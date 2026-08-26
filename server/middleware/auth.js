const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

// Verifies the JWT and attaches req.user. Used on any route that requires
// a logged-in user (uploading, liking, profile, etc.).
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return error(res, 401, 'Not authorized. Please log in.');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return error(res, 401, 'User no longer exists.');
    if (user.isBanned) return error(res, 403, 'This account has been suspended.');

    req.user = user;
    next();
  } catch (err) {
    return error(res, 401, 'Invalid or expired session. Please log in again.');
  }
};

// Like `protect`, but does not fail the request if there's no token —
// used on public routes that behave slightly differently when logged in
// (e.g. showing whether the current user already liked a memory).
const attachUserIfPresent = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && !user.isBanned) req.user = user;
    next();
  } catch (err) {
    next();
  }
};

// Ensure user is admin or moderator
const adminOrModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    next();
  } else {
    return error(res, 403, 'Not authorized as admin or moderator.');
  }
};

module.exports = { protect, attachUserIfPresent, adminOrModerator };
