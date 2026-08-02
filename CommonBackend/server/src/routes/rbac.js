const { Router } = require('express');
const rbacController = require('../controller/rbacController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { checkPermission } = require('../middleware/permission');

const router = Router();

router.use(authenticateToken);
router.use(adminMiddleware);

// Admin User Management Routes
router.get('/users', checkPermission('users.manage'), rbacController.getAdminUsers);
router.post('/users', checkPermission('users.manage'), rbacController.createAdminUser);
router.patch('/users/:id/status', checkPermission('users.manage'), rbacController.toggleAdminUserStatus);

// Roles & Permissions Matrix Routes
router.get('/roles', checkPermission('users.manage'), rbacController.getRoles);
router.post('/roles', checkPermission('users.manage'), rbacController.createRole);
router.get('/permissions', checkPermission('users.manage'), rbacController.getPermissions);
router.patch('/roles/:id/permissions', checkPermission('users.manage'), rbacController.updateRolePermissions);

module.exports = router;
