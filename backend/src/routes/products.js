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

router.patch('/:id', (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: { message: 'Login required.' } });
    }

    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.session.userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Admin access required.' } });
    }

    const { name, description, price, category, image_url, stock } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: { message: 'Name is required.' } });
    }

    if (price === undefined || price === '' || Number(price) < 0) {
      return res.status(400).json({ error: { message: 'Valid price is required.' } });
    }

    if (stock === undefined || stock === '' || Number(stock) < 0) {
      return res.status(400).json({ error: { message: 'Valid stock is required.' } });
    }

    const result = db.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, category = ?,
          image_url = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      String(name).trim(),
      description || '',
      Number(price),
      category || 'Men',
      image_url || '',
      Number(stock),
      Number(req.params.id)
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: { message: 'Product not found.' } });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id));

    res.json({ product });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  req.method = 'PATCH';
  return router.handle(req, res, next);
});

router.post('/', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.session.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { name, image, price, category, stock, description } = req.body;

    if (!name || price === undefined || !category || stock === undefined) {
      return res.status(400).json({ error: 'Name, price, category and stock are required' });
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      return res.status(400).json({ error: 'Price and stock cannot be negative' });
    }

    const result = db.prepare(`
      INSERT INTO products (name, image_url, price, category, stock, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name,
      image || '/images/default-product.jpg',
      Number(price),
      category,
      Number(stock),
      description || ''
    );

    res.status(201).json({ message: 'Product added successfully', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
