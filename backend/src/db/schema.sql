-- Navia Markets boutique e-commerce assessment
-- SQLite schema
-- Foreign keys are enabled by the connection module (db/index.js), not here,
-- since PRAGMA foreign_keys is a per-connection setting in SQLite.

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'customer'
                      CHECK (role IN ('customer', 'admin')),
    phone         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Case-insensitive uniqueness on email (BR: "email must be unique"):
-- an expression index on LOWER(email) means 'User@x.com' and 'user@x.com'
-- collide, without needing a duplicate normalized-email column.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower
    ON users (LOWER(email));

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT,
    price       REAL NOT NULL CHECK (price >= 0),
    category    TEXT NOT NULL,
    image_url   TEXT,                         -- NULL => frontend applies default image
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

-- ---------------------------------------------------------------------------
-- PRODUCT SIZES (one product -> many available sizes)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_sizes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_label TEXT NOT NULL,
    UNIQUE (product_id, size_label)
);

-- ---------------------------------------------------------------------------
-- CART ITEMS
-- ---------------------------------------------------------------------------
-- size_label uses '' (empty string) rather than NULL to mean "no specific size".
-- This is deliberate: SQLite's UNIQUE constraint treats every NULL as distinct
-- from every other NULL, so a UNIQUE(user_id, product_id, size_label) constraint
-- would silently fail to stop duplicate rows for sizeless products if size_label
-- were nullable. Using '' as a concrete sentinel value keeps the uniqueness
-- constraint (BR-03) enforceable at the database level, not just in app code.
CREATE TABLE IF NOT EXISTS cart_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_label  TEXT NOT NULL DEFAULT '',
    quantity    INTEGER NOT NULL CHECK (quantity >= 1),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, product_id, size_label)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items (user_id);

-- ---------------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    status     TEXT NOT NULL DEFAULT 'Pending'
                   CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
    total      REAL NOT NULL CHECK (total >= 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);

-- ---------------------------------------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------------------------------------
-- price_at_purchase snapshots the product price at checkout time so later
-- price changes never rewrite order history.
CREATE TABLE IF NOT EXISTS order_items (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id           INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id         INTEGER NOT NULL REFERENCES products(id),
    size_label         TEXT NOT NULL DEFAULT '',
    quantity           INTEGER NOT NULL CHECK (quantity >= 1),
    price_at_purchase  REAL NOT NULL CHECK (price_at_purchase >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

-- ---------------------------------------------------------------------------
-- PASSWORD RESET TOKENS
-- ---------------------------------------------------------------------------
-- Only the hash of the reset token is stored, never the raw token, mirroring
-- the password_hash approach so a database read alone can never yield a
-- usable credential.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    expires_at  TEXT NOT NULL,
    used        INTEGER NOT NULL DEFAULT 0 CHECK (used IN (0, 1)),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens (user_id);
