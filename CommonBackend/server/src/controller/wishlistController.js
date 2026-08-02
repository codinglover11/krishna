const wishlistRepository = require('../repository/wishlistRepository');
const cartRepository = require('../repository/cartRepository');
const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const wishlistController = {
  getWishlist: async (req, res, next) => {
    const userId = req.user.id;
    try {
      const list = await wishlistRepository.findWishlistByUserId(userId);
      return sendSuccess(res, 200, list, 'Wishlist loaded successfully.');
    } catch (error) {
      next(error);
    }
  },

  addItem: async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, 400, 'Product ID is required.', []);
    }

    try {
      // Verify product exists
      const prodCheck = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
      if (prodCheck.rows.length === 0) {
        return sendError(res, 404, 'Product not found.', []);
      }

      await wishlistRepository.addToWishlist(userId, productId);
      return sendSuccess(res, 200, null, 'Product added to wishlist.');
    } catch (error) {
      next(error);
    }
  },

  removeItem: async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params;

    try {
      const removed = await wishlistRepository.removeFromWishlist(userId, productId);
      if (!removed) {
        return sendError(res, 404, 'Item not found in wishlist.', []);
      }
      return sendSuccess(res, 200, null, 'Product removed from wishlist.');
    } catch (error) {
      next(error);
    }
  },

  checkStatus: async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params;

    try {
      const isWishlisted = await wishlistRepository.checkWishlistStatus(userId, productId);
      return sendSuccess(res, 200, { wishlisted: isWishlisted }, 'Wishlist status checked.');
    } catch (error) {
      next(error);
    }
  },

  moveItemToCart: async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const { variantId } = req.body; // Size variant to add to cart

    try {
      // Resolve variant
      let resolvedVariantId = variantId;
      if (!resolvedVariantId) {
        // Resolve first available variant in stock if not explicitly provided
        const variantRes = await pool.query(
          `SELECT id, stock_quantity FROM product_variants WHERE product_id = $1 AND stock_quantity > 0 LIMIT 1`,
          [productId]
        );
        const variant = variantRes.rows[0];
        if (!variant) {
          return sendError(res, 400, 'This product is out of stock and cannot be moved to the cart.', []);
        }
        resolvedVariantId = variant.id;
      } else {
        const checkStock = await pool.query(
          `SELECT stock_quantity FROM product_variants WHERE id = $1`,
          [resolvedVariantId]
        );
        if (checkStock.rows.length === 0 || checkStock.rows[0].stock_quantity <= 0) {
          return sendError(res, 400, 'Selected size variant is out of stock.', []);
        }
      }

      // Add to cart first
      const cart = await cartRepository.findOrCreateCart(userId);
      await cartRepository.addCartItem(cart.id, productId, resolvedVariantId, 1);

      // Remove from wishlist only after successful cart operation
      await wishlistRepository.removeFromWishlist(userId, productId);

      return sendSuccess(res, 200, null, 'Product successfully moved to shopping cart.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = wishlistController;
