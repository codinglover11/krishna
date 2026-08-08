require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { pool } = require('./config/db');

const run = async () => {
  try {
    console.log('Running migration...');
    const res = await pool.query(`
      ALTER TABLE product_images 
      ADD COLUMN IF NOT EXISTS color_id INTEGER REFERENCES colors(id) ON DELETE SET NULL;
    `);
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
};

run();
