import { PrismaClient } from '@prisma/client';
import { sendPushNotification } from '../services/notification.service';
import { sendSMS } from '../services/sms.service';
import { autoUnlockSMS } from '../utils/smsTemplates';

const prisma = new PrismaClient();

/**
 * Auto-Unlock Job — Runs daily at midnight (Asia/Dhaka).
 *
 * Finds all donors whose 120-day lock period has expired,
 * unlocks their profiles, and notifies them via Push + SMS.
 *
 * Note: is_available is set to false — donor must manually re-enable.
 */
export async function autoUnlockJob(): Promise<void> {
  const now = new Date();

  try {
    // Find all donors whose lock period has expired
    const expiredDonors = await prisma.user.findMany({
      where: {
        isLocked: true,
        lockEndDate: { lte: now },
      },
    });

    if (expiredDonors.length === 0) {
      console.log('[AutoUnlock] No donors to unlock.');
      return;
    }

    // Batch unlock all expired donors
    await prisma.user.updateMany({
      where: {
        id: { in: expiredDonors.map((d) => d.id) },
      },
      data: {
        isLocked: false,
        isAvailable: false, // Donor must manually re-enable
        lockStartDate: null,
        lockEndDate: null,
      },
    });

    // Notify each donor via Push + SMS
    for (const donor of expiredDonors) {
      if (donor.fcmToken) {
        await sendPushNotification(
          [donor.fcmToken],
          '🎉 You can donate again!',
          'Your 4-month rest period is over. Toggle your availability to start receiving requests.',
          { type: 'auto_unlock' }
        );
      }

      await sendSMS(donor.phone, autoUnlockSMS());
    }

    console.log(`[AutoUnlock] Unlocked ${expiredDonors.length} donor(s).`);
  } catch (error) {
    console.error('[AutoUnlock] Error:', error);
  }
}
