import { PrismaClient } from '@prisma/client';
import { generateOTP, hashOTP, verifyOTP } from '../utils/otp';
import { signToken } from '../utils/jwt';
import { sendOtpSMS } from './sms.service';
import { AppError } from '../types';
import { OTP_EXPIRY_MINUTES } from '../utils/constants';

const prisma = new PrismaClient();

/**
 * Register a new user.
 * 1. Check if phone already exists → throw 409.
 * 2. Generate & hash OTP.
 * 3. Create unverified user record.
 * 4. Send OTP via SMS.
 */
export async function register(
  name: string,
  phone: string,
  bloodGroup: string
): Promise<{ message: string }> {
  // Check for duplicate phone
  const existing = await prisma.user.findUnique({ where: { phone } });

  if (existing && existing.isVerified) {
    throw new AppError(409, 'DUPLICATE_PHONE', 'This phone number is already registered');
  }

  // Generate OTP
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  if (existing && !existing.isVerified) {
    // Update existing unverified record with new OTP
    await prisma.user.update({
      where: { phone },
      data: {
        name,
        bloodGroup: bloodGroup as any,
        otpHash,
        otpExpiresAt,
      },
    });
  } else {
    // Create new unverified user
    await prisma.user.create({
      data: {
        name,
        phone,
        bloodGroup: bloodGroup as any,
        isVerified: false,
        otpHash,
        otpExpiresAt,
      },
    });
  }

  // Send OTP via SMS
  await sendOtpSMS(phone, otp);

  return { message: 'OTP sent successfully' };
}

/**
 * Verify OTP and activate the user's profile.
 * 1. Find user by phone.
 * 2. Check OTP expiry.
 * 3. Compare OTP with hash.
 * 4. Activate profile, clear OTP, return JWT.
 */
export async function verifyOtp(
  phone: string,
  otp: string
): Promise<{ token: string; user: any }> {
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found with this phone number');
  }

  if (!user.otpHash || !user.otpExpiresAt) {
    throw new AppError(400, 'INVALID_OTP', 'No OTP was generated for this user. Please register again.');
  }

  // Check expiry
  if (new Date() > user.otpExpiresAt) {
    throw new AppError(400, 'INVALID_OTP', 'OTP has expired. Please request a new one.');
  }

  // Compare OTP
  const isValid = await verifyOTP(otp, user.otpHash);
  if (!isValid) {
    throw new AppError(400, 'INVALID_OTP', 'Invalid OTP. Please try again.');
  }

  // Activate profile and clear OTP
  const updatedUser = await prisma.user.update({
    where: { phone },
    data: {
      isVerified: true,
      otpHash: null,
      otpExpiresAt: null,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      bloodGroup: true,
      profilePhoto: true,
      isAvailable: true,
      isLocked: true,
      lockEndDate: true,
      donationCount: true,
      createdAt: true,
    },
  });

  // Sign JWT
  const token = signToken({ userId: updatedUser.id, phone: updatedUser.phone });

  return { token, user: updatedUser };
}
