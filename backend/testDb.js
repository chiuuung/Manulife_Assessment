const pool = require('./database/config/db');

async function testDatabase() {
  try {
    console.log('=== DATABASE CONNECTION TEST ===');
    
    // Test 1: List all tables
    console.log('\n1. Checking database tables:');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables in database:', tables.map(t => Object.values(t)[0]));

    // Test 2: Check users table structure
    console.log('\n2. Checking users table structure:');
    const [columns] = await pool.query('DESCRIBE users');
    console.log('Users table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });

    // Test 3: Check for isAdmin column
    const hasAdminColumn = columns.some(col => col.Field === 'isAdmin');
    console.log('\n3. isAdmin column exists:', hasAdminColumn ? 'YES ✓' : 'NO ✗');

    // Test 4: Check all users in the database
    console.log('\n4. Listing all users:');
    const [users] = await pool.query('SELECT id, username, email, isAdmin, created_at FROM users');
    
    if (users.length === 0) {
      console.log('  No users found in the database');
    } else {
      users.forEach(user => {
        console.log(`  User #${user.id}: ${user.username} (${user.email})`);
        console.log(`    Admin: ${user.isAdmin ? 'YES ✓' : 'NO ✗'}`);
        console.log(`    Created: ${user.created_at}`);
      });
    }

    // Test 5: Specifically look for admin users
    console.log('\n5. Checking for admin users:');
    const [admins] = await pool.query('SELECT id, username, email FROM users WHERE isAdmin = true');
    
    if (admins.length === 0) {
      console.log('  No admin users found');
    } else {
      admins.forEach(admin => {
        console.log(`  Admin found: ${admin.username} (${admin.email})`);
      });
    }
    
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    // Close the connection pool
    pool.end();
  }
}

testDatabase();