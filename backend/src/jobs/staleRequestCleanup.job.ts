import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Stale Request Cleanup — Runs every 30 minutes.
 *
 * Expires PENDING blood requests that have been unmatched
 * for more than 2 hours.
 */
export async function staleRequestCleanup(): Promise<void> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  try {
    const result = await prisma.bloodRequest.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: twoHoursAgo },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    if (result.count > 0) {
      console.log(`[StaleCleanup] Expired ${result.count} stale request(s).`);
    }
  } catch (error) {
    console.error('[StaleCleanup] Error:', error);
  }
}
