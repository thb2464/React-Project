// packages/server/routes/menu.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/menu → lấy toàn bộ menu chung
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT item_id, name, category, img_url, price, is_available, is_veg, options
      FROM food_items 
      WHERE is_available = true
      ORDER BY category, name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;