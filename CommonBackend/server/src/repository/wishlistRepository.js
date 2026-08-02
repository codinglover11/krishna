const { pool } = require('../config/db');

const wishlistRepository = {
  findWishlistByUserId: async (userId) => {
    try {
      const query = `
        SELECT w.id as wishlist_item_id, w.created_at,
               p.id as product_id, p.name as product_name, p.price, p.discount_price, p.brand, p.slug,
               c.name as category_name,
               (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
               CASE 
                 WHEN COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) > 0 THEN TRUE 
                 ELSE FALSE 
               END as is_in_stock
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = $1
        ORDER BY w.created_at DESC
      `;
      const res = await pool.query(query, [userId]);
      return res.rows;
    } catch (err) {
      console.warn('[WishlistRepository] Falling back to basic wishlist query:', err.message);
      const fallbackQuery = `
        SELECT w.id as wishlist_item_id, w.created_at,
               p.id as product_id, p.name as product_name, p.price,
               c.name as category_name,
               (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as primary_image,
               TRUE as is_in_stock
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = $1
        ORDER BY w.created_at DESC
      `;
      const res = await pool.query(fallbackQuery, [userId]);
      return res.rows;
    }
  },

  addToWishlist: async (userId, productId) => {
    const query = `
      INSERT INTO wishlist (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;
    const res = await pool.query(query, [userId, productId]);
    return res.rows[0];
  },

  removeFromWishlist: async (userId, productId) => {
    const query = `DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING *`;
    const res = await pool.query(query, [userId, productId]);
    return res.rows[0];
  },

  checkWishlistStatus: async (userId, productId) => {
    const query = `SELECT EXISTS(SELECT 1 FROM wishlist WHERE user_id = $1 AND product_id = $2) as exists`;
    const res = await pool.query(query, [userId, productId]);
    return res.rows[0].exists;
  }
};

module.exports = wishlistRepository;
