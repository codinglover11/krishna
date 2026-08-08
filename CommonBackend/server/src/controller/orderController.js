const orderRepository = require('../repository/orderRepository');
const cartRepository = require('../repository/cartRepository');
const addressRepository = require('../repository/addressRepository');
const userRepository = require('../repository/userRepository');
const deliveryService = require('../services/deliveryService');
const communicationService = require('../services/communicationService');
const { sendSuccess, sendError } = require('../utils/response');

const orderController = {
  estimateDelivery: async (req, res, next) => {
    try {
      const { latitude, longitude } = req.body;
      if (!latitude || !longitude) {
        return sendSuccess(res, 200, {
          distanceKm: 0,
          eligible: true,
          message: 'Delivery calculated (Address verification pending).',
          charge: 50 // Standard fallback flat rate
        }, 'Fallback delivery estimate calculated.');
      }
      const distanceKm = deliveryService.calculateDistanceToShop(latitude, longitude);
      const eligibility = deliveryService.validateDeliveryEligibility(distanceKm);
      const charge = eligibility.eligible ? deliveryService.calculateDeliveryCharge(distanceKm) : 0;
      
      return sendSuccess(res, 200, {
        distanceKm,
        eligible: eligibility.eligible,
        message: eligibility.message,
        charge
      }, 'Delivery estimate calculated.');
    } catch (error) {
      next(error);
    }
  },

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
      // 1. Verify user & address
      const user = await userRepository.findUserById(userId);
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

      // 3. Distance & Eligibility Validation
      let deliveryDistance = 0;
      let deliveryCharge = 0;
      if (address.latitude && address.longitude) {
        deliveryDistance = deliveryService.calculateDistanceToShop(address.latitude, address.longitude);
        const eligibility = deliveryService.validateDeliveryEligibility(deliveryDistance);
        if (!eligibility.eligible) {
          if (user && user.email) {
            await communicationService.sendOutofDeliveryAreaEmail(user.email).catch(() => {});
          }
          return sendError(res, 400, eligibility.message, []);
        }
        deliveryCharge = deliveryService.calculateDeliveryCharge(deliveryDistance);
      }

      // 4. Validate stock & compute totals
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

        const price = parseFloat(item.unitPrice || item.price);
        const discountPrice = item.discountPrice ? parseFloat(item.discountPrice) : null;
        subtotal += price * item.quantity;
        
        if (discountPrice && discountPrice < price) {
          discountAmount += (price - discountPrice) * item.quantity;
        }
      }

      // Architecture Ready: Tax & Shipping
      const taxAmount = 0.00;
      const shippingAmount = deliveryCharge;
      const totalPrice = subtotal - discountAmount + taxAmount + shippingAmount;

      // Generate order number
      const orderNumber = `KF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentStatus = paymentMethod === 'ONLINE' ? 'Pending_Verification' : 'Pending';

      // 5. Place order atomically
      const orderData = {
        addressId,
        totalPrice,
        discountAmount,
        taxAmount,
        shippingAmount, // This maps to delivery_charge in our new logic if we modify repo, but we'll adapt repository directly later
        paymentMethod,
        paymentStatus,
        orderNumber,
        deliveryDistance,
        deliveryCharge
      };

      const order = await orderRepository.createOrderAtomic(userId, orderData, cartItems);
      
      // 6. Send confirmation email (only for COD, ONLINE waits for admin verification)
      if (user && user.email && paymentMethod === 'COD') {
        const estDate = deliveryService.getEstimatedDeliveryDate();
        await communicationService.sendOrderConfirmation(order, cartItems, user.email, estDate).catch(err => console.error(err));
      }

      // 7. Send notification to admin
      await communicationService.sendAdminOrderNotification({ ...orderData, id: order.id }, address, cartItems).catch(err => console.error(err));

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

      const createdTime = new Date(order.created_at).getTime();
      const hoursDiff = (Date.now() - createdTime) / (1000 * 60 * 60);
      const { feePaid } = req.body || {};

      if (hoursDiff > 24 && !feePaid) {
        return sendError(res, 400, 'Cancellation fee required for orders older than 24 hours.', []);
      }

      await orderRepository.cancelOrderAtomic(id);
      return sendSuccess(res, 200, null, 'Order cancelled successfully.');
    } catch (error) {
      next(error);
    }
  },

  verifyPayment: async (req, res, next) => {
    const { id } = req.params;
    const { action } = req.query;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).send('Invalid action. Use ?action=accept or ?action=decline');
    }

    try {
      const order = await orderRepository.findOrderById(id);
      if (!order) {
        return res.status(404).send('Order not found.');
      }

      if (order.payment_status !== 'Pending_Verification') {
        return res.status(400).send(`Payment is already processed. Current status: ${order.payment_status}`);
      }

      const newStatus = action === 'accept' ? 'Paid' : 'Payment_Failed';
      await orderRepository.updatePaymentStatus(id, newStatus);
      
      if (action === 'accept') {
        try {
          const items = await orderRepository.findOrderItems(id);
          const user = await userRepository.findUserById(order.user_id);
          if (user && user.email) {
            const estDate = deliveryService.getEstimatedDeliveryDate();
            await communicationService.sendOrderConfirmation(order, items, user.email, estDate).catch(err => console.error(err));
          }
        } catch (e) {
          console.error('Failed to send customer confirmation email after verification:', e);
        }
      }
      
      const htmlResponse = `
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: ${action === 'accept' ? '#16a34a' : '#dc2626'}">
              Payment ${action === 'accept' ? 'Accepted' : 'Declined'} successfully.
            </h2>
            <p>The order payment status has been updated to <strong>${newStatus}</strong>.</p>
            <p>You can safely close this window.</p>
          </body>
        </html>
      `;
      return res.status(200).send(htmlResponse);
    } catch (error) {
      console.error(error);
      return res.status(500).send('An error occurred during verification.');
    }
  }
};

module.exports = orderController;
