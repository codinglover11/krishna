module.exports = {
  asyncHandler: require('../middleware/asyncHandler'),
  errorHandler: require('../middleware/error').errorHandler,
  notFoundHandler: require('../middleware/error').notFoundHandler,
  validate: require('../middleware/validation').validate,
};
