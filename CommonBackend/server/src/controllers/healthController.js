const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../middleware/asyncHandler');

const getHealth = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, {
    status: 'ok',
    service: 'common-backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'configured' : 'pending',
    redis: process.env.REDIS_URL ? 'configured' : 'pending',
  }, 'Backend health check passed');
});

module.exports = {
  getHealth,
};
