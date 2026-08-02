const { Router } = require('express');
const offerController = require('../controller/offerController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = Router();

// Public Offer Endpoints
router.get('/', offerController.getPublicOffers);

// Protected Admin Offer Management Endpoints
router.get('/admin', authenticateToken, adminMiddleware, offerController.getAdminOffers);
router.post('/', authenticateToken, adminMiddleware, offerController.createOffer);
router.patch('/:id', authenticateToken, adminMiddleware, offerController.updateOffer);
router.delete('/:id', authenticateToken, adminMiddleware, offerController.deleteOffer);

module.exports = router;
