require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.sendStatus(401); // Unauthorized - Không có token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden - Token không hợp lệ
        }
        req.user = user; // Lưu thông tin user vào request để các route sau có thể dùng
        next(); // Chuyển sang middleware/handler tiếp theo
    });
}

module.exports = authenticateToken;
