const userRepository = require('../repository/userRepository');
const authService = require('../service/authService');
const communicationService = require('../services/communicationService');
const otpService = require('../services/otpService');
const { sendSuccess, sendError } = require('../utils/response');
const { pool } = require('../config/db');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const authController = {
  register: async (req, res, next) => {
    const { name, email, password, phone, avatar } = req.body;
    
    try {
      const existingUser = await userRepository.findUserByEmail(email);
      if (existingUser) {
        return sendError(res, 400, 'A user account with this email address already exists.', []);
      }

      const passwordHash = await authService.hashPassword(password);
      
      // Execute registration and shopping cart creation atomically within a transaction
      const client = await pool.connect();
      let newUser;
      try {
        await client.query('BEGIN');
        newUser = await userRepository.createUser(name, email, passwordHash, 3, phone || null, avatar || null, client);
        await client.query('INSERT INTO cart (user_id) VALUES ($1)', [newUser.id]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      return sendSuccess(res, 201, newUser, 'User registered successfully and cart provisioned.');
    } catch (error) {
      next(error);
    }
  },

  sendEmailOTP: async (req, res, next) => {
    const { email, purpose = 'registration' } = req.body;
    if (!email) return sendError(res, 400, 'Email address is required.');

    try {
      const otp = await otpService.createAndStoreOTP(email, purpose);



      await communicationService.sendEmailOTP(email, otp);
      return sendSuccess(res, 200, { email }, `OTP code sent to ${email}. Valid for 5 minutes.`);
    } catch (error) {
      next(error);
    }
  },

  verifyEmailOTP: async (req, res, next) => {
    const { email, otp, purpose = 'registration' } = req.body;
    if (!email || !otp) return sendError(res, 400, 'Email and OTP code are required.');

    try {
      const result = await otpService.verifyOTP(email, otp, purpose);
      if (!result.valid) {
        return sendError(res, 400, result.message);
      }
      return sendSuccess(res, 200, { email, verified: true }, result.message);
    } catch (error) {
      next(error);
    }
  },

  verifyFirebasePhoneToken: async (req, res, next) => {
    const { idToken } = req.body;
    if (!idToken) return sendError(res, 400, 'Firebase ID Token is required.');

    try {
      const verifiedData = await communicationService.verifyPhoneToken(idToken);
      return sendSuccess(res, 200, verifiedData, 'Phone Token verified successfully.');
    } catch (error) {
      return sendError(res, 401, error.message || 'Firebase phone authentication failed.');
    }
  },

  sendAdminForgotOTP: async (req, res, next) => {
    const { email } = req.body;
    const adminPhone = process.env.ADMIN_PHONE_NUMBER || '+1234567890';
    const target = email || adminPhone;

    try {
      const otp = await otpService.createAndStoreOTP(target, 'admin_reset');
      
      if (email) {
        await communicationService.sendEmailOTP(email, otp);
      }
      

      return sendSuccess(res, 200, { target }, `Admin OTP code dispatched. Check your email/logs.`);
    } catch (error) {
      next(error);
    }
  },

  resetAdminPasswordOTP: async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    const adminPhone = process.env.ADMIN_PHONE_NUMBER || '+1234567890';
    const target = email || adminPhone;

    if (!otp || !newPassword) {
      return sendError(res, 400, 'OTP code and new password are required.');
    }

    try {
      const verification = await otpService.verifyOTP(target, otp, 'admin_reset');
      if (!verification.valid) {
        return sendError(res, 400, verification.message);
      }

      // Update admin user password
      const adminUser = await pool.query("SELECT u.* FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'Admin' OR u.email = $1 LIMIT 1", [email || 'admin@krishnafootwear.com']).then(r => r.rows[0]);
      if (!adminUser) {
        return sendError(res, 404, 'Admin user account not found.');
      }

      const passwordHash = await authService.hashPassword(newPassword);
      await userRepository.updateUserPassword(adminUser.id, passwordHash);

      return sendSuccess(res, 200, null, 'Admin password has been reset successfully.');
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const user = await userRepository.findUserByEmail(email);
      if (!user || !user.is_active) {
        return sendError(res, 401, 'Invalid email or password credentials.', []);
      }

      const isMatch = await authService.comparePassword(password, user.password_hash);
      if (!isMatch) {
        return sendError(res, 401, 'Invalid email or password credentials.', []);
      }

      const accessToken = authService.generateAccessToken(user);
      const refreshToken = authService.generateRefreshToken(user);

      // Save Refresh Token securely in PostgreSQL
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await userRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

      // Set cookie
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role_name
      };

      return sendSuccess(res, 200, { user: userProfile, accessToken }, 'Login successful.');
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    const { refreshToken } = req.cookies;

    try {
      if (refreshToken) {
        await userRepository.revokeRefreshToken(refreshToken);
      }
      res.clearCookie('refreshToken', COOKIE_OPTIONS);
      return sendSuccess(res, 200, null, 'Logged out successfully.');
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req, res, next) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return sendError(res, 401, 'Session expired or refresh token is missing.', []);
    }

    try {
      const decoded = authService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return sendError(res, 401, 'Refresh token is expired or invalid.', []);
      }

      const dbToken = await userRepository.findRefreshToken(refreshToken);
      if (!dbToken) {
        return sendError(res, 401, 'Refresh token has been revoked or is invalid.', []);
      }

      const user = await userRepository.findUserById(dbToken.user_id);
      if (!user || !user.is_active) {
        return sendError(res, 401, 'User account is inactive or not found.', []);
      }

      // Generate rotated tokens
      const newAccessToken = authService.generateAccessToken(user);
      const newRefreshToken = authService.generateRefreshToken(user);

      // Rotate Refresh Token in DB: Revoke old, insert new
      await userRepository.revokeRefreshToken(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await userRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

      // Set cookie
      res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role_name
      };

      return sendSuccess(res, 200, { user: userProfile, accessToken: newAccessToken }, 'Token refreshed successfully.');
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    const { email } = req.body;

    try {
      const user = await userRepository.findUserByEmail(email);
      if (!user) {
        return sendSuccess(res, 200, null, 'If this email is registered, a password recovery code will be dispatched.');
      }

      const resetToken = authService.generateAccessToken(user);
      console.log(`[PASSWORD RESET SERVICE]: Token generated for ${email}: ${resetToken}`);
      return sendSuccess(res, 200, { resetToken }, 'Password reset instructions generated.');
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    const { token, newPassword } = req.body;

    try {
      const decoded = authService.verifyAccessToken(token);
      if (!decoded) {
        return sendError(res, 400, 'Password reset token is expired or invalid.', []);
      }

      const passwordHash = await authService.hashPassword(newPassword);
      await userRepository.updateUserPassword(decoded.id, passwordHash);

      return sendSuccess(res, 200, null, 'Your password has been successfully updated.');
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]).then(r => r.rows[0]);
      if (!user) {
        return sendError(res, 404, 'User not found.', []);
      }

      const isMatch = await authService.comparePassword(oldPassword, user.password_hash);
      if (!isMatch) {
        return sendError(res, 400, 'Incorrect existing password entered.', []);
      }

      const passwordHash = await authService.hashPassword(newPassword);
      await userRepository.updateUserPassword(userId, passwordHash);

      return sendSuccess(res, 200, null, 'Password updated successfully. Please log back in.');
    } catch (error) {
      next(error);
    }
  },

  getCurrentUser: async (req, res, next) => {
    try {
      const user = await userRepository.findUserById(req.user.id);
      if (!user) {
        return sendError(res, 404, 'User not found.', []);
      }
      return sendSuccess(res, 200, user, 'Current user profile fetched.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
