// Single shared SQLite connection for the whole backend.
// better-sqlite3 is synchronous, which keeps the transaction logic used later
// for checkout (Section 9/10 of the approved architecture) simple to reason
// about: no interleaved async callbacks between the stock check and decrement.

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'database', 'app.db');

const db = new Database(DB_PATH);

// Foreign keys are OFF by default per SQLite connection unless explicitly
// enabled - required for the ON DELETE CASCADE behavior in the schema to work.
db.pragma('foreign_keys = ON');

// WAL improves concurrent read/write behavior for a local multi-request
// Express server; still a single physical writer, which is what the
// concurrent-checkout design in the architecture relies on.
db.pragma('journal_mode = WAL');

module.exports = db;
