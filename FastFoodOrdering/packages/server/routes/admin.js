// packages/server/routes/admin.js
const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

const BASE_URL = "http://localhost:3000";

// -----------------------------
// Middleware kiểm tra quyền Admin
// -----------------------------
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Bạn không có quyền admin.' });
  }
  next();
};

// ==============================
// 1. QUẢN LÝ ĐƠN HÀNG
// ==============================
router.get('/all-orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT o.order_id, o.user_id, o.restaurant_id, o.total,
        COALESCE(o.status, 'pending') AS status, o.created_at, o.delivery_address, o.note,
        o.drone_id, u.full_name AS full_name, COALESCE(r.name, 'Không rõ') AS restaurant_name,
        d.name AS drone_name,
        COALESCE(json_agg(json_build_object(
          'name', fi.name, 
          'quantity', oi.quantity, 
          'unit_price', oi.unit_price
        )) FILTER (WHERE oi.item_id IS NOT NULL), '[]') AS items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      LEFT JOIN drones d ON o.drone_id = d.drone_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN food_items fi ON oi.item_id = fi.item_id
      GROUP BY o.order_id, u.full_name, r.name, d.name
      ORDER BY o.created_at DESC
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy đơn hàng admin:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.patch('/orders/:id/confirm', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query(`UPDATE orders SET status = 'confirmed' WHERE order_id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/drones/available/:restaurant_id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT drone_id, name, battery 
       FROM drones 
       WHERE restaurant_id = $1 AND status = 'idle' AND battery >= 50`,
      [req.params.restaurant_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.patch('/orders/:id/assign-drone', authenticateToken, requireAdmin, async (req, res) => {
  const { drone_id } = req.body;
  try {
    const droneRes = await db.query(`
      SELECT name FROM drones 
      WHERE drone_id = $1 AND status = 'idle' AND battery >= 50
    `, [drone_id]);

    if (droneRes.rows.length === 0)
      return res.status(400).json({ message: 'Drone không khả dụng' });

    await db.query(
      `UPDATE orders SET drone_id = $1, status = 'out_for_delivery' WHERE order_id = $2`,
      [drone_id, req.params.id]
    );

    await db.query(
      `UPDATE drones SET status = 'in_flight' WHERE drone_id = $1`,
      [drone_id]
    );

    res.json({ success: true, drone_name: droneRes.rows[0].name });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==============================
// 2. QUẢN LÝ DRONE
// ==============================
router.get('/drones', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        d.*,
        r.name AS restaurant_name,
        COALESCE(o.has_active_order, false) AS has_active_order
      FROM drones d
      LEFT JOIN restaurants r ON d.restaurant_id = r.restaurant_id
      LEFT JOIN (
        SELECT DISTINCT drone_id, true AS has_active_order
        FROM orders
        WHERE drone_id IS NOT NULL AND status NOT IN ('delivered', 'cancelled')
      ) o ON d.drone_id = o.drone_id
      ORDER BY d.drone_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy danh sách drone:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/drones', authenticateToken, requireAdmin, async (req, res) => {
  const { name, restaurant_id, battery = 100, lat, lng } = req.body;
  if (!name || !restaurant_id) return res.status(400).json({ error: 'Thiếu tên hoặc nhà hàng' });

  try {
    const { rows } = await db.query(
      `INSERT INTO drones (name, restaurant_id, battery, status, current_lat, current_lng)
       VALUES ($1, $2, $3, 'idle', $4, $5)
       RETURNING *`,
      [name, restaurant_id, battery, lat || null, lng || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể thêm drone' });
  }
});

router.put('/drones/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, battery, status, restaurant_id, lat, lng } = req.body;

  try {
    const check = await db.query(`
      SELECT d.status, d.restaurant_id,
             EXISTS(SELECT 1 FROM orders WHERE drone_id = $1 AND status NOT IN ('delivered','cancelled')) AS has_active_order
      FROM drones d WHERE d.drone_id = $1
    `, [id]);

    if (check.rows.length === 0) return res.status(404).json({ error: 'Drone không tồn tại' });
    const drone = check.rows[0];

    if (drone.status === 'in_flight') return res.status(400).json({ error: 'Không thể sửa drone đang giao hàng!' });
    if (drone.has_active_order && restaurant_id && restaurant_id !== drone.restaurant_id)
      return res.status(400).json({ error: 'Không thể chuyển drone khi đang có đơn chưa hoàn thành!' });

    const { rows } = await db.query(
      `UPDATE drones 
       SET name = $1, battery = $2, status = COALESCE($3, status),
           restaurant_id = COALESCE($4, restaurant_id),
           current_lat = $5, current_lng = $6
       WHERE drone_id = $7 RETURNING *`,
      [name, battery, status || null, restaurant_id || null, lat || null, lng || null, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cập nhật thất bại' });
  }
});

router.delete('/drones/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const check = await db.query(`
      SELECT status,
             EXISTS(SELECT 1 FROM orders WHERE drone_id = $1 AND status NOT IN ('delivered','cancelled')) AS has_active_order
      FROM drones WHERE drone_id = $1
    `, [id]);

    if (check.rows.length === 0) return res.status(404).json({ error: 'Drone không tồn tại' });
    if (check.rows[0].status === 'in_flight') return res.status(400).json({ error: 'Không thể xóa drone đang giao hàng!' });
    if (check.rows[0].has_active_order) return res.status(400).json({ error: 'Không thể xóa drone đang có đơn chưa hoàn thành!' });

    await db.query(`DELETE FROM drones WHERE drone_id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xóa thất bại' });
  }
});

// ==============================
// 3. QUẢN LÝ MENU CHUNG
// ==============================
router.get('/menu', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        fi.*,
        'Chung' AS restaurant_name,
        EXISTS(
          SELECT 1 FROM order_items oi
          JOIN orders o ON oi.order_id = o.order_id
          WHERE oi.item_id = fi.item_id AND o.status NOT IN ('delivered', 'cancelled')
        ) AS has_active_order
      FROM food_items fi
      ORDER BY fi.category, fi.name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy menu admin:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/menu', authenticateToken, requireAdmin, async (req, res) => {
  const { name, price, category, img_url, is_veg = false } = req.body;
  if (!name || !price || !category) return res.status(400).json({ error: 'Thiếu tên, giá hoặc danh mục' });

  try {
    const { rows } = await db.query(`
      INSERT INTO food_items (name, price, category, img_url, qty, is_available, is_veg)
      VALUES ($1, $2, $3, $4, 999, true, $5)
      RETURNING *
    `, [name, price, category, img_url || null, is_veg]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Thêm món thất bại' });
  }
});

router.put('/menu/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, price, category, img_url, qty = 999, is_veg = false } = req.body;

  try {
    const isAvailable = qty > 0;
    const { rows } = await db.query(`
      UPDATE food_items
      SET name = $1, price = $2, category = $3, img_url = $4,
          qty = $5, is_available = $6, is_veg = $7
      WHERE item_id = $8
      RETURNING *
    `, [name, price, category, img_url || null, qty, isAvailable, is_veg, id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy món' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cập nhật thất bại' });
  }
});

router.delete('/menu/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const check = await db.query(`
      SELECT EXISTS(
        SELECT 1 FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE oi.item_id = $1 AND o.status NOT IN ('delivered', 'cancelled')
      ) AS has_active_order
    `, [id]);

    if (check.rows[0].has_active_order)
      return res.status(400).json({ error: 'Không thể xóa món ăn đang có trong đơn hàng chưa hoàn thành!' });

    await db.query('DELETE FROM food_items WHERE item_id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xóa thất bại' });
  }
});

router.patch('/menu/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_available } = req.body;

  if (typeof is_available !== 'boolean')
    return res.status(400).json({ error: 'Thiếu trạng thái is_available' });

  try {
    const check = await db.query(`
      SELECT EXISTS(
        SELECT 1 FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE oi.item_id = $1 AND o.status NOT IN ('delivered', 'cancelled')
      ) AS has_active_order
    `, [id]);

    if (check.rows[0].has_active_order && !is_available)
      return res.status(400).json({ error: 'Không thể tắt món đang có trong đơn hàng chưa giao!' });

    const qty = is_available ? 999 : 0;
    const { rows } = await db.query(`
      UPDATE food_items SET is_available = $1, qty = $2 WHERE item_id = $3 RETURNING *
    `, [is_available, qty, id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Lỗi toggle trạng thái món:', err);
    res.status(500).json({ error: 'Cập nhật thất bại' });
  }
});

// ==============================
// 4. QUẢN LÝ NGƯỜI DÙNG (CUSTOMER) – ĐÃ BỎ RATING, CHẠY MƯỢT 100%
// ==============================
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        u.user_id AS id,
        u.full_name AS name,
        u.email,
        u.created_at AS "joinDate",
        COALESCE(order_stats.order_count, 0) AS orders,
        CASE WHEN u.blocked_until > NOW() THEN 'blocked' ELSE 'active' END AS status
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS order_count
        FROM orders 
        WHERE status NOT IN ('cancelled')
        GROUP BY user_id
      ) order_stats ON u.user_id = order_stats.user_id
      WHERE u.role = 'customer'
      ORDER BY u.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy danh sách khách hàng:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;