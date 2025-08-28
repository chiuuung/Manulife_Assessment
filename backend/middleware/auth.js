const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment!');
}

const verifyToken = (req, res, next) => {
  const header = req.header('Authorization');
  if (!header) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  const token = header.split(' ')[1];

  // Allow demo/admin session token for admin.html local login
  if (token === 'admin-session-token') {
    req.user = {
      id: 1, // Make sure this matches your admin user in the DB
      username: 'admin',
      email: 'admin@gmail.com',
      isAdmin: true
    };
    return next();
  }

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;