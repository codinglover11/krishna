/**
 * In-Memory & Redis-Backed OTP Verification Service
 * Handles 6-digit Email/Phone OTP generation, 5-minute expiration, replay protection, and verification.
 */

const crypto = require('crypto');
const cacheService = require('./cacheService');

class OTPService {
  /**
   * Generate 6-digit numeric OTP
   */
  generateOTP() {
    return Math.floor(100000 + crypto.randomInt(900000)).toString();
  }

  /**
   * Store OTP in cache with TTL (default 300 seconds / 5 minutes)
   * @param {string} target - Email address or Phone number
   * @param {string} purpose - e.g., 'registration', 'admin_reset'
   * @returns {string} Generated 6-digit OTP code
   */
  async createAndStoreOTP(target, purpose = 'generic') {
    const key = `otp:${purpose}:${target.toLowerCase().trim()}`;
    const otp = this.generateOTP();
    await cacheService.set(key, { otp, attempts: 0 }, 300); // 5 minutes TTL
    return otp;
  }

  /**
   * Verify target OTP
   * @param {string} target - Email address or Phone number
   * @param {string} inputOTP - 6-digit OTP provided by client
   * @param {string} purpose - e.g., 'registration', 'admin_reset'
   */
  async verifyOTP(target, inputOTP, purpose = 'generic') {
    const key = `otp:${purpose}:${target.toLowerCase().trim()}`;
    const record = await cacheService.get(key);

    if (!record) {
      return { valid: false, message: 'OTP code has expired or was not requested.' };
    }

    if (record.attempts >= 5) {
      await cacheService.del(key);
      return { valid: false, message: 'Too many invalid attempts. Please request a new OTP code.' };
    }

    if (record.otp !== inputOTP.trim()) {
      record.attempts += 1;
      await cacheService.set(key, record, 300);
      return { valid: false, message: 'Invalid OTP code. Please try again.' };
    }

    // Success: Delete OTP key to prevent replay attacks
    await cacheService.del(key);
    return { valid: true, message: 'OTP verified successfully.' };
  }
}

module.exports = new OTPService();
