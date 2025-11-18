// Nạp các biến môi trường từ file .env
require('dotenv').config();
const { Pool } = require('pg');

// Tạo một đối tượng Pool mới với thông tin kết nối từ biến môi trường
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Kiểm tra kết nối
pool.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối database:', err.stack);
    } else {
        console.log('Kết nối database PostgreSQL thành công!');
    }
});

// Xuất ra một object có một phương thức query
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool,
}