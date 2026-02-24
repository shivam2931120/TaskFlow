// Main Server File
// yeh file Express server ko configure aur start karti hai

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Environment variables load karo - __dirname se .env ka path pinpoint karo
dotenv.config({ path: path.join(__dirname, '.env') });

const logger = require('./utils/logger');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/errorMiddleware');
const { testConnection } = require('./config/db');

// Routes import karo
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Express app banao
const app = express();
const PORT = process.env.PORT || 5000;

// ==================== SECURITY MIDDLEWARE ====================
// Helmet - security headers set karta hai
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Just safely echo the exact origin requested by the browser
      callback(null, origin || '*');
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// Rate Limiting - bahut zyada requests block karo (DDoS protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute ki window
  max: 1000, // Ek IP se max 1000 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth routes ke liye strict rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Auth routes ke liye sirf 20 requests
  message: {
    success: false,
    message: 'Login attempts limit exceed. 15 minute baad try karein.',
  },
});
app.use('/api/auth', authLimiter);

// ==================== BODY PARSING ====================
// JSON body parse karo
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookies parse karo
app.use(cookieParser());

// ==================== LOGGING ====================
// Morgan HTTP request logger
app.use(loggerMiddleware);

// ==================== API ROUTES ====================
// Mounting routes with and without '/api' prefix to be fail-safe 
// (in case NEXT_PUBLIC_API_URL is missing the /api suffix)
['/api', ''].forEach((prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/tasks`, taskRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API Root. Please use /api endpoints.',
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API chal raha hai!',
    timestamp: new Date().toISOString(),
  });
});

// ==================== ERROR HANDLING ====================
// 404 handler - koi route match nahi hua
app.use(notFoundMiddleware);

// Central error handler - saari errors yahan catch hoti hain
app.use(errorMiddleware);

// ==================== SERVER START ====================
const startServer = async () => {
  try {
    // Supabase connection test karo
    await testConnection();

    // Vercel handles the listening part internally, so we only listen if we are NOT on Vercel
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      app.listen(PORT, () => {
        logger.info(`TaskFlow server port ${PORT} pe chal raha hai`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`API URL: http://localhost:${PORT}/api`);
      });
    }
  } catch (error) {
    logger.error('Server start me error aaya: ' + error.message);
    // Don't kill process on Vercel
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      process.exit(1);
    }
  }
};

// Server shuru karo
startServer();

module.exports = app;
