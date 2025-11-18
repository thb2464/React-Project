// packages/server/routes/drones.js
const express = require('express');
const db = require('../db');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

// GET /api/drones/available?restaurant_id=1
router.get('/available', authenticateToken, async (req, res) => {
  const { restaurant_id } = req.query;

  if (!restaurant_id) {
    return res.status(400).json({ error: 'Thiếu restaurant_id' });
  }

  try {
    const { rows } = await db.query(
      `SELECT drone_id, name, battery, status 
       FROM drones 
       WHERE restaurant_id = $1 
         AND status = 'idle' 
         AND battery >= 50
       ORDER BY battery DESC`,
      [restaurant_id]
    );

    res.json({ drones: rows });
  } catch (err) {
    console.error('Lỗi lấy drone:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;