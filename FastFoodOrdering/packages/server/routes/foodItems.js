const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @route   GET /api/food-items
 * @desc    Lấy TẤT CẢ món ăn từ tất cả nhà hàng
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        // Câu lệnh SELECT * đơn giản không có điều kiện WHERE
        const { rows } = await db.query('SELECT * FROM food_items WHERE is_available = TRUE');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Lỗi khi truy vấn tất cả food items:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
