const express = require('express');
const db = require('../db');
const router = express.Router();

// API: Lấy danh sách tất cả nhà hàng đang hoạt động
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM restaurants WHERE status = 'active'");
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

// API: Lấy thông tin chi tiết một nhà hàng
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM restaurants WHERE restaurant_id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Không tìm thấy nhà hàng' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

// API: Lấy menu của một nhà hàng
router.get('/:id/menu', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM food_items WHERE restaurant_id = $1 AND is_available = TRUE', [id]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

module.exports = router;
