const express = require('express');
const db = require('../db');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

console.log("✅ DRONE ROUTES LOADED: / (All Drones) & /available");

// --- DEBUG MIDDLEWARE: Log every request hitting this router ---
router.use((req, res, next) => {
  console.log(`📡 DRONE ROUTER HIT: ${req.method} ${req.url}`);
  next();
});

// --- ROUTE 1: GET ALL DRONES ---
router.get('/', authenticateToken, async (req, res) => {
  console.log("🚀 Executing GET / (All Drones)..."); // Log inside the route
  try {
    const { rows } = await db.query(
      `SELECT drone_id, restaurant_id, name, status, battery 
       FROM drones 
       ORDER BY drone_id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy danh sách drone:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ... keep the rest of the file (available route) the same
router.get('/available', authenticateToken, async (req, res) => {
    // ... existing code
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ error: 'Thiếu restaurant_id' });
    try {
        const { rows } = await db.query(
            `SELECT drone_id, name, battery, status FROM drones WHERE restaurant_id = $1 AND status = 'idle' AND battery >= 50 ORDER BY battery DESC`,
            [restaurant_id]
        );
        res.json({ drones: rows }); 
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;