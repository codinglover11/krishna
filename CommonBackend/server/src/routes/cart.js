const { Router } = require('express');
const cartController = require('../controller/cartController');
const authenticateToken = require('../middleware/auth');

const router = Router();

// Secure all endpoints with authentication tokens
router.use(authenticateToken);

router.post('/', cartController.addItem);
router.get('/', cartController.getCart);
router.patch('/:itemId', cartController.updateItem);
router.delete('/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
