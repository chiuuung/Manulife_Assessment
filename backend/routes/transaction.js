const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../database/config/db');

// Get all transactions for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const [transactions] = await pool.query(
      `SELECT t.*, a.symbol, a.name 
       FROM transactions t
       JOIN assets a ON t.asset_id = a.id
       WHERE t.user_id = ?
       ORDER BY transaction_date DESC`,
      [req.user.id]
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transactions for a specific asset
router.get('/asset/:assetId', verifyToken, async (req, res) => {
  try {
    const [transactions] = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = ? AND asset_id = ?
       ORDER BY transaction_date DESC`,
      [req.user.id, req.params.assetId]
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new transaction
router.post('/', verifyToken, async (req, res) => {
  try {
    const { asset_id, type, quantity, price, notes } = req.body;
    
    // Validate input
    if (!asset_id || !type || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if asset exists and belongs to user
    const [assets] = await pool.query(
      'SELECT * FROM assets WHERE id = ? AND user_id = ?',
      [asset_id, req.user.id]
    );
    
    if (assets.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    const asset = assets[0];
    
    // Insert transaction
    const [result] = await pool.query(
      `INSERT INTO transactions 
       (user_id, asset_id, type, quantity, price, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, asset_id, type, quantity, price, notes || null]
    );
    
    // Update asset quantity based on transaction type
    let newQuantity = parseFloat(asset.quantity);
    if (type === 'buy') {
      newQuantity += parseFloat(quantity);
    } else if (type === 'sell') {
      newQuantity -= parseFloat(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({ message: 'Cannot sell more than owned quantity' });
      }
    }
    
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