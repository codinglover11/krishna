const { Router } = require('express');
const auditLogController = require('../controller/auditLogController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { checkPermission } = require('../middleware/permission');

const router = Router();

router.use(authenticateToken);
router.use(adminMiddleware);

router.get('/', checkPermission('users.manage'), auditLogController.getAuditLogs);

module.exports = router;
