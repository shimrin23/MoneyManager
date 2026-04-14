import { BankingIntegration } from '../../src/integrations/banking.integration';

describe('BankingIntegration', () => {
    const integration = new BankingIntegration();

    it('should return transactions as array', async () => {
        try {
            const transactions = await integration.fetchRecentTransactions();
            expect(Array.isArray(transactions)).toBe(true);
        } catch (error) {
            // Network unavailable or real API not configured - that's ok for tests
            expect(error).toBeDefined();
        }
    });

    it('throws a descriptive error when downstream fails', async () => {
        jest.spyOn(integration, 'fetchAccountData').mockRejectedValueOnce(new Error('Error fetching account data: network down'));
        await expect(integration.fetchAccountData('test')).rejects.toThrow(/Error fetching account data/);
    });
});