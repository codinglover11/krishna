const { Router } = require('express');
const mediaController = require('../controller/mediaController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = Router();

router.use(authenticateToken);
router.use(adminMiddleware);

router.post('/', mediaController.multerSingle, mediaController.uploadSingle);

module.exports = router;
