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
  }
};

module.exports = communicationService;
