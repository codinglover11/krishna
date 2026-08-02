const cartRepository = require('../repository/cartRepository');
const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const cartController = {
  getCart: async (req, res, next) => {
    const userId = req.user.id; // From authenticateToken middleware

    try {
      const cart = await cartRepository.findOrCreateCart(userId);
      const items = await cartRepository.findCartItems(cart.id);

      let subtotal = 0;
      let totalDiscount = 0;
      let finalTotal = 0;
      const sanitizedItems = [];

      for (const item of items) {
        // Enforce stock bounds: If quantity exceeds stock, clamp it and update the DB
        let currentQty = item.quantity;
        const stockLimit = item.stock_quantity || 0;

        if (stockLimit <= 0) {
          // Out of stock completely, remove item or mark quantity as 0
          await cartRepository.removeCartItem(item.cart_item_id);
          continue;
        } else if (currentQty > stockLimit) {
          currentQty = stockLimit;
          await cartRepository.updateCartItemQuantity(item.cart_item_id, currentQty);
          item.quantity = currentQty;
        }

        const basePrice = parseFloat(item.price);
        const discountPrice = item.discount_price ? parseFloat(item.discount_price) : null;
        const hasDiscount = discountPrice !== null && discountPrice < basePrice;

        const itemSubtotal = basePrice * currentQty;
        const itemTotal = hasDiscount ? discountPrice * currentQty : basePrice * currentQty;
        const itemDiscount = hasDiscount ? (basePrice - discountPrice) * currentQty : 0;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        finalTotal += itemTotal;

        sanitizedItems.push({
          cartItemId: item.cart_item_id,
          productId: item.product_id,
          productName: item.product_name,
          brand: item.brand,
          slug: item.slug,
          variantId: item.variant_id,
          size: item.size_label,
          color: item.color_name,
          colorCode: item.color_code,
          primaryImage: item.primary_image,
          quantity: currentQty,
          stockLimit,
          unitPrice: basePrice,
          discountPrice: item.discount_price ? discountPrice : null,
          totalPrice: itemTotal
        });
      }

      return sendSuccess(res, 200, {
        cartId: cart.id,
        items: sanitizedItems,
        subtotal,
        discount: totalDiscount,
        total: finalTotal
      }, 'Cart details loaded.');
    } catch (error) {
      next(error);
    }
  },

  addItem: async (req, res, next) => {
    const userId = req.user.id;
    const { productId, productVariantId, quantity = 1 } = req.body;

    if (!productId || !productVariantId) {
      return sendError(res, 400, 'Product ID and Variant ID are required.', []);
    }

    try {
      const cart = await cartRepository.findOrCreateCart(userId);

      // Verify variant exists and has stock
      const variantRes = await pool.query('SELECT stock_quantity FROM product_variants WHERE id = $1', [productVariantId]);
      const variant = variantRes.rows[0];
      if (!variant) {
        return sendError(res, 404, 'Selected variant not found.', []);
      }

      const stockLimit = variant.stock_quantity;
      if (stockLimit <= 0) {
        return sendError(res, 400, 'Selected variant is out of stock.', []);
      }

      // Check if item already exists to verify stock sum limits
      const existing = await cartRepository.findCartItemByVariant(cart.id, productVariantId);
      const newQty = existing ? existing.quantity + quantity : quantity;

      if (newQty > stockLimit) {
        return sendError(res, 400, `Cannot add quantity. Only ${stockLimit} items are available in stock.`, []);
      }

      const added = await cartRepository.addCartItem(cart.id, productId, productVariantId, quantity);
      return sendSuccess(res, 200, added, 'Product successfully added to cart.');
    } catch (error) {
      next(error);
    }
  },

  updateItem: async (req, res, next) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return sendError(res, 400, 'Quantity must be at least 1.', []);
    }

    try {
      // Find item details to fetch variant stock limit
      const itemRes = await pool.query(`
        SELECT ci.quantity, pv.stock_quantity
        FROM cart_items ci
        LEFT JOIN product_variants pv ON ci.product_variant_id = pv.id
        WHERE ci.id = $1
      `, [itemId]);
      
      const item = itemRes.rows[0];
      if (!item) {
        return sendError(res, 404, 'Cart item not found.', []);
      }

      if (quantity > item.stock_quantity) {
        return sendError(res, 400, `Stock limit exceeded. Only ${item.stock_quantity} available.`, []);
      }

      const updated = await cartRepository.updateCartItemQuantity(itemId, quantity);
      return sendSuccess(res, 200, updated, 'Cart item quantity updated.');
    } catch (error) {
      next(error);
    }
  },

  removeItem: async (req, res, next) => {
    const { itemId } = req.params;

    try {
      const removed = await cartRepository.removeCartItem(itemId);
      if (!removed) {
        return sendError(res, 404, 'Cart item not found.', []);
      }
      return sendSuccess(res, 200, null, 'Item removed from cart.');
    } catch (error) {
      next(error);
    }
  },

  clearCart: async (req, res, next) => {
    const userId = req.user.id;

    try {
      const cart = await cartRepository.findOrCreateCart(userId);
      await cartRepository.clearCartItems(cart.id);
      return sendSuccess(res, 200, null, 'Cart cleared successfully.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = cartController;
