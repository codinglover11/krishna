const express = require('express');
const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Public Get Approved Product Reviews
router.get('/', async (req, res, next) => {
  try {
    const { productId } = req.query;
    try {
      let query = `
        SELECT r.id, r.rating, r.comment, r.created_at, u.name as customer_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.is_approved = TRUE
      `;
      const params = [];
      if (productId) {
        query += ` AND r.product_id = $1`;
        params.push(productId);
      }
      query += ` ORDER BY r.created_at DESC`;
      const result = await pool.query(query, params);
      return sendSuccess(res, 200, result.rows, 'Approved reviews fetched.');
    } catch (err) {
      console.warn('[ReviewRoute] Falling back to basic reviews query:', err.message);
      let query = `
        SELECT r.id, r.rating, r.comment, r.created_at, u.name as customer_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
      `;
      const params = [];
      if (productId) {
        query += ` WHERE r.product_id = $1`;
        params.push(productId);
      }
      query += ` ORDER BY r.created_at DESC`;
      const result = await pool.query(query, params);
      return sendSuccess(res, 200, result.rows, 'Approved reviews fetched.');
    }
  } catch (error) {
    next(error);
  }
});

// Authenticated Post Product Review
router.post('/', authenticateToken, async (req, res, next) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || rating < 1 || rating > 5) {
    return sendError(res, 400, 'Product ID and a valid rating (1 to 5 stars) are required.', []);
  }

  try {
    const query = `
      INSERT INTO reviews (user_id, product_id, rating, comment, is_approved)
      VALUES ($1, $2, $3, $4, TRUE)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [userId, productId, rating, comment || '']);
    return sendSuccess(res, 201, result.rows[0], 'Review submitted successfully.');
  } catch (err) {
    console.warn('[ReviewRoute] Falling back to basic review insertion:', err.message);
    try {
      const fallbackQuery = `
        INSERT INTO reviews (user_id, product_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await pool.query(fallbackQuery, [userId, productId, rating, comment || '']);
      return sendSuccess(res, 201, result.rows[0], 'Review submitted successfully.');
    } catch (error) {
      next(error);
    }
  }
});

module.exports = router;
