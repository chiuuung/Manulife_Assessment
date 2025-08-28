const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// If JWT_SECRET is missing, set a fallback
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not found in .env file, using fallback value');
  process.env.JWT_SECRET = '87654321';
}

console.log('Server starting with JWT_SECRET available:', !!process.env.JWT_SECRET);

// Import routes
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const transactionRoutes = require('./routes/transaction');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('Portfolio Management API is running');
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});