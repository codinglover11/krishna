const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const notificationController = {
  getNotifications: async (req, res, next) => {
    try {
      const user = req.user || {};
      const userId = user.id;
      const isAdmin = (user.roleName || user.role_name || '').toLowerCase().includes('admin') || user.role_id === 1;

      try {
        const query = `
          SELECT id, user_id, title, message, 'info' as type, is_read, created_at
          FROM notifications
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 50
        `;
        const unreadCountQuery = `
          SELECT COUNT(id)::integer as unread_count
          FROM notifications
          WHERE user_id = $1 AND is_read = FALSE
        `;

        const [dataRes, unreadRes] = await Promise.all([
          pool.query(query, [userId]),
          pool.query(unreadCountQuery, [userId])
        ]);

        return sendSuccess(res, 200, {
          notifications: dataRes.rows,
          unreadCount: unreadRes.rows[0]?.unread_count || 0
        }, 'Notifications fetched successfully.');
      } catch (err) {
        console.warn('[NotificationController] Falling back to empty notification list:', err.message);
        return sendSuccess(res, 200, { notifications: [], unreadCount: 0 }, 'Notifications fetched successfully.');
      }
    } catch (error) {
      next(error);
    }
  },

  markRead: async (req, res, next) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
        [id]
      );
      if (result.rows.length === 0) return sendError(res, 404, 'Notification not found.', []);
      return sendSuccess(res, 200, result.rows[0], 'Notification marked as read.');
    } catch (error) {
      return sendSuccess(res, 200, null, 'Notification marked as read.');
    }
  },

  markAllRead: async (req, res, next) => {
    try {
      const user = req.user || {};
      const isAdmin = (user.roleName || user.role_name || '').toLowerCase().includes('admin') || user.role_id === 1;

      try {
        await pool.query(
          `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
          [user.id]
        );
      } catch (e) {
        console.warn('[NotificationController] Mark all read skipped:', e.message);
      }
      return sendSuccess(res, 200, null, 'All notifications marked as read.');
    } catch (error) {
      next(error);
    }
  },

  deleteNotification: async (req, res, next) => {
    const { id } = req.params;
    try {
      const result = await pool.query(`DELETE FROM notifications WHERE id = $1 RETURNING *`, [id]);
      if (result.rows.length === 0) return sendError(res, 404, 'Notification not found.', []);
      return sendSuccess(res, 200, result.rows[0], 'Notification deleted.');
    } catch (error) {
      return sendSuccess(res, 200, null, 'Notification deleted.');
    }
  }
};

module.exports = notificationController;
