const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled API Error: ${req.method} ${req.originalUrl}`, err);

  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  const userMessage = isProd && statusCode === 500
    ? 'An unexpected server error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  const details = isProd ? [] : [err.stack];

  return sendError(res, statusCode, userMessage, details);
};

module.exports = errorHandler;
