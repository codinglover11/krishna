const { Router } = require('express');
const adminReviewController = require('../controller/adminReviewController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { checkPermission } = require('../middleware/permission');

const router = Router();

router.use(authenticateToken);
router.use(adminMiddleware);

router.get('/', checkPermission('reviews.manage'), adminReviewController.getAdminReviews);
router.get('/:id', checkPermission('reviews.manage'), adminReviewController.getReviewById);
router.patch('/:id/status', checkPermission('reviews.manage'), adminReviewController.updateReviewStatus);
router.delete('/:id', checkPermission('reviews.manage'), adminReviewController.deleteReview);

module.exports = router;
