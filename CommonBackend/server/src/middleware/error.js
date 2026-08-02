const { sendError } = require('../utils/response');

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errors = Array.isArray(err.errors) ? err.errors : [];

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
