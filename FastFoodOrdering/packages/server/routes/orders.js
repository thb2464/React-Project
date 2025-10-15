const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware xác thực
const router = express.Router();


// API: Tạo một đơn hàng mới (yêu cầu đăng nhập)
router.post('/', authenticateToken, async (req, res) => {
    const { restaurant_id, delivery_address, items, payment_method } = req.body;
    const user_id = req.user.id;

    if (!restaurant_id || !delivery_address || !items || items.length === 0 || !payment_method) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
    }

    const client = await db.pool.connect(); // Sử dụng transaction
    try {
        await client.query('BEGIN');

        // 1. Tính tổng tiền từ database để đảm bảo an toàn
        const item_ids = items.map(item => item.item_id);
        const pricesResult = await client.query(`SELECT item_id, price FROM food_items WHERE item_id = ANY($1::int[])`, [item_ids]);
        
        let total_amount = 0;
        const priceMap = new Map(pricesResult.rows.map(i => [i.item_id, parseFloat(i.price)]));

        for (const item of items) {
            if (!priceMap.has(item.item_id)) {
                throw new Error(`Món ăn với ID ${item.item_id} không tồn tại.`);
            }
            total_amount += priceMap.get(item.item_id) * item.quantity;
        }

        // 2. Tạo đơn hàng
        const orderQuery = `
            INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address, order_status)
            VALUES ($1, $2, $3, $4, 'confirmed')
            RETURNING order_id, created_at;
        `;
        const orderResult = await client.query(orderQuery, [user_id, restaurant_id, total_amount, delivery_address]);
        const newOrder = orderResult.rows[0];

        // 3. Thêm các món ăn vào order_items
        const orderItemsQuery = 'INSERT INTO order_items (order_id, item_id, quantity) VALUES ($1, $2, $3)';
        for (const item of items) {
            await client.query(orderItemsQuery, [newOrder.order_id, item.item_id, item.quantity]);
        }
        
        // 4. Tạo thanh toán
        const paymentQuery = 'INSERT INTO payments (order_id, method, payment_status) VALUES ($1, $2, $3)';
        // Giả lập thanh toán thành công nếu không phải COD
        const payment_status = payment_method.toUpperCase() === 'COD' ? 'pending' : 'successful';
        await client.query(paymentQuery, [newOrder.order_id, payment_method, payment_status]);

        // 5. (Nâng cao) Tự động tạo delivery và tìm drone
        const deliveryQuery = 'INSERT INTO deliveries (order_id, status) VALUES ($1, $2) RETURNING delivery_id';
        const deliveryResult = await client.query(deliveryQuery, [newOrder.order_id, 'pending']);
        // Logic tìm drone và assign...

        await client.query('COMMIT');
        res.status(201).json({ message: 'Đặt hàng thành công!', order: newOrder });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Lỗi server khi tạo đơn hàng.' });
    } finally {
        client.release();
    }
});

// API: Lấy lịch sử đơn hàng của người dùng đang đăng nhập
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { rows } = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

module.exports = router;
