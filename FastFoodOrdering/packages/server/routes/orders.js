// routes/orders.js – PHIÊN BẢN HOÀN HẢO NHẤT (22/11/2025)

const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

// ==============================
// API: TẠO ĐƠN HÀNG CHÍNH (WEB + MOBILE DÙNG CHUNG)
// ==============================
router.post('/', authenticateToken, async (req, res) => {
    const { restaurant_id, delivery_address, items, payment_method = 'COD' } = req.body;
    const user_id = req.user.id;

    console.log('Tạo đơn hàng mới từ user_id:', user_id);

    if (!restaurant_id || !delivery_address || !items || items.length === 0) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Tính tổng tiền an toàn từ DB
        const item_ids = items.map(item => item.item_id);
        const pricesResult = await client.query(
            `SELECT item_id, price FROM food_items WHERE item_id = ANY($1::int[])`,
            [item_ids]
        );

        let total = 0;
        const priceMap = new Map(pricesResult.rows.map(i => [i.item_id, parseFloat(i.price)]));

        for (const item of items) {
            if (!priceMap.has(item.item_id)) {
                throw new Error(`Món ăn ID ${item.item_id} không tồn tại`);
            }
            total += priceMap.get(item.item_id) * item.quantity;
        }

        // 2. TẠO ĐƠN HÀNG – FIX LỖI "order" → DÙNG "status" THAY THẾ
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, restaurant_id, total, delivery_address, status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING order_id, created_at`,
            [user_id, restaurant_id, total, delivery_address]
        );
        const newOrder = orderResult.rows[0];

        // 3. Thêm món ăn
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, item_id, quantity, unit_price)
                 VALUES ($1, $2, $3, $4)`,
                [newOrder.order_id, item.item_id, item.quantity, priceMap.get(item.item_id)]
            );
        }

        // 4. Tạo thanh toán
        const method = (payment_method || 'cod').toLowerCase();
        const payment_status = method === 'cod' ? 'pending' : 'paid';

        await client.query(
            `INSERT INTO payments (order_id, method, status, amount)
             VALUES ($1, $2, $3, $4)`,
            [newOrder.order_id, method, payment_status, total]
        );

        // 5. Tạo delivery
        await client.query(
            `INSERT INTO deliveries (order_id, status) VALUES ($1, 'pending')`,
            [newOrder.order_id]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            order: newOrder
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Lỗi tạo đơn hàng:', error.message);
        res.status(500).json({ error: error.message || 'Lỗi server' });
    } finally {
        client.release();
    }
});

// ==============================
// API: TẠO ĐƠN HÀNG COD (DÀNH RIÊNG CHO MOBILE)
// ==============================
router.post('/create-cod', authenticateToken, async (req, res) => {
  const { user_id, restaurant_id, total, delivery_address, note = '', items } = req.body;

  console.log('Tạo đơn COD từ mobile:', { user_id, restaurant_id, total, items_count: items?.length });

  if (!user_id || !restaurant_id || !total || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
  }

  try {
    const orderResult = await db.query(
      `INSERT INTO orders (user_id, restaurant_id, total, delivery_address, note, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING order_id, created_at`,
      [user_id, restaurant_id, total, delivery_address, note || null]
    );

    const orderId = orderResult.rows[0].order_id;
    console.log(`ĐƠN HÀNG COD #${orderId} TẠO THÀNH CÔNG!`);

    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, item_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.item_id, item.quantity, item.unit_price || 0]
      );
    }

    await db.query(
      `INSERT INTO payments (order_id, method, status, amount)
       VALUES ($1, 'COD', 'pending', $2)`,
      [orderId, total]
    );

    res.json({
      success: true,
      order_id: orderId,
      message: 'Đặt hàng thành công! Chờ admin xác nhận.'
    });

  } catch (err) {
    console.error('LỖI TẠO ĐƠN COD:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================
// API: LẤY LỊCH SỬ ĐƠN HÀNG
// ==============================
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const query = `
      SELECT 
        o.order_id, o.total, o.status, o.created_at, o.delivery_address,
        COALESCE(r.name, 'Không rõ') as restaurant_name,
        COALESCE(json_agg(json_build_object('name', fi.name, 'quantity', oi.quantity)) FILTER (WHERE oi.item_id IS NOT NULL), '[]') as items
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN food_items fi ON oi.item_id = fi.item_id
      WHERE o.user_id = $1
      GROUP BY o.order_id, r.name
      ORDER BY o.created_at DESC
    `;

    const { rows } = await db.query(query, [user_id]);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi history:', err.message);
    res.status(500).send('Lỗi Server');
  }
});

// ==============================
// API: LẤY ĐƠN HÀNG ĐANG XỬ LÝ
// ==============================
router.get('/current', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const { rows } = await db.query(`
      SELECT o.*, r.name AS restaurant_name, d.name AS drone_name
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      LEFT JOIN drones d ON o.drone_id = d.drone_id
      WHERE o.user_id = $1 AND o.status IN ('pending', 'confirmed', 'out_for_delivery')
      ORDER BY o.created_at DESC LIMIT 1
    `, [user_id]);

    if (rows.length === 0) return res.json(null);

    const order = rows[0];
    const items = await db.query(`
      SELECT fi.name, oi.quantity, oi.unit_price AS price
      FROM order_items oi
      JOIN food_items fi ON oi.item_id = fi.item_id
      WHERE oi.order_id = $1
    `, [order.order_id]);

    order.items = items.rows;
    res.json(order);
  } catch (err) {
    console.error('Lỗi /current:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==============================
// API: KHÁCH NHẬN HÀNG (HOÀN TẤT ĐƠN)
// ==============================
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  try {
    const orderRes = await db.query(
      `SELECT drone_id, status FROM orders WHERE order_id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

    const { drone_id, status } = orderRes.rows[0];
    if (status === 'delivered') return res.status(400).json({ message: 'Đơn đã hoàn thành' });

    await db.query(`UPDATE orders SET status = 'delivered' WHERE order_id = $1`, [orderId]);

    if (drone_id) {
      await db.query(`UPDATE drones SET status = 'idle', battery = battery - 5 WHERE drone_id = $1`, [drone_id]);
    }

    res.json({ success: true, message: 'Nhận hàng thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;