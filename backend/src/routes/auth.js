const express = require('express');
const db = require('../db');
const { isValidEmail, isValidPassword, isNonEmptyString } = require('../utils/validators');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateResetToken, hashToken } = require('../utils/tokens');

const router = express.Router();

const PUBLIC_USER_COLUMNS = 'id, name, email, role, phone, address, created_at';

function validationError(res, message, fields) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message, fields } });
}

function findUserByEmail(email) {
    return db.prepare(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`).get(email.trim());
}

function toPublicUser(row) {
    if (!row) return null;
    const { id, name, email, role, phone, address, created_at } = row;
    return { id, name, email, role, phone, address, created_at };
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, address } = req.body || {};
        const fieldErrors = {};

        if (!isNonEmptyString(name)) fieldErrors.name = 'Name is required.';
        if (!isNonEmptyString(email)) fieldErrors.email = 'Email is required.';
        else if (!isValidEmail(email)) fieldErrors.email = 'Email format is invalid.';
        if (!isNonEmptyString(password)) fieldErrors.password = 'Password is required.';
        else if (!isValidPassword(password)) fieldErrors.password = 'Password must be at least 8 characters.';

        if (Object.keys(fieldErrors).length > 0) {
            return validationError(res, 'Please correct the highlighted fields.', fieldErrors);
        }

        // Pre-check for a friendly error message. The UNIQUE index on
        // LOWER(email) is the authoritative guard (see catch block below) —
        // this check just avoids a raw SQLite error reaching the client in
        // the common case.
        const existing = findUserByEmail(email);
        if (existing) {
            return res.status(409).json({
                error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' },
            });
        }

        const passwordHash = await hashPassword(password);

        // Role is never accepted from the request body — registration always
        // creates a customer. Admin accounts are created via the
        // create-admin script (see README), not through this public route.
        const insert = db
            .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
            .run(name.trim(), email.trim(), passwordHash, 'customer');

        const user = db.prepare(`SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = ?`).get(insert.lastInsertRowid);

        req.session.userId = user.id;
        req.session.role = user.role;

        return res.status(201).json({ user });
    } catch (err) {
        if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            // Race condition fallback: two registrations for the same email
            // landed between the pre-check and the insert. The database
            // constraint is what actually prevents the duplicate; this just
            // turns it into the same friendly response as the common case.
            return res.status(409).json({
                error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' },
            });
        }
        return next(err);
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
            return validationError(res, 'Email and password are required.', {
                email: !isNonEmptyString(email) ? 'Email is required.' : undefined,
                password: !isNonEmptyString(password) ? 'Password is required.' : undefined,
            });
        }

        const row = findUserByEmail(email);

        // Deliberately identical response whether the email doesn't exist or
        // the password is wrong — telling them apart would let an attacker
        // enumerate registered emails.
        const genericFailure = () =>
            res.status(401).json({
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
            });

        if (!row) return genericFailure();

        const passwordMatches = await verifyPassword(password, row.password_hash);
        if (!passwordMatches) return genericFailure();

        req.session.userId = row.id;
        req.session.role = row.role;

        return res.json({ user: toPublicUser(row) });
    } catch (err) {
        return next(err);
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
router.post('/logout', (req, res, next) => {
    if (!req.session) return res.status(204).end();
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('navia.sid');
        return res.status(204).end();
    });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me  — "who am I", used by the frontend on load/refresh
// ---------------------------------------------------------------------------
router.get('/me', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.json({ user: null });
    }
    const user = db.prepare(`SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = ?`).get(req.session.userId);
    if (!user) {
        // Session refers to a user that no longer exists — treat as logged out.
        return res.json({ user: null });
    }
    return res.json({ user });
});
// PUT /api/auth/profile - update logged-in user's profile
router.put('/profile', (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Please log in first.'
        }
      });
    }

    const { name, phone, address } = req.body || {};
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

    if (!trimmedName) {
      return validationError(
        res,
        'Name is required.',
        { name: 'Name is required.' }
      );
    }

    const updateUser = db.prepare(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?'
    );

    updateUser.run(
      trimmedName,
      trimmedPhone || null,
address || null,
      req.session.userId
    );

    const updatedUser = db.prepare(
      `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = ?`
    ).get(req.session.userId);

    if (!updatedUser) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.'
        }
      });
    }

    return res.json({ user: updatedUser });
  } catch (err) {
    return next(err);
  }
});
// ---------------------------------------------------------------------------
// POST /api/auth/password-reset/request
// ---------------------------------------------------------------------------
router.post('/password-reset/request', (req, res, next) => {
    try {
        const { email } = req.body || {};
        if (!isNonEmptyString(email) || !isValidEmail(email)) {
            return validationError(res, 'A valid email is required.', { email: 'A valid email is required.' });
        }

        const user = findUserByEmail(email);

        // Always return the same response whether or not the account
        // exists — same enumeration concern as login.
        const genericResponse = () =>
            res.json({ message: 'If an account with that email exists, a reset link has been generated.' });

        if (!user) return genericResponse();

        const { rawToken, tokenHash } = generateResetToken();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

        db.prepare(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
        ).run(user.id, tokenHash, expiresAt);

        // No real email service is realistic to stand up for this
        // assessment (documented as a known limitation) — the reset link is
        // surfaced via server log instead of an actual email send.
        const resetLink = `http://localhost:5173/reset-password?token=${rawToken}`;
        console.log(`[password reset] ${user.email} -> ${resetLink} (expires ${expiresAt})`);

        return genericResponse();
    } catch (err) {
        return next(err);
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/password-reset/confirm
// ---------------------------------------------------------------------------
router.post('/password-reset/confirm', async (req, res, next) => {
    try {
        const { token, newPassword } = req.body || {};

        if (!isNonEmptyString(token)) {
            return validationError(res, 'Reset token is required.', { token: 'Reset token is required.' });
        }
        if (!isValidPassword(newPassword)) {
            return validationError(res, 'New password must be at least 8 characters.', {
                newPassword: 'New password must be at least 8 characters.',
            });
        }

        const tokenHash = hashToken(token);
        const row = db
            .prepare('SELECT * FROM password_reset_tokens WHERE token_hash = ?')
            .get(tokenHash);

        const invalid = () =>
            res.status(400).json({
                error: { code: 'INVALID_RESET_TOKEN', message: 'This reset link is invalid or has expired.' },
            });

        if (!row) return invalid();
        if (row.used) return invalid();
        if (new Date(row.expires_at).getTime() < Date.now()) return invalid();

        const passwordHash = await hashPassword(newPassword);

        const updateUser = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        const markUsed = db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?');

        db.transaction(() => {
            updateUser.run(passwordHash, row.user_id);
            markUsed.run(row.id);
        })();

        return res.json({ message: 'Password has been reset. You can now log in with your new password.' });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
