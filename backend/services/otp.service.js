<<<<<<< Updated upstream
=======
import crypto from 'crypto';
export const OTP_LENGTH = 6;
export const OTP_EXPIRE_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_COOLDOWN_MINS = 2;
export function generateOTP(length = OTP_LENGTH) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max + 1).toString();
}
export function hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

export function verifyOTP(inputOtp, storedHash) {
    const inputHash = hashOTP(inputOtp);
    try {
        return crypto.timingSafeEqual(
            Buffer.from(inputHash, 'hex'),
            Buffer.from(storedHash, 'hex')
        );
    } catch {
        return false;
    }
}

export function isOTPExpired(expiresAt) {
    return new Date() > new Date(expiresAt);
}


export function canResendOTP(lastSentAt) {
    if (!lastSentAt) return true;
    const elapsed = Date.now() - new Date(lastSentAt).getTime();
    return elapsed > OTP_COOLDOWN_MINS * 60 * 1000;
}

export function resendCooldownSeconds(lastSentAt) {
    if (!lastSentAt) return 0;
    const elapsed = Date.now() - new Date(lastSentAt).getTime();
    const cooldownMs = OTP_COOLDOWN_MINS * 60 * 1000;
    return Math.max(0, Math.ceil((cooldownMs - elapsed) / 1000));
}
export function buildOTPDoc(plainOtp) {
    return {
        code: hashOTP(plainOtp),
        expiresAt: new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000),
        attempts: 0,
        lastSentAt: new Date(),
    };
}
>>>>>>> Stashed changes
