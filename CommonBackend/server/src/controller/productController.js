const productRepository = require('../repository/productRepository');
const auditLogService = require('../services/auditLogService');
const { sendSuccess, sendError } = require('../utils/response');
const authService = require('../service/authService');

const isAdminRequest = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = authService.verifyAccessToken(token);
      return decoded && (decoded.role?.toUpperCase() === 'ADMIN' || decoded.role_id === 1);
    } catch (e) {
      return false;
    }
  }
  return false;
};

const sanitizeProducts = (req, products) => {
  if (!isAdminRequest(req)) {
    if (Array.isArray(products)) {
      products.forEach(p => delete p.cost_price);
    } else if (products) {
      delete products.cost_price;
    }
  }
};

const productController = {
  getAllProducts: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const offset = (page - 1) * limit;

      const filters = {
        categoryId: req.query.categoryId || req.query.category,
        sort: req.query.sort,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        search: req.query.search || req.query.q,
        status: req.query.status,
        featured: req.query.featured,
        newArrivals: req.query.newArrivals,
        bestSellers: req.query.bestSellers,
        includeDeleted: req.query.includeDeleted === 'true',
        gender: req.query.gender,
        ageGroup: req.query.ageGroup,
        limit,
        offset
      };

      const { products, totalCount } = await productRepository.findProducts(filters);
      
      const pagination = {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };

      sanitizeProducts(req, products);
      return sendSuccess(res, 200, { products, pagination }, 'Products fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  getProductById: async (req, res, next) => {
    const { id } = req.params;
    try {
      const product = await productRepository.findProductById(id);
      if (!product) {
        return sendError(res, 404, 'Product not found.', []);
      }
      sanitizeProducts(req, product);
      return sendSuccess(res, 200, product, 'Product details fetched.');
    } catch (error) {
      next(error);
    }
  },

  getProductBySlug: async (req, res, next) => {
    const { slug } = req.params;
    try {
      const product = await productRepository.findProductBySlug(slug);
      if (!product) {
        return sendError(res, 404, 'Product not found.', []);
      }
      sanitizeProducts(req, product);
      return sendSuccess(res, 200, product, 'Product details fetched by slug.');
    } catch (error) {
      next(error);
    }
  },

  createProduct: async (req, res, next) => {
    const data = req.body;
    if (!data.name || !data.price || !data.sku) {
      return sendError(res, 400, 'Product name, SKU, and base price are required.', []);
    }

    const price = parseFloat(data.price);
    const discountPrice = data.discountPrice ? parseFloat(data.discountPrice) : null;
    const costPrice = data.costPrice ? parseFloat(data.costPrice) : null;

    if (price <= 0) return sendError(res, 400, 'Base selling price must be greater than 0.');
    if (discountPrice !== null && discountPrice <= 0) return sendError(res, 400, 'Discounted price must be greater than 0.');
    if (costPrice !== null && costPrice <= 0) return sendError(res, 400, 'Cost price must be greater than 0.');
    if (discountPrice !== null && price < discountPrice) return sendError(res, 400, 'Selling Price cannot be greater than MRP.');

    try {
      const created = await productRepository.createProduct(data);
      await auditLogService.logAudit(req, {
        action: 'PRODUCT_CREATED',
        module: 'Products',
        description: `Created product "${created.name}" (SKU: ${created.sku})`
      });
      return sendSuccess(res, 201, created, 'Product created successfully.');
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;

    const price = parseFloat(data.price);
    const discountPrice = data.discountPrice ? parseFloat(data.discountPrice) : null;
    const costPrice = data.costPrice ? parseFloat(data.costPrice) : null;

    if (price <= 0) return sendError(res, 400, 'Base selling price must be greater than 0.');
    if (discountPrice !== null && discountPrice <= 0) return sendError(res, 400, 'Discounted price must be greater than 0.');
    if (costPrice !== null && costPrice <= 0) return sendError(res, 400, 'Cost price must be greater than 0.');
    if (discountPrice !== null && price < discountPrice) return sendError(res, 400, 'Selling Price cannot be greater than MRP.');

    try {
      const existing = await productRepository.findProductById(id);
      if (!existing) {
        return sendError(res, 404, 'Product not found.', []);
      }

      const updated = await productRepository.updateProduct(id, data);
      await auditLogService.logAudit(req, {
        action: 'PRODUCT_UPDATED',
        module: 'Products',
        description: `Updated product "${updated.name}" (ID: ${id})`
      });
      return sendSuccess(res, 200, updated, 'Product updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, res, next) => {
    const { id } = req.params;

    try {
      const existing = await productRepository.findProductById(id);
      if (!existing) {
        return sendError(res, 404, 'Product not found.', []);
      }

      const deleted = await productRepository.softDeleteProduct(id);
      await auditLogService.logAudit(req, {
        action: 'PRODUCT_DELETED',
        module: 'Products',
        description: `Soft deleted product "${existing.name}" (ID: ${id})`
      });
      return sendSuccess(res, 200, deleted, 'Product soft-deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  restoreProduct: async (req, res, next) => {
    const { id } = req.params;

    try {
      const existing = await productRepository.findProductById(id);
      if (!existing) {
        return sendError(res, 404, 'Product not found.', []);
      }

      const restored = await productRepository.restoreProduct(id);
      await auditLogService.logAudit(req, {
        action: 'PRODUCT_RESTORED',
        module: 'Products',
        description: `Restored product "${existing.name}" (ID: ${id})`
      });
      return sendSuccess(res, 200, restored, 'Product restored successfully.');
    } catch (error) {
      next(error);
    }
  },

  toggleStatus: async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
      const existing = await productRepository.findProductById(id);
      if (!existing) {
        return sendError(res, 404, 'Product not found.', []);
      }

      const updated = await productRepository.toggleProductStatus(id, !!isActive);
      return sendSuccess(res, 200, updated, `Product ${isActive ? 'enabled' : 'disabled'} successfully.`);
    } catch (error) {
      next(error);
    }
  },

  duplicateProduct: async (req, res, next) => {
    const { id } = req.params;

    try {
      const original = await productRepository.findProductById(id);
      if (!original) {
        return sendError(res, 404, 'Product not found.', []);
      }

      const duplicateData = {
        name: `${original.name} (Copy)`,
        slug: `${original.slug}-copy-${Date.now()}`,
        sku: `${original.sku}-COPY-${Math.floor(1000 + Math.random() * 9000)}`,
        brand: original.brand,
        categoryId: original.category_id,
        description: original.description,
        shortDescription: original.short_description,
        price: original.price,
        discountPrice: original.discount_price,
        costPrice: original.cost_price,
        isFeatured: original.is_featured,
        isBestseller: original.is_bestseller,
        isNewArrival: original.is_new_arrival,
        isActive: false,
        images: original.images ? original.images.map(img => img.image_url) : [],
        variants: original.variants ? original.variants.map(v => ({
          sizeId: v.size_id,
          colorId: v.color_id,
          stockQuantity: v.stock_quantity
        })) : []
      };

      const duplicated = await productRepository.createProduct(duplicateData);
      return sendSuccess(res, 201, duplicated, 'Product duplicated successfully.');
    } catch (error) {
      next(error);
    }
  },

  getFeatured: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 4;
      const { products } = await productRepository.findProducts({ featured: true, limit });
      sanitizeProducts(req, products);
      return sendSuccess(res, 200, products, 'Featured products fetched.');
    } catch (error) {
      next(error);
    }
  },

  getNewArrivals: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 4;
      const { products } = await productRepository.findProducts({ sort: 'newest', limit });
      sanitizeProducts(req, products);
      return sendSuccess(res, 200, products, 'New arrival products fetched.');
    } catch (error) {
      next(error);
    }
  },

  getBestSellers: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 4;
      const { products } = await productRepository.findProducts({ limit });
      sanitizeProducts(req, products);
      return sendSuccess(res, 200, products, 'Best seller products fetched.');
    } catch (error) {
      next(error);
    }
  },

  getProductsByCategory: async (req, res, next) => {
    const { categoryId } = req.params;
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const offset = (page - 1) * limit;

      const { products, totalCount } = await productRepository.findProducts({
        categoryId,
        limit,
        offset
      });

      const pagination = {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };

      sanitizeProducts(req, products);
      return sendSuccess(res, 200, { products, pagination }, 'Products under category fetched.');
    } catch (error) {
      next(error);
    }
  },

  searchProducts: async (req, res, next) => {
    const queryTerm = req.query.q || req.query.search;
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const offset = (page - 1) * limit;

      const { products, totalCount } = await productRepository.findProducts({
        search: queryTerm,
        limit,
        offset
      });

      const pagination = {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };

      sanitizeProducts(req, products);
      return sendSuccess(res, 200, { products, pagination }, 'Search results fetched.');
    } catch (error) {
      next(error);
    }
  },

  getRelatedProducts: async (req, res, next) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit, 10) || 4;

    try {
      const product = await productRepository.findProductById(id);
      if (!product) {
        return sendError(res, 404, 'Product not found.', []);
      }

      const related = await productRepository.findRelatedProducts(id, product.category_id, limit);
      sanitizeProducts(req, related);
      return sendSuccess(res, 200, related, 'Related products fetched.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productController;
