import { schedule } from 'node-cron';
import TransactionsService from '../services/transactions.service';

const DAILY_SYNC_CRON = process.env.BANK_SYNC_CRON || '0 0 * * *';
const SYNC_ENABLED = process.env.BANK_SYNC_ENABLED !== 'false';

if (SYNC_ENABLED) {
    const transactionsService = new TransactionsService();
    
    schedule(DAILY_SYNC_CRON, async () => {
        console.log('Running scheduled daily transaction sync...');
        try {
            // Placeholder: Sync job would fetch from banking integration and persist transactions
            const transactions = await transactionsService.findAll();
            console.log(`Scheduled transaction sync completed. Current transactions: ${transactions.length}`);
        } catch (error) {
            console.error('Scheduled transaction sync failed:', error);
        }
    });

    console.log(`Transaction sync scheduler enabled with cron: ${DAILY_SYNC_CRON}`);
} else {
    console.log('Transaction sync scheduler is disabled via BANK_SYNC_ENABLED=false');
}