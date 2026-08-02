const { sendError } = require('../utils/response');
const asyncHandler = require('../middleware/asyncHandler');

const listProducts = asyncHandler(async (req, res) => {
  return sendError(res, 501, 'Products module is reserved for future implementation');
});

const getProduct = asyncHandler(async (req, res) => {
  return sendError(res, 501, 'Products module is reserved for future implementation');
});

const createProduct = asyncHandler(async (req, res) => {
  return sendError(res, 501, 'Products module is reserved for future implementation');
});

const updateProduct = asyncHandler(async (req, res) => {
  return sendError(res, 501, 'Products module is reserved for future implementation');
});

const deleteProduct = asyncHandler(async (req, res) => {
  return sendError(res, 501, 'Products module is reserved for future implementation');
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
