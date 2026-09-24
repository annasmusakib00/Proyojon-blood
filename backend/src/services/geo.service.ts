import { PrismaClient } from '@prisma/client';
import { MatchedDonor } from '../types';
import { SEARCH_RADIUS_KM } from '../utils/constants';

const prisma = new PrismaClient();

/**
 * Find all verified, available, unlocked donors of a specific blood group
 * within a given radius of the hospital location using the Haversine formula.
 *
 * The radius filtering is done at the database level using MySQL's
 * trigonometric functions for performance.
 */
export async function findDonorsWithinRadius(
  hospitalLat: number,
  hospitalLng: number,
  bloodGroup: string
): Promise<MatchedDonor[]> {
  const donors = await prisma.$queryRaw<MatchedDonor[]>`
    SELECT 
      id, 
      name, 
      phone, 
      fcm_token AS fcmToken, 
      latitude, 
      longitude,
      (
        6371 * ACOS(
          COS(RADIANS(${hospitalLat})) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(${hospitalLng})) +
          SIN(RADIANS(${hospitalLat})) * SIN(RADIANS(latitude))
        )
      ) AS distance_km
    FROM users
    WHERE blood_group = ${bloodGroup}
      AND is_available = true
      AND is_locked = false
      AND is_verified = true
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
    HAVING distance_km <= ${SEARCH_RADIUS_KM}
    ORDER BY distance_km ASC
  `;

  return donors;
}
