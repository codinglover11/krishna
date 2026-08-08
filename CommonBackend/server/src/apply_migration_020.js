const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { pool } = require('./config/db');

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Running migration 020...');

    // 1. Add latitude and longitude to addresses
    await client.query(`ALTER TABLE addresses ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8)`);
    await client.query(`ALTER TABLE addresses ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8)`);

    // 2. Add delivery_distance and delivery_charge to orders
    await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_distance DECIMAL(10, 2)`);
    await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 0.00`);

    // 3. Drop constraint and recreate to allow 'Pending_Verification' for payment_status
    await client.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check`);
    await client.query(`ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('Pending', 'Pending_Verification', 'Paid', 'Failed', 'Refunded'))`);

    await client.query('COMMIT');
    console.log('Migration 020 completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
