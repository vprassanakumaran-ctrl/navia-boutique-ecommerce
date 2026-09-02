// Reset tokens are handled differently from passwords on purpose:
// - passwords are looked up by user row, so a slow, salted bcrypt hash is fine
// - reset tokens are looked up BY the token itself (the user presents only
//   the token, not their identity), so we need a deterministic hash we can
//   query with a plain WHERE clause. SHA-256 gives that; bcrypt's per-hash
//   random salt would make a direct lookup impossible without scanning and
//   comparing every stored token.
// The raw token is still never stored — only its SHA-256 hash — so a
// database read alone can't be replayed as a valid reset link.

const crypto = require('crypto');

function generateResetToken() {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    return { rawToken, tokenHash };
}

function hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

module.exports = { generateResetToken, hashToken };
