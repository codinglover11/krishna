const EventEmitter = require('events');
const { pool } = require('../config/db');

class NotificationEmitter extends EventEmitter {}
const notificationEmitter = new NotificationEmitter();

const notificationService = {
  emitter: notificationEmitter,

  createNotification: async ({ userId = null, isAdmin = false, title, message, type = 'info' }) => {
    try {
      const query = `
        INSERT INTO notifications (user_id, is_admin, title, message, type, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, FALSE, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const values = [userId || null, isAdmin === true, title, message, type];
      const result = await pool.query(query, values);
      const notification = result.rows[0];

      // Emit real-time event hook (ready for Socket.io / WebSocket server)
      notificationEmitter.emit('notification_dispatched', notification);

      return notification;
    } catch (error) {
      console.error('Failed to dispatch notification:', error);
    }
  }
};

module.exports = notificationService;
