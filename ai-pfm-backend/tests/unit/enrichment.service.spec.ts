import { EnhancedBankingIntegration } from '../../src/services/enhanced-banking.service';

describe('EnhancedBankingIntegration', () => {
  const svc = new EnhancedBankingIntegration();

  it('normalizes merchant names and maps MCC to category', () => {
    const txn = {
      mcc: '4121',
      merchantName: 'Uber Lanka - Ride',
      amount: -500,
      description: 'Taxi ride'
    };

    const res = svc.categorizeTransaction(txn as any);

    expect(res.normalizedMerchant).toBe('Uber');
    expect(res.category).toBe('Transport');
    expect(typeof res.confidence).toBe('number');
    expect(res.confidence).toBeGreaterThanOrEqual(0);
    expect(res.confidence).toBeLessThanOrEqual(1);
  });

  it('detects income transactions and assigns Income category', () => {
    const txn = {
      mcc: '9999',
      merchantName: 'Acme Corp',
      amount: 150000,
      description: 'Monthly SALARY payment'
    };

    const res = svc.categorizeTransaction(txn as any);
    expect(res.category).toBe('Income');
  });

  it('flags common subscriptions as recurring', () => {
    const txn = {
      mcc: '5814',
      merchantName: 'Netflix.com',
      amount: -1299,
      description: 'Monthly Netflix subscription'
    };

    const res = svc.categorizeTransaction(txn as any);
    expect(res.isRecurring).toBe(true);
    expect(res.recurringFrequency).toBe('monthly');
    expect(res.recurringDueDate).toBeDefined();
  });
});
