const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seedAdmin() {
  console.log('Seeding Super Admin user into PostgreSQL database...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ensure roles exist
    await client.query(`
      INSERT INTO roles (id, name) VALUES (1, 'Super Admin'), (2, 'Customer')
      ON CONFLICT (id) DO NOTHING
    `);

    // 2. Hash password
    const email = 'piyushtewani11@gmail.com';
    const rawPassword = 'Shyam11';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // 3. Upsert Super Admin user
    const userRes = await client.query(`
      INSERT INTO users (role_id, name, email, password_hash, is_active)
      VALUES (1, 'Piyush Tewani (Super Admin)', $1, $2, TRUE)
      ON CONFLICT (email) 
      DO UPDATE SET 
        role_id = 1,
        password_hash = EXCLUDED.password_hash,
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, name, email, role_id, is_active;
    `, [email, passwordHash]);

    await client.query('COMMIT');

    console.log('==================================================');
    console.log('SUCCESS: Admin User Seeded Successfully!');
    console.log('User Details:', userRes.rows[0]);
    console.log('==================================================');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('FAILED to seed admin user:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedAdmin();
