// packages/server/routes/restaurants.js
const express = require('express');
const db = require('../db');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

// Lấy tất cả nhà hàng (chi nhánh) đang mở
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM restaurants WHERE is_open = TRUE ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy chi tiết 1 nhà hàng
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM restaurants WHERE restaurant_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy drone đang rảnh của nhà hàng đó
router.get('/:id/drones', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT drone_id, name, battery, status 
       FROM drones 
       WHERE restaurant_id = $1 AND status = 'idle' AND battery > 30`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ĐÚNG 100% – ROUTE PATCH ĐỂ ADMIN CẬP NHẬT TRẠNG THÁI
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_open } = req.body;

  // Kiểm tra is_open phải là boolean
  if (typeof is_open !== 'boolean') {
    return res.status(400).json({ error: 'is_open phải là true/false' });
  }

  try {
    const { rows } = await db.query(
      `UPDATE restaurants 
       SET is_open = $1, updated_at = NOW() 
       WHERE restaurant_id = $2 
       RETURNING *`,
      [is_open, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Lỗi update is_open:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;