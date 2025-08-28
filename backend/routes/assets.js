const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const pool = require('../database/config/db');
const yahooFinance = require('yahoo-finance2').default; // <-- Yahoo Finance package

// Fetch live price for an asset by type and symbol (now uses Yahoo Finance for everything)
router.get('/price/:type/:symbol', verifyToken, async (req, res) => {
  console.log('--- /price/:type/:symbol HIT ---', req.params);
  const { type, symbol } = req.params;
  try {
    let price = null;
    const querySymbol = symbol.trim();

    try {
      const quote = await yahooFinance.quote(querySymbol);
      if (quote && quote.regularMarketPrice) {
        price = quote.regularMarketPrice;
      }
    } catch (err) {
      console.error('Yahoo Finance fetch error:', err);
      return res.status(404).json({ message: 'Live price not found.' });
    }

    if (price === null) {
      return res.status(404).json({ message: 'Live price not found.' });
    }

    res.json({ symbol, price });
  } catch (error) {
    console.error('Error in /price/:type/:symbol:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all assets for the current user, or ALL if admin
router.get('/', verifyToken, async (req, res) => {
  try {
    let assets, query, params;
    if (req.user.isAdmin) {
      query = 'SELECT * FROM assets';
      params = [];
    } else {
      query = 'SELECT * FROM assets WHERE user_id = ?';
      params = [req.user.id];
    }
    [assets] = await pool.query(query, params);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get asset by ID (admin can view any asset)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    let assets, query, params;
    if (req.user.isAdmin) {
      query = 'SELECT * FROM assets WHERE id = ?';
      params = [req.params.id];
    } else {
      query = 'SELECT * FROM assets WHERE id = ? AND user_id = ?';
      params = [req.params.id, req.user.id];
    }
    [assets] = await pool.query(query, params);

    if (assets.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(assets[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new asset (always under the current user)
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

// Update an asset (admin can edit any asset)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { type, symbol, name, quantity, purchase_price, purchase_date, current_price } = req.body;

    // Check if asset exists and belongs to user, or admin
    let assets, query, params;
    if (req.user.isAdmin) {
      query = 'SELECT * FROM assets WHERE id = ?';
      params = [req.params.id];
    } else {
      query = 'SELECT * FROM assets WHERE id = ? AND user_id = ?';
      params = [req.params.id, req.user.id];
    }
    [assets] = await pool.query(query, params);

    if (assets.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Update asset
    await pool.query(
      `UPDATE assets SET 
       type = ?, symbol = ?, name = ?, quantity = ?, purchase_price = ?, 
       purchase_date = ?, current_price = ? 
       WHERE id = ?`,
      [type, symbol, name, quantity, purchase_price, purchase_date, current_price, req.params.id]
    );

    res.json({ message: 'Asset updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an asset (admin can delete any asset)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if asset exists and belongs to user, or admin
    let assets, query, params;
    if (req.user.isAdmin) {
      query = 'SELECT * FROM assets WHERE id = ?';
      params = [req.params.id];
    } else {
      query = 'SELECT * FROM assets WHERE id = ? AND user_id = ?';
      params = [req.params.id, req.user.id];
    }
    [assets] = await pool.query(query, params);

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
      'DELETE FROM assets WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;