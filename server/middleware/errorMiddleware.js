// Error Handling Middleware
// yeh middleware saari errors centrally handle karta hai

const logger = require('../utils/logger');

// Central error handler - jab bhi koi error aaye yeh catch karega
const errorMiddleware = (err, req, res, next) => {
  // Error log karo
  logger.error(`Error: ${err.message} | Path: ${req.originalUrl} | Method: ${req.method}`);

  // Default error values set karo
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Validation errors ke liye special handling
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // JWT errors ke liye
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Duplicate key error (Supabase)
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  // Production me stack trace mat bhejo
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

// 404 handler - jab koi route match nahi karta
const notFoundMiddleware = (req, res, next) => {
  logger.warn(`Route nahi mila: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorMiddleware, notFoundMiddleware };
