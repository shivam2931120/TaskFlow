// Authentication Middleware
// yeh middleware JWT token verify karta hai har protected route ke liye

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Token verify karne ka middleware
const authMiddleware = (req, res, next) => {
  try {
    // Cookie se token lo ya Authorization header se
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    // Agar token nahi mila to unauthorized response do
    if (!token) {
      logger.warn('Auth middleware: Token nahi mila - unauthorized access attempt');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.',
      });
    }

    // JWT token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User info request object me daal do - aage controllers use karenge
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    // Sab sahi hai to next middleware/controller pe jaao
    next();
  } catch (error) {
    // Token expired ya invalid hai
    if (error.name === 'TokenExpiredError') {
      logger.warn('Auth middleware: Token expire ho gaya hai');
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
    }

    logger.error('Auth middleware error: ' + error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }
};

module.exports = authMiddleware;
