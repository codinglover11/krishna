const { Router } = require('express');
const bannerController = require('../controller/bannerController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = Router();

// Public Banner Endpoints for Customer Homepage Carousel
router.get('/', bannerController.getPublicBanners);

// Protected Admin Banner Management Endpoints
router.get('/admin', authenticateToken, adminMiddleware, bannerController.getAdminBanners);
router.post('/', authenticateToken, adminMiddleware, bannerController.createBanner);
router.patch('/:id', authenticateToken, adminMiddleware, bannerController.updateBanner);
router.delete('/:id', authenticateToken, adminMiddleware, bannerController.deleteBanner);
router.patch('/:id/restore', authenticateToken, adminMiddleware, bannerController.restoreBanner);

module.exports = router;
