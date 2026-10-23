import { detectAnomalies, AnomalyInputTransaction } from '../../src/services/anomaly-detection.service';

const expense = (id: string, amount: number, category: string, description: string, date = '2026-10-20', extra: Partial<AnomalyInputTransaction> = {}): AnomalyInputTransaction => ({
  _id: id, amount, category, description, date, type: 'expense', ...extra,
});

describe('detectAnomalies', () => {
  it('returns no alerts for an empty list', () => {
    expect(detectAnomalies([])).toEqual([]);
  });

  it('flags the second copy of a same-day duplicate, not the first', () => {
    const alerts = detectAnomalies([
      expense('a', 1500, 'Food & Dining', 'Lunch', '2026-10-20', { createdAt: '2026-10-20T10:00:00Z' }),
      expense('b', 1500, 'Food & Dining', 'Lunch', '2026-10-20', { createdAt: '2026-10-20T10:05:00Z' }),
    ]);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].transactionId).toBe('b');
    expect(alerts[0].type).toBe('duplicate');
  });

  it('does not flag the same amount on different days', () => {
    const alerts = detectAnomalies([
      expense('a', 1500, 'Food & Dining', 'Lunch', '2026-10-19'),
      expense('b', 1500, 'Food & Dining', 'Lunch', '2026-10-20'),
    ]);
    expect(alerts).toHaveLength(0);
  });

  it('flags a large spike against the overall median when the category has little history', () => {
    const alerts = detectAnomalies([
      expense('1', 1500, 'Food & Dining', 'Lunch'),
      expense('2', 3000, 'Transport', 'Uber'),
      expense('3', 8000, 'Bills & Utilities', 'Electricity'),
      expense('4', 2500, 'Entertainment', 'Netflix'),
      expense('5', 99.5, 'Shopping', 'Pen'),
      expense('laptop', 250000, 'Shopping', 'Laptop'),
    ]);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].transactionId).toBe('laptop');
    expect(alerts[0].type).toBe('spike');
    expect(alerts[0].riskScore).toBeGreaterThanOrEqual(85);
    expect(alerts[0].riskScore).toBeLessThanOrEqual(100);
  });

  it('flags a spike within a category using the z-score', () => {
    const alerts = detectAnomalies([
      expense('1', 1000, 'Food & Dining', 'Lunch 1', '2026-10-01'),
      expense('2', 1200, 'Food & Dining', 'Lunch 2', '2026-10-02'),
      expense('3', 900, 'Food & Dining', 'Lunch 3', '2026-10-03'),
      expense('4', 1100, 'Food & Dining', 'Lunch 4', '2026-10-04'),
      expense('big', 9000, 'Food & Dining', 'Wedding dinner', '2026-10-05'),
    ]);

    expect(alerts.map(a => a.transactionId)).toEqual(['big']);
  });

  it('ignores income and normal spending', () => {
    const alerts = detectAnomalies([
      { _id: 'salary', amount: 100000, category: 'Salary', date: '2026-10-01', type: 'income' },
      expense('1', 1500, 'Food & Dining', 'Lunch'),
      expense('2', 1800, 'Transport', 'Uber'),
      expense('3', 2000, 'Shopping', 'Shirt'),
      expense('4', 1200, 'Food & Dining', 'Dinner'),
      expense('5', 2500, 'Entertainment', 'Movie'),
    ]);
    expect(alerts).toHaveLength(0);
  });

  it('keeps the saved review status and includes bank-flagged transactions', () => {
    const alerts = detectAnomalies([
      expense('x', 500, 'Shopping', 'Odd charge', '2026-10-20', { isAnomaly: true, anomalyScore: 0.9, anomalyStatus: 'reviewed-safe' }),
    ]);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].status).toBe('reviewed-safe');
    expect(alerts[0].riskScore).toBe(90);
  });
});
