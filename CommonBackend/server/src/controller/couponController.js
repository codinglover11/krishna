const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const couponController = {
  getAdminCoupons: async (req, res, next) => {
    try {
      const query = `
        SELECT c.*,
               COALESCE((SELECT COUNT(id) FROM orders WHERE coupon_id = c.id AND status NOT IN ('Cancelled')), 0)::integer as total_used_count
        FROM coupons c
        WHERE (c.is_deleted IS FALSE OR c.is_deleted IS NULL)
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query);
      return sendSuccess(res, 200, result.rows, 'Coupons fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  createCoupon: async (req, res, next) => {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, usagePerUser, startDate, expiresAt, isActive } = req.body;
    if (!code || discountValue === undefined) {
      return sendError(res, 400, 'Coupon code and discount value are required.', []);
    }

    try {
      const cleanCode = code.trim().toUpperCase();
      const existing = await pool.query(`SELECT id FROM coupons WHERE UPPER(code) = $1 AND (is_deleted IS FALSE OR is_deleted IS NULL)`, [cleanCode]);
      if (existing.rows.length > 0) {
        return sendError(res, 400, `Coupon code "${cleanCode}" already exists.`, []);
      }

      const query = `
        INSERT INTO coupons (code, description, discount_type, discount_value, is_percentage, min_order_amount, max_discount_amount, usage_limit, usage_per_user, start_date, expires_at, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      const discVal = parseFloat(discountValue) || 0;
      const isPct = discountType !== 'flat';

      const values = [
        cleanCode, description || '', discountType || 'percentage', discVal, isPct,
        parseFloat(minOrderAmount) || 0, maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit ? parseInt(usageLimit, 10) : null, usagePerUser ? parseInt(usagePerUser, 10) : 1,
        startDate || new Date(), expiresAt || new Date(Date.now() + 30 * 86400000), isActive !== false
      ];

      const resQuery = await pool.query(query, values);
      return sendSuccess(res, 201, resQuery.rows[0], 'Coupon created successfully.');
    } catch (error) {
      next(error);
    }
  },

  updateCoupon: async (req, res, next) => {
    const { id } = req.params;
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, usagePerUser, startDate, expiresAt, isActive } = req.body;

    try {
      const existing = await pool.query(`SELECT id FROM coupons WHERE id = $1`, [id]);
      if (existing.rows.length === 0) {
        return sendError(res, 404, 'Coupon not found.', []);
      }

      const cleanCode = code.trim().toUpperCase();
      const duplicate = await pool.query(`SELECT id FROM coupons WHERE UPPER(code) = $1 AND id != $2 AND (is_deleted IS FALSE OR is_deleted IS NULL)`, [cleanCode, id]);
      if (duplicate.rows.length > 0) {
        return sendError(res, 400, `Coupon code "${cleanCode}" already in use by another coupon.`, []);
      }

      const query = `
        UPDATE coupons
        SET code = $1, description = $2, discount_type = $3, discount_value = $4, is_percentage = $5,
            min_order_amount = $6, max_discount_amount = $7, usage_limit = $8, usage_per_user = $9,
            start_date = $10, expires_at = $11, is_active = $12
        WHERE id = $13
        RETURNING *
      `;
      const discVal = parseFloat(discountValue) || 0;
      const isPct = discountType !== 'flat';

      const values = [
        cleanCode, description || '', discountType || 'percentage', discVal, isPct,
        parseFloat(minOrderAmount) || 0, maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit ? parseInt(usageLimit, 10) : null, usagePerUser ? parseInt(usagePerUser, 10) : 1,
        startDate || new Date(), expiresAt || new Date(Date.now() + 30 * 86400000), isActive !== false, id
      ];

      const resQuery = await pool.query(query, values);
      return sendSuccess(res, 200, resQuery.rows[0], 'Coupon updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  deleteCoupon: async (req, res, next) => {
    const { id } = req.params;
    try {
      const resQuery = await pool.query(`UPDATE coupons SET is_deleted = TRUE, is_active = FALSE WHERE id = $1 RETURNING *`, [id]);
      if (resQuery.rows.length === 0) return sendError(res, 404, 'Coupon not found.', []);
      return sendSuccess(res, 200, resQuery.rows[0], 'Coupon deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  validateCoupon: async (req, res, next) => {
    const { code, subtotal, userId } = req.body;
    const currentSubtotal = parseFloat(subtotal) || 0;

    if (!code) {
      return sendError(res, 400, 'Please enter a coupon code.', []);
    }

    try {
      const cleanCode = code.trim().toUpperCase();
      const couponRes = await pool.query(
        `SELECT * FROM coupons WHERE UPPER(code) = $1 AND (is_deleted IS FALSE OR is_deleted IS NULL)`,
        [cleanCode]
      );
      const coupon = couponRes.rows[0];

      if (!coupon) {
        return sendError(res, 404, `Invalid coupon code "${cleanCode}".`, []);
      }

      if (!coupon.is_active) {
        return sendError(res, 400, `Coupon code "${cleanCode}" is currently inactive.`, []);
      }

      const now = new Date();
      if (coupon.start_date && new Date(coupon.start_date) > now) {
        return sendError(res, 400, `Coupon code "${cleanCode}" promotion has not started yet.`, []);
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return sendError(res, 400, `Coupon code "${cleanCode}" has expired.`, []);
      }

      if (coupon.min_order_amount && currentSubtotal < parseFloat(coupon.min_order_amount)) {
        return sendError(res, 400, `Minimum cart total of $${parseFloat(coupon.min_order_amount).toFixed(2)} required for coupon "${cleanCode}".`, []);
      }

      // Check Total Usage Limit
      if (coupon.usage_limit) {
        const totalUsedRes = await pool.query(
          `SELECT COUNT(id)::integer as count FROM orders WHERE coupon_id = $1 AND status NOT IN ('Cancelled')`,
          [coupon.id]
        );
        const totalUsed = totalUsedRes.rows[0]?.count || 0;
        if (totalUsed >= coupon.usage_limit) {
          return sendError(res, 400, `Coupon code "${cleanCode}" has reached its maximum global usage limit.`, []);
        }
      }

      // Check Per User Usage Limit
      if (userId && coupon.usage_per_user) {
        const userUsedRes = await pool.query(
          `SELECT COUNT(id)::integer as count FROM orders WHERE coupon_id = $1 AND user_id = $2 AND status NOT IN ('Cancelled')`,
          [coupon.id, userId]
        );
        const userUsed = userUsedRes.rows[0]?.count || 0;
        if (userUsed >= coupon.usage_per_user) {
          return sendError(res, 400, `You have already redeemed coupon "${cleanCode}" the maximum allowed number of times.`, []);
        }
      }

      // Calculate Discount Amount
      let discountAmount = 0;
      const val = parseFloat(coupon.discount_value) || 0;

      if (coupon.discount_type === 'flat' || !coupon.is_percentage) {
        discountAmount = Math.min(val, currentSubtotal);
      } else {
        discountAmount = (currentSubtotal * val) / 100;
        if (coupon.max_discount_amount && parseFloat(coupon.max_discount_amount) > 0) {
          discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
        }
      }

      discountAmount = Math.min(discountAmount, currentSubtotal);
      const finalTotal = Math.max(0, currentSubtotal - discountAmount);

      return sendSuccess(res, 200, {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discount_type,
          discountValue: coupon.discount_value
        },
        discountAmount,
        finalTotal
      }, `Coupon "${cleanCode}" applied successfully! Saved $${discountAmount.toFixed(2)}.`);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = couponController;
