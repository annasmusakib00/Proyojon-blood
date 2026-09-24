import cron from 'node-cron';
import { autoUnlockJob } from './autoUnlock.job';
import { staleRequestCleanup } from './staleRequestCleanup.job';

/**
 * Initialize all background cron jobs.
 */
export function initScheduler(): void {
  // Run daily at midnight (Bangladesh Standard Time, UTC+6)
  cron.schedule('0 0 * * *', autoUnlockJob, {
    timezone: 'Asia/Dhaka',
  });

  // Run every 30 minutes
  cron.schedule('*/30 * * * *', staleRequestCleanup);

  console.log('[Scheduler] All cron jobs registered.');
}
