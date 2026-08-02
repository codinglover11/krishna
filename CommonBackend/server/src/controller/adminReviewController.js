const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const adminReviewController = {
  getAdminReviews: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const { search, status, rating, productId } = req.query;

      let whereClause = `WHERE (r.is_deleted IS FALSE OR r.is_deleted IS NULL)`;
      const queryParams = [];
      let paramIdx = 1;

      if (search) {
        whereClause += ` AND (u.name ILIKE $${paramIdx} OR p.name ILIKE $${paramIdx} OR r.comment ILIKE $${paramIdx})`;
        queryParams.push(`%${search}%`);
        paramIdx++;
      }

      if (status) {
        whereClause += ` AND r.status = $${paramIdx}`;
        queryParams.push(status);
        paramIdx++;
      }

      if (rating) {
        whereClause += ` AND r.rating = $${paramIdx}`;
        queryParams.push(parseInt(rating, 10));
        paramIdx++;
      }

      if (productId) {
        whereClause += ` AND r.product_id = $${paramIdx}`;
        queryParams.push(productId);
        paramIdx++;
      }

      const countQuery = `
        SELECT COUNT(r.id)::integer as total
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.id
        ${whereClause}
      `;
      const countRes = await pool.query(countQuery, queryParams);
      const totalReviews = countRes.rows[0]?.total || 0;

      const dataQuery = `
        SELECT r.id, r.rating, r.comment, r.status, r.created_at,
               u.id as user_id, u.name as customer_name, u.email as customer_email,
               p.id as product_id, p.name as product_name, p.sku as product_sku
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
      `;
      queryParams.push(limit, offset);

      const dataRes = await pool.query(dataQuery, queryParams);

      return sendSuccess(res, 200, {
        reviews: dataRes.rows,
        pagination: {
          totalItems: totalReviews,
          totalPages: Math.ceil(totalReviews / limit),
          currentPage: page,
          limit
        }
      }, 'Admin reviews fetched.');
    } catch (error) {
      next(error);
    }
  },

  getReviewById: async (req, res, next) => {
    const { id } = req.params;
    try {
      const query = `
        SELECT r.id, r.rating, r.comment, r.status, r.created_at,
               u.id as user_id, u.name as customer_name, u.email as customer_email,
               p.id as product_id, p.name as product_name, p.sku as product_sku
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.id
        WHERE r.id = $1 AND (r.is_deleted IS FALSE OR r.is_deleted IS NULL)
      `;
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return sendError(res, 404, 'Review not found.', []);
      return sendSuccess(res, 200, result.rows[0], 'Review details fetched.');
    } catch (error) {
      next(error);
    }
  },

  updateReviewStatus: async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Pending', 'Approved', 'Rejected'];
    if (!status || !allowed.includes(status)) {
      return sendError(res, 400, `Invalid review status. Allowed values: ${allowed.join(', ')}`, []);
    }

    try {
      const query = `
        UPDATE reviews
        SET status = $1
        WHERE id = $2 AND (is_deleted IS FALSE OR is_deleted IS NULL)
        RETURNING *
      `;
      const result = await pool.query(query, [status, id]);
      if (result.rows.length === 0) return sendError(res, 404, 'Review not found.', []);

      return sendSuccess(res, 200, result.rows[0], `Review status updated to "${status}".`);
    } catch (error) {
      next(error);
    }
  },

  deleteReview: async (req, res, next) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `UPDATE reviews SET is_deleted = TRUE, status = 'Rejected' WHERE id = $1 RETURNING *`,
        [id]
      );
      if (result.rows.length === 0) return sendError(res, 404, 'Review not found.', []);
      return sendSuccess(res, 200, result.rows[0], 'Review soft-deleted.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminReviewController;
