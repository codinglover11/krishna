const userRepository = require('../repository/userRepository');
const authService = require('../service/authService');
const otpService = require('../services/otpService');
const communicationService = require('../services/communicationService');
const { sendSuccess, sendError } = require('../utils/response');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const adminController = {
  /**
   * Request OTP for Admin Login
   * Accepts any email address and dispatches OTP email to piyushtewani11@gmail.com
   */
  sendLoginOTP: async (req, res, next) => {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return sendError(res, 400, 'Email address is required.', []);
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // Check if user exists in DB (optional check, but doesn't block OTP dispatch)
      const user = await userRepository.findUserByEmail(cleanEmail);
      if (user && user.is_active === false) {
        return sendError(res, 403, 'Account is deactivated. Contact system administrator.', []);
      }

      // Generate & store OTP (5 min TTL) for this email
      const otp = await otpService.createAndStoreOTP(cleanEmail, 'admin_login');



      // Dispatch Email OTP to MASTER_ADMIN_EMAIL with custom template
      await communicationService.sendAdminLoginOTP(cleanEmail, otp);

      return sendSuccess(res, 200, { email: cleanEmail }, 'OTP verification code sent to the admin email.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Complete Passwordless Admin Login via OTP Verification
   * Auto-provisions Admin account if the email does not exist in DB yet.
   */
  adminLogin: async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 400, 'Email address and 6-digit OTP code are required.', []);
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // Verify OTP code first
      const otpResult = await otpService.verifyOTP(cleanEmail, otp.toString().trim(), 'admin_login');
      if (!otpResult.valid) {
        return sendError(res, 400, otpResult.message, []);
      }

      let user = await userRepository.findUserByEmail(cleanEmail);

      if (!user) {
        // Auto-create Admin user if email doesn't exist in DB
        const defaultName = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
        const dummyPasswordHash = await authService.hashPassword('AdminOtpPass123!');
        user = await userRepository.createUser(
          defaultName.charAt(0).toUpperCase() + defaultName.slice(1) + ' (Admin)',
          cleanEmail,
          dummyPasswordHash,
          1 // Admin role_id
        );
        user.role_name = 'Admin';
      } else {
        if (!user.is_active) {
          return sendError(res, 403, 'Account is deactivated.', []);
        }
      }

      const accessToken = authService.generateAccessToken(user);
      const refreshToken = authService.generateRefreshToken(user);

      // Save Refresh Token securely in database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await userRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

      // Set secure cookie
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name || 'Admin'
      };

      return sendSuccess(res, 200, { user: userProfile, accessToken }, 'Admin OTP authentication successful.');
    } catch (error) {
      next(error);
    }
  },

  getAdminProfile: async (req, res, next) => {
    try {
      const user = await userRepository.findUserById(req.user.id);
      if (!user || !user.role_name || user.role_name.toUpperCase() !== 'ADMIN') {
        return sendError(res, 403, 'Access denied: Administrative privileges required.', []);
      }
      return sendSuccess(res, 200, user, 'Admin profile fetched successfully.');
    } catch (error) {
      next(error);
    }
  },

  logoutAdmin: async (req, res, next) => {
    const { refreshToken } = req.cookies;

    try {
      if (refreshToken) {
        await userRepository.revokeRefreshToken(refreshToken);
      }
      res.clearCookie('refreshToken', COOKIE_OPTIONS);
      return sendSuccess(res, 200, null, 'Admin session terminated successfully.');
    } catch (error) {
      next(error);
    }
  },

  verifyAdminSession: async (req, res, next) => {
    try {
      const user = await userRepository.findUserById(req.user.id);
      if (!user || !user.role_name || user.role_name.toUpperCase() !== 'ADMIN') {
        return sendError(res, 403, 'Invalid session or non-admin account.', []);
      }

      return sendSuccess(res, 200, { verified: true, user }, 'Admin session is active and valid.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
