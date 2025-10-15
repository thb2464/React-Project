require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// --- BƯỚC 1: IMPORT ROUTE MỚI ---
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const droneRoutes = require('./routes/drones');
const foodItemRoutes = require('./routes/foodItems'); // <-- ĐẢM BẢO BẠN CÓ DÒNG NÀY

const app = express();
const PORT = process.env.PORT || 3000;

// === Middlewares ===
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Routes ===
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Chào mừng đến với FastFood Delivery API!' });
});

// --- BƯỚC 2: SỬ DỤNG ROUTE MỚI ---
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/food-items', foodItemRoutes); // <-- ĐẢM BẢO BẠN CÓ DÒNG NÀY


// === Khởi động Server ===
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

