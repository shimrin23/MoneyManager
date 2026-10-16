import Transaction from "../schemas/transaction.schema";
import Subscription from "../schemas/subscription.schema";
import Loan from "../schemas/loan.schema";
import CreditCard from "../schemas/creditcard.schema";
import User from "../schemas/user.schema";

const HISTORY_MONTHS = 6;
const MIN_MONTHS_FOR_TREND = 3;
const FLAT_THRESHOLD_PCT = 5;

export type Confidence = "low" | "medium" | "high";
export type Trend = "up" | "down" | "flat";

export interface ForecastTransaction {
  amount: number;
  category: string;
  date: Date | string;
  type: "income" | "expense";
  isRecurring?: boolean;
  normalizedMerchant?: string;
  merchantName?: string;
}

export interface ForecastSubscription {
  name: string;
  provider: string;
  amount: number;
  frequency: "monthly" | "yearly";
  nextPayment: Date | string;
  category: string;
}

export interface ForecastLoan {
  provider: string;
  monthlyInstallment: number;
  endDate: Date | string;
  status: "Active" | "Closed" | "Overdue";
}

export interface ForecastCreditCard {
  cardName: string;
  provider: string;
  minPaymentDue: number;
}

export interface ForecastInput {
  transactions: ForecastTransaction[];
  subscriptions: ForecastSubscription[];
  loans: ForecastLoan[];
  creditCards: ForecastCreditCard[];
  monthlyIncomeFallback?: number;
  now: Date;
}

export interface Range {
  projected: number;
  low: number;
  high: number;
}

export interface CategoryForecast {
  category: string;
  projected: number;
  lastMonth: number;
  changePct: number | null;
  trend: Trend;
}

export interface NextMonthForecast {
  month: string;
  generatedAt: string;
  income: Range;
  expenses: Range & { fixed: number; variable: number };
  netSavings: Range;
  byCategory: CategoryForecast[];
  history: Array<{ month: string; income: number; expenses: number }>;
  confidence: Confidence;
  monthsOfData: number;
  notes: string[];
}

interface FixedItem {
  category: string;
  amount: number;
  /** Lower-cased names a recurring transaction may carry for this item. */
  matchers: string[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// Months are bucketed in UTC, like the rest of the backend.
const monthIndex = (d: Date) => d.getUTCFullYear() * 12 + d.getUTCMonth();

const monthKey = (idx: number) => {
  const year = Math.floor(idx / 12);
  const month = (idx % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
};

const toDate = (d: Date | string) => (d instanceof Date ? d : new Date(d));

const mean = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;

const sampleStdDev = (values: number[]) => {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

/**
 * Projects the next value of a monthly series (oldest first).
 * With fewer than 3 points it returns the plain average; otherwise it blends a
 * recency-weighted average with a linear trend. Never negative.
 */
export function projectSeries(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;
  if (n < MIN_MONTHS_FOR_TREND) return Math.max(0, mean(values));

  let weightSum = 0;
  let weighted = 0;
  values.forEach((v, i) => {
    weightSum += i + 1;
    weighted += v * (i + 1);
  });
  const wma = weighted / weightSum;

  // Least-squares line through (i, value), evaluated at i = n.
  const xMean = (n - 1) / 2;
  const yMean = mean(values);
  let num = 0;
  let den = 0;
  values.forEach((v, i) => {
    num += (i - xMean) * (v - yMean);
    den += (i - xMean) ** 2;
  });
  const slope = den === 0 ? 0 : num / den;
  const trend = yMean + slope * (n - xMean);
  const boundedTrend = Math.min(Math.max(trend, 0), 2 * Math.max(...values));

  return Math.max(0, 0.6 * wma + 0.4 * boundedTrend);
}

/** ±1 standard deviation band around a projection, plus a confidence label. */
export function confidenceBand(
  values: number[],
  projected: number,
): Range & { confidence: Confidence } {
  const sd = sampleStdDev(values);
  const m = mean(values);
  const cv = m > 0 ? sd / m : Infinity;

  let confidence: Confidence = "low";
  if (values.length >= MIN_MONTHS_FOR_TREND) {
    if (values.length >= 5 && cv < 0.15) confidence = "high";
    else if (cv < 0.35) confidence = "medium";
  }

  return {
    projected,
    low: Math.max(0, projected - sd),
    high: projected + sd,
    confidence,
  };
}

const lowerTrim = (s?: string) => (s ? s.trim().toLowerCase() : "");

function buildFixedItems(
  input: ForecastInput,
  targetIdx: number,
): FixedItem[] {
  const items: FixedItem[] = [];

  for (const sub of input.subscriptions) {
    const due = monthIndex(toDate(sub.nextPayment)) === targetIdx;
    if (sub.frequency === "yearly" && !due) continue;
    items.push({
      category: sub.category || "Subscriptions",
      amount: sub.amount,
      matchers: [lowerTrim(sub.name), lowerTrim(sub.provider)],
    });
  }

  for (const loan of input.loans) {
    if (loan.status === "Closed") continue;
    if (monthIndex(toDate(loan.endDate)) < targetIdx) continue;
    items.push({
      category: "Loans",
      amount: loan.monthlyInstallment,
      matchers: [lowerTrim(loan.provider)],
    });
  }

  for (const card of input.creditCards) {
    if (!(card.minPaymentDue > 0)) continue;
    items.push({
      category: "Credit Cards",
      amount: card.minPaymentDue,
      matchers: [lowerTrim(card.cardName), lowerTrim(card.provider)],
    });
  }

  return items.filter((i) => Number.isFinite(i.amount) && i.amount > 0);
}

/**
 * True when an expense is already represented by a known commitment
 * (subscription, loan installment, card minimum), so counting both would
 * double count it.
 */
function isCoveredByFixed(
  t: ForecastTransaction,
  matchers: string[],
  coveredCategories: Set<string>,
): boolean {
  if (coveredCategories.has(lowerTrim(t.category))) return true;
  if (!t.isRecurring) return false;
  const names = [lowerTrim(t.normalizedMerchant), lowerTrim(t.merchantName)];
  return names.some(
    (n) => n && matchers.some((m) => m && (n.includes(m) || m.includes(n))),
  );
}

function trendOf(changePct: number | null): Trend {
  if (changePct === null || Math.abs(changePct) < FLAT_THRESHOLD_PCT) {
    return "flat";
  }
  return changePct > 0 ? "up" : "down";
}

/** Pure forecast builder: no I/O, deterministic for a given input and `now`. */
export function buildForecast(input: ForecastInput): NextMonthForecast {
  const { now } = input;
  const currentIdx = monthIndex(now);
  const targetIdx = currentIdx + 1;
  const windowStart = currentIdx - HISTORY_MONTHS;
  const notes: string[] = [];

  // Only complete months inside the window; the current month is partial.
  const txns = input.transactions
    .map((t) => ({ ...t, idx: monthIndex(toDate(t.date)), amt: Math.abs(t.amount) }))
    .filter(
      (t) =>
        Number.isFinite(t.amt) && t.idx >= windowStart && t.idx < currentIdx,
    );

  const fixedItems = buildFixedItems(input, targetIdx);
  const fixedTotal = fixedItems.reduce((s, i) => s + i.amount, 0);
  const matchers = fixedItems.flatMap((i) => i.matchers);

  const coveredCategories = new Set<string>();
  if (input.loans.length > 0 || input.creditCards.length > 0) {
    coveredCategories.add("loan");
    coveredCategories.add("loans");
    coveredCategories.add("debt");
  }
  if (input.subscriptions.length > 0) {
    coveredCategories.add("subscription");
    coveredCategories.add("subscriptions");
  }

  // Span runs from the first month with data to the last complete month.
  const monthsOfData =
    txns.length === 0 ? 0 : currentIdx - Math.min(...txns.map((t) => t.idx));
  const firstIdx = currentIdx - monthsOfData;
  const span = Array.from({ length: monthsOfData }, (_, i) => firstIdx + i);
  const slot = (idx: number) => idx - firstIdx;
  const zeros = () => span.map(() => 0);

  const incomeSeries = zeros();
  const totalExpenseSeries = zeros();
  const variableSeries = zeros();
  const categoryAll = new Map<string, { name: string; series: number[] }>();
  const categoryVariable = new Map<string, number[]>();

  for (const t of txns) {
    const s = slot(t.idx);
    if (t.type === "income") {
      incomeSeries[s] += t.amt;
      continue;
    }
    const name = t.category?.trim() || "Uncategorized";
    const key = name.toLowerCase();
    if (!categoryAll.has(key)) categoryAll.set(key, { name, series: zeros() });
    categoryAll.get(key)!.series[s] += t.amt;
    totalExpenseSeries[s] += t.amt;

    if (!isCoveredByFixed(t, matchers, coveredCategories)) {
      variableSeries[s] += t.amt;
      if (!categoryVariable.has(key)) categoryVariable.set(key, zeros());
      categoryVariable.get(key)![s] += t.amt;
    }
  }

  // Income
  const hasIncomeHistory = incomeSeries.some((v) => v > 0);
  let income: Range;
  let incomeConfidence: Confidence;
  if (hasIncomeHistory) {
    const projected = projectSeries(incomeSeries);
    const band = confidenceBand(incomeSeries, projected);
    income = { projected: band.projected, low: band.low, high: band.high };
    incomeConfidence = band.confidence;
  } else {
    const fallback = input.monthlyIncomeFallback ?? 0;
    income = { projected: fallback, low: fallback, high: fallback };
    incomeConfidence = "low";
    if (fallback > 0) {
      notes.push(
        "No income transactions found; using your profile's monthly income.",
      );
    }
  }

  // Expenses: variable spending from history plus known commitments.
  const variableProjected = [...categoryVariable.values()].reduce(
    (s, series) => s + projectSeries(series),
    0,
  );
  const variableBand = confidenceBand(variableSeries, variableProjected);
  const expenses = {
    projected: variableProjected + fixedTotal,
    low: variableBand.low + fixedTotal,
    high: variableBand.high + fixedTotal,
    fixed: fixedTotal,
    variable: variableProjected,
  };

  // Categories: variable projection plus fixed commitments for that category.
  const fixedByCategory = new Map<string, { name: string; amount: number }>();
  for (const item of fixedItems) {
    const key = item.category.trim().toLowerCase();
    const entry = fixedByCategory.get(key) ?? { name: item.category, amount: 0 };
    entry.amount += item.amount;
    fixedByCategory.set(key, entry);
  }

  const categoryKeys = new Set([...categoryAll.keys(), ...fixedByCategory.keys()]);
  const byCategory: CategoryForecast[] = [...categoryKeys]
    .map((key) => {
      const all = categoryAll.get(key);
      const varSeries = categoryVariable.get(key);
      const fixed = fixedByCategory.get(key);
      const projected =
        (varSeries ? projectSeries(varSeries) : 0) + (fixed?.amount ?? 0);
      const lastMonth = all ? all.series[all.series.length - 1] : 0;
      const changePct =
        lastMonth > 0 ? ((projected - lastMonth) / lastMonth) * 100 : null;
      return {
        category: all?.name ?? fixed!.name,
        projected: round2(projected),
        lastMonth: round2(lastMonth),
        changePct: changePct === null ? null : round2(changePct),
        trend: trendOf(changePct),
      };
    })
    .sort((a, b) => b.projected - a.projected);

  // Overall confidence is the weaker of income and spending confidence.
  const order: Confidence[] = ["low", "medium", "high"];
  const confidence =
    order[Math.min(order.indexOf(incomeConfidence), order.indexOf(variableBand.confidence))];

  if (monthsOfData === 0) {
    notes.push(
      "No transaction history yet. Add or sync transactions to enable forecasting.",
    );
  } else if (monthsOfData < MIN_MONTHS_FOR_TREND) {
    notes.push(
      `Only ${monthsOfData} month(s) of history; the forecast uses a simple average.`,
    );
  }
  if (fixedItems.length > 0) {
    notes.push(
      "Subscriptions, loan installments and card minimums are counted once as fixed costs.",
    );
  }

  const net: Range = {
    projected: income.projected - expenses.projected,
    low: income.low - expenses.high,
    high: income.high - expenses.low,
  };

  const r = (x: Range): Range => ({
    projected: round2(x.projected),
    low: round2(x.low),
    high: round2(x.high),
  });

  return {
    month: monthKey(targetIdx),
    generatedAt: now.toISOString(),
    income: r(income),
    expenses: {
      ...r(expenses),
      fixed: round2(expenses.fixed),
      variable: round2(expenses.variable),
    },
    netSavings: r(net),
    byCategory,
    history: span.map((idx) => ({
      month: monthKey(idx),
      income: round2(incomeSeries[slot(idx)]),
      expenses: round2(totalExpenseSeries[slot(idx)]),
    })),
    confidence,
    monthsOfData,
    notes,
  };
}

export class ForecastService {
  async getNextMonthForecast(
    userId: string,
    now: Date = new Date(),
  ): Promise<NextMonthForecast> {
    const windowStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - HISTORY_MONTHS, 1),
    );

    const [transactions, subscriptions, loans, creditCards, user] =
      await Promise.all([
        Transaction.find({ userId, date: { $gte: windowStart } }).lean(),
        Subscription.find({ userId, isActive: true }).lean(),
        Loan.find({ userId, status: { $ne: "Closed" } }).lean(),
        CreditCard.find({ userId }).lean(),
        User.findById(userId).select("monthlyIncome").lean(),
      ]);

    return buildForecast({
      transactions,
      subscriptions,
      loans,
      creditCards,
      monthlyIncomeFallback: user?.monthlyIncome,
      now,
    });
  }
}
