const { Router } = require('express');
const { pool } = require('../config/db');
const { getHealth } = require('../controllers/healthController');
const { validate, createValidationSchemas } = require('../middleware/validation');

const router = Router();

router.get('/', validate(createValidationSchemas().health), getHealth);

router.get('/migrate', async (req, res) => {
  try {
    await pool.query('ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color_id INTEGER REFERENCES colors(id) ON DELETE SET NULL;');
    res.json({ success: true, message: 'Migration applied successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
