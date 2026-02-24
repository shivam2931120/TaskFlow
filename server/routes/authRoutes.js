// Auth Routes
// This file defines all authentication routes

const express = require('express');
const router = express.Router();
const { register, login, logout, checkAuth } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes - accessible by anyone
router.post('/register', register);  // Naya account banao
router.post('/login', login);        // Login

// Protected routes - sirf logged in users ke liye
router.post('/logout', authMiddleware, logout);     // Logout
router.get('/check', authMiddleware, checkAuth);    // Check auth status

module.exports = router;
