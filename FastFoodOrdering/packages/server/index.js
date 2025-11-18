// packages/server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes        = require('./routes/auth');
const restaurantRoutes  = require('./routes/restaurants');
const orderRoutes       = require('./routes/orders');
const droneRoutes       = require('./routes/drones');
const foodItemRoutes    = require('./routes/foodItems');
const paymentRoutes     = require('./routes/payments');
const adminRoutes = require('./routes/admin');   // <--- THÊM

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- ROUTES ----
app.get('/api', (req, res) => res.json({ message: 'API OK' }));

app.use('/api/auth',        authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/drones',      droneRoutes);
app.use('/api/food-items',  foodItemRoutes);
app.use('/api/payments',    paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res, next) => {
    console.log(`[SERVER] Received: ${req.method} ${req.url}`);
    next();
});

app.use(express.urlencoded({ extended: true }));

app.listen(PORT,'0.0.0.0', () => console.log(`Server http://0.0.0.0:${PORT}`));