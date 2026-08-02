const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const adminCustomerController = {
  getAdminCustomers: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const search = req.query.search || '';
      const isActive = req.query.isActive;

      // Select explicit non-sensitive fields ONLY
      let query = `
        SELECT u.id, u.name, u.email, u.is_active, u.created_at, u.updated_at,
               COALESCE((SELECT phone_number FROM addresses WHERE user_id = u.id AND is_default = TRUE LIMIT 1),
                        (SELECT phone_number FROM addresses WHERE user_id = u.id LIMIT 1)) as mobile,
               COALESCE((SELECT COUNT(id) FROM orders WHERE user_id = u.id), 0)::integer as total_orders,
               COALESCE((SELECT SUM(total_price) FROM orders WHERE user_id = u.id AND status NOT IN ('Cancelled')), 0.00)::numeric(10,2) as total_spent,
               (SELECT MAX(created_at) FROM orders WHERE user_id = u.id) as last_order_date
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE (r.name = 'Customer' OR r.name = 'USER' OR u.role_id = 2 OR r.name IS NULL)
      `;
      const values = [];
      let countParam = 1;

      if (search) {
        query += ` AND (u.name ILIKE $${countParam} OR u.email ILIKE $${countParam} OR EXISTS (SELECT 1 FROM addresses WHERE user_id = u.id AND phone_number ILIKE $${countParam}))`;
        values.push(`%${search}%`);
        countParam++;
      }

      if (isActive === 'true' || isActive === 'false') {
        query += ` AND u.is_active = $${countParam}`;
        values.push(isActive === 'true');
        countParam++;
      }

      query += ` ORDER BY u.created_at DESC`;

      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_table`;
      const totalResult = await pool.query(countQuery, values);
      const totalCount = parseInt(totalResult.rows[0].count, 10);

      query += ` LIMIT $${countParam} OFFSET $${countParam + 1}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);

      const pagination = {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };

      return sendSuccess(res, 200, { customers: result.rows, pagination }, 'Customers fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  getAdminCustomerById: async (req, res, next) => {
    const { id } = req.params;
    try {
      const userRes = await pool.query(
        `SELECT u.id, u.name, u.email, u.is_active, u.created_at, u.updated_at,
                COALESCE((SELECT COUNT(id) FROM orders WHERE user_id = u.id), 0)::integer as total_orders,
                COALESCE((SELECT SUM(total_price) FROM orders WHERE user_id = u.id AND status NOT IN ('Cancelled')), 0.00)::numeric(10,2) as total_spent,
                COALESCE((SELECT AVG(total_price) FROM orders WHERE user_id = u.id AND status NOT IN ('Cancelled')), 0.00)::numeric(10,2) as avg_order_value,
                (SELECT MAX(created_at) FROM orders WHERE user_id = u.id) as last_order_date
         FROM users u
         WHERE u.id = $1`,
        [id]
      );
      const customer = userRes.rows[0];

      if (!customer) {
        return sendError(res, 404, 'Customer not found.', []);
      }

      // Addresses List
      const addrRes = await pool.query(
        `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
        [id]
      );
      customer.addresses = addrRes.rows;

      return sendSuccess(res, 200, customer, 'Customer details fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  getAdminCustomerOrders: async (req, res, next) => {
    const { id } = req.params;
    try {
      const ordersRes = await pool.query(
        `SELECT o.id, o.order_number, o.status, o.total_price, o.payment_method,
                o.payment_status, o.created_at,
                (SELECT COUNT(id) FROM order_items WHERE order_id = o.id)::integer as items_count
         FROM orders o
         WHERE o.user_id = $1
         ORDER BY o.created_at DESC`,
        [id]
      );

      return sendSuccess(res, 200, ordersRes.rows, 'Customer orders fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  toggleCustomerStatus: async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
      const userRes = await pool.query(`SELECT id, is_active FROM users WHERE id = $1`, [id]);
      if (userRes.rows.length === 0) {
        return sendError(res, 404, 'Customer not found.', []);
      }

      const updateRes = await pool.query(
        `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, is_active`,
        [!!isActive, id]
      );

      return sendSuccess(res, 200, updateRes.rows[0], `Customer account ${isActive ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminCustomerController;
