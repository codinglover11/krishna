const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const auditLogController = {
  getAuditLogs: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 15;
      const offset = (page - 1) * limit;

      const { search, module: moduleFilter, startDate, endDate } = req.query;

      let whereClause = `WHERE 1=1`;
      const queryParams = [];
      let paramIdx = 1;

      if (search) {
        whereClause += ` AND (admin_name ILIKE $${paramIdx} OR action ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`;
        queryParams.push(`%${search}%`);
        paramIdx++;
      }

      if (moduleFilter) {
        whereClause += ` AND module = $${paramIdx}`;
        queryParams.push(moduleFilter);
        paramIdx++;
      }

      if (startDate) {
        whereClause += ` AND created_at >= $${paramIdx}`;
        queryParams.push(startDate);
        paramIdx++;
      }

      if (endDate) {
        whereClause += ` AND created_at <= $${paramIdx}`;
        queryParams.push(endDate);
        paramIdx++;
      }

      const countQuery = `SELECT COUNT(id)::integer as total FROM audit_logs ${whereClause}`;
      const countRes = await pool.query(countQuery, queryParams);
      const totalLogs = countRes.rows[0]?.total || 0;

      const dataQuery = `
        SELECT id, admin_id, admin_name, action, module, description, ip_address, created_at
        FROM audit_logs
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
      `;
      queryParams.push(limit, offset);

      const dataRes = await pool.query(dataQuery, queryParams);

      return sendSuccess(res, 200, {
        logs: dataRes.rows,
        pagination: {
          totalItems: totalLogs,
          totalPages: Math.ceil(totalLogs / limit),
          currentPage: page,
          limit
        }
      }, 'Admin audit logs fetched.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = auditLogController;
