// Notification Routes
// yeh file notification system ke routes define karti hai

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Saare notification routes protected hain
router.use(authMiddleware);

router.get('/', getNotifications);          // Saari notifications dekho
router.put('/read-all', markAllAsRead);     // Saari read mark karo
router.put('/:id/read', markAsRead);        // Ek notification read mark karo
router.delete('/:id', deleteNotification);  // Notification delete karo

module.exports = router;
