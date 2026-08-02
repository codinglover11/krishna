const categoryRepository = require('../repository/categoryRepository');
const productRepository = require('../repository/productRepository');
const { sendSuccess, sendError } = require('../utils/response');

const categoryController = {
  getAllCategories: async (req, res, next) => {
    try {
      const includeDeleted = req.query.includeDeleted === 'true';
      const categories = await categoryRepository.findCategories(includeDeleted);
      return sendSuccess(res, 200, categories, 'Categories fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  getCategoryById: async (req, res, next) => {
    const { id } = req.params;
    try {
      const category = await categoryRepository.findCategoryById(id);
      if (!category) {
        return sendError(res, 404, 'Category not found.', []);
      }
      return sendSuccess(res, 200, category, 'Category details fetched.');
    } catch (error) {
      next(error);
    }
  },

  getCategoryBySlug: async (req, res, next) => {
    const { slug } = req.params;
    try {
      const category = await categoryRepository.findCategoryBySlug(slug);
      if (!category) {
        return sendError(res, 404, 'Category not found.', []);
      }
      return sendSuccess(res, 200, category, 'Category details fetched by slug.');
    } catch (error) {
      next(error);
    }
  },

  createCategory: async (req, res, next) => {
    const data = req.body;
    if (!data.name) {
      return sendError(res, 400, 'Category name is required.', []);
    }

    try {
      const created = await categoryRepository.createCategory(data);
      return sendSuccess(res, 201, created, 'Category created successfully.');
    } catch (error) {
      next(error);
    }
  },

  updateCategory: async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;

    try {
      const existing = await categoryRepository.findCategoryById(id);
      if (!existing) {
        return sendError(res, 404, 'Category not found.', []);
      }

      const updated = await categoryRepository.updateCategory(id, data);
      return sendSuccess(res, 200, updated, 'Category updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  deleteCategory: async (req, res, next) => {
    const { id } = req.params;

    try {
      const existing = await categoryRepository.findCategoryById(id);
      if (!existing) {
        return sendError(res, 404, 'Category not found.', []);
      }

      const deleted = await categoryRepository.softDeleteCategory(id);
      return sendSuccess(res, 200, deleted, 'Category soft-deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  restoreCategory: async (req, res, next) => {
    const { id } = req.params;

    try {
      const existing = await categoryRepository.findCategoryById(id);
      if (!existing) {
        return sendError(res, 404, 'Category not found.', []);
      }

      const restored = await categoryRepository.restoreCategory(id);
      return sendSuccess(res, 200, restored, 'Category restored successfully.');
    } catch (error) {
      next(error);
    }
  },

  getFeaturedCategories: async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 4;
    try {
      const categories = await categoryRepository.findFeaturedCategories(limit);
      return sendSuccess(res, 200, categories, 'Featured categories fetched.');
    } catch (error) {
      next(error);
    }
  },

  getCategoryProducts: async (req, res, next) => {
    const { id } = req.params;
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const offset = (page - 1) * limit;

      const category = await categoryRepository.findCategoryById(id);
      if (!category) {
        return sendError(res, 404, 'Category not found.', []);
      }

      const { products, totalCount } = await productRepository.findProducts({
        categoryId: id,
        limit,
        offset
      });

      const pagination = {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };

      return sendSuccess(res, 200, { category, products, pagination }, 'Category products fetched.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoryController;
