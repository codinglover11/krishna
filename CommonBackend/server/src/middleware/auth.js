const authService = require('../service/authService');
const { sendError } = require('../utils/response');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 401, 'Access token is missing', []);
  }

  const decoded = authService.verifyAccessToken(token);
  if (!decoded) {
    return sendError(res, 401, 'Access token is expired or invalid', []);
  }

  req.user = decoded;
  next();
};
