// Blocks a request unless it carries a valid session (i.e. the httpOnly
// session cookie set at login). This is the actual authorization boundary —
// not a client-side route guard — so BR-05 style "own data only" rules are
// enforced here and in the route handlers, not just hidden in the UI.

function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            error: { code: 'UNAUTHENTICATED', message: 'You must be logged in to do that.' },
        });
    }
    next();
}

module.exports = requireAuth;
