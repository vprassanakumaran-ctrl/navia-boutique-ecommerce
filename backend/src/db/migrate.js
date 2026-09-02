// Applies schema.sql to the database file at DB_PATH (backend/database/app.db
// by default). Safe to re-run: every statement uses IF NOT EXISTS.

const fs = require('fs');
const path = require('path');
const db = require('./index');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema);

const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((row) => row.name);

console.log('Schema applied to:', db.name);
console.log('Tables present:', tables.join(', '));
