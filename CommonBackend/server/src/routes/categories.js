const { Router } = require('express');
const categoryController = require('../controller/categoryController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = Router();

// Public Category Browse Endpoints
router.get('/featured', categoryController.getFeaturedCategories);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/products', categoryController.getCategoryProducts);

// Protected Admin Category Management Endpoints
router.post('/', authenticateToken, adminMiddleware, categoryController.createCategory);
router.patch('/:id', authenticateToken, adminMiddleware, categoryController.updateCategory);
router.delete('/:id', authenticateToken, adminMiddleware, categoryController.deleteCategory);
router.patch('/:id/restore', authenticateToken, adminMiddleware, categoryController.restoreCategory);

module.exports = router;
