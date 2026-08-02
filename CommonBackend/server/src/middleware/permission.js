const { pool } = require('../config/db');
const { sendError } = require('../utils/response');

const checkPermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return sendError(res, 401, 'Authentication token missing or invalid.', []);
      }

      const roleName = (user.roleName || user.role || '').toLowerCase();

      // Super Admin role bypasses granular permission checks
      if (roleName === 'super admin' || roleName === 'superadmin' || user.role_id === 1) {
        return next();
      }

      // Query PostgreSQL role_permissions matrix
      const permQuery = `
        SELECT p.code
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1 AND p.code = $2
      `;
      const permResult = await pool.query(permQuery, [user.role_id, permissionCode]);

      if (permResult.rows.length === 0) {
        return sendError(res, 403, `Access Denied: Missing required permission "${permissionCode}".`, []);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkPermission };
