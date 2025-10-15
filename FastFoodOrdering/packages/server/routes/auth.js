const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// API: Đăng ký người dùng mới
router.post('/register', async (req, res) => {
    const { full_name, email, password, role = 'customer' } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đủ thông tin.' });
    }

    try {
        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserQuery = `
            INSERT INTO users (full_name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, email, role;
        `;
        const { rows } = await db.query(newUserQuery, [full_name, email, password_hash, role]);

        res.status(201).json({
            message: 'Đăng ký thành công!',
            user: rows[0],
        });

    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Lỗi unique violation (email đã tồn tại)
            return res.status(409).json({ error: 'Email này đã được sử dụng.' });
        }
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

// API: Đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Vui lòng cung cấp email và mật khẩu.' });
    }

    try {
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(userQuery, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
        }

        const user = rows[0];

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
        }

        // Tạo JSON Web Token (JWT)
        const payload = {
            user: {
                id: user.user_id,
                role: user.role,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }, // Token hết hạn sau 7 ngày
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Đăng nhập thành công!',
                    token,
                    user: {
                        user_id: user.user_id,
                        full_name: user.full_name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

module.exports = router;
