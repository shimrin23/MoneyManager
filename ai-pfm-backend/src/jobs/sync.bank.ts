import { schedule } from 'node-cron';
import { randomUUID } from 'crypto';
import { BankingIntegration } from '../integrations/banking.integration';
import { TransactionRepository } from '../repositories/transaction.repository';
import { enrichmentService } from '../services/enrichment.service';

const bankingIntegration = new BankingIntegration();
const transactionRepository = new TransactionRepository();
const BATCH_SIZE = 50;
const MAX_RETRIES = 3;

async function fetchWithRetry(accountId: string, attempt = 1): Promise<any[]> {
    try {
        return await bankingIntegration.fetchRecentTransactions();
    } catch (error) {
        if (attempt >= MAX_RETRIES) {
            throw error;
        }
        console.warn(`Fetch attempt ${attempt} failed. Retrying...`);
        return fetchWithRetry(accountId, attempt + 1);
    }
}

async function persistTransactions(transactions: any[]) {
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
        const batch = transactions.slice(i, i + BATCH_SIZE);
        batch.forEach((tx, idx) => {
            const enriched = enrichmentService.enrich(tx);
            transactionRepository.create({
                id: tx.id || randomUUID(),
                ...enriched,
                syncedAt: new Date().toISOString(),
                batchId: `${Date.now()}-${i + idx}`,
            });
        });
    }
}

schedule('0 0 * * *', async () => {
    console.log(' Running scheduled daily bank sync...');
    try {
        const bankData = await fetchWithRetry('SOME_ACCOUNT_ID');
        await persistTransactions(bankData);
        console.log(`Scheduled sync persisted ${bankData.length} transactions.`);
    } catch (error) {
        console.error(' Scheduled sync failed:', error);
    }
});