const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../database/config/db');

// Get all transactions for the current user, or ALL if admin
router.get('/', verifyToken, async (req, res) => {
  try {
    let transactions, query, params;
    if (req.user.isAdmin) {
      query = `
        SELECT t.*, a.symbol, a.name, u.username, u.email
        FROM transactions t
        JOIN assets a ON t.asset_id = a.id
        JOIN users u ON t.user_id = u.id
        ORDER BY transaction_date DESC
      `;
      params = [];
    } else {
      query = `
        SELECT t.*, a.symbol, a.name 
        FROM transactions t
        JOIN assets a ON t.asset_id = a.id
        WHERE t.user_id = ?
        ORDER BY transaction_date DESC
      `;
      params = [req.user.id];
    }
    [transactions] = await pool.query(query, params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transactions for a specific asset (admin can see all)
router.get('/asset/:assetId', verifyToken, async (req, res) => {
  try {
    let transactions, query, params;
    if (req.user.isAdmin) {
      query = `
        SELECT * FROM transactions 
        WHERE asset_id = ?
        ORDER BY transaction_date DESC
      `;
      params = [req.params.assetId];
    } else {
      query = `
        SELECT * FROM transactions 
        WHERE user_id = ? AND asset_id = ?
        ORDER BY transaction_date DESC
      `;
      params = [req.user.id, req.params.assetId];
    }
    [transactions] = await pool.query(query, params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new transaction (always under the current user)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { asset_id, type, quantity, price, notes } = req.body;

    // Validate input
    if (!asset_id || !type || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if asset exists and belongs to user, or admin
    let assets, query, params;
    if (req.user.isAdmin) {
      query = 'SELECT * FROM assets WHERE id = ?';
      params = [asset_id];
    } else {
      query = 'SELECT * FROM assets WHERE id = ? AND user_id = ?';
      params = [asset_id, req.user.id];
    }
    [assets] = await pool.query(query, params);

    if (assets.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const asset = assets[0];
    let newQuantity = parseFloat(asset.quantity);

    // Check quantity logic BEFORE inserting transaction!
    if (type === 'buy') {
      newQuantity += parseFloat(quantity);
    } else if (type === 'sell') {
      newQuantity -= parseFloat(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({ message: 'Cannot sell more than owned quantity' });
      }
    }

    // Only insert transaction if valid
    const [result] = await pool.query(
      `INSERT INTO transactions 
       (user_id, asset_id, type, quantity, price, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, asset_id, type, quantity, price, notes || null]
    );

    // Update asset
    await pool.query(
      'UPDATE assets SET quantity = ?, current_price = ? WHERE id = ?',
      [newQuantity, price, asset_id]
    );

    res.status(201).json({ 
      message: 'Transaction created successfully',
      transaction_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;