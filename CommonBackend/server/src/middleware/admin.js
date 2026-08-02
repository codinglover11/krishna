const { sendError } = require('../utils/response');

module.exports = (req, res, next) => {
  if (!req.user || !req.user.role || req.user.role.toUpperCase() !== 'ADMIN') {
    return sendError(res, 403, 'Forbidden: Administrative privileges required.', []);
  }
  next();
};
