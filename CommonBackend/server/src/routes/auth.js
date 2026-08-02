const { Router } = require('express');
const authController = require('../controller/authController');
const authenticateToken = require('../middleware/auth');
const { validate, createValidationSchemas } = require('../middleware/validation');

const schemas = createValidationSchemas();
const router = Router();

router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', validate(schemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), authController.resetPassword);

// Email OTP Endpoints
router.post('/email-otp/send', authController.sendEmailOTP);
router.post('/email-otp/verify', authController.verifyEmailOTP);

// Firebase Phone Token Endpoint
router.post('/verify-firebase-token', authController.verifyFirebasePhoneToken);

// Admin Password Reset OTP Endpoints
router.post('/admin/forgot-password-otp', authController.sendAdminForgotOTP);
router.post('/admin/reset-password-otp', authController.resetAdminPasswordOTP);

// Protected routes
router.patch('/change-password', authenticateToken, validate(schemas.changePassword), authController.changePassword);
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
