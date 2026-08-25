const { error } = require('../utils/apiResponse');

// Central error handler — every controller can just `next(err)` and this
// turns it into a consistent JSON response instead of leaking stack traces.
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return error(res, 400, 'Validation failed.', messages);
  }

  if (err.code === 11000) {
    return error(res, 409, 'This record already exists.');
  }

  if (err.name === 'CastError') {
    return error(res, 400, 'Invalid ID format.');
  }

  return error(res, err.statusCode || 500, err.message || 'Something went wrong on our end.');
};

const notFound = (req, res) => error(res, 404, `Route not found: ${req.originalUrl}`);

module.exports = { errorHandler, notFound };
