import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'medicare-dev-secret-change-me';

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthenticated' });
  try {
    req.auth = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth || req.auth.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
