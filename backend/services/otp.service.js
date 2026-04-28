import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

const OtpService = {
  generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += crypto.randomInt(0, 10);
    }
    return otp;
  },

  async hashOTP(otp) {
    const salt = await bcryptjs.genSalt(10);
    return await bcryptjs.hash(otp, salt);
  },

  async verifyOTP(otp, hashedOtp) {
    try {
      return await bcryptjs.compare(otp, hashedOtp);
    } catch (error) {
      console.error('OTP verification error:', error);
      return false;
    }
  },

  isExpired(expiresAt) {
    return Date.now() > expiresAt;
  }
};

export default OtpService;