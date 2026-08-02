const { Router } = require('express');
const productController = require('../controller/productController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = Router();

// Public Product Browse Endpoints
router.get('/featured', productController.getFeatured);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/best-sellers', productController.getBestSellers);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/related/:id', productController.getRelatedProducts);
router.get('/slug/:slug', productController.getProductBySlug);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected Admin Product Management Endpoints
router.post('/', authenticateToken, adminMiddleware, productController.createProduct);
router.patch('/:id', authenticateToken, adminMiddleware, productController.updateProduct);
router.delete('/:id', authenticateToken, adminMiddleware, productController.deleteProduct);
router.patch('/:id/restore', authenticateToken, adminMiddleware, productController.restoreProduct);
router.patch('/:id/status', authenticateToken, adminMiddleware, productController.toggleStatus);
router.post('/:id/duplicate', authenticateToken, adminMiddleware, productController.duplicateProduct);

module.exports = router;
