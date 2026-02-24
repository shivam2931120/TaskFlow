// Authentication Controller
// yeh controller user registration, login aur logout handle karta hai

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const logger = require('../utils/logger');

// JWT token generate karne ka helper function
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// Cookie options - secure aur HTTP-only
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

// ==================== REGISTER ====================
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email aur password saare required hain' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password kam se kam 6 characters ka hona chahiye' });

    // Email pehle se registered hai kya
    const { rows: existing } = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: 'Is email se pehle se account hai. Please login karein.' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const { rows } = await db.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );
    const newUser = rows[0];

    // Welcome notification create karo
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [newUser.id, 'Welcome to TaskFlow!', 'Aapka account successfully create ho gaya hai. Tasks add karna shuru karein!', 'info']
    );

    const token = generateToken(newUser);
    res.cookie('token', token, cookieOptions);
    logger.info('Naya user registered: ' + newUser.email);

    res.status(201).json({ success: true, message: 'Registration successful!', user: newUser, token });
  } catch (error) {
    logger.error('Register controller error: ' + error.message);
    next(error);
  }
};

// ==================== LOGIN ====================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email aur password dono required hain' });

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = rows[0];

    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email ya password' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Failed login attempt: ' + email);
      return res.status(401).json({ success: false, message: 'Invalid email ya password' });
    }

    const token = generateToken(user);
    res.cookie('token', token, cookieOptions);
    logger.info('User logged in: ' + user.email);

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ success: true, message: 'Login successful!', user: userWithoutPassword, token });
  } catch (error) {
    logger.error('Login controller error: ' + error.message);
    next(error);
  }
};

// ==================== LOGOUT ====================
const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
    logger.info('User logged out: ' + (req.user?.email || 'Unknown'));
    res.status(200).json({ success: true, message: 'Logout successful!' });
  } catch (error) {
    logger.error('Logout controller error: ' + error.message);
    next(error);
  }
};

// ==================== CHECK AUTH ====================
const checkAuth = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ success: false, message: 'User nahi mila' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error('Check auth error: ' + error.message);
    next(error);
  }
};

module.exports = { register, login, logout, checkAuth };
