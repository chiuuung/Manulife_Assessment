const pool = require('./database/config/db');

async function testQuery() {
  try {
    // Test if we can query the database
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Database tables:', rows);
  } catch (error) {
    console.error('Query error:', error);
  }
}

testQuery();