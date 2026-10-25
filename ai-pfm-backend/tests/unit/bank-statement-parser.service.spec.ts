import {
  inferCategory,
  parseBankStatement,
  parseDateFlexible,
  statementOccurrences,
} from '../../src/services/bank-statement-parser.service';

// The "Load Sample ComBank CSV" statement from the Connect Bank page
const sample = `Date,Description,Withdrawal (Debit),Deposit (Credit),Balance
01/10/2024,SALARY DEPOSIT - TECH CORP,,150000.00,150000.00
02/10/2024,KEELLS SUPER COLOMBO 03,4250.00,,145750.00
03/10/2024,DIALOG AXIATA BILL PAYMENT,2500.00,,143250.00
04/10/2024,UBER LANKA TRIP RIDE,1200.00,,142050.00
05/10/2024,LANKA IOC FUEL SHED,5000.00,,137050.00
06/10/2024,CEB ELECTRICITY BILL,3800.00,,133250.00
07/10/2024,DARAZ ONLINE PURCHASE,4990.00,,128260.00`;

describe('parseBankStatement', () => {
  it('reads every row of the sample statement, including the salary', () => {
    const { transactions, skippedRows } = parseBankStatement(sample, 'combank');
    expect(transactions).toHaveLength(7);
    expect(skippedRows).toHaveLength(0);
    expect(transactions[0]).toMatchObject({ type: 'income', amount: 150000, category: 'Salary' });
    expect(transactions.filter((t) => t.type === 'expense')).toHaveLength(6);
  });

  it('reads a Dr/Cr column as the direction, not as an amount column', () => {
    const csv = `Date,Description,Amount,Dr/Cr
01/10/2026,SALARY OCTOBER,200000,CR
02/10/2026,KEELLS SUPER,3500,DR
03/10/2026,PICKME RIDE,800,DR`;
    const { transactions } = parseBankStatement(csv);
    expect(transactions.map((t) => t.type)).toEqual(['income', 'expense', 'expense']);
    expect(transactions.map((t) => t.amount)).toEqual([200000, 3500, 800]);
  });

  it('skips and reports rows with invalid dates instead of saving a wrong date', () => {
    const csv = `Date,Description,Debit,Credit
32/13/2026,BAD DATE ROW,1000,
abc,TEXT DATE ROW,500,
05/10/2026,GOOD ROW,250,`;
    const { transactions, skippedRows } = parseBankStatement(csv);
    expect(transactions).toHaveLength(1);
    expect(transactions[0].description).toBe('GOOD ROW');
    expect(skippedRows).toEqual([
      { row: 1, reason: 'Invalid date "32/13/2026"' },
      { row: 2, reason: 'Invalid date "abc"' },
    ]);
  });
});

describe('parseDateFlexible', () => {
  it('accepts real dates in the common formats', () => {
    expect(parseDateFlexible('05/10/2026')).toEqual(new Date(Date.UTC(2026, 9, 5)));
    expect(parseDateFlexible('05-Oct-2026')).toEqual(new Date(Date.UTC(2026, 9, 5)));
    expect(parseDateFlexible('2026-10-05')).toEqual(new Date(Date.UTC(2026, 9, 5)));
  });

  it('rejects dates that do not exist', () => {
    expect(parseDateFlexible('32/13/2026')).toBeNull();
    expect(parseDateFlexible('30/02/2026')).toBeNull();
    expect(parseDateFlexible('abc')).toBeNull();
    expect(parseDateFlexible('')).toBeNull();
  });
});

describe('inferCategory', () => {
  it('uses the same category names as the app', () => {
    expect(inferCategory('KEELLS SUPER')).toBe('Food & Dining');
    expect(inferCategory('UBER LANKA TRIP')).toBe('Transport');
    expect(inferCategory('DIALOG BILL')).toBe('Bills & Utilities');
    expect(inferCategory('ATM WDL KANDY')).toBe('Other');
    expect(inferCategory('SALARY DEPOSIT', 'income')).toBe('Salary');
    expect(inferCategory('REMITTANCE FROM UK', 'income')).toBe('Other');
  });
});

describe('statementOccurrences', () => {
  it('numbers identical rows so two real same-day purchases are both kept', () => {
    const csv = `Date,Description,Debit,Credit
05/10/2026,JAVA LOUNGE COFFEE,850,
05/10/2026,JAVA LOUNGE COFFEE,850,
05/10/2026,KEELLS SUPER,850,`;
    const { transactions } = parseBankStatement(csv);
    expect(statementOccurrences(transactions)).toEqual([1, 2, 1]);
  });
});
