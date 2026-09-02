// Registration (routes/auth.js) always creates role='customer' on purpose —
// a public endpoint must never let a request body grant itself admin. This
// script is the deliberate, separate path for creating an admin account, run
// manually by whoever controls the server.
//
// Usage:
//   node src/db/create-admin.js "Admin Name" admin@navia.com SomeStrongPass1

const db = require('./index');
const { hashPassword } = require('../utils/password');
const { isValidEmail, isValidPassword, isNonEmptyString } = require('../utils/validators');

async function main() {
    const [, , name, email, password] = process.argv;

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
        console.error('Usage: node src/db/create-admin.js "Name" email@example.com password');
        process.exitCode = 1;
        return;
    }
    if (!isValidEmail(email)) {
        console.error('That email address is not a valid format.');
        process.exitCode = 1;
        return;
    }
    if (!isValidPassword(password)) {
        console.error('Password must be at least 8 characters.');
        process.exitCode = 1;
        return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (existing) {
        console.error('A user with that email already exists.');
        process.exitCode = 1;
        return;
    }

    const passwordHash = await hashPassword(password);
    const insert = db
        .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
        .run(name.trim(), email.trim(), passwordHash, 'admin');

    console.log(`Admin user created: id=${insert.lastInsertRowid}, email=${email}`);
}

main();
