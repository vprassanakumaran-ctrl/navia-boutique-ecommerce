const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

// Customer dashboard
router.get('/customer', (req, res, next) => {
  try {
    const userId = req.session.userId;

    const summary = db.prepare(`
      SELECT
        COUNT(*) AS totalOrders,
        COALESCE(SUM(total), 0) AS totalAmountSpent
      FROM orders
      WHERE user_id = ?
    `).get(userId);

    const recentlyPurchased = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.image_url,
        oi.quantity,
        o.created_at
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT 5
    `).all(userId);

    res.json({
      totalOrders: summary.totalOrders,
      totalAmountSpent: summary.totalAmountSpent,
      recentlyPurchased
    });
  } catch (err) {
    next(err);
  }
});

// Admin dashboard
router.get('/admin', (req, res, next) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const totalProducts = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
    const revenue = db.prepare(`
      SELECT COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE status != 'Cancelled'
    `).get().revenue;
const users = db.prepare(`
  SELECT id, name, email, phone, address, role, created_at
  FROM users
  ORDER BY id DESC
`).all();
    const lowStockProducts = db.prepare(`
      SELECT id, name, stock
      FROM products
      WHERE stock <= 5
      ORDER BY stock ASC
    `).all();

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
users,
      lowStockProducts
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
