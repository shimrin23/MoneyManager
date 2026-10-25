import {
  calculateFinancialMetrics,
  calculateHealthScore,
  getHealthStatus,
  percentileAmong,
} from '../../src/services/health-score.utils';
import { buildRecommendations, recommendationKeyOf } from '../../src/services/recommendation-rules';
import { buildFinancialContext } from '../../src/services/coach-context.service';

// Step 7 test data: everything dated this month (testing on 26 Oct 2026)
const now = new Date(2026, 9, 26, 12);
const day = (d: number, m = 9) => new Date(2026, m, d);
const stage1 = [
  { date: day(2), type: 'income', amount: 100000, category: 'Salary' },
  { date: day(3), type: 'expense', amount: 25000, category: 'Food & Dining' },
  { date: day(4), type: 'expense', amount: 20000, category: 'Shopping' },
  { date: day(5), type: 'expense', amount: 30000, category: 'Bills & Utilities' },
  { date: day(6), type: 'expense', amount: 10000, category: 'Transport' },
];
const card = { creditLimit: 100000, currentBalance: 80000 };
const goal = { title: 'Emergency Fund', targetAmount: 100000, currentAmount: 20000, status: 'In Progress' };

const score = (txs: any[], cards: any[] = [], goals: any[] = []) => {
  const { metrics } = calculateFinancialMetrics(txs, [], cards, 0, goals, now);
  return calculateHealthScore(metrics, goals);
};

describe('Financial health metrics and score', () => {
  it('Stage 1: savings 15%, discretionary 45%, score 75', () => {
    const { metrics, noDataReason } = calculateFinancialMetrics(stage1, [], [], 0, [], now);
    expect(noDataReason).toBeNull();
    expect(metrics.savingsRate).toBeCloseTo(0.15);
    expect(metrics.discretionaryRatio).toBeCloseTo(0.45);
    expect(score(stage1)).toBe(75);
  });

  it('Stage 2 (+card at 80%) scores 50, Stage 3 (+goal) scores 55', () => {
    expect(score(stage1, [card])).toBe(50);
    expect(score(stage1, [card], [goal])).toBe(55);
  });

  it('only counts the last 30 days, so a 5 September expense does not change the score', () => {
    const withOld = [...stage1, { date: day(5, 8), type: 'expense', amount: 30000, category: 'Shopping' }];
    expect(score(withOld, [card], [goal])).toBe(55);
  });

  it('emergency fund uses money saved in emergency goals, not this month\'s leftover', () => {
    const { metrics } = calculateFinancialMetrics(stage1, [], [], 0, [goal, { title: 'New Car', currentAmount: 500000 }], now);
    expect(metrics.emergencyFund).toBe(20000);
    expect(metrics.emergencyFundMonths).toBeCloseTo(20000 / 85000);
  });

  it('gives no score for an empty account or one without income', () => {
    expect(calculateFinancialMetrics([], [], [], 0, [], now).noDataReason).toBe('no-transactions');
    expect(calculateFinancialMetrics([], [], [], 50000, [], now).noDataReason).toBe('no-transactions');
    expect(calculateFinancialMetrics(stage1.slice(1), [], [], 0, [], now).noDataReason).toBe('no-income');
  });
});

describe('getHealthStatus', () => {
  it('uses one scale for every page', () => {
    expect(getHealthStatus(85)).toEqual({ status: 'Excellent', riskLevel: 'Low' });
    expect(getHealthStatus(75)).toEqual({ status: 'Good', riskLevel: 'Medium' });
    expect(getHealthStatus(50)).toEqual({ status: 'Needs Work', riskLevel: 'High' });
    expect(getHealthStatus(30)).toEqual({ status: 'Critical', riskLevel: 'Very High' });
  });
});

describe('percentileAmong', () => {
  it('is the share of peers the user beats, with lower-is-better metrics inverted', () => {
    expect(percentileAmong(70, [50, 60, 80, 90])).toBe(50);
    expect(percentileAmong(95, [50, 60, 80, 90])).toBe(100);
    expect(percentileAmong(0.2, [0.1, 0.5, 0.6, 0.9], false)).toBe(75);
  });
});

describe('buildRecommendations', () => {
  it('Stage 1 gives only the emergency fund recommendation; Stage 2 adds credit utilization', () => {
    const m1 = calculateFinancialMetrics(stage1, [], [], 0, [], now).metrics;
    expect(buildRecommendations(m1).map(r => r.key)).toEqual(['emergency-fund']);

    const m2 = calculateFinancialMetrics(stage1, [], [card], 0, [], now).metrics;
    expect(buildRecommendations(m2).map(r => r.key)).toEqual(['emergency-fund', 'credit-utilization']);
  });

  it('matches recommendations saved before keys existed by title', () => {
    expect(recommendationKeyOf({ title: 'Build Emergency Fund' })).toBe('emergency-fund');
    expect(recommendationKeyOf({ key: 'savings-rate', title: 'x' })).toBe('savings-rate');
  });
});

describe('buildFinancialContext', () => {
  it('gives the coach this month\'s spending per category', () => {
    const ctx = buildFinancialContext('u1', stage1, [goal], now);
    expect(ctx.monthlyIncome).toBe(100000);
    expect(ctx.monthlyExpenses).toBe(85000);
    expect(ctx.topSpendingCategories.find(c => c.name === 'Shopping')?.amount).toBe(20000);
    expect(ctx.financialGoals?.[0]).toMatchObject({ name: 'Emergency Fund', currentAmount: 20000 });
  });
});
