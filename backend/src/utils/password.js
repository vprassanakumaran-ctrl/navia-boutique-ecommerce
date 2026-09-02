// Wraps bcryptjs so the rest of the app never touches a raw password string
// or salt round count directly. bcryptjs (not bcrypt) per the approved stack
// — pure JS, no native build step.

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

function hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

function verifyPassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
}

module.exports = { hashPassword, verifyPassword };
