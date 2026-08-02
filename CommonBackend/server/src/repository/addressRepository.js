const { pool } = require('../config/db');

const addressRepository = {
  findAddressesByUserId: async (userId) => {
    const query = `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },

  findAddressById: async (id) => {
    const query = `SELECT * FROM addresses WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  },

  createAddress: async (userId, data) => {
    const query = `
      INSERT INTO addresses (
        user_id, full_name, address_line1, address_line2, city, state, postal_code,
        phone_number, alternate_phone, landmark, country, address_type, is_default
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const res = await pool.query(query, [
      userId, data.fullName, data.addressLine1, data.addressLine2, data.city, data.state,
      data.postalCode, data.phoneNumber, data.alternatePhone, data.landmark,
      data.country || 'India', data.addressType || 'Home', data.isDefault || false
    ]);
    return res.rows[0];
  },

  updateAddress: async (id, data) => {
    const query = `
      UPDATE addresses
      SET full_name = $1, address_line1 = $2, address_line2 = $3, city = $4, state = $5,
          postal_code = $6, phone_number = $7, alternate_phone = $8, landmark = $9,
          country = $10, address_type = $11, is_default = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `;
    const res = await pool.query(query, [
      data.fullName, data.addressLine1, data.addressLine2, data.city, data.state,
      data.postalCode, data.phoneNumber, data.alternatePhone, data.landmark,
      data.country || 'India', data.addressType || 'Home', data.isDefault || false, id
    ]);
    return res.rows[0];
  },

  deleteAddress: async (id) => {
    const query = `DELETE FROM addresses WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  },

  clearDefaultsExcept: async (userId, exceptId) => {
    const query = `UPDATE addresses SET is_default = FALSE WHERE user_id = $1 AND id != $2`;
    await pool.query(query, [userId, exceptId]);
  },

  setDefault: async (userId, id) => {
    // Within transaction or sequential update
    await pool.query('BEGIN');
    try {
      await pool.query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [userId]);
      await pool.query(`UPDATE addresses SET is_default = TRUE WHERE id = $1`, [id]);
      await pool.query('COMMIT');
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  }
};

module.exports = addressRepository;
