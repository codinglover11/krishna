const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const bannerController = {
  getPublicBanners: async (req, res, next) => {
    try {
      const query = `
        SELECT id, title, subtitle, description, image_url, link_url, display_order, created_at
        FROM banners
        WHERE (is_deleted IS FALSE OR is_deleted IS NULL)
          AND is_active = TRUE
        ORDER BY display_order ASC, created_at DESC
      `;
      const result = await pool.query(query);
      return sendSuccess(res, 200, result.rows, 'Active banners fetched.');
    } catch (error) {
      console.warn('[BannerController] Falling back to basic banner query:', error.message);
      try {
        const fallbackQuery = `SELECT id, title, image_url, link_url FROM banners WHERE is_active = TRUE`;
        const result = await pool.query(fallbackQuery);
        return sendSuccess(res, 200, result.rows, 'Active banners fetched.');
      } catch (err) {
        return sendSuccess(res, 200, [], 'No banners active.');
      }
    }
  },

  getAdminBanners: async (req, res, next) => {
    try {
      const includeDeleted = req.query.includeDeleted === 'true';
      let query = `SELECT * FROM banners`;
      if (!includeDeleted) {
        query += ` WHERE (is_deleted IS FALSE OR is_deleted IS NULL)`;
      }
      query += ` ORDER BY display_order ASC, created_at DESC`;
      const result = await pool.query(query);
      return sendSuccess(res, 200, result.rows, 'Admin banners fetched.');
    } catch (error) {
      next(error);
    }
  },

  createBanner: async (req, res, next) => {
    const { title, subtitle, description, imageUrl, linkUrl, displayOrder, startDate, endDate, isActive } = req.body;
    if (!title || !imageUrl) {
      return sendError(res, 400, 'Banner title and Cloudinary image URL are required.', []);
    }

    try {
      const query = `
        INSERT INTO banners (title, subtitle, description, image_url, link_url, display_order, start_date, end_date, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        title, subtitle || '', description || '', imageUrl, linkUrl || '',
        displayOrder || 0, startDate || null, endDate || null, isActive !== false
      ];
      const resQuery = await pool.query(query, values);
      return sendSuccess(res, 201, resQuery.rows[0], 'Banner created successfully.');
    } catch (error) {
      next(error);
    }
  },

  updateBanner: async (req, res, next) => {
    const { id } = req.params;
    const { title, subtitle, description, imageUrl, linkUrl, displayOrder, startDate, endDate, isActive } = req.body;

    try {
      const existing = await pool.query(`SELECT id FROM banners WHERE id = $1`, [id]);
      if (existing.rows.length === 0) {
        return sendError(res, 404, 'Banner not found.', []);
      }

      const query = `
        UPDATE banners
        SET title = $1, subtitle = $2, description = $3, image_url = $4, link_url = $5,
            display_order = $6, start_date = $7, end_date = $8, is_active = $9
        WHERE id = $10
        RETURNING *
      `;
      const values = [
        title, subtitle || '', description || '', imageUrl, linkUrl || '',
        displayOrder || 0, startDate || null, endDate || null, isActive !== false, id
      ];
      const resQuery = await pool.query(query, values);
      return sendSuccess(res, 200, resQuery.rows[0], 'Banner updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  deleteBanner: async (req, res, next) => {
    const { id } = req.params;
    try {
      const resQuery = await pool.query(`UPDATE banners SET is_deleted = TRUE, is_active = FALSE WHERE id = $1 RETURNING *`, [id]);
      if (resQuery.rows.length === 0) return sendError(res, 404, 'Banner not found.', []);
      return sendSuccess(res, 200, resQuery.rows[0], 'Banner soft-deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  restoreBanner: async (req, res, next) => {
    const { id } = req.params;
    try {
      const resQuery = await pool.query(`UPDATE banners SET is_deleted = FALSE, is_active = TRUE WHERE id = $1 RETURNING *`, [id]);
      if (resQuery.rows.length === 0) return sendError(res, 404, 'Banner not found.', []);
      return sendSuccess(res, 200, resQuery.rows[0], 'Banner restored successfully.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bannerController;
