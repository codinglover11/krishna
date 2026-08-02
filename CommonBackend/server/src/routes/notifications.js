const { Router } = require('express');
const notificationController = require('../controller/notificationController');
const authenticateToken = require('../middleware/auth');

const router = Router();

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
