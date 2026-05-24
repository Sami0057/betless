import cron from 'node-cron';
import { syncMatches, syncResults } from '../services/football.service';
import logger from '../utils/logger';

export function startCronJobs(): void {
  if (process.env.ENABLE_CRON_JOBS !== 'true') {
    logger.info('⏸️  Cron jobs disabled');
    return;
  }

  // Sync upcoming matches every 3 hours
  cron.schedule(process.env.MATCH_SYNC_CRON || '0 */3 * * *', async () => {
    logger.info('🔄 Syncing upcoming matches...');
    await syncMatches().catch((e) => logger.error('Match sync error:', e));
  });

  // Check results every 15 minutes during match times
  cron.schedule(process.env.RESULT_CHECK_CRON || '*/15 * * * *', async () => {
    await syncResults().catch((e) => logger.error('Results sync error:', e));
  });

  logger.info('⏰ Cron jobs started');
}
