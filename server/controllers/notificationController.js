// Notification Controller
// yeh controller notification CRUD operations handle karta hai

const { db } = require('../config/db');
const logger = require('../utils/logger');

// ==================== GET NOTIFICATIONS ====================
const getNotifications = async (req, res, next) => {
  try {
    const { rows: notifications } = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    logger.error('Get notifications controller error: ' + error.message);
    next(error);
  }
};

// ==================== MARK AS READ ====================
const markAsRead = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Notification nahi mili' });
    res.status(200).json({ success: true, message: 'Notification read mark ho gayi', notification: rows[0] });
  } catch (error) {
    logger.error('Mark as read error: ' + error.message);
    next(error);
  }
};

// ==================== MARK ALL AS READ ====================
const markAllAsRead = async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    logger.info('All notifications marked as read for user ' + req.user.email);
    res.status(200).json({ success: true, message: 'Saari notifications read mark ho gayi' });
  } catch (error) {
    logger.error('Mark all as read controller error: ' + error.message);
    next(error);
  }
};

// ==================== DELETE NOTIFICATION ====================
const deleteNotification = async (req, res, next) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'Notification nahi mili ya delete me error aaya' });
    res.status(200).json({ success: true, message: 'Notification delete ho gayi' });
  } catch (error) {
    logger.error('Delete notification error: ' + error.message);
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
