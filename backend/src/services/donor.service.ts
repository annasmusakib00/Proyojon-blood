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
    data: { latitude, longitude, lastSeenAt: new Date() },
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
    data: { fcmToken, lastSeenAt: new Date() },
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

/**
 * Get all active/verified donors across Bangladesh with optional filters.
 * Supports filtering by blood group and location (division/district text search).
 */
export async function getAllDonors(filters: {
  blood_group?: string;
  location?: string;
  page?: number;
  limit?: number;
}): Promise<{ donors: any[]; total: number; page: number; totalPages: number }> {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 50);
  const skip = (page - 1) * limit;

  const where: any = {
    isVerified: true,
    isAvailable: true,
    isLocked: false,
  };

  if (filters.blood_group) {
    where.bloodGroup = filters.blood_group;
  }

  if (filters.location) {
    // Search in the user's name or any text-based location fields
    // Since we store lat/lng, we also match division/district via a location field
    where.locationText = {
      contains: filters.location,
    };
  }

  const [donors, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        bloodGroup: true,
        profilePhoto: true,
        isAvailable: true,
        isLocked: true,
        isVerified: true,
        donationCount: true,
        locationText: true,
        lastSeenAt: true,
        createdAt: true,
        badges: {
          select: { badgeType: true },
        },
      },
      orderBy: [
        { donationCount: 'desc' },
        { lastSeenAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Mask phone numbers for list view (show last 4 digits)
  const maskedDonors = donors.map((d) => ({
    ...d,
    phone: d.phone.slice(0, 3) + '****' + d.phone.slice(-4),
  }));

  return {
    donors: maskedDonors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a donor's public profile by ID.
 * Shows full phone number, blood group, verified status, donation count.
 */
export async function getDonorPublicProfile(donorId: string) {
  const user = await prisma.user.findUnique({
    where: { id: donorId },
    select: {
      id: true,
      name: true,
      phone: true,
      bloodGroup: true,
      profilePhoto: true,
      isAvailable: true,
      isLocked: true,
      isVerified: true,
      donationCount: true,
      locationText: true,
      lastSeenAt: true,
      createdAt: true,
      badges: {
        select: { badgeType: true, awardedAt: true },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'Donor not found');
  }

  return user;
}
