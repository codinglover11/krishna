const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const rbacController = {
  // Admin User Management
  getAdminUsers: async (req, res, next) => {
    try {
      const query = `
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.is_active, u.created_at
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE r.name IN ('Super Admin', 'Admin', 'Manager') OR u.role_id IN (1, 3, 4)
        ORDER BY u.created_at DESC
      `;
      const result = await pool.query(query);
      return sendSuccess(res, 200, result.rows, 'Admin users fetched.');
    } catch (error) {
      next(error);
    }
  },

  createAdminUser: async (req, res, next) => {
    const { name, email, password, roleId } = req.body;
    if (!name || !email || !password || !roleId) {
      return sendError(res, 400, 'Name, email, password, and role ID are required.', []);
    }

    try {
      const existing = await pool.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
      if (existing.rows.length > 0) {
        return sendError(res, 400, 'User with this email already exists.', []);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const query = `
        INSERT INTO users (name, email, password_hash, role_id, is_active)
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING id, name, email, role_id, is_active, created_at
      `;
      const resQuery = await pool.query(query, [name, email, hashedPassword, roleId]);
      return sendSuccess(res, 201, resQuery.rows[0], 'Admin user created successfully.');
    } catch (error) {
      next(error);
    }
  },

  toggleAdminUserStatus: async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
      const query = `
        UPDATE users
        SET is_active = $1
        WHERE id = $2
        RETURNING id, name, email, role_id, is_active
      `;
      const result = await pool.query(query, [isActive !== false, id]);
      if (result.rows.length === 0) return sendError(res, 404, 'Admin user not found.', []);
      return sendSuccess(res, 200, result.rows[0], 'Admin user status updated.');
    } catch (error) {
      next(error);
    }
  },

  // Roles & Permissions Matrix Management
  getRoles: async (req, res, next) => {
    try {
      const rolesRes = await pool.query(`SELECT id, name, description FROM roles ORDER BY id ASC`);
      const permRes = await pool.query(`
        SELECT rp.role_id, p.id as permission_id, p.code as permission_code
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
      `);

      const roles = rolesRes.rows.map((role) => {
        const assigned = permRes.rows
          .filter((p) => p.role_id === role.id)
          .map((p) => p.permission_code);
        return { ...role, permissions: assigned };
      });

      return sendSuccess(res, 200, roles, 'Roles & permission assignments fetched.');
    } catch (error) {
      next(error);
    }
  },

  createRole: async (req, res, next) => {
    const { name, description } = req.body;
    if (!name) return sendError(res, 400, 'Role name is required.', []);

    try {
      const query = `INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *`;
      const result = await pool.query(query, [name, description || '']);
      return sendSuccess(res, 201, result.rows[0], 'Role created successfully.');
    } catch (error) {
      next(error);
    }
  },

  getPermissions: async (req, res, next) => {
    try {
      const result = await pool.query(`SELECT * FROM permissions ORDER BY module ASC, code ASC`);
      return sendSuccess(res, 200, result.rows, 'System permissions fetched.');
    } catch (error) {
      next(error);
    }
  },

  updateRolePermissions: async (req, res, next) => {
    const { id } = req.params; // role_id
    const { permissionCodes } = req.body; // array of permission code strings

    if (!Array.isArray(permissionCodes)) {
      return sendError(res, 400, 'permissionCodes must be an array of string codes.', []);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Delete current role permissions
      await client.query(`DELETE FROM role_permissions WHERE role_id = $1`, [id]);

      // 2. Insert new assigned permissions
      if (permissionCodes.length > 0) {
        const permIdsRes = await client.query(
          `SELECT id FROM permissions WHERE code = ANY($1)`,
          [permissionCodes]
        );
        for (const pRow of permIdsRes.rows) {
          await client.query(
            `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`,
            [id, pRow.id]
          );
        }
      }

      await client.query('COMMIT');
      return sendSuccess(res, 200, { roleId: id, permissionCodes }, 'Role permissions updated successfully.');
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }
};

module.exports = rbacController;
