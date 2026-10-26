import { buildCategoryTips } from '../../src/services/budget-tips';

const base = {
  category: 'Food & Dining',
  allocated: 30000,
  spent: 18000,
  lastMonth: 15000,
  topPlaces: [{ name: 'Keells Super', amount: 8000, count: 4 }],
  daysLeft: 6,
};

describe('buildCategoryTips', () => {
  it('works out what is left per day and where the money went', () => {
    const tips = buildCategoryTips(base);
    expect(tips.percentageUsed).toBe(60);
    expect(tips.insights[0]).toBe('You have used 60% of your LKR 30,000 budget. LKR 12,000 is left for 6 days.');
    expect(tips.insights).toContain('You have already spent 20% more than all of last month (LKR 15,000).');
    expect(tips.insights).toContain('Most of it went to Keells Super: LKR 8,000 over 4 payments.');
    expect(tips.tips).toContain('Keep Food & Dining to about LKR 2,000 a day to stay within budget.');
    expect(tips.tips).toContain('Cutting Keells Super by a quarter would save about LKR 2,000 this month.');
  });

  it('adds tips for the category itself', () => {
    expect(buildCategoryTips(base).tips.some(t => t.includes('groceries once a week'))).toBe(true);
    expect(buildCategoryTips({ ...base, category: 'Transport' }).tips.some(t => t.includes('PickMe and Uber'))).toBe(true);
    expect(buildCategoryTips({ ...base, category: 'Pets' }).tips).toContain('Set a weekly limit for this category and check it every weekend.');
  });

  it('handles being over budget and having no budget', () => {
    expect(buildCategoryTips({ ...base, spent: 35000 }).insights[0]).toBe('You are LKR 5,000 over your Food & Dining budget of LKR 30,000.');
    expect(buildCategoryTips({ ...base, allocated: null }).percentageUsed).toBeNull();
  });
});
