import bcryptjs from 'bcryptjs';

/**
 * Generate a random 6-digit numeric OTP string.
 */
export function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
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
