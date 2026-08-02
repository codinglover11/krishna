const { Router } = require('express');
const mediaController = require('../controller/mediaController');
const authenticateToken = require('../middleware/auth');

const router = Router();

router.use(authenticateToken);

// Media Management Routes
router.post('/upload', mediaController.multerSingle, mediaController.uploadSingle);
router.post('/multiple-upload', mediaController.multerArray, mediaController.uploadMultiple);
router.delete('/:publicId(*)', mediaController.deleteMedia);

module.exports = router;
