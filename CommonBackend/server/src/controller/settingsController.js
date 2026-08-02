const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const settingsController = {
  getSettings: async (req, res, next) => {
    try {
      const query = `SELECT * FROM store_settings WHERE id = 1 LIMIT 1`;
      const result = await pool.query(query);
      
      const settings = result.rows[0] || {
        store_name: 'Krishna Footwear',
        email: 'support@krishnafootwear.com',
        phone: '+91 98765 43210',
        address: '123 Leather Craft Street, Footwear Hub, India'
      };

      return sendSuccess(res, 200, settings, 'Store settings fetched.');
    } catch (error) {
      next(error);
    }
  },

  updateSettings: async (req, res, next) => {
    const {
      storeName, storeLogo, email, phone, address,
      facebookUrl, instagramUrl, twitterUrl,
      shippingConfig, taxConfig, returnPolicy, aboutContent
    } = req.body;

    try {
      const query = `
        INSERT INTO store_settings (
          id, store_name, store_logo, email, phone, address,
          facebook_url, instagram_url, twitter_url,
          shipping_config, tax_config, return_policy, about_content, updated_at
        ) VALUES (
          1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          store_name = EXCLUDED.store_name,
          store_logo = EXCLUDED.store_logo,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          facebook_url = EXCLUDED.facebook_url,
          instagram_url = EXCLUDED.instagram_url,
          twitter_url = EXCLUDED.twitter_url,
          shipping_config = EXCLUDED.shipping_config,
          tax_config = EXCLUDED.tax_config,
          return_policy = EXCLUDED.return_policy,
          about_content = EXCLUDED.about_content,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const values = [
        storeName || 'Krishna Footwear',
        storeLogo || null,
        email || 'support@krishnafootwear.com',
        phone || '',
        address || '',
        facebookUrl || '',
        instagramUrl || '',
        twitterUrl || '',
        shippingConfig ? JSON.stringify(shippingConfig) : '{}',
        taxConfig ? JSON.stringify(taxConfig) : '{}',
        returnPolicy || '',
        aboutContent || ''
      ];

      const result = await pool.query(query, values);
      return sendSuccess(res, 200, result.rows[0], 'Store settings updated successfully.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = settingsController;
