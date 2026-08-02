const { pool } = require('../config/db');

const categoryRepository = {
  findCategories: async (includeDeleted = false) => {
    try {
      let query = `
        SELECT c.*,
               COALESCE((SELECT COUNT(id) FROM products WHERE category_id = c.id AND (is_deleted IS FALSE OR is_deleted IS NULL)), 0)::integer as product_count
        FROM categories c
      `;
      if (!includeDeleted) {
        query += ` WHERE (c.is_deleted IS FALSE OR c.is_deleted IS NULL)`;
      }
      query += ` ORDER BY c.name ASC`;
      const result = await pool.query(query);
      return result.rows;
    } catch (err) {
      console.warn('[CategoryRepository] Falling back to basic category query:', err.message);
      const fallbackQuery = `
        SELECT c.*,
               COALESCE((SELECT COUNT(id) FROM products WHERE category_id = c.id), 0)::integer as product_count
        FROM categories c
        ORDER BY c.name ASC
      `;
      const result = await pool.query(fallbackQuery);
      return result.rows;
    }
  },

  findCategoryById: async (id) => {
    try {
      const query = `
        SELECT c.*,
               COALESCE((SELECT COUNT(id) FROM products WHERE category_id = c.id AND (is_deleted IS FALSE OR is_deleted IS NULL)), 0)::integer as product_count
        FROM categories c
        WHERE c.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      const fallbackQuery = `
        SELECT c.*,
               COALESCE((SELECT COUNT(id) FROM products WHERE category_id = c.id), 0)::integer as product_count
        FROM categories c
        WHERE c.id = $1
      `;
      const result = await pool.query(fallbackQuery, [id]);
      return result.rows[0];
    }
  },

  findCategoryBySlug: async (slug) => {
    try {
      const query = `
        SELECT c.*,
               COALESCE((SELECT COUNT(id) FROM products WHERE category_id = c.id AND (is_deleted IS FALSE OR is_deleted IS NULL)), 0)::integer as product_count
        FROM categories c
        WHERE c.slug = $1
      `;
      const result = await pool.query(query, [slug]);
      return result.rows[0];
    } catch (err) {
      const fallbackQuery = `
        SELECT c.*,
               COALESCE((SELECT COUNT(id) FROM products WHERE category_id = c.id), 0)::integer as product_count
        FROM categories c
        WHERE c.slug = $1
      `;
      const result = await pool.query(fallbackQuery, [slug]);
      return result.rows[0];
    }
  },

  createCategory: async (data) => {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      const query = `
        INSERT INTO categories (name, slug, description, image_url, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const values = [
        data.name, slug, data.description || '', data.imageUrl || null,
        data.displayOrder || 0, data.isActive !== false
      ];
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      const fallbackQuery = `
        INSERT INTO categories (name, slug, description, image_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const res = await pool.query(fallbackQuery, [data.name, slug, data.description || '', data.imageUrl || null]);
      return res.rows[0];
    }
  },

  updateCategory: async (id, data) => {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      const query = `
        UPDATE categories
        SET name = $1, slug = $2, description = $3, image_url = $4,
            display_order = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `;
      const values = [
        data.name, slug, data.description || '', data.imageUrl || null,
        data.displayOrder || 0, data.isActive !== false, id
      ];
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      const fallbackQuery = `
        UPDATE categories
        SET name = $1, slug = $2, description = $3, image_url = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `;
      const res = await pool.query(fallbackQuery, [data.name, slug, data.description || '', data.imageUrl || null, id]);
      return res.rows[0];
    }
  },

  softDeleteCategory: async (id) => {
    try {
      const query = `UPDATE categories SET is_deleted = TRUE, is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
      const res = await pool.query(query, [id]);
      return res.rows[0];
    } catch (err) {
      const query = `DELETE FROM categories WHERE id = $1 RETURNING *`;
      const res = await pool.query(query, [id]);
      return res.rows[0];
    }
  },

  restoreCategory: async (id) => {
    try {
      const query = `UPDATE categories SET is_deleted = FALSE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
      const res = await pool.query(query, [id]);
      return res.rows[0];
    } catch (err) {
      const query = `SELECT * FROM categories WHERE id = $1`;
      const res = await pool.query(query, [id]);
      return res.rows[0];
    }
  },

  findFeaturedCategories: async (limit = 4) => {
    try {
      const query = `
        SELECT c.*,
               COALESCE((SELECT COUNT(id) FROM products WHERE category_id = c.id AND (is_deleted IS FALSE OR is_deleted IS NULL)), 0)::integer as product_count
        FROM categories c
        WHERE (c.is_deleted IS FALSE OR c.is_deleted IS NULL) AND c.is_active = TRUE
        ORDER BY product_count DESC, c.name ASC
        LIMIT $1
      `;
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (err) {
      const fallbackQuery = `
        SELECT c.*,
               COALESCE((SELECT COUNT(id) FROM products WHERE category_id = c.id), 0)::integer as product_count
        FROM categories c
        ORDER BY c.name ASC
        LIMIT $1
      `;
      const result = await pool.query(fallbackQuery, [limit]);
      return result.rows;
    }
  }
};

module.exports = categoryRepository;
