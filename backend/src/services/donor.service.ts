import { PrismaClient } from '@prisma/client';
import { AppError } from '../types';

const prisma = new PrismaClient();

/**
 * Toggle donor availability.
 * Blocked if the donor is in the 120-day rest lock.
 */
export async function toggleAvailability(
  userId: string,
  isAvailable: boolean
): Promise<{ is_available: boolean }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  if (user.isLocked) {
    const now = new Date();
    const lockEnd = user.lockEndDate ? new Date(user.lockEndDate) : now;
    const remainingDays = Math.ceil(
      (lockEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    throw new AppError(
      403,
      'PROFILE_LOCKED',
      `Your profile is locked for the resting period. ${remainingDays} days remaining.`
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isAvailable },
    select: { isAvailable: true },
  });

  return { is_available: updated.isAvailable };
}

/**
 * Update donor's current geo-location.
 */
export async function updateLocation(
  userId: string,
  latitude: number,
  longitude: number
): Promise<{ updated: boolean }> {
  await prisma.user.update({
    where: { id: userId },
    data: { latitude, longitude },
  });

  return { updated: true };
}

/**
 * Update donor's FCM token for push notifications.
 */
export async function updateFcmToken(
  userId: string,
  fcmToken: string
): Promise<{ updated: boolean }> {
  await prisma.user.update({
    where: { id: userId },
    data: { fcmToken },
  });

  return { updated: true };
}

export async function updateProfilePhoto(
  userId: string,
  url: string
): Promise<{ updated: boolean }> {
  await prisma.user.update({
    where: { id: userId },
    data: { profilePhoto: url },
  });

  return { updated: true };
}

export async function getPendingRequests(userId: string) {
  // Find all notification logs for this donor where the associated request is still PENDING
  const logs = await prisma.notificationLog.findMany({
    where: {
      donorId: userId,
      request: {
        status: 'PENDING',
      },
    },
    include: {
      request: true,
    },
  });
  return logs.map((log) => log.request);
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { badges: true }
  });
  
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  
  const { passwordHash, otpHash, ...userWithoutSecrets } = user;
  return userWithoutSecrets;
}
