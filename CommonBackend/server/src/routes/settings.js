const { Router } = require('express');
const settingsController = require('../controller/settingsController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { checkPermission } = require('../middleware/permission');

const router = Router();

// Public Store Settings Route
router.get('/', settingsController.getSettings);

// Protected Admin Update Store Settings Route
router.patch('/', authenticateToken, adminMiddleware, checkPermission('settings.manage'), settingsController.updateSettings);

module.exports = router;
