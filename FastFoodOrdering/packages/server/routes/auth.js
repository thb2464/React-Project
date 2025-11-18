// packages/server/routes/auth.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { full_name, email, password, phone, birthday } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đủ thông tin bắt buộc.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (full_name, email, password_hash, phone, birthday)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, full_name, email, role, phone, birthday, loyalty_points, membership, created_at;
    `;
    const { rows } = await db.query(query, [full_name, email, password_hash, phone || null, birthday || null]);

    const user = rows[0];
    // Trong phần Register và Login – sửa 2 chỗ này
const token = jwt.sign(
  { 
    id: user.user_id || user.id, 
    role: (user.role || 'customer').toLowerCase()  // ÉP CHỮ THƯỜNG LUÔN!
  }, 
  process.env.JWT_SECRET, 
  { expiresIn: '7d' }
);

    res.status(201).json({
      message: 'Đăng ký thành công!',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        birthday: user.birthday,
        loyalty_points: user.loyalty_points,
        membership: user.membership,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === '23505') return res.status(409).json({ error: 'Email đã được sử dụng.' });
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu.' });

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Email hoặc mật khẩu sai.' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Email hoặc mật khẩu sai.' });

    // Trong phần Register và Login – sửa 2 chỗ này
const token = jwt.sign(
  { 
    id: user.user_id || user.id, 
    role: (user.role || 'customer').toLowerCase()  // ÉP CHỮ THƯỜNG LUÔN!
  }, 
  process.env.JWT_SECRET, 
  { expiresIn: '7d' }
);

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        birthday: user.birthday,
        loyalty_points: user.loyalty_points || 0,
        membership: user.membership || 'bronze',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Get current user (protected)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT user_id, full_name, email, role, phone, birthday, 
              loyalty_points, membership, dietary, allergies, addresses, created_at 
       FROM users WHERE user_id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile (protected)
router.put('/me', authenticateToken, async (req, res) => {
  const { full_name, phone, birthday, dietary, allergies, addresses } = req.body;

  try {
    const query = `
      UPDATE users 
      SET full_name = $1, phone = $2, birthday = $3, 
          dietary = $4, allergies = $5, addresses = $6
      WHERE user_id = $7
      RETURNING user_id, full_name, email, phone, birthday, loyalty_points, membership, dietary, allergies, addresses;
    `;
    const { rows } = await db.query(query, [
      full_name,
      phone || null,
      birthday || null,
      dietary || [],
      allergies || null,
      JSON.stringify(addresses || []),
      req.user.id,
    ]);

    res.json({ message: 'Cập nhật thành công!', user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi cập nhật' });
  }
});

module.exports = router;