const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const pool = require('../database/config/db');

// Use only the env variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment!');
}

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt: ${email}`);

    // Special hardcoded case for admin
    if (email === 'admin@gmail.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 999, isAdmin: true },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: 999,
          username: 'admin',
          email: 'admin@gmail.com',
          isAdmin: true
        }
      });
    }
    
    // Regular database login
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = users[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Create and sign token with HARDCODED secret
    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during authentication', error: error.message });
  }
});

// Public endpoint for users - no authentication needed
router.get('/users/public', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, isAdmin, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Authenticated endpoint for users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, isAdmin, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user route
router.delete('/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;