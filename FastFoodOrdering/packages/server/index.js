require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes       = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes      = require('./routes/orders');
const droneRoutes      = require('./routes/drones');
const foodItemRoutes   = require('./routes/foodItems');
const paymentRoutes    = require('./routes/payments');
const adminRoutes      = require('./routes/admin');

app.get('/api', (req, res) => res.json({ message: 'API OK' }));

// Database Health Check
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as time');
    res.json({ 
      status: 'success', 
      message: 'Database Connected!', 
      time: result.rows[0].time 
    });
  } catch (error) {
    console.error('DB Test Failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database Connection Failed', 
      error: error.message 
    });
  }
});

app.use('/api/auth',        authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/drones',      droneRoutes);
app.use('/api/food-items',  foodItemRoutes);
app.use('/api/payments',    paymentRoutes);
app.use('/api/admin',       adminRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});