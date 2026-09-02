const express = require('express');
const router = express.Router();

const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

// Get current user's orders
router.get('/', (req, res, next) => {
  try {
if (req.session.role === 'admin') {
  const orders = db.prepare(`
    SELECT id, user_id, status, total, created_at, updated_at
    FROM orders
    ORDER BY id DESC
  `).all();

  return res.json({ orders });
}    
const orders = db.prepare(`
      SELECT id, status, total, created_at, updated_at
      FROM orders
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(req.session.userId);

    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// Checkout current cart
router.post('/checkout', (req, res, next) => {
  try {
    const userId = req.session.userId;
    const deliveryAddress = String(req.body?.deliveryAddress || '').trim();

    if (!deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required.' });
    }

    const cart = db.prepare(`
      SELECT
        ci.id,
        ci.product_id,
        ci.size_label,
        ci.quantity,
        p.price
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
      ORDER BY ci.id
    `).all(userId);

    if (cart.length === 0) {
      return res.status(400).json({
        error: { code: 'EMPTY_CART', message: 'Your cart is empty.' }
      });
    }

    const total = cart.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const createOrder = db.prepare(`
      INSERT INTO orders (user_id, status, total, delivery_address)
      VALUES (?, 'Pending', ?, ?)
    `);

    const createItem = db.prepare(`
      INSERT INTO order_items
        (order_id, product_id, size_label, quantity, price_at_purchase)
      VALUES (?, ?, ?, ?, ?)
    `);

    const clearCart = db.prepare(`
      DELETE FROM cart_items
      WHERE user_id = ?
    `);

    let orderId;

    db.transaction(() => {
      const result = createOrder.run(userId, total, deliveryAddress);
      orderId = result.lastInsertRowid;

      for (const item of cart) {
        createItem.run(
          orderId,
          item.product_id,
          item.size_label,
          item.quantity,
          item.price
        );
      }

      clearCart.run(userId);
    })();

    const order = db.prepare(`
      SELECT id, status, total, created_at, updated_at
      FROM orders
      WHERE id = ? AND user_id = ?
    `).get(orderId, userId);

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
});

// Cancel an order
router.patch("/:id/cancel", (req, res, next) => {
  try {
    const result = db.prepare(`
      UPDATE orders
      SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND status IN ('Pending', 'Confirmed')
    `).run(req.params.id, req.session.userId);

    if (result.changes === 0) {
      const order = db.prepare("SELECT status FROM orders WHERE id = ? AND user_id = ?").get(req.params.id, req.session.userId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (order.status === "Delivered") return res.status(400).json({ error: "Delivered orders cannot be cancelled" });
      return res.status(400).json({ error: "This order cannot be cancelled" });
    }

    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

router.patch('/:id/status', (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Login required' });
    }

    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.session.userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = db.prepare('SELECT id, status FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'Delivered' && status === 'Cancelled') {
      return res.status(400).json({ error: 'Delivered orders cannot be cancelled' });
    }

    db.prepare(
      "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(status, req.params.id);

    const updatedOrder = db.prepare(
      'SELECT id, status, total, created_at, updated_at FROM orders WHERE id = ?'
    ).get(req.params.id);

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
