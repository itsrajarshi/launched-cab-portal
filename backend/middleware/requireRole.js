// Role-based authorization middleware factory.
// Usage: router.use(authenticateToken, requireRole('vendor'));
//        router.post('/', authenticateToken, requireRole('company'), handler);
function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = requireRole;
