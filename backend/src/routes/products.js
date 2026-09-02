const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/products
// Supports search and category filtering
router.get('/', (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();

    let sql = `
      SELECT id, name, description, price, category, image_url, stock,
             created_at, updated_at
      FROM products
      WHERE 1 = 1
    `;

    const params = [];

    if (search) {
      sql += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      sql += ` AND LOWER(category) = LOWER(?)`;
      params.push(category);
    }

    sql += ` ORDER BY id DESC`;

    const products = db.prepare(sql).all(...params);

    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
// View one product with its available sizes
router.get('/:id', (req, res, next) => {
  try {
    const product = db
      .prepare(`
        SELECT id, name, description, price, category, image_url, stock,
               created_at, updated_at
        FROM products
        WHERE id = ?
      `)
      .get(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found.'
        }
      });
    }

    const sizes = db
      .prepare(`
        SELECT id, size_label
        FROM product_sizes
        WHERE product_id = ?
        ORDER BY id
      `)
      .all(req.params.id);

    res.json({
      product: {
        ...product,
        sizes
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
