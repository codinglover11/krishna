const orderRepository = require('../repository/orderRepository');
const cartRepository = require('../repository/cartRepository');
const addressRepository = require('../repository/addressRepository');
const { sendSuccess, sendError } = require('../utils/response');

const orderController = {
  getOrders: async (req, res, next) => {
    const userId = req.user.id;
    try {
      const orders = await orderRepository.findOrdersByUserId(userId);
      return sendSuccess(res, 200, orders, 'Orders fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const order = await orderRepository.findOrderById(id);
      if (!order || order.user_id !== userId) {
        return sendError(res, 404, 'Order not found.', []);
      }

      const items = await orderRepository.findOrderItems(id);
      return sendSuccess(res, 200, { ...order, items }, 'Order details fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  createOrder: async (req, res, next) => {
    const userId = req.user.id;
    const { addressId, paymentMethod = 'COD' } = req.body;

    if (!addressId) {
      return sendError(res, 400, 'Shipping address is required.', []);
    }

    try {
      // 1. Verify address
      const address = await addressRepository.findAddressById(addressId);
      if (!address || address.user_id !== userId) {
        return sendError(res, 400, 'Invalid shipping address.', []);
      }

      // 2. Fetch cart items
      const cart = await cartRepository.findOrCreateCart(userId);
      const cartItems = await cartRepository.findCartItems(cart.id);

      if (cartItems.length === 0) {
        return sendError(res, 400, 'Your shopping cart is empty.', []);
      }

      // 3. Validate stock & compute totals
      let subtotal = 0;
      let discountAmount = 0;
      
      for (const item of cartItems) {
        if (item.quantity > item.stock_quantity) {
          return sendError(
            res,
            400,
            `Product "${item.productName}" (Size ${item.size_label}) is out of stock or requested quantity exceeds available inventory. Available stock: ${item.stock_quantity}`,
            []
          );
        }

        const price = parseFloat(item.unitPrice);
        const discountPrice = item.discountPrice ? parseFloat(item.discountPrice) : null;
        subtotal += price * item.quantity;
        
        if (discountPrice && discountPrice < price) {
          discountAmount += (price - discountPrice) * item.quantity;
        }
      }

      // Architecture Ready: Tax & Shipping
      const taxAmount = 0.00;
      const shippingAmount = 0.00; // Free shipping
      const totalPrice = subtotal - discountAmount + taxAmount + shippingAmount;

      // Generate order number
      const orderNumber = `KF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Place order atomically
      const orderData = {
        addressId,
        totalPrice,
        discountAmount,
        taxAmount,
        shippingAmount,
        paymentMethod,
        orderNumber
      };

      const order = await orderRepository.createOrderAtomic(userId, orderData, cartItems);

      return sendSuccess(res, 201, order, 'Order placed successfully.');
    } catch (error) {
      next(error);
    }
  },

  cancelOrder: async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const order = await orderRepository.findOrderById(id);
      if (!order || order.user_id !== userId) {
        return sendError(res, 404, 'Order not found.', []);
      }

      await orderRepository.cancelOrderAtomic(id);
      return sendSuccess(res, 200, null, 'Order cancelled successfully.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderController;
