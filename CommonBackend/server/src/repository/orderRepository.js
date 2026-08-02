const { pool } = require('../config/db');

const orderRepository = {
  findOrdersByUserId: async (userId) => {
    const query = `
      SELECT o.*,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },

  findOrderById: async (id) => {
    const query = `
      SELECT o.*,
             a.full_name as address_name, a.address_line1, a.address_line2,
             a.city, a.state, a.postal_code, a.phone_number, a.alternate_phone, a.landmark, a.country
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.id = $1
    `;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  },

  findOrderItems: async (orderId) => {
    const query = `
      SELECT oi.*, p.name as product_name, p.brand, p.slug,
             s.size_label as size, c.color_name as color,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM order_items oi
      JOIN product_variants pv ON oi.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN sizes s ON pv.size_id = s.id
      LEFT JOIN colors c ON pv.color_id = c.id
      WHERE oi.order_id = $1
    `;
    const res = await pool.query(query, [orderId]);
    return res.rows;
  },

  createOrderAtomic: async (userId, data, cartItems) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert order
      const orderQuery = `
        INSERT INTO orders (
          user_id, address_id, status, total_price, discount_amount, tax_amount,
          shipping_amount, payment_method, payment_status, order_number
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const orderRes = await client.query(orderQuery, [
        userId, data.addressId, 'Pending', data.totalPrice, data.discountAmount || 0,
        data.taxAmount || 0, data.shippingAmount || 0, data.paymentMethod || 'COD',
        'Pending', data.orderNumber
      ]);
      const order = orderRes.rows[0];

      // 2. Loop cartItems: insert order_items & update inventory
      for (const item of cartItems) {
        const variantId = item.variant_id || item.variantId || item.product_variant_id;
        if (!variantId) {
          throw new Error('Invalid item variant selection.');
        }

        // Enforce inventory checks
        const checkStockRes = await client.query(
          `SELECT stock_quantity FROM product_variants WHERE id = $1 FOR UPDATE`,
          [variantId]
        );
        const variant = checkStockRes.rows[0];
        if (!variant || variant.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product variant size/color. Available: ${variant?.stock_quantity || 0}`);
        }

        // Insert order item
        const itemQuery = `
          INSERT INTO order_items (order_id, product_variant_id, quantity, price_at_purchase)
          VALUES ($1, $2, $3, $4)
        `;
        const purchasePrice = item.discountPrice ? parseFloat(item.discountPrice) : (parseFloat(item.unitPrice) || parseFloat(item.price) || 0);
        await client.query(itemQuery, [order.id, variantId, item.quantity, purchasePrice]);

        // Decrement stock
        const updateStockQuery = `
          UPDATE product_variants
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
        `;
        await client.query(updateStockQuery, [item.quantity, variantId]);
      }

      // 3. Clear customer cart items
      const cartRes = await client.query(`SELECT id FROM cart WHERE user_id = $1`, [userId]);
      if (cartRes.rows.length > 0) {
        await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartRes.rows[0].id]);
      }

      await client.query('COMMIT');
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  updateOrderStatus: async (id, status, paymentStatus = null) => {
    let query, params;
    if (paymentStatus) {
      query = `UPDATE orders SET status = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`;
      params = [status, paymentStatus, id];
    } else {
      query = `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
      params = [status, id];
    }
    const res = await pool.query(query, params);
    return res.rows[0];
  },

  cancelOrderAtomic: async (orderId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get order details to check eligibility
      const orderRes = await client.query(`SELECT status, user_id FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);
      const order = orderRes.rows[0];
      if (!order) {
        throw new Error('Order not found.');
      }
      if (order.status !== 'Pending' && order.status !== 'Confirmed') {
        throw new Error('Order is already being processed or shipped and cannot be cancelled.');
      }

      // 2. Cancel order
      await client.query(
        `UPDATE orders SET status = 'Cancelled', payment_status = 'Refunded', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [orderId]
      );

      // 3. Return items back to variant stock
      const itemsRes = await client.query(`SELECT product_variant_id, quantity FROM order_items WHERE order_id = $1`, [orderId]);
      for (const item of itemsRes.rows) {
        await client.query(
          `UPDATE product_variants SET stock_quantity = stock_quantity + $1 WHERE id = $2`,
          [item.quantity, item.product_variant_id]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};

module.exports = orderRepository;
