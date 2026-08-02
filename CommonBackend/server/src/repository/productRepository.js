const { pool } = require('../config/db');
const cacheService = require('../services/cacheService');

const productRepository = {
  findProducts: async (filters = {}) => {
    const cacheKey = `products:catalog:${JSON.stringify(filters)}`;
    return cacheService.getOrSet(cacheKey, 60, async () => {
      const { categoryId, sort, minPrice, maxPrice, search, featured, newArrivals, bestSellers, status, gender, ageGroup, includeDeleted = false, limit = 12, offset = 0 } = filters;
      
      try {
        let query = `
          SELECT p.*, c.name as category_name,
                 (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
                 COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) as total_stock,
                 COALESCE((SELECT AVG(rating)::numeric(2,1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE), 0.0) as average_rating,
                 COALESCE((SELECT COUNT(id) FROM reviews WHERE product_id = p.id AND is_approved = TRUE), 0) as reviews_count
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE 1=1
        `;
        const values = [];
        let countParam = 1;

        if (!includeDeleted) {
          query += ` AND (p.is_deleted IS FALSE OR p.is_deleted IS NULL)`;
        }

        if (categoryId) {
          query += ` AND p.category_id = $${countParam}`;
          values.push(categoryId);
          countParam++;
        }

        if (status === 'active') {
          query += ` AND (p.is_active = TRUE OR p.is_active IS NULL)`;
        } else if (status === 'inactive') {
          query += ` AND p.is_active = FALSE`;
        }

        if (featured === true || featured === 'true') {
          query += ` AND p.is_featured = TRUE`;
        }

        if (bestSellers === true || bestSellers === 'true') {
          query += ` AND p.is_bestseller = TRUE`;
        }

        if (newArrivals === true || newArrivals === 'true') {
          query += ` AND p.is_new_arrival = TRUE`;
        }

        if (minPrice) {
          query += ` AND p.price >= $${countParam}`;
          values.push(parseFloat(minPrice));
          countParam++;
        }

        if (maxPrice) {
          query += ` AND p.price <= $${countParam}`;
          values.push(parseFloat(maxPrice));
          countParam++;
        }

        if (search) {
          query += ` AND (p.name ILIKE $${countParam} OR p.description ILIKE $${countParam})`;
          values.push(`%${search}%`);
          countParam++;
        }

        if (gender) {
          query += ` AND p.gender = $${countParam}`;
          values.push(gender);
          countParam++;
        }

        if (ageGroup) {
          query += ` AND p.age_group = $${countParam}`;
          values.push(ageGroup);
          countParam++;
        }

        // Count total matching items
        const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered_products`;
        const totalResult = await pool.query(countQuery, values);
        const totalCount = parseInt(totalResult.rows[0].count, 10);

        // Sorting logic
        if (sort === 'price_low_high') {
          query += ` ORDER BY p.price ASC`;
        } else if (sort === 'price_high_low') {
          query += ` ORDER BY p.price DESC`;
        } else if (sort === 'newest') {
          query += ` ORDER BY p.created_at DESC`;
        } else {
          query += ` ORDER BY p.created_at DESC`;
        }

        query += ` LIMIT $${countParam} OFFSET $${countParam + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        return { products: result.rows, totalCount };
      } catch (err) {
        console.warn('[ProductRepository] Falling back to basic products query:', err.message);
        
        let query = `
          SELECT p.*, c.name as category_name,
                 (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as primary_image
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE 1=1
        `;
        const values = [];
        let countParam = 1;

        if (categoryId) {
          query += ` AND p.category_id = $${countParam}`;
          values.push(categoryId);
          countParam++;
        }

        const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered_products`;
        const totalResult = await pool.query(countQuery, values);
        const totalCount = parseInt(totalResult.rows[0].count, 10);

        query += ` LIMIT $${countParam} OFFSET $${countParam + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        return { products: result.rows, totalCount };
      }
    });
  },

  findProductById: async (id) => {
    try {
      const query = `
        SELECT p.*, c.name as category_name,
               COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) as total_stock,
               COALESCE((SELECT AVG(rating)::numeric(2,1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE), 0.0) as average_rating,
               COALESCE((SELECT COUNT(id) FROM reviews WHERE product_id = p.id AND is_approved = TRUE), 0) as reviews_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `;
      const productResult = await pool.query(query, [id]);
      const product = productResult.rows[0];

      if (!product) return null;

      const imagesResult = await pool.query(
        `SELECT id, image_url, is_primary FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, created_at ASC`,
        [id]
      );
      product.images = imagesResult.rows;

      const variantsResult = await pool.query(
        `SELECT pv.id, pv.product_id, pv.size_id, pv.color_id, pv.stock_quantity,
                s.size_label, col.color_name, col.color_code
         FROM product_variants pv
         LEFT JOIN sizes s ON pv.size_id = s.id
         LEFT JOIN colors col ON pv.color_id = col.id
         WHERE pv.product_id = $1`,
        [id]
      );
      product.variants = variantsResult.rows;

      return product;
    } catch (err) {
      console.warn('[ProductRepository] Falling back to basic product by ID query:', err.message);
      const query = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`;
      const res = await pool.query(query, [id]);
      return res.rows[0] || null;
    }
  },

  findProductBySlug: async (slug) => {
    try {
      const query = `
        SELECT p.*, c.name as category_name,
               COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) as total_stock,
               COALESCE((SELECT AVG(rating)::numeric(2,1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE), 0.0) as average_rating,
               COALESCE((SELECT COUNT(id) FROM reviews WHERE product_id = p.id AND is_approved = TRUE), 0) as reviews_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = $1
      `;
      const productResult = await pool.query(query, [slug]);
      const product = productResult.rows[0];

      if (!product) return null;

      const imagesResult = await pool.query(
        `SELECT id, image_url, is_primary FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, created_at ASC`,
        [slug]
      );
      product.images = imagesResult.rows;

      return product;
    } catch (err) {
      const query = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1`;
      const res = await pool.query(query, [slug]);
      return res.rows[0] || null;
    }
  },

  createProduct: async (data) => {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const sku = data.sku || `KRN-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const query = `
        INSERT INTO products (category_id, name, slug, brand, description, short_description, price, discount_price, cost_price, sku, is_featured, is_bestseller, is_new_arrival, is_active, gender, age_group)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `;
      const values = [
        data.categoryId || null, data.name, slug, data.brand || 'Krishna', data.description || '',
        data.shortDescription || '', data.price, data.discountPrice || null, data.costPrice || null,
        sku, data.isFeatured || false, data.isBestseller || false, data.isNewArrival !== false, data.isActive !== false,
        data.gender || null, data.ageGroup || null
      ];
      const res = await pool.query(query, values);
      const product = res.rows[0];

      if (data.images && Array.isArray(data.images)) {
        for (let i = 0; i < data.images.length; i++) {
          await pool.query(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
            [product.id, data.images[i], i === 0]
          );
        }
      }

      if (data.variants && Array.isArray(data.variants)) {
        for (const v of data.variants) {
          await pool.query(
            'INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity) VALUES ($1, $2, $3, $4)',
            [product.id, v.sizeId, v.colorId, v.stockQuantity]
          );
        }
      }

      return product;
    } catch (err) {
      console.warn('[ProductRepository] Falling back to basic product creation query:', err.message);
      const fallbackQuery = `
        INSERT INTO products (category_id, name, description, price, sku)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const res = await pool.query(fallbackQuery, [data.categoryId || null, data.name, data.description || '', data.price, sku]);
      const product = res.rows[0];

      if (data.images && Array.isArray(data.images)) {
        for (let i = 0; i < data.images.length; i++) {
          await pool.query(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
            [product.id, data.images[i], i === 0]
          );
        }
      }

      if (data.variants && Array.isArray(data.variants)) {
        for (const v of data.variants) {
          await pool.query(
            'INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity) VALUES ($1, $2, $3, $4)',
            [product.id, v.sizeId, v.colorId, v.stockQuantity]
          );
        }
      }

      return product;
    }
  },

  updateProduct: async (id, data) => {
    try {
      const query = `
        UPDATE products
        SET category_id = $1, name = $2, brand = $3, description = $4, short_description = $5,
            price = $6, discount_price = $7, cost_price = $8, is_featured = $9, is_bestseller = $10,
            is_new_arrival = $11, is_active = $12, gender = $13, age_group = $14, updated_at = CURRENT_TIMESTAMP
        WHERE id = $15
        RETURNING *
      `;
      const values = [
        data.categoryId || null, data.name, data.brand || 'Krishna', data.description || '', data.shortDescription || '',
        data.price, data.discountPrice || null, data.costPrice || null, data.isFeatured || false,
        data.isBestseller || false, data.isNewArrival !== false, data.isActive !== false,
        data.gender || null, data.ageGroup || null, id
      ];
      const res = await pool.query(query, values);
      
      if (data.images && Array.isArray(data.images)) {
        await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);
        for (let i = 0; i < data.images.length; i++) {
          await pool.query(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
            [id, data.images[i], i === 0]
          );
        }
      }

      if (data.variants && Array.isArray(data.variants)) {
        await pool.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
        for (const v of data.variants) {
          await pool.query(
            'INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity) VALUES ($1, $2, $3, $4)',
            [id, v.sizeId, v.colorId, v.stockQuantity]
          );
        }
      }

      return res.rows[0];
    } catch (err) {
      console.warn('[ProductRepository] Falling back to basic product update query:', err.message);
      const fallbackQuery = `
        UPDATE products
        SET category_id = $1, name = $2, description = $3, price = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `;
      const res = await pool.query(fallbackQuery, [data.categoryId || null, data.name, data.description || '', data.price, id]);
      
      console.log(`[DEBUG] Updating images for product ${id}. data.images:`, data.images);
      if (data.images && Array.isArray(data.images)) {
        try {
          await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);
          console.log(`[DEBUG] Deleted old images for ${id}`);
          for (let i = 0; i < data.images.length; i++) {
            await pool.query(
              'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
              [id, data.images[i], i === 0]
            );
            console.log(`[DEBUG] Inserted image ${i} for ${id}:`, data.images[i]);
          }
        } catch (imgErr) {
          console.error(`[DEBUG] Error inserting images:`, imgErr.message);
        }
      }

      if (data.variants && Array.isArray(data.variants)) {
        try {
          await pool.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
          for (const v of data.variants) {
            await pool.query(
              'INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity) VALUES ($1, $2, $3, $4)',
              [id, v.sizeId, v.colorId, v.stockQuantity]
            );
          }
        } catch (varErr) {
          console.error(`[DEBUG] Error inserting variants:`, varErr.message);
        }
      }

      await cacheService.flushPattern('products:*');
      return res.rows[0];
    }
  },

  softDeleteProduct: async (id) => {
    const query = `UPDATE products SET is_deleted = TRUE, is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  },

  restoreProduct: async (id) => {
    const query = `UPDATE products SET is_deleted = FALSE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  },

  findRelatedProducts: async (productId, limit = 4) => {
    try {
      const currentProduct = await pool.query(`SELECT category_id FROM products WHERE id = $1`, [productId]);
      const categoryId = currentProduct.rows[0]?.category_id;

      const query = `
        SELECT p.*, c.name as category_name,
               (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
               COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) as total_stock,
               COALESCE((SELECT AVG(rating)::numeric(2,1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE), 0.0) as average_rating
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id != $1 AND ($2::integer IS NULL OR p.category_id = $2)
        ORDER BY p.created_at DESC
        LIMIT $3
      `;
      const result = await pool.query(query, [productId, categoryId || null, limit]);
      return result.rows;
    } catch (err) {
      console.warn('[ProductRepository] Falling back to basic related products query:', err.message);
      const fallbackQuery = `
        SELECT p.*, c.name as category_name,
               (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as primary_image
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id != $1
        LIMIT $2
      `;
      const result = await pool.query(fallbackQuery, [productId, limit]);
      return result.rows;
    }
  }
};

module.exports = productRepository;
