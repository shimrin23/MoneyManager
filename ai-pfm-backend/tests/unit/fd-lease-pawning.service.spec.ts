import {
  addMonths,
  applyMaturity,
  calculateFD,
  installmentsDue,
  leaseProgress,
  pawnDaysRemaining,
  renewFD,
  validateFDInput,
  validateLeaseInput,
  validatePawnInput,
} from '../../src/services/fd-lease-pawning.service';

const fd = (overrides: Record<string, unknown> = {}) => ({
  principalAmount: 100000, interestRate: 12, tenure: 12, tenureUnit: 'months',
  startDate: new Date(2025, 9, 1), maturityDate: new Date(2026, 9, 1),
  maturityAmount: 112000, interestEarned: 12000, status: 'active', autoRenewal: false,
  ...overrides,
}) as any;

const lease = {
  assetName: 'Toyota Aqua', lessor: 'LB Finance', assetType: 'vehicle',
  principalAmount: 1200000, monthlyPayment: 25000, interestRate: 14, tenureMonths: 60, startDate: '2026-01-15',
};

const pawn = {
  itemDescription: 'Gold chain', itemType: 'gold', pledgedValue: 200000, loanAmount: 150000, interestRate: 24,
  branch: 'Colombo 03', ticketNumber: 'PWN-1', pledgeDate: '2026-09-01', redemptionDate: '2026-12-01',
};

describe('addMonths', () => {
  it('does not overflow into the next month', () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
    expect(addMonths(new Date(2026, 9, 25), 12)).toEqual(new Date(2027, 9, 25));
  });
});

describe('Fixed deposits', () => {
  it('calculates simple interest and maturity date from the start date', () => {
    expect(calculateFD(100000, 12, 12, new Date(2026, 9, 25))).toEqual({
      interestEarned: 12000, maturityAmount: 112000, maturityDate: new Date(2027, 9, 25),
    });
  });

  it('rejects negative, zero and missing values with a clear message', () => {
    expect(validateFDInput({ principalAmount: -5000, interestRate: 10, tenure: 12 })).toBe('Principal amount must be greater than 0');
    expect(validateFDInput({ principalAmount: 5000, interestRate: 0, tenure: 12 })).toBe('Interest rate must be greater than 0%');
    expect(validateFDInput({ principalAmount: 5000, interestRate: 10, tenure: 1.5 })).toMatch(/whole number/);
    expect(validateFDInput({ principalAmount: '', interestRate: 10, tenure: 12 })).toMatch(/required/);
    expect(validateFDInput({ principalAmount: 5000, interestRate: 10, tenure: 12 })).toBeNull();
  });

  it('accepts a past start date but not a future or invalid one', () => {
    const fd = { principalAmount: 5000, interestRate: 10, tenure: 1 };
    const past = new Date();
    past.setMonth(past.getMonth() - 2);
    const future = new Date();
    future.setDate(future.getDate() + 3);
    expect(validateFDInput({ ...fd, startDate: past.toISOString().split('T')[0] })).toBeNull();
    expect(validateFDInput({ ...fd, startDate: future.toISOString().split('T')[0] })).toBe('Start date cannot be in the future');
    expect(validateFDInput({ ...fd, startDate: 'abc' })).toBe('Start date is not a valid date');
    expect(validateFDInput({ ...fd, startDate: '2000-01-01' })).toBe('Start date cannot be more than 10 years ago');
  });

  it('an FD that started 2 months ago with a 1-month tenure is matured', () => {
    const start = new Date(2026, 7, 25);
    const terms = calculateFD(50000, 12, 1, start);
    expect(terms.maturityDate).toEqual(new Date(2026, 8, 25));
    expect(applyMaturity(fd({ ...terms, startDate: start, tenure: 1 }), new Date(2026, 9, 26))).toEqual({ status: 'matured' });
  });

  it('marks an FD matured once its maturity date has passed', () => {
    expect(applyMaturity(fd(), new Date(2026, 8, 30))).toBeNull();
    expect(applyMaturity(fd(), new Date(2026, 9, 2))).toEqual({ status: 'matured' });
  });

  it('rolls over with auto-renewal, reinvesting the maturity amount', () => {
    const result = applyMaturity(fd({ autoRenewal: true }), new Date(2026, 9, 25));
    expect(result).toMatchObject({
      status: 'active', principalAmount: 112000, maturityAmount: 125440,
      startDate: new Date(2026, 9, 1), maturityDate: new Date(2027, 9, 1),
    });
  });

  it('renewing starts a new term with a new maturity date', () => {
    const renewed = renewFD(fd({ status: 'matured' }), new Date(2026, 9, 25));
    expect(renewed.maturityDate).toEqual(new Date(2027, 9, 25));
    expect(renewed.principalAmount).toBe(112000);
    expect(renewed.status).toBe('active');
  });
});

describe('Leases', () => {
  it('validates the form', () => {
    expect(validateLeaseInput(lease)).toBeNull();
    expect(validateLeaseInput({ ...lease, principalAmount: -1 })).toMatch(/Principal/);
    expect(validateLeaseInput({ ...lease, monthlyPayment: 0 })).toMatch(/Monthly payment/);
    expect(validateLeaseInput({ ...lease, tenureMonths: 0 })).toMatch(/Tenure/);
    expect(validateLeaseInput({ ...lease, assetName: '  ' })).toMatch(/Asset name/);
    expect(validateLeaseInput({ ...lease, startDate: 'not a date' })).toMatch(/start date/);
  });

  it('counts installments already due when the lease is added', () => {
    expect(installmentsDue(new Date(2026, 0, 15), 60, new Date(2026, 9, 25))).toBe(9);
    expect(installmentsDue(new Date(2026, 11, 1), 60, new Date(2026, 9, 25))).toBe(0);
  });

  it('a future lease has its first payment one month after the start date', () => {
    const progress = leaseProgress(1200000, 60, new Date(2026, 11, 1), 0);
    expect(progress.nextPaymentDate).toEqual(new Date(2027, 0, 1));
    expect(progress.remainingMonths).toBe(60);
  });

  it('remaining months and outstanding drop with each payment and reach 0', () => {
    expect(leaseProgress(1200000, 60, new Date(2026, 0, 15), 10)).toMatchObject({
      remainingMonths: 50, outstandingBalance: 1000000, nextPaymentDate: new Date(2026, 11, 15),
    });
    expect(leaseProgress(1200000, 60, new Date(2026, 0, 15), 60)).toMatchObject({
      remainingMonths: 0, outstandingBalance: 0, nextPaymentDate: null,
    });
  });
});

describe('Pawning', () => {
  it('validates the form', () => {
    expect(validatePawnInput(pawn)).toBeNull();
    expect(validatePawnInput({ ...pawn, loanAmount: 250000 })).toBe('Loan amount cannot be more than the pledged value');
    expect(validatePawnInput({ ...pawn, pledgedValue: 0 })).toMatch(/Pledged value/);
    expect(validatePawnInput({ ...pawn, redemptionDate: '2026-08-01' })).toBe('Redemption date must be after the pledge date');
  });

  it('days remaining go negative once overdue', () => {
    expect(pawnDaysRemaining(new Date(2026, 9, 20), new Date(2026, 9, 25))).toBe(-5);
    expect(pawnDaysRemaining(new Date(2026, 10, 4), new Date(2026, 9, 25))).toBe(10);
  });
});
