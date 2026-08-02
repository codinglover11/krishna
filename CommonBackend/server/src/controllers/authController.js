const { sendError } = require('../utils/response');
const asyncHandler = require('../middleware/asyncHandler');

const register = asyncHandler(async (req, res) => {
  return sendError(res, 501, 'Authentication endpoints are reserved for future implementation');
});

const login = asyncHandler(async (req, res) => {
  return sendError(res, 501, 'Authentication endpoints are reserved for future implementation');
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return sendError(res, 501, 'Authentication endpoints are reserved for future implementation');
});

module.exports = {
  register,
  login,
  getCurrentUser,
};
