// packages/server/middleware/authenticateToken.js ← THAY TOÀN BỘ FILE NÀY!

require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Authorization Header:', authHeader); // ← SẼ THẤY NGAY KHI GỌI API

  if (!token) {
    return res.status(401).json({ error: 'Không có token' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verify failed:', err.message);
      return res.status(403).json({ error: 'Token không hợp lệ hoặc hết hạn' });
    }

    // IN RA ĐỂ BẠN THẤY LUÔN TRONG TERMINAL
    console.log('Token hợp lệ! req.user =', decoded);

    // ÉP role thành chữ thường để tránh lỗi admin vs Admin
    if (decoded.role) {
      decoded.role = decoded.role.toLowerCase();
    }

    req.user = decoded; // ← QUAN TRỌNG NHẤT!
    next(); // ← CHO QUA!
  });
}

module.exports = authenticateToken;