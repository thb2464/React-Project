const express = require('express');
const db = require('../db');
const router = express.Router();

// Lưu ý: Các API này trong thực tế cần được bảo vệ, chỉ admin hoặc hệ thống nội bộ mới được gọi

// API: Lấy trạng thái tất cả các drone
router.get('/status', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT drone_id, status, battery_level FROM drones');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

// API: (Giả lập) Drone cập nhật vị trí của nó
// Trong thực tế, drone sẽ gọi API này định kỳ
router.post('/tracking', async (req, res) => {
    const { delivery_id, latitude, longitude } = req.body;

    if (!delivery_id || !latitude || !longitude) {
        return res.status(400).json({ error: 'Thiếu thông tin tracking.' });
    }

    try {
        const query = 'INSERT INTO tracking (delivery_id, latitude, longitude) VALUES ($1, $2, $3)';
        await db.query(query, [delivery_id, latitude, longitude]);
        res.status(200).json({ message: 'Cập nhật vị trí thành công.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

// API: Cập nhật trạng thái của một chuyến giao hàng
router.put('/deliveries/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Ví dụ: 'in_progress', 'completed'

    if (!status) {
        return res.status(400).json({ error: 'Thiếu trạng thái mới.' });
    }

    try {
        // Cập nhật thêm end_time nếu trạng thái là completed
        let query;
        let params;
        if (status.toLowerCase() === 'completed') {
            query = 'UPDATE deliveries SET status = $1, end_time = NOW() WHERE delivery_id = $2';
            params = [status, id];
        } else {
            query = 'UPDATE deliveries SET status = $1 WHERE delivery_id = $2';
            params = [status, id];
        }
        
        const result = await db.query(query, params);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Không tìm thấy chuyến giao hàng.' });
        }
        
        res.status(200).json({ message: `Cập nhật trạng thái thành công cho delivery ${id}.` });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});


module.exports = router;
