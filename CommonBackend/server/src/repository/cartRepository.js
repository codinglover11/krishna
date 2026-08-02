const { pool } = require('../config/db');

const cartRepository = {
  findOrCreateCart: async (userId) => {
    // Check if cart exists
    const checkQuery = `SELECT * FROM cart WHERE user_id = $1`;
    const checkRes = await pool.query(checkQuery, [userId]);
    if (checkRes.rows.length > 0) {
      return checkRes.rows[0];
    }

    // Provision new cart if missing
    const insertQuery = `INSERT INTO cart (user_id) VALUES ($1) RETURNING *`;
    const insertRes = await pool.query(insertQuery, [userId]);
    return insertRes.rows[0];
  },

  findCartItems: async (cartId) => {
    const query = `
      SELECT ci.id as cart_item_id, ci.quantity,
             p.id as product_id, p.name as product_name, p.price, p.discount_price, p.brand, p.slug,
             pv.id as variant_id, pv.stock_quantity,
             s.size_label, col.color_name, col.color_code,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM cart_items ci
      JOIN product_variants pv ON ci.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN sizes s ON pv.size_id = s.id
      LEFT JOIN colors col ON pv.color_id = col.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `;
    const res = await pool.query(query, [cartId]);
    return res.rows;
  },

  findCartItemByVariant: async (cartId, variantId) => {
    const query = `SELECT * FROM cart_items WHERE cart_id = $1 AND product_variant_id = $2`;
    const res = await pool.query(query, [cartId, variantId]);
    return res.rows[0];
  },

  addCartItem: async (cartId, productId, variantId, quantity) => {
    const query = `
      INSERT INTO cart_items (cart_id, product_variant_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_variant_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const res = await pool.query(query, [cartId, variantId, quantity]);
    return res.rows[0];
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    const query = `UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
    const res = await pool.query(query, [quantity, itemId]);
    return res.rows[0];
  },

  removeCartItem: async (itemId) => {
    const query = `DELETE FROM cart_items WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [itemId]);
    return res.rows[0];
  },

  clearCartItems: async (cartId) => {
    const query = `DELETE FROM cart_items WHERE cart_id = $1 RETURNING *`;
    const res = await pool.query(query, [cartId]);
    return res.rows;
  }
};

module.exports = cartRepository;
