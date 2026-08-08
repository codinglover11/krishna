const { pool } = require('../config/db');
const auditLogService = require('../services/auditLogService');
const communicationService = require('../services/communicationService');
const { sendSuccess, sendError } = require('../utils/response');

const ALLOWED_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded'
];

const adminOrderController = {
  getAllOrders: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const search = req.query.search || '';
      const status = req.query.status || '';
      const paymentStatus = req.query.paymentStatus || '';
      const startDate = req.query.startDate || '';
      const endDate = req.query.endDate || '';

      let query = `
        SELECT o.id, o.order_number, o.status, o.total_price, o.discount_amount,
               o.tax_amount, o.shipping_amount, o.payment_method, o.payment_status,
               o.payment_reference, o.created_at, o.updated_at,
               u.id as user_id, u.name as customer_name, u.email as customer_email,
               a.full_name as shipping_name, a.phone_number as customer_phone,
               a.city, a.state,
               (SELECT COUNT(id) FROM order_items WHERE order_id = o.id)::integer as items_count
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN addresses a ON o.address_id = a.id
        WHERE 1=1
      `;
      const values = [];
      let countParam = 1;

      if (search) {
        query += ` AND (o.order_number ILIKE $${countParam} OR u.name ILIKE $${countParam} OR u.email ILIKE $${countParam} OR a.phone_number ILIKE $${countParam} OR o.status ILIKE $${countParam})`;
        values.push(`%${search}%`);
        countParam++;
      }

      if (status) {
        query += ` AND o.status = $${countParam}`;
        values.push(status);
        countParam++;
      }

      if (paymentStatus) {
        query += ` AND o.payment_status = $${countParam}`;
        values.push(paymentStatus);
        countParam++;
      }

      if (startDate) {
        query += ` AND o.created_at >= $${countParam}`;
        values.push(startDate);
        countParam++;
      }

      if (endDate) {
        query += ` AND o.created_at <= $${countParam}`;
        values.push(`${endDate} 23:59:59`);
        countParam++;
      }

      query += ` ORDER BY o.created_at DESC`;

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

      return sendSuccess(res, 200, { orders: result.rows, pagination }, 'Orders fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, res, next) => {
    const { id } = req.params;
    try {
      const orderRes = await pool.query(
        `SELECT o.*, u.id as user_id, u.name as customer_name, u.email as customer_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id::text = $1 OR o.order_number = $1`,
        [id]
      );
      const order = orderRes.rows[0];

      if (!order) {
        return sendError(res, 404, 'Order not found.', []);
      }

      // Shipping Address
      const addressRes = await pool.query(`SELECT * FROM addresses WHERE id = $1`, [order.address_id]);
      order.address = addressRes.rows[0] || null;

      // Order Items
      const itemsRes = await pool.query(
        `SELECT oi.id, oi.quantity, oi.price_at_purchase,
                pv.id as variant_id, p.id as product_id, p.name as product_name,
                p.sku, p.brand, s.size_label, col.color_name, col.color_code,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
         FROM order_items oi
         JOIN product_variants pv ON oi.product_variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         LEFT JOIN sizes s ON pv.size_id = s.id
         LEFT JOIN colors col ON pv.color_id = col.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsRes.rows;

      // Status Timeline History
      const historyRes = await pool.query(
        `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC`,
        [order.id]
      );
      order.status_history = historyRes.rows;

      return sendSuccess(res, 200, order, 'Order details fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  updateOrderStatus: async (req, res, next) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminUser = req.user;

    if (!ALLOWED_STATUSES.includes(status)) {
      return sendError(res, 400, `Invalid order status. Allowed: ${ALLOWED_STATUSES.join(', ')}`, []);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existingRes = await client.query(`SELECT * FROM orders WHERE id = $1 FOR UPDATE`, [id]);
      const order = existingRes.rows[0];

      if (!order) {
        await client.query('ROLLBACK');
        return sendError(res, 404, 'Order not found.', []);
      }

      const prevStatus = order.status;
      let newPaymentStatus = order.payment_status;

      // Automatic payment status update upon delivery
      if (status === 'Delivered' && order.payment_method === 'COD') {
        newPaymentStatus = 'Paid';
      } else if (['Cancelled', 'Refunded'].includes(status) && order.payment_status === 'Paid') {
        newPaymentStatus = 'Refunded';
      }

      // Update Order Table
      const updateRes = await client.query(
        `UPDATE orders
         SET status = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [status, newPaymentStatus, id]
      );
      const updatedOrder = updateRes.rows[0];

      // Stock Restoration if Cancelled / Returned / Refunded from an active status
      if (['Cancelled', 'Returned', 'Refunded'].includes(status) && !['Cancelled', 'Returned', 'Refunded'].includes(prevStatus)) {
        const itemsRes = await client.query(`SELECT product_variant_id, quantity FROM order_items WHERE order_id = $1`, [id]);
        for (const item of itemsRes.rows) {
          await client.query(
            `UPDATE product_variants SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [item.quantity, item.product_variant_id]
          );
        }
      }

      // Record Status History Entry
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes)
         VALUES ($1, $2, $3)`,
        [id, status, notes || `Status updated from ${prevStatus} to ${status}`]
      );

      // Create Notification for Customer
      const notifTitle = `Order #${order.order_number} ${status}`;
      const notifMsg = `Your order #${order.order_number} status has been updated to ${status}.`;
      await client.query(
        `INSERT INTO notifications (user_id, is_admin, title, message, type, is_read, created_at)
         VALUES ($1, FALSE, $2, $3, 'order', FALSE, CURRENT_TIMESTAMP)`,
        [order.user_id, notifTitle, notifMsg]
      );

      await client.query('COMMIT');

      // Audit Log for Admin Action
      await auditLogService.logAudit(req, {
        action: 'ORDER_STATUS_UPDATED',
        module: 'Orders',
        description: `Updated order #${order.order_number} status from ${prevStatus} to ${status}`
      });

      // Communication Service Abstraction Trigger
      await communicationService.sendEmail({
        to: `user_${order.user_id}@customer.com`,
        subject: `Update on your Order #${order.order_number}`,
        template: 'order_status_update',
        data: { orderNumber: order.order_number, status }
      });

      return sendSuccess(res, 200, updatedOrder, `Order status updated to "${status}".`);
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }
};

module.exports = adminOrderController;
