/**
 * server/middleware/auth.js
 * Verifies JWT Bearer token and attaches req.user = { id, email, role }
 */
import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/** Only allow specific roles */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    next();
  };
}
