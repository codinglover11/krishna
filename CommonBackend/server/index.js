const app = require('./src/app');
const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/db');
const logger = require('./src/utils/logger');

const port = Number(process.env.PORT || 5000);

// Auto-ensure Super Admin credentials in database on server startup
async function ensureAdminUser() {
  try {
    const email = 'piyushtewani11@gmail.com';
    const rawPassword = 'Shyam11';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // 1. Ensure roles exist
    await pool.query(`
      INSERT INTO roles (id, name) VALUES (1, 'Super Admin'), (2, 'Customer')
      ON CONFLICT (id) DO NOTHING
    `);

    // 2. Upsert admin user
    const res = await pool.query(`
      INSERT INTO users (role_id, name, email, password_hash, is_active)
      VALUES (1, 'Piyush Tewani (Super Admin)', $1, $2, TRUE)
      ON CONFLICT (email) 
      DO UPDATE SET 
        role_id = 1,
        password_hash = EXCLUDED.password_hash,
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, role_id;
    `, [email, passwordHash]);

    logger.info(`Super Admin user active: ${res.rows[0].email} (Role ID: ${res.rows[0].role_id})`);
  } catch (err) {
    logger.error('Failed to auto-seed Super Admin user on startup:', err);
  }
}

app.listen(port, async () => {
  console.log(`CommonBackend listening on port ${port}`);
  await ensureAdminUser();
});
