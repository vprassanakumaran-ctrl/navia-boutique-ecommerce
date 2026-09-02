const express = require('express');
const router = express.Router();

const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

// Get current user's cart
router.get('/', (req, res, next) => {
  try {
    const items = db.prepare(`
      SELECT
        ci.id,
        ci.product_id,
        ci.size_label,
        ci.quantity,
        p.name,
        p.price,
        p.image_url
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
      ORDER BY ci.id DESC
    `).all(req.session.userId);

    res.json({ cart: items });
  } catch (err) {
    next(err);
  }
});

// Add product to cart
router.post('/', (req, res, next) => {
  try {
    const { productId, quantity = 1, sizeLabel = '' } = req.body;

    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({
        error: { code: 'INVALID_PRODUCT', message: 'Invalid productId.' }
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        error: { code: 'INVALID_QUANTITY', message: 'Quantity must be at least 1.' }
      });
    }

    const product = db.prepare(
      'SELECT id FROM products WHERE id = ?'
    ).get(productId);

    if (!product) {
      return res.status(404).json({
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' }
      });
    }

    const existing = db.prepare(`
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ? AND product_id = ? AND size_label = ?
    `).get(req.session.userId, productId, sizeLabel);

    if (existing) {
      db.prepare(`
        UPDATE cart_items
        SET quantity = ?
        WHERE id = ? AND user_id = ?
      `).run(existing.quantity + quantity, existing.id, req.session.userId);
    } else {
      db.prepare(`
        INSERT INTO cart_items
          (user_id, product_id, size_label, quantity)
        VALUES (?, ?, ?, ?)
      `).run(req.session.userId, productId, sizeLabel, quantity);
    }

    const cart = db.prepare(`
      SELECT
        ci.id,
        ci.product_id,
        ci.size_label,
        ci.quantity,
        p.name,
        p.price,
        p.image_url
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
      ORDER BY ci.id DESC
    `).all(req.session.userId);

    res.status(201).json({ cart });
  } catch (err) {
    next(err);
  }
});

// Update quantity
router.patch('/:id', (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const { quantity } = req.body;

    if (!Number.isInteger(itemId) || itemId < 1) {
      return res.status(400).json({
        error: { code: 'INVALID_ITEM', message: 'Invalid cart item.' }
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        error: { code: 'INVALID_QUANTITY', message: 'Quantity must be at least 1.' }
      });
    }

    const result = db.prepare(`
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ? AND user_id = ?
    `).run(quantity, itemId, req.session.userId);

    if (result.changes === 0) {
      return res.status(404).json({
        error: { code: 'CART_ITEM_NOT_FOUND', message: 'Cart item not found.' }
      });
    }

    const cart = db.prepare(`
      SELECT
        ci.id,
        ci.product_id,
        ci.size_label,
        ci.quantity,
        p.name,
        p.price,
        p.image_url
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
      ORDER BY ci.id DESC
    `).all(req.session.userId);

    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// Remove item
router.delete('/:id', (req, res, next) => {
  try {
    const itemId = Number(req.params.id);

    const result = db.prepare(`
      DELETE FROM cart_items
      WHERE id = ? AND user_id = ?
    `).run(itemId, req.session.userId);

    if (result.changes === 0) {
      return res.status(404).json({
        error: { code: 'CART_ITEM_NOT_FOUND', message: 'Cart item not found.' }
      });
    }

    const cart = db.prepare(`
      SELECT
        ci.id,
        ci.product_id,
        ci.size_label,
        ci.quantity,
        p.name,
        p.price,
        p.image_url
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
      ORDER BY ci.id DESC
    `).all(req.session.userId);

    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
