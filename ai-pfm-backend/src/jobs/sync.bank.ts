import { schedule } from 'node-cron';
import transactionSyncService from '../services/transaction-sync.service';

const DAILY_SYNC_CRON = process.env.BANK_SYNC_CRON || '0 0 * * *';
const SYNC_ENABLED = process.env.BANK_SYNC_ENABLED !== 'false';

if (SYNC_ENABLED) {
    schedule(DAILY_SYNC_CRON, async () => {
        console.log('Running scheduled daily transaction sync...');
        try {
            const summary = await transactionSyncService.syncAllConsentedUsers();
            console.log(
                `Scheduled sync complete — users: ${summary.usersProcessed} processed, ${summary.usersFailed} failed; ` +
                `transactions: ${summary.totalInserted} inserted, ${summary.totalUpdated} updated`
            );
        } catch (error) {
            console.error('Scheduled transaction sync failed:', error);
        }
    });

    console.log(`Transaction sync scheduler enabled with cron: ${DAILY_SYNC_CRON}`);
} else {
    console.log('Transaction sync scheduler is disabled via BANK_SYNC_ENABLED=false');
}