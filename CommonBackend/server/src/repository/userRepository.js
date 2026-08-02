const { pool } = require('../config/db');

const userRepository = {
  createUser: async (name, email, passwordHash, roleId = 3, phone = null, avatar = null, dbClient = pool) => {
    try {
      const query = `
        INSERT INTO users (role_id, name, email, password_hash, phone, avatar)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, role_id, name, email, phone, avatar, is_active, created_at, updated_at
      `;
      const values = [roleId, name, email, passwordHash, phone, avatar];
      const result = await dbClient.query(query, values);
      return result.rows[0];
    } catch (err) {
      const fallbackQuery = `
        INSERT INTO users (role_id, name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, role_id, name, email, created_at
      `;
      const result = await dbClient.query(fallbackQuery, [roleId, name, email, passwordHash]);
      return result.rows[0];
    }
  },

  updateUserProfile: async (id, name, email, phone = null, avatar = null) => {
    try {
      const query = `
        UPDATE users
        SET name = $1, 
            email = $2, 
            phone = COALESCE($3, phone),
            avatar = COALESCE($4, avatar),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, role_id, name, email, phone, avatar, is_active, created_at, updated_at
      `;
      const result = await pool.query(query, [name, email, phone, avatar, id]);
      return result.rows[0];
    } catch (err) {
      const fallbackQuery = `
        UPDATE users
        SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, role_id, name, email, created_at
      `;
      const result = await pool.query(fallbackQuery, [name, email, id]);
      return result.rows[0];
    }
  },

  findUserByEmail: async (email) => {
    try {
      const query = `
        SELECT u.*, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1
      `;
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      const fallbackQuery = `SELECT * FROM users WHERE email = $1`;
      const result = await pool.query(fallbackQuery, [email]);
      return result.rows[0];
    }
  },

  findUserById: async (id) => {
    try {
      const query = `
        SELECT u.id, u.role_id, r.name as role_name, u.name, u.email, u.phone, u.avatar, u.is_active, u.created_at, u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      const fallbackQuery = `
        SELECT u.id, u.role_id, r.name as role_name, u.name, u.email, u.created_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
      `;
      const result = await pool.query(fallbackQuery, [id]);
      return result.rows[0];
    }
  },

  updateUserPassword: async (id, passwordHash) => {
    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [passwordHash, id]);
    return result.rows[0];
  },

  saveRefreshToken: async (userId, token, expiresAt) => {
    try {
      const query = `
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await pool.query(query, [userId, token, expiresAt]);
      return result.rows[0];
    } catch (err) {
      console.warn('[UserRepository] Warning saving refresh token:', err.message);
      return { user_id: userId, token, expires_at: expiresAt };
    }
  },

  findRefreshToken: async (token) => {
    try {
      const query = `
        SELECT * FROM refresh_tokens
        WHERE token = $1 AND is_revoked = FALSE AND expires_at > CURRENT_TIMESTAMP
      `;
      const result = await pool.query(query, [token]);
      return result.rows[0];
    } catch (err) {
      return null;
    }
  },

  revokeRefreshToken: async (token) => {
    try {
      const query = `UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1 RETURNING *`;
      const result = await pool.query(query, [token]);
      return result.rows[0];
    } catch (err) {
      return null;
    }
  },

  revokeAllUserRefreshTokens: async (userId) => {
    try {
      const query = `UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1 RETURNING *`;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (err) {
      return [];
    }
  }
};

module.exports = userRepository;
