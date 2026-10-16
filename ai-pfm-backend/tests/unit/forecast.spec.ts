import {
  buildForecast,
  confidenceBand,
  projectSeries,
  ForecastInput,
  ForecastTransaction,
} from "../../src/services/forecast.service";

const NOW = new Date("2026-10-16T12:00:00.000Z");

const tx = (
  month: string, // "2026-07"
  type: "income" | "expense",
  amount: number,
  category = type === "income" ? "Salary" : "Food",
  extra: Partial<ForecastTransaction> = {},
): ForecastTransaction => ({
  amount,
  type,
  category,
  date: new Date(`${month}-10T12:00:00.000Z`),
  ...extra,
});

const input = (overrides: Partial<ForecastInput> = {}): ForecastInput => ({
  transactions: [],
  subscriptions: [],
  loans: [],
  creditCards: [],
  now: NOW,
  ...overrides,
});

const STEADY_MONTHS = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];

describe("projectSeries", () => {
  it("projects a stable series to about the same value", () => {
    expect(projectSeries([100, 100, 100, 100])).toBeCloseTo(100, 5);
  });

  it("projects a rising series above its average", () => {
    const values = [100, 120, 140, 160, 180];
    expect(projectSeries(values)).toBeGreaterThan(160);
  });

  it("uses the plain average with fewer than 3 months", () => {
    expect(projectSeries([100, 200])).toBe(150);
    expect(projectSeries([80])).toBe(80);
  });

  it("returns 0 for an empty series and never goes negative", () => {
    expect(projectSeries([])).toBe(0);
    expect(projectSeries([300, 200, 100, 0])).toBeGreaterThanOrEqual(0);
  });
});

describe("confidenceBand", () => {
  it("rates short history as low confidence", () => {
    expect(confidenceBand([100, 100], 100).confidence).toBe("low");
  });

  it("rates long, steady history as high confidence with a zero-width band", () => {
    const band = confidenceBand([100, 100, 100, 100, 100, 100], 100);
    expect(band.confidence).toBe("high");
    expect(band.low).toBe(100);
    expect(band.high).toBe(100);
  });

  it("keeps the lower bound non-negative", () => {
    expect(confidenceBand([0, 500, 0, 500], 50).low).toBe(0);
  });
});

describe("buildForecast", () => {
  it("targets the month after `now`", () => {
    expect(buildForecast(input()).month).toBe("2026-11");
    expect(
      buildForecast(input({ now: new Date("2026-12-31T23:00:00.000Z") })).month,
    ).toBe("2027-01");
  });

  it("forecasts steady income and spending", () => {
    const transactions = STEADY_MONTHS.flatMap((m) => [
      tx(m, "income", 5000),
      tx(m, "expense", 3000, "Housing"),
      tx(m, "expense", 500, "Food"),
    ]);
    const f = buildForecast(input({ transactions }));

    expect(f.monthsOfData).toBe(6);
    expect(f.income.projected).toBeCloseTo(5000, 1);
    expect(f.expenses.projected).toBeCloseTo(3500, 1);
    expect(f.netSavings.projected).toBeCloseTo(1500, 1);
    expect(f.confidence).toBe("high");
    expect(f.history).toHaveLength(6);
    expect(f.byCategory.map((c) => c.category)).toEqual(["Housing", "Food"]);
    expect(f.byCategory[0].trend).toBe("flat");
  });

  it("ignores the current partial month", () => {
    const f = buildForecast(
      input({
        transactions: [
          tx("2026-09", "expense", 100),
          tx("2026-10", "expense", 99999),
        ],
      }),
    );
    expect(f.monthsOfData).toBe(1);
    expect(f.expenses.projected).toBe(100);
  });

  it("returns an empty forecast with a note and income fallback when there is no history", () => {
    const f = buildForecast(input({ monthlyIncomeFallback: 4000 }));
    expect(f.monthsOfData).toBe(0);
    expect(f.income.projected).toBe(4000);
    expect(f.expenses.projected).toBe(0);
    expect(f.byCategory).toEqual([]);
    expect(f.confidence).toBe("low");
    expect(f.notes.join(" ")).toMatch(/No transaction history/);
  });

  it("falls back to profile income when there are only expenses", () => {
    const f = buildForecast(
      input({
        transactions: [tx("2026-09", "expense", 100)],
        monthlyIncomeFallback: 2500,
      }),
    );
    expect(f.income.projected).toBe(2500);
    expect(f.notes.join(" ")).toMatch(/profile/);
  });

  it("treats stored amounts by magnitude, using type for direction", () => {
    const f = buildForecast(
      input({ transactions: [tx("2026-09", "expense", -250)] }),
    );
    expect(f.expenses.projected).toBe(250);
  });

  it("does not double count subscriptions already in the history", () => {
    const transactions = STEADY_MONTHS.map((m) =>
      tx(m, "expense", 15, "Entertainment", {
        isRecurring: true,
        normalizedMerchant: "Netflix",
      }),
    );
    const f = buildForecast(
      input({
        transactions,
        subscriptions: [
          {
            name: "Netflix",
            provider: "Netflix",
            amount: 15,
            frequency: "monthly",
            nextPayment: new Date("2026-11-05T00:00:00.000Z"),
            category: "Entertainment",
          },
        ],
      }),
    );
    expect(f.expenses.fixed).toBe(15);
    expect(f.expenses.variable).toBe(0);
    expect(f.expenses.projected).toBe(15);
    expect(f.byCategory[0]).toMatchObject({ category: "Entertainment", projected: 15, lastMonth: 15 });
  });

  it("replaces loan and card payments in history with the known amounts", () => {
    const transactions = STEADY_MONTHS.flatMap((m) => [
      tx(m, "income", 5000),
      tx(m, "expense", 400, "Loan"),
      tx(m, "expense", 100, "Food"),
    ]);
    const f = buildForecast(
      input({
        transactions,
        loans: [
          {
            provider: "Bank A",
            monthlyInstallment: 420,
            endDate: new Date("2028-01-01T00:00:00.000Z"),
            status: "Active",
          },
        ],
        creditCards: [{ cardName: "Visa", provider: "Bank B", minPaymentDue: 50 }],
      }),
    );
    expect(f.expenses.fixed).toBe(470);
    expect(f.expenses.variable).toBeCloseTo(100, 1);
    expect(f.expenses.projected).toBeCloseTo(570, 1);
  });

  it("skips closed or already-ended loans", () => {
    const f = buildForecast(
      input({
        loans: [
          {
            provider: "Old",
            monthlyInstallment: 300,
            endDate: new Date("2026-10-31T00:00:00.000Z"),
            status: "Active",
          },
          {
            provider: "Done",
            monthlyInstallment: 200,
            endDate: new Date("2030-01-01T00:00:00.000Z"),
            status: "Closed",
          },
        ],
      }),
    );
    expect(f.expenses.fixed).toBe(0);
  });

  it("counts yearly subscriptions only in their due month", () => {
    const yearly = (nextPayment: string) => ({
      name: "Antivirus",
      provider: "Sec Co",
      amount: 120,
      frequency: "yearly" as const,
      nextPayment: new Date(nextPayment),
      category: "Software",
    });
    expect(
      buildForecast(input({ subscriptions: [yearly("2026-11-20T00:00:00.000Z")] }))
        .expenses.fixed,
    ).toBe(120);
    expect(
      buildForecast(input({ subscriptions: [yearly("2027-03-20T00:00:00.000Z")] }))
        .expenses.fixed,
    ).toBe(0);
  });

  it("compares each category's projection with last month and keeps a consistent band", () => {
    const f = buildForecast(
      input({
        transactions: [
          tx("2026-06", "expense", 100, "Dining"),
          tx("2026-07", "expense", 200, "Dining"),
          tx("2026-08", "expense", 300, "Dining"),
          tx("2026-09", "expense", 250, "Dining"),
        ],
      }),
    );
    const dining = f.byCategory.find((c) => c.category === "Dining")!;
    expect(dining.lastMonth).toBe(250);
    expect(dining.projected).toBeGreaterThan(250);
    expect(dining.changePct).toBeGreaterThan(5);
    expect(dining.trend).toBe("up");
    expect(f.netSavings.low).toBeLessThanOrEqual(f.netSavings.projected);
    expect(f.netSavings.high).toBeGreaterThanOrEqual(f.netSavings.projected);
  });

  it("is deterministic", () => {
    const transactions = STEADY_MONTHS.flatMap((m, i) => [
      tx(m, "income", 5000 + i * 100),
      tx(m, "expense", 2000 + i * 50),
    ]);
    expect(buildForecast(input({ transactions }))).toEqual(
      buildForecast(input({ transactions })),
    );
  });
});
