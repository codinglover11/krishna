const { Router } = require('express');
const wishlistController = require('../controller/wishlistController');
const authenticateToken = require('../middleware/auth');

const router = Router();

// Secure all endpoints with authentication token verification
router.use(authenticateToken);

router.post('/', wishlistController.addItem);
router.get('/', wishlistController.getWishlist);
router.delete('/:productId', wishlistController.removeItem);
router.post('/:productId/move-to-cart', wishlistController.moveItemToCart);
router.get('/check/:productId', wishlistController.checkStatus);

module.exports = router;
