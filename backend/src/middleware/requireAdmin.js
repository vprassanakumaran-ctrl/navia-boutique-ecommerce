// Enforces BR-06 ("only administrators can add/edit products") at the
// server, not the client. Any route mounted behind this middleware is
// unreachable by a non-admin regardless of what the frontend UI shows.

function requireAdmin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            error: { code: 'UNAUTHENTICATED', message: 'You must be logged in to do that.' },
        });
    }
    if (req.session.role !== 'admin') {
        return res.status(403).json({
            error: { code: 'FORBIDDEN', message: 'Administrator access required.' },
        });
    }
    next();
}

module.exports = requireAdmin;
