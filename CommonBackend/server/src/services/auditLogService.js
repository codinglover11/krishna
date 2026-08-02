const { pool } = require('../config/db');

const auditLogService = {
  logAudit: async (req, { action, module: moduleName, description }) => {
    try {
      const adminUser = req.user || {};
      const adminId = adminUser.id || null;
      const adminName = adminUser.name || 'System Admin';

      // Extract client IP address securely
      const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';

      const query = `
        INSERT INTO audit_logs (admin_id, admin_name, action, module, description, ip_address, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const values = [adminId, adminName, action, moduleName, description, ipAddress];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Failed to log admin audit entry:', error);
    }
  }
};

module.exports = auditLogService;
