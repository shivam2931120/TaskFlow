// User Controller
// yeh controller user profile operations handle karta hai

const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const logger = require('../utils/logger');

// ==================== GET PROFILE ====================
const getProfile = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ success: false, message: 'User profile nahi mili' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error('Get profile error: ' + error.message);
    next(error);
  }
};

// ==================== UPDATE PROFILE ====================
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name && !email)
      return res.status(400).json({ success: false, message: 'Kam se kam ek field provide karein (name ya email)' });

    // Duplicate email check (agar email change ho rahi hai)
    if (email) {
      const { rows: dup } = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase().trim(), userId]
      );
      if (dup.length > 0)
        return res.status(409).json({ success: false, message: 'Yeh email already kisi aur ke paas registered hai' });
    }

    // Dynamic update query banao
    const updates = [];
    const params = [];
    let idx = 1;
    if (name)  { updates.push(`name = $${idx++}`);  params.push(name.trim()); }
    if (email) { updates.push(`email = $${idx++}`); params.push(email.toLowerCase().trim()); }
    params.push(userId);

    const { rows } = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, created_at`,
      params
    );
    const updatedUser = rows[0];

    // Profile update notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [userId, 'Profile Updated', 'Aapki profile successfully update ho gayi hai.', 'info']
    );

    logger.info('Profile updated: ' + updatedUser.email);
    res.status(200).json({ success: true, message: 'Profile successfully update ho gayi', user: updatedUser });
  } catch (error) {
    logger.error('Update profile controller error: ' + error.message);
    next(error);
  }
};

// ==================== CHANGE PASSWORD ====================
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Current password aur new password dono required hain' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password kam se kam 6 characters ka hona chahiye' });

    const { rows } = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    const user = rows[0];
    if (!user) return res.status(404).json({ success: false, message: 'User nahi mila' });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ success: false, message: 'Current password galat hai' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    logger.info('Password changed: ' + req.user.email);
    res.status(200).json({ success: true, message: 'Password successfully change ho gaya' });
  } catch (error) {
    logger.error('Change password controller error: ' + error.message);
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
