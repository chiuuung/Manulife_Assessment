const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const MAX_RETRIES = 10;
const RETRY_DELAY = 3000; // milliseconds

// Test database connection with retry logic
const testConnection = async (retries = 0) => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
  } catch (error) {
    console.error(`❌ Database connection error: ${error.code || error}`);
    if (retries < MAX_RETRIES) {
      const nextTry = retries + 1;
      console.log(`🔄 Retrying database connection in ${RETRY_DELAY / 1000}s... (attempt ${nextTry}/${MAX_RETRIES})`);
      setTimeout(() => testConnection(nextTry), RETRY_DELAY);
    } else {
      console.error('❌ Max database connection retries reached. Please check your DB service.');
    }
  }
};

// Run the test when this file is imported
testConnection();

module.exports = pool;