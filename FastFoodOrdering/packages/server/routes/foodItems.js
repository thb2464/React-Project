// packages/server/routes/foodItems.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// Lấy toàn bộ menu (chung cho mọi nhà hàng)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM food_items WHERE is_available = TRUE ORDER BY category, name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;