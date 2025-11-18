// packages/server/routes/payments.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function sortObject(o) {
  return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
}

function createVnpayParams(orderId, amount, ip, info) {
  const p = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_Amount: amount * 100,
    vnp_CreateDate: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
    vnp_CurrCode: 'VND',
    vnp_IpAddr: ip || '127.0.0.1',
    vnp_Locale: 'vn',
    vnp_OrderInfo: info,
    vnp_OrderType: '170000',
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    vnp_TxnRef: orderId,
  };
  const sorted = sortObject(p);
  const sign = Object.keys(sorted)
    .map(k => `${k}=${encodeURIComponent(sorted[k])}`)
    .join('&');
  const hmac = crypto.createHmac('sha512', process.env.VNP_HASH_SECRET);
  p.vnp_SecureHash = hmac.update(sign).digest('hex');
  return p;
}

/* ---------- POST: tạo URL ---------- */
router.post('/create-vnpay-url', async (req, res) => {
  try {
    const {
      user_id, restaurant_id, total_amount, delivery_address,
      delivery_lat, delivery_lng, note, items
    } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // 1. order
    const o = await pool.query(
      `INSERT INTO orders
         (user_id, restaurant_id, total, delivery_address, delivery_lat, delivery_lng, note, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING order_id`,
      [user_id, restaurant_id, total_amount, delivery_address, delivery_lat, delivery_lng, note]
    );
    const orderId = o.rows[0].order_id;

    // 2. order_items
    for (const i of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, item_id, quantity, unit_price, customizations, note)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [orderId, i.item_id, i.quantity, i.unit_price, i.customizations || [], i.note || '']
      );
    }

    // 3. payment record
    await pool.query(
      `INSERT INTO payments (order_id, method, status, amount) VALUES ($1,'vnpay','pending',$2)`,
      [orderId, total_amount]
    );

    // 4. URL
    const vnp = createVnpayParams(
      orderId.toString(),
      total_amount,
      ip,
      `Thanh toan don hang #${orderId}`
    );
    const url = `${process.env.VNP_URL}?${new URLSearchParams(vnp).toString()}`;

    res.json({ success: true, paymentUrl: url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
});

/* ---------- GET: callback ---------- */
router.get('/vnpay-return', async (req, res) => {
  let p = req.query;
  const secure = p.vnp_SecureHash;
  delete p.vnp_SecureHash;
  delete p.vnp_SecureHashType;

  const sorted = sortObject(p);
  const sign = Object.keys(sorted)
    .map(k => `${k}=${encodeURIComponent(sorted[k])}`)
    .join('&');
  const hmac = crypto.createHmac('sha512', process.env.VNP_HASH_SECRET);
  const chk = hmac.update(sign).digest('hex');

  const orderId = p.vnp_TxnRef;
  const code = p.vnp_ResponseCode;

  if (secure === chk && code === '00') {
    await pool.query(
      `UPDATE payments SET status='paid', paid_at=NOW(), vnpay_txn=$1 WHERE order_id=$2`,
      [p.vnp_TransactionNo, orderId]
    );
    await pool.query(`UPDATE orders SET status='paid' WHERE order_id=$1`, [orderId]);
    res.redirect(`http://localhost:5173/payment-success?order_id=${orderId}`);
  } else {
    await pool.query(`UPDATE payments SET status='failed' WHERE order_id=$1`, [orderId]);
    res.redirect(`http://localhost:5173/payment-failed?order_id=${orderId}&code=${code}`);
  }
});

module.exports = router;