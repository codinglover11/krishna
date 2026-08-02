/**
 * Production Logger Utility
 * Sanitizes logs and prevents sensitive credentials (passwords, tokens) from being printed.
 */

const isProd = process.env.NODE_ENV === 'production';

const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  const sensitiveKeys = ['password', 'password_hash', 'token', 'refreshToken', 'secret', 'api_secret'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  return sanitized;
};

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, sanitizeData(meta));
  },

  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, sanitizeData(meta));
  },

  error: (message, error = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      message: error.message || error,
      ...(isProd ? {} : { stack: error.stack })
    });
  }
};

module.exports = logger;
