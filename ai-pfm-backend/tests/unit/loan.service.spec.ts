import LoanService from '../../src/services/loan.service';

const emi = (principal: number, rate: number, tenure: number) =>
  LoanService.calculateEMI({ principal, annualInterestRate: rate, tenureMonths: tenure }).monthlyEMI;

const loan = (id: string, principal: number, rate: number, tenure: number) => ({
  _id: id, type: 'Personal', provider: `Bank ${id}`, principal, interestRate: rate, tenure,
  monthlyInstallment: emi(principal, rate, tenure), status: 'Active', paymentSchedule: [],
}) as any;

describe('LoanService', () => {
  it('calculates EMI with the standard formula', () => {
    expect(LoanService.calculateEMI({ principal: 500000, annualInterestRate: 12, tenureMonths: 24 }))
      .toEqual({ monthlyEMI: 23536.74, totalInterest: 64881.67, totalPayable: 564881.67 });
  });

  it('handles 0% interest', () => {
    expect(emi(120000, 0, 12)).toBe(10000);
  });

  it('lump sum payment saves interest and time (never a negative saving)', () => {
    const result = LoanService.simulateLumpSumPayment(500000, 12, emi(500000, 12, 24), 100000, 6, 24);
    expect(result.savings.interestSaved).toBeCloseTo(17254.82, 2);
    expect(result.savings.timeSaved).toBe(4);
    expect(result.totalPayable).toBeCloseTo(500000 + result.totalInterest, 2);
  });

  it('a lump sum larger than the balance only clears what is owed', () => {
    const result = LoanService.simulateLumpSumPayment(500000, 12, emi(500000, 12, 24), 900000, 1, 24);
    expect(result.timeToPayoff).toBe(1);
    expect(result.totalPayable).toBeCloseTo(505000, 2); // principal + one month of interest
  });

  it('debt strategies save interest by rolling freed EMIs to the next loan', () => {
    const loans = [loan('A', 500000, 12, 24), loan('B', 1000000, 15, 60), loan('C', 200000, 24, 12)];
    const snowball = LoanService.calculateSnowballStrategy(loans);
    const avalanche = LoanService.calculateAvalancheStrategy(loans);

    expect(snowball.schedule.map(s => s.loanId)).toEqual(['C', 'A', 'B']); // smallest balance first
    expect(avalanche.schedule.map(s => s.loanId)).toEqual(['C', 'B', 'A']); // highest rate first
    expect(snowball.totalInterestSaved).toBeGreaterThan(0);
    expect(avalanche.totalInterestSaved).toBeGreaterThan(snowball.totalInterestSaved);
  });

  it('a single loan has nothing to roll over', () => {
    const result = LoanService.calculateAvalancheStrategy([loan('A', 500000, 12, 24)]);
    expect(result.totalInterestSaved).toBeCloseTo(0, 2);
    expect(result.timeToPayoff).toBe(24);
  });

  it('skips the EMI-to-income alert when income is unknown', async () => {
    const alerts = await LoanService.generateLoanAlerts(
      { ...loan('A', 500000, 12, 24), nextDueDate: new Date(Date.now() + 30 * 864e5) },
      0,
    );
    expect(alerts.find(a => a.type === 'high-emi-ratio')).toBeUndefined();
  });
});
