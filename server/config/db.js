// Database Configuration (pg Pool)
// yeh file PostgreSQL connection pool setup karti hai Supabase session pooler ke saath

const { Pool } = require('pg');
const logger = require('../utils/logger');

// Session pooler connection string env se lo
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Supabase ke liye SSL required hai
  },
  max: 10,                 // Max 10 concurrent connections
  idleTimeoutMillis: 30000, // 30 sec ke baad idle connection close karo
  connectionTimeoutMillis: 5000, // 5 sec me connect nahi hua to error
});

// Connection error handle karo
pool.on('error', (err) => {
  logger.error('Unexpected pool error: ' + err.message);
});

// Connection test karne ka function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()'); // Simple test query
    client.release();
    logger.info('PostgreSQL (Supabase pooler) se connection successful hai');
  } catch (err) {
    logger.error('Database se connect nahi ho paa raha: ' + err.message);
    // Server band mat karo - retry hoga
  }
};

module.exports = { db: pool, testConnection };
