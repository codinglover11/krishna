/**
 * Modular Provider-Independent Communication Service Architecture
 * Abstract interface for Email OTP, Firebase Phone Verification, and notifications.
 * Completely free of third-party Twilio dependencies.
 */

const { getEmailProvider } = require('./emailProviders');
const firebaseAuthProvider = require('./firebaseAuthProvider');

const communicationService = {
  /**
   * Send Email Notification or OTP
   * @param {Object} options - { to, subject, html, text }
   */
  sendEmail: async ({ to, subject, html, text }) => {
    const provider = getEmailProvider();
    return await provider.send({ to, subject, html, text });
  },

  /**
   * Dispatch 6-Digit Email OTP
   * @param {string} email - Recipient email address
   * @param {string} otp - 6-digit OTP code
   */
  sendEmailOTP: async (email, otp) => {
    const subject = 'Your Krishna Footwear Verification Code';
    const text = `Your OTP verification code is: ${otp}. It expires in 5 minutes. Do not share this code with anyone.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Krishna Footwear</h2>
        <p style="font-size: 16px;">Your verification code is:</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #eb5e55; background: #f8fafc; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #64748b;">This code expires in 5 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `;
    return await communicationService.sendEmail({ to: email, subject, html, text });
  },

  /**
   * Dispatch Admin Login OTP to Master Admin Email
   * Always sends to piyushtewani11@gmail.com with dynamic template based on target email.
   * @param {string} targetEmail - The email trying to log into Admin
   * @param {string} otp - 6-digit OTP code
   */
  sendAdminLoginOTP: async (targetEmail, otp) => {
    const MASTER_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'piyushtewani11@gmail.com';
    const cleanTargetEmail = (targetEmail || '').toLowerCase().trim();
    const isMasterAdmin = cleanTargetEmail === MASTER_ADMIN_EMAIL.toLowerCase();

    let subject = '';
    let text = '';
    let htmlMessage = '';

    if (isMasterAdmin) {
      subject = 'Krishna Admin Login OTP Code';
      text = `Your OTP verification code is here plss Use for log in: ${otp}`;
      htmlMessage = `
        <p style="font-size: 16px; color: #1e293b;">Your OTP verification code is here plss Use for log in:</p>
      `;
    } else {
      subject = `Admin Login Attempt Notification - ${targetEmail}`;
      text = `${targetEmail} is try to enter in Krishna Admin If its secure share the OPT with them. OTP Code: ${otp}`;
      htmlMessage = `
        <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
          <p style="font-size: 15px; color: #991b1b; margin: 0; font-weight: bold;">
            ${targetEmail} is try to enter in Krishna Admin
          </p>
          <p style="font-size: 14px; color: #7f1d1d; margin: 6px 0 0 0;">
            If its secure share the OPT with them.
          </p>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Krishna Footwear Admin</h2>
        ${htmlMessage}
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #eb5e55; background: #f8fafc; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #64748b;">This verification code expires in 5 minutes.</p>
      </div>
    `;

    try {
      return await communicationService.sendEmail({ to: MASTER_ADMIN_EMAIL, subject, html, text });
    } catch (err) {
      console.warn(`[CommunicationService] Notice on sending email to ${MASTER_ADMIN_EMAIL}:`, err.message);
      return { success: false, warning: err.message };
    }
  },

  /**
   * Verify Phone Authentication Token via Firebase
   * @param {string} idToken - Firebase client ID token
   */
  verifyPhoneToken: async (idToken) => {
    return await firebaseAuthProvider.verifyPhoneToken(idToken);
  },

  /**
   * Dispatch Out of Delivery Area Regret Email
   * @param {string} customerEmail
   */
  sendOutofDeliveryAreaEmail: async (customerEmail) => {
    const shopAddress = process.env.SHOP_ADDRESS || "varun path Mansarowar, near sharma sweets, Jaipur";
    const subject = 'Delivery Currently Unavailable for Your Location';
    const text = `Your requested delivery location is outside our current delivery area. Shop Address: ${shopAddress}. We regret the inconvenience and hope to serve you in the future.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Delivery Currently Unavailable</h2>
        <p style="font-size: 16px;">We're sorry, but your requested delivery location is outside our current delivery area.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="font-size: 14px; margin: 0; font-weight: bold;">You can still visit our physical store at:</p>
          <p style="font-size: 14px; color: #475569; margin-top: 4px;">${shopAddress}</p>
        </div>
        <p style="font-size: 14px; color: #64748b;">We regret the inconvenience and hope to serve you in the future.</p>
      </div>
    `;
    return await communicationService.sendEmail({ to: customerEmail, subject, html, text });
  },

  /**
   * Dispatch Order Confirmation Email
   * @param {Object} order
   * @param {Array} items
   * @param {string} customerEmail
   * @param {Date} estimatedDeliveryDate
   */
  sendOrderConfirmation: async (order, items, customerEmail, estimatedDeliveryDate) => {
    const subject = `Order Confirmed! Order ID: #${order.order_number}`;
    
    let itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.product_name} ${item.size ? `(Size: ${item.size})` : ''}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.price_at_purchase}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #166534; margin-top: 0;">Order Confirmed!</h2>
        <p style="font-size: 16px;">Thank you for your order, <strong>#${order.order_number}</strong>.</p>
        
        <h3 style="margin-top: 24px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1;">Product</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #cbd5e1;">Qty</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #cbd5e1;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 4px 0; display: flex; justify-content: space-between;"><span>Subtotal:</span> <strong>₹${order.total_price - order.delivery_charge}</strong></p>
          <p style="margin: 4px 0; display: flex; justify-content: space-between;"><span>Delivery:</span> <strong>₹${order.delivery_charge}</strong></p>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 8px 0;" />
          <p style="margin: 4px 0; display: flex; justify-content: space-between; font-size: 18px;"><span>Total:</span> <strong style="color: #1e3a8a;">₹${order.total_price}</strong></p>
        </div>

        <p style="font-size: 14px; margin-bottom: 4px;"><strong>Payment Method:</strong> ${order.payment_method}</p>
        <p style="font-size: 14px; margin-bottom: 24px;"><strong>Expected Delivery:</strong> ${estimatedDeliveryDate.toDateString()}</p>

        <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 32px;">Thank you for shopping at Krishna Footwear!</p>
      </div>
    `;

    const text = `Order Confirmed! Order ID: #${order.order_number}. Thank you for your order. Total: ₹${order.total_price}.`;
    return await communicationService.sendEmail({ to: customerEmail, subject, html, text });
  },

  /**
   * Dispatch Order Notification Email to Admin
   * @param {Object} order
   * @param {Object} address
   * @param {Array} items
   */
  sendAdminOrderNotification: async (order, address, items) => {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'piyushtewani11@gmail.com';
    const subject = `New Order Received! #${order.order_number}`;
    
    let itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.product_name} ${item.size ? `(Size: ${item.size})` : ''}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      </tr>
    `).join('');

    const verificationLinksHtml = order.paymentMethod === 'ONLINE' ? `
      <div style="margin-top: 32px; padding: 24px; border: 2px dashed #3b82f6; border-radius: 8px; text-align: center; background-color: #eff6ff;">
        <h3 style="color: #1e3a8a; margin-top: 0;">Manual Payment Verification Required</h3>
        <p style="margin-bottom: 24px; font-size: 16px; font-weight: bold;">Do u recived payment of order ₹${order.totalPrice}?</p>
        <p style="margin-bottom: 24px;">if i tap yes than show order confirmed else reject</p>
        <a href="${process.env.API_URL || 'http://localhost:3000'}/api/v1/orders/verify-payment/${order.id}?action=accept" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 12px;">✅ Yes (Accept Payment)</a>
        <a href="${process.env.API_URL || 'http://localhost:3000'}/api/v1/orders/verify-payment/${order.id}?action=decline" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">❌ Reject</a>
      </div>
    ` : '';

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">New Order Alert</h2>
        <p style="font-size: 16px;">A new order (<strong>#${order.order_number}</strong>) has been placed.</p>
        
        <h3 style="margin-top: 24px;">Delivery Details</h3>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 4px 0;"><strong>Name:</strong> ${address.full_name}</p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> ${address.phone_number}</p>
          <p style="margin: 4px 0;"><strong>Address:</strong> ${address.address_line1}, ${address.city}, ${address.state} - ${address.postal_code}</p>
          <p style="margin: 4px 0;"><strong>Distance:</strong> ${order.deliveryDistance} km</p>
        </div>

        <h3 style="margin-top: 24px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1;">Product</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #cbd5e1;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 4px 0; display: flex; justify-content: space-between;"><span>Payment Method:</span> <strong>${order.paymentMethod}</strong></p>
          <p style="margin: 4px 0; display: flex; justify-content: space-between; font-size: 18px;"><span>Total:</span> <strong style="color: #1e3a8a;">₹${order.totalPrice}</strong></p>
        </div>

        ${verificationLinksHtml}
      </div>
    `;

    let text = `New Order: #${order.order_number}. Total: ₹${order.totalPrice}. Payment: ${order.paymentMethod}. Deliver to: ${address.address_line1}, ${address.city}. Distance: ${order.deliveryDistance} km`;
    if (order.paymentMethod === 'ONLINE') {
      text += `\n\n[ADMIN VERIFICATION REQUIRED]\nDo u recived payment of order ₹${order.totalPrice}?\nAccept: ${process.env.API_URL || 'http://localhost:3000'}/api/v1/orders/verify-payment/${order.id}?action=accept\nDecline: ${process.env.API_URL || 'http://localhost:3000'}/api/v1/orders/verify-payment/${order.id}?action=decline\n`;
    }

    try {
      return await communicationService.sendEmail({ to: ADMIN_EMAIL, subject, html, text });
    } catch (err) {
      console.error('Failed to send admin order notification email:', err);
    }
  }
};

module.exports = communicationService;
