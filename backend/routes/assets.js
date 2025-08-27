const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../database/config/db');

// Get all assets for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const [assets] = await pool.query(
      'SELECT * FROM assets WHERE user_id = ?',
      [req.user.id]
    );
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get asset by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [assets] = await pool.query(
      'SELECT * FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (assets.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.json(assets[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new asset
router.post('/', verifyToken, async (req, res) => {
  try {
    const { type, symbol, name, quantity, purchase_price, purchase_date, current_price } = req.body;
    
    // Validate input
    if (!type || !symbol || !name || !quantity || !purchase_price || !purchase_date) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO assets 
       (user_id, type, symbol, name, quantity, purchase_price, purchase_date, current_price) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, type, symbol, name, quantity, purchase_price, purchase_date, current_price || purchase_price]
    );
    
    // Also record this as a buy transaction
    await pool.query(
      `INSERT INTO transactions 
       (user_id, asset_id, type, quantity, price, transaction_date, notes) 
       VALUES (?, ?, 'buy', ?, ?, ?, ?)`,
      [req.user.id, result.insertId, quantity, purchase_price, purchase_date, 'Initial purchase']
    );
    
    res.status(201).json({ 
      message: 'Asset created successfully',
      asset_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an asset
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { type, symbol, name, quantity, purchase_price, purchase_date, current_price } = req.body;
    
    // Check if asset exists and belongs to user
    const [assets] = await pool.query(
      'SELECT * FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (assets.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Update asset
    await pool.query(
      `UPDATE assets SET 
       type = ?, symbol = ?, name = ?, quantity = ?, purchase_price = ?, 
       purchase_date = ?, current_price = ? 
       WHERE id = ? AND user_id = ?`,
      [type, symbol, name, quantity, purchase_price, purchase_date, current_price, req.params.id, req.user.id]
    );
    
    res.json({ message: 'Asset updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an asset
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if asset exists and belongs to user
    const [assets] = await pool.query(
      'SELECT * FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (assets.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Delete related transactions first (due to foreign key constraint)
    await pool.query(
      'DELETE FROM transactions WHERE asset_id = ?',
      [req.params.id]
    );
    
    // Delete the asset
    await pool.query(
      'DELETE FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;