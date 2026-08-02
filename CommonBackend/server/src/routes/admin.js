const { Router } = require('express');
const adminController = require('../controller/adminController');
const adminOrderController = require('../controller/adminOrderController');
const adminCustomerController = require('../controller/adminCustomerController');
const adminDashboardController = require('../controller/adminDashboardController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = Router();

// Public Admin Auth (Passwordless OTP Flow)
router.post('/send-otp', adminController.sendLoginOTP);
router.post('/login', adminController.adminLogin);

// Protected Admin Routes
router.use(authenticateToken);
router.use(adminMiddleware);

router.get('/me', adminController.getAdminProfile);
router.post('/logout', adminController.logoutAdmin);
router.get('/verify', adminController.verifyAdminSession);

// Admin Dashboard & Analytics Routes
router.get('/dashboard', adminDashboardController.getDashboardOverview);
router.get('/dashboard/charts', adminDashboardController.getChartData);
router.get('/dashboard/revenue', adminDashboardController.getRevenueMetrics);
router.get('/dashboard/orders', adminDashboardController.getOrderMetrics);
router.get('/dashboard/products', adminDashboardController.getProductMetrics);
router.get('/dashboard/customers', adminDashboardController.getCustomerMetrics);

// Admin Order Management Routes
router.get('/orders', adminOrderController.getAllOrders);
router.get('/orders/:id', adminOrderController.getOrderById);
router.patch('/orders/:id/status', adminOrderController.updateOrderStatus);

// Admin Customer Management Routes
router.get('/customers', adminCustomerController.getAdminCustomers);
router.get('/customers/:id', adminCustomerController.getAdminCustomerById);
router.get('/customers/:id/orders', adminCustomerController.getAdminCustomerOrders);
router.patch('/customers/:id/status', adminCustomerController.toggleCustomerStatus);

module.exports = router;
