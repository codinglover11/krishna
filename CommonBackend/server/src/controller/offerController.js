const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const offerController = {
  getPublicOffers: async (req, res, next) => {
    try {
      const query = `
        SELECT o.*, p.name as product_name, c.name as category_name
        FROM offers o
        LEFT JOIN products p ON o.target_product_id = p.id
        LEFT JOIN categories c ON o.target_category_id = c.id
        WHERE (o.is_deleted IS FALSE OR o.is_deleted IS NULL)
          AND o.is_active = TRUE
          AND (o.start_date IS NULL OR o.start_date <= CURRENT_TIMESTAMP)
          AND (o.end_date IS NULL OR o.end_date >= CURRENT_TIMESTAMP)
        ORDER BY o.created_at DESC
      `;
      const result = await pool.query(query);
      return sendSuccess(res, 200, result.rows, 'Active offers fetched.');
    } catch (error) {
      next(error);
    }
  },

  getAdminOffers: async (req, res, next) => {
    try {
      const query = `
        SELECT o.*, p.name as product_name, c.name as category_name
        FROM offers o
        LEFT JOIN products p ON o.target_product_id = p.id
        LEFT JOIN categories c ON o.target_category_id = c.id
        WHERE (o.is_deleted IS FALSE OR o.is_deleted IS NULL)
        ORDER BY o.created_at DESC
      `;
      const result = await pool.query(query);
      return sendSuccess(res, 200, result.rows, 'Admin offers fetched.');
    } catch (error) {
      next(error);
    }
  },

  createOffer: async (req, res, next) => {
    const { title, description, discountType, discountValue, offerScope, targetProductId, targetCategoryId, startDate, endDate, isActive } = req.body;
    if (!title || discountValue === undefined) {
      return sendError(res, 400, 'Offer title and discount value are required.', []);
    }

    try {
      const query = `
        INSERT INTO offers (title, description, discount_type, discount_value, discount_percentage, offer_scope, target_product_id, target_category_id, start_date, end_date, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const discVal = parseFloat(discountValue) || 0;
      const discPct = discountType === 'flat' ? 10 : Math.min(100, Math.max(1, Math.round(discVal)));

      const values = [
        title, description || '', discountType || 'percentage', discVal, discPct,
        offerScope || 'store', targetProductId || null, targetCategoryId || null,
        startDate || new Date(), endDate || new Date(Date.now() + 30 * 86400000), isActive !== false
      ];
      const resQuery = await pool.query(query, values);
      return sendSuccess(res, 201, resQuery.rows[0], 'Offer created successfully.');
    } catch (error) {
      next(error);
    }
  },

  updateOffer: async (req, res, next) => {
    const { id } = req.params;
    const { title, description, discountType, discountValue, offerScope, targetProductId, targetCategoryId, startDate, endDate, isActive } = req.body;

    try {
      const existing = await pool.query(`SELECT id FROM offers WHERE id = $1`, [id]);
      if (existing.rows.length === 0) {
        return sendError(res, 404, 'Offer not found.', []);
      }

      const query = `
        UPDATE offers
        SET title = $1, description = $2, discount_type = $3, discount_value = $4,
            discount_percentage = $5, offer_scope = $6, target_product_id = $7,
            target_category_id = $8, start_date = $9, end_date = $10, is_active = $11
        WHERE id = $12
        RETURNING *
      `;
      const discVal = parseFloat(discountValue) || 0;
      const discPct = discountType === 'flat' ? 10 : Math.min(100, Math.max(1, Math.round(discVal)));

      const values = [
        title, description || '', discountType || 'percentage', discVal, discPct,
        offerScope || 'store', targetProductId || null, targetCategoryId || null,
        startDate || new Date(), endDate || new Date(Date.now() + 30 * 86400000), isActive !== false, id
      ];
      const resQuery = await pool.query(query, values);
      return sendSuccess(res, 200, resQuery.rows[0], 'Offer updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  deleteOffer: async (req, res, next) => {
    const { id } = req.params;
    try {
      const resQuery = await pool.query(`UPDATE offers SET is_deleted = TRUE, is_active = FALSE WHERE id = $1 RETURNING *`, [id]);
      if (resQuery.rows.length === 0) return sendError(res, 404, 'Offer not found.', []);
      return sendSuccess(res, 200, resQuery.rows[0], 'Offer deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = offerController;
