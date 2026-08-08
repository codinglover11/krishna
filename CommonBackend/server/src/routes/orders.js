const { Router } = require('express');
const orderController = require('../controller/orderController');
const authenticateToken = require('../middleware/auth');

const router = Router();

// Public endpoint for admin email verification
router.get('/verify-payment/:id', orderController.verifyPayment);

// Secure all endpoints with authentication token verification
router.use(authenticateToken);

router.post('/estimate-delivery', orderController.estimateDelivery);
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
