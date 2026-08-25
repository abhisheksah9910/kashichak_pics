const { error } = require('../utils/apiResponse');

// Must run after `protect`. Blocks anyone whose role isn't 'admin'.
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return error(res, 403, 'Admin access required.');
  }
  next();
};

module.exports = { adminOnly };
