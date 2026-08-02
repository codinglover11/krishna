const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || '';

// Enable SSL rejectUnauthorized: false required for Neon PostgreSQL secure cloud database
const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: (connectionString.includes('sslmode=require') || connectionString.includes('neon.tech'))
        ? { rejectUnauthorized: false }
        : false,
      max: 20, // High-concurrency connection pool bound
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    })
  : null;

const getDatabaseConfig = () => ({
  connectionString,
  configured: Boolean(connectionString),
  driver: 'postgresql',
});

const testConnection = async () => {
  if (!pool) {
    return { ok: false, message: 'Database credentials are not configured yet' };
  }

  try {
    const result = await pool.query('SELECT NOW()');
    return { ok: true, message: 'Database connection successful', timestamp: result.rows[0].now };
  } catch (error) {
    return { ok: false, message: error.message };
  }
};

module.exports = {
  pool,
  getDatabaseConfig,
  testConnection,
};
