import { advanceNextPayment, validateSubscriptionInput } from '../../src/services/subscriptions.service';

const valid = { name: 'Netflix Premium', provider: 'Netflix', amount: 2500, frequency: 'monthly', category: 'Entertainment', nextPayment: '2026-11-01' };

describe('validateSubscriptionInput', () => {
  it('accepts a complete subscription and ignores fields users may not set', () => {
    const result = validateSubscriptionInput({ ...valid, userId: 'someone-else' });
    expect('data' in result && result.data).toMatchObject({ name: 'Netflix Premium', amount: 2500 });
    expect('data' in result && 'userId' in result.data).toBe(false);
  });

  it('rejects a negative or zero amount and a missing category', () => {
    expect(validateSubscriptionInput({ ...valid, amount: -500 })).toEqual({ error: 'Amount must be greater than 0' });
    expect(validateSubscriptionInput({ ...valid, amount: 0 })).toEqual({ error: 'Amount must be greater than 0' });
    expect(validateSubscriptionInput({ ...valid, category: '' })).toEqual({ error: 'Category is required' });
    expect(validateSubscriptionInput({ ...valid, frequency: 'weekly' })).toEqual({ error: 'Frequency must be monthly or yearly' });
  });

  it('allows partial edits such as restoring a subscription', () => {
    expect(validateSubscriptionInput({ isActive: true, isZombie: false }, true)).toEqual({ data: { isActive: true, isZombie: false } });
  });
});

describe('advanceNextPayment', () => {
  it('moves monthly by 1 month and yearly by 1 year', () => {
    expect(advanceNextPayment(new Date(2026, 9, 25), 'monthly')).toEqual(new Date(2026, 10, 25));
    expect(advanceNextPayment(new Date(2026, 9, 25), 'yearly')).toEqual(new Date(2027, 9, 25));
  });
});
