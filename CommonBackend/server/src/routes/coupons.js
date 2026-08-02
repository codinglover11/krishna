const { Router } = require('express');
const couponController = require('../controller/couponController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = Router();

// Public / Customer Checkout Coupon Validation Endpoint
router.post('/validate', couponController.validateCoupon);

// Protected Admin Coupon Management Endpoints
router.get('/admin', authenticateToken, adminMiddleware, couponController.getAdminCoupons);
router.post('/', authenticateToken, adminMiddleware, couponController.createCoupon);
router.patch('/:id', authenticateToken, adminMiddleware, couponController.updateCoupon);
router.delete('/:id', authenticateToken, adminMiddleware, couponController.deleteCoupon);

module.exports = router;
