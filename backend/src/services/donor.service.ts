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
