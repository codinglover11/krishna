const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const inventoryController = {
  getInventory: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const stockFilter = req.query.stockFilter; // 'low', 'out', 'in'

      let query = `
        SELECT pv.id as variant_id, pv.product_id, pv.stock_quantity, pv.updated_at,
               p.name as product_name, p.sku, p.brand, p.is_active, p.price,
               c.name as category_name, s.size_label, col.color_name, col.color_code,
               (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN sizes s ON pv.size_id = s.id
        LEFT JOIN colors col ON pv.color_id = col.id
        WHERE (p.is_deleted IS FALSE OR p.is_deleted IS NULL)
      `;
      const values = [];
      let countParam = 1;

      if (search) {
        query += ` AND (p.name ILIKE $${countParam} OR p.sku ILIKE $${countParam} OR s.size_label ILIKE $${countParam} OR col.color_name ILIKE $${countParam})`;
        values.push(`%${search}%`);
        countParam++;
      }

      if (stockFilter === 'out') {
        query += ` AND pv.stock_quantity = 0`;
      } else if (stockFilter === 'low') {
        query += ` AND pv.stock_quantity > 0 AND pv.stock_quantity <= 5`;
      } else if (stockFilter === 'in') {
        query += ` AND pv.stock_quantity > 5`;
      }

      query += ` ORDER BY pv.stock_quantity ASC, p.name ASC`;

      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_table`;
      const totalResult = await pool.query(countQuery, values);
      const totalCount = parseInt(totalResult.rows[0].count, 10);

      query += ` LIMIT $${countParam} OFFSET $${countParam + 1}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);

      // Summary indicators
      const summaryRes = await pool.query(`
        SELECT 
          COUNT(CASE WHEN pv.stock_quantity = 0 THEN 1 END)::integer as out_of_stock_count,
          COUNT(CASE WHEN pv.stock_quantity > 0 AND pv.stock_quantity <= 5 THEN 1 END)::integer as low_stock_count,
          COUNT(CASE WHEN pv.stock_quantity > 5 THEN 1 END)::integer as in_stock_count,
          COALESCE(SUM(pv.stock_quantity), 0)::integer as total_items_count
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        WHERE (p.is_deleted IS FALSE OR p.is_deleted IS NULL)
      `);

      const summary = summaryRes.rows[0];
      const pagination = {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };

      return sendSuccess(res, 200, { items: result.rows, summary, pagination }, 'Inventory data fetched.');
    } catch (error) {
      next(error);
    }
  },

  updateVariantStock: async (req, res, next) => {
    const { variantId } = req.params;
    const { stockQuantity } = req.body;

    if (stockQuantity === undefined || stockQuantity < 0) {
      return sendError(res, 400, 'Valid stock quantity (>= 0) is required.', []);
    }

    try {
      const query = `
        UPDATE product_variants
        SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const resQuery = await pool.query(query, [stockQuantity, variantId]);
      if (resQuery.rows.length === 0) {
        return sendError(res, 404, 'Product variant not found.', []);
      }

      return sendSuccess(res, 200, resQuery.rows[0], 'Stock quantity updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  getLookupMetadata: async (req, res, next) => {
    try {
      // Auto-migrate color_id
      await pool.query('ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color_id INTEGER REFERENCES colors(id) ON DELETE SET NULL;');
      
      const sizesRes = await pool.query(`SELECT * FROM sizes ORDER BY id ASC`);
      const colorsRes = await pool.query(`SELECT * FROM colors ORDER BY id ASC`);
      return sendSuccess(res, 200, { sizes: sizesRes.rows, colors: colorsRes.rows }, 'Sizes and colors fetched.');
    } catch (error) {
      next(error);
    }
  },

  createSize: async (req, res, next) => {
    try {
      const { size_label } = req.body;
      if (!size_label) return sendError(res, 400, 'Size label is required');
      const result = await pool.query('INSERT INTO sizes (size_label) VALUES ($1) RETURNING *', [size_label]);
      return sendSuccess(res, 201, result.rows[0], 'Size created');
    } catch (error) {
      next(error);
    }
  },

  createColor: async (req, res, next) => {
    try {
      const { color_name, color_code } = req.body;
      if (!color_name || !color_code) return sendError(res, 400, 'Color name and code are required');
      const result = await pool.query('INSERT INTO colors (color_name, color_code) VALUES ($1, $2) RETURNING *', [color_name, color_code]);
      return sendSuccess(res, 201, result.rows[0], 'Color created');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = inventoryController;
