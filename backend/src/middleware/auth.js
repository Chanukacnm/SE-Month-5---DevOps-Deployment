const jwt = require('jsonwebtoken');
const config = require('../config');
const { ApiError } = require('../utils/errors');

function requireAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Authentication required');
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    req.user = { id: payload.sub, name: payload.name, email: payload.email, role: payload.role };
  } catch {
    throw new ApiError(401, 'Session expired, please sign in again');
  }
  next();
}

const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user?.role)) throw new ApiError(403, 'You do not have permission to do that');
    next();
  };

module.exports = { requireAuth, requireRole };
