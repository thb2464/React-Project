const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken'); 
const router = express.Router();

// --- REQUIRE ADMIN LOCAL ---
// Middleware kiểm tra admin – ĐÃ SỬA ĐỂ KHÔNG CHẶN NHẦM
const requireAdminLocal = (req, res, next) => {
  if (!req.user) {
    console.log('Admin route: Không có user → 401');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.user.role !== 'admin') {
    console.log('Admin route: User không phải admin →', req.user.role);
    return res.status(403).json({ error: 'Forbidden – cần quyền admin' });
  }
  next();
};

// --- Các route ---
router.get('/all-orders', authenticateToken, requireAdminLocal, async (req, res) => {
  try {
    const query = `
      SELECT 
        o.order_id,
        o.total,
        COALESCE(o.status, 'pending') AS status,
        o.created_at,
        o.delivery_address,
        o.note,
        o.drone_id,
        u.full_name,
        COALESCE(r.name, 'Không xác định') AS restaurant_name,
        d.name AS drone_name,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'name', COALESCE(fi.name, 'Món ăn'),
              'quantity', oi.quantity,
              'unit_price', oi.unit_price
            ) ORDER BY oi.order_id
          ) FILTER (WHERE oi.order_id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      LEFT JOIN drones d ON o.drone_id = d.drone_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN food_items fi ON oi.item_id = fi.item_id
      GROUP BY 
        o.order_id, o.total, o.status, o.created_at, o.delivery_address, 
        o.note, o.drone_id, u.full_name, r.name, d.name
      ORDER BY o.created_at DESC
    `;

    const result = await db.query(query);
    console.log(`ADMIN ROUTE: Tải thành công ${result.rows.length} đơn hàng`);
    
    res.json(result.rows);
  } catch (err) {
    console.error('LỖI TRONG /api/admin/all-orders:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});
router.get('/all-restaurants', authenticateToken, requireAdminLocal, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM restaurants ORDER BY name');
  res.json(rows);
});

router.put('/restaurants/:id/status', authenticateToken, requireAdminLocal, async (req, res) => {
  const { id } = req.params;
  const { is_open } = req.body;

  try {
    const { rows } = await db.query(
      `UPDATE restaurants 
       SET is_open = $1 
       WHERE restaurant_id = $2 
       RETURNING *`,
      [is_open, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
