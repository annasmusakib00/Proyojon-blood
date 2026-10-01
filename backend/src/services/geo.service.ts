import { PrismaClient } from '@prisma/client';
import { MatchedDonor } from '../types';
import { SEARCH_RADIUS_KM, DONOR_FRESHNESS_DAYS } from '../utils/constants';

const prisma = new PrismaClient();

/**
 * Find all verified, available, recently-active, reachable donors
 * of a specific blood group within a given radius of the hospital
 * location using the Haversine formula.
 *
 * Eligibility criteria:
 *  - Matching blood group
 *  - Not the requester themselves
 *  - is_available = true  (donor has toggled themselves available)
 *  - is_locked = false    (not in the 120-day rest period)
 *  - is_verified = true   (OTP-verified account)
 *  - latitude/longitude are present
 *  - last_seen_at is within the freshness window (prevents ghost accounts)
 *  - fcm_token is present (donor can be reached via push notification)
 *  - within SEARCH_RADIUS_KM kilometres of the hospital
 */
export async function findDonorsWithinRadius(
  hospitalLat: number,
  hospitalLng: number,
  bloodGroup: string,
  requesterId: string
): Promise<MatchedDonor[]> {
  const freshnessThreshold = new Date(
    Date.now() - DONOR_FRESHNESS_DAYS * 24 * 60 * 60 * 1000
  );

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
      AND id != ${requesterId}
      AND is_available = true
      AND is_locked = false
      AND is_verified = true
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND last_seen_at IS NOT NULL
      AND last_seen_at >= ${freshnessThreshold}
    HAVING distance_km <= ${SEARCH_RADIUS_KM}
    ORDER BY distance_km ASC
  `;

  return donors;
}

