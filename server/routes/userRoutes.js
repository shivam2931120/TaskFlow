// User Routes
// yeh file user profile ke routes define karti hai

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Saare user routes protected hain - login zaroori hai
router.use(authMiddleware);

router.get('/profile', getProfile);           // Profile dekhein
router.put('/profile', updateProfile);        // Profile update karein
router.put('/change-password', changePassword); // Password change karein

module.exports = router;
