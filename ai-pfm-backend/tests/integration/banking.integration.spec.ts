import { BankingIntegration } from '../../src/integrations/banking.integration';

describe('BankingIntegration', () => {
    const integration = new BankingIntegration();

    it('returns mock recent transactions', async () => {
        const transactions = await integration.fetchRecentTransactions();
        expect(Array.isArray(transactions)).toBe(true);
        expect(transactions.length).toBeGreaterThan(0);
        expect(transactions[0]).toHaveProperty('amount');
        expect(transactions[0]).toHaveProperty('description');
    });

    it('throws a descriptive error when downstream fails', async () => {
        jest.spyOn(integration, 'fetchAccountData').mockRejectedValueOnce(new Error('Error fetching account data: network down'));
        await expect(integration.fetchAccountData('test')).rejects.toThrow(/Error fetching account data/);
    });
});