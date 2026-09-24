import bcryptjs from 'bcryptjs';

/**
 * Generate a random 6-digit numeric OTP string.
 */
export function generateOTP(): string {
  // Hardcoded for testing since SMS API is not yet purchased
  return "123456";
}

/**
 * Hash an OTP using bcryptjs with 10 salt rounds.
 */
export async function hashOTP(otp: string): Promise<string> {
  return bcryptjs.hash(otp, 10);
}

/**
 * Verify a plain-text OTP against its bcrypt hash.
 */
export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(otp, hash);
}
