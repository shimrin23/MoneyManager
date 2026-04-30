type TransactionType = "income" | "expense";

export interface SimulatedBankFeedOptions {
  userId: string;
  accountId: string;
  accountName: string;
  currency: string;
  transactionCount: number;
  days: number;
  startDate: Date;
  endDate: Date;
  seed: string;
}

export interface SimulatedBankFeedTransaction {
  id: string;
  userId: string;
  accountId: string;
  sourceAccount: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  merchantName: string;
  normalizedMerchant: string;
  merchantId: string;
  mcc: string;
  type: TransactionType;
  isRecurring: boolean;
  recurringFrequency?: "weekly" | "monthly" | "quarterly";
  recurringDueDate?: string;
  categoryConfidence: number;
  processedAt: string;
  ingestionType: "batch";
  isAnomaly: boolean;
  anomalyScore: number;
}

export interface SimulatedBankFeedSummary {
  transactionCount: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  recurringTransactionCount: number;
  anomalyCount: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    transactionCount: number;
  }>;
}

export interface SimulatedBankFeed {
  source: "simulated-bank";
  generatedAt: string;
  userId: string;
  accountId: string;
  accountName: string;
  currency: string;
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: SimulatedBankFeedSummary;
  transactions: SimulatedBankFeedTransaction[];
}

type FeedTemplate = {
  category: string;
  merchantName: string;
  normalizedMerchant: string;
  description: string;
  mcc: string;
  minAmount: number;
  maxAmount: number;
  type: TransactionType;
  recurringFrequency?: "weekly" | "monthly" | "quarterly";
  recurringChance?: number;
  anomalyChance?: number;
};

const INCOME_TEMPLATE: FeedTemplate = {
  category: "Salary",
  merchantName: "Acme Payroll",
  normalizedMerchant: "Acme Payroll",
  description: "Monthly salary deposit",
  mcc: "6011",
  minAmount: 1200,
  maxAmount: 4200,
  type: "income",
  recurringFrequency: "monthly",
  recurringChance: 1,
  anomalyChance: 0,
};

const EXPENSE_TEMPLATES: FeedTemplate[] = [
  {
    category: "Housing",
    merchantName: "Cityline Rentals",
    normalizedMerchant: "Cityline Rentals",
    description: "Monthly rent payment",
    mcc: "6513",
    minAmount: 850,
    maxAmount: 2400,
    type: "expense",
    recurringFrequency: "monthly",
    recurringChance: 0.95,
    anomalyChance: 0.02,
  },
  {
    category: "Food",
    merchantName: "FreshMart Market",
    normalizedMerchant: "FreshMart Market",
    description: "Grocery store purchase",
    mcc: "5411",
    minAmount: 25,
    maxAmount: 180,
    type: "expense",
    recurringChance: 0.2,
    anomalyChance: 0.05,
  },
  {
    category: "Food",
    merchantName: "Table & Thyme",
    normalizedMerchant: "Table & Thyme",
    description: "Restaurant dining",
    mcc: "5812",
    minAmount: 18,
    maxAmount: 95,
    type: "expense",
    recurringChance: 0.05,
    anomalyChance: 0.04,
  },
  {
    category: "Transport",
    merchantName: "Metro Fuel",
    normalizedMerchant: "Metro Fuel",
    description: "Fuel purchase",
    mcc: "5542",
    minAmount: 20,
    maxAmount: 120,
    type: "expense",
    recurringChance: 0.12,
    anomalyChance: 0.04,
  },
  {
    category: "Transport",
    merchantName: "CityCab",
    normalizedMerchant: "CityCab",
    description: "Ride share payment",
    mcc: "4121",
    minAmount: 8,
    maxAmount: 45,
    type: "expense",
    recurringChance: 0.08,
    anomalyChance: 0.04,
  },
  {
    category: "Entertainment",
    merchantName: "StreamBox",
    normalizedMerchant: "StreamBox",
    description: "Streaming subscription",
    mcc: "5815",
    minAmount: 9,
    maxAmount: 24,
    type: "expense",
    recurringFrequency: "monthly",
    recurringChance: 0.92,
    anomalyChance: 0.01,
  },
  {
    category: "Utilities",
    merchantName: "North Grid Power",
    normalizedMerchant: "North Grid Power",
    description: "Electricity bill",
    mcc: "4900",
    minAmount: 55,
    maxAmount: 210,
    type: "expense",
    recurringFrequency: "monthly",
    recurringChance: 0.9,
    anomalyChance: 0.03,
  },
  {
    category: "Health",
    merchantName: "Wellness Club",
    normalizedMerchant: "Wellness Club",
    description: "Gym membership",
    mcc: "7997",
    minAmount: 15,
    maxAmount: 85,
    type: "expense",
    recurringFrequency: "monthly",
    recurringChance: 0.75,
    anomalyChance: 0.02,
  },
  {
    category: "Shopping",
    merchantName: "Nova Electronics",
    normalizedMerchant: "Nova Electronics",
    description: "Retail electronics purchase",
    mcc: "5732",
    minAmount: 40,
    maxAmount: 650,
    type: "expense",
    recurringChance: 0.03,
    anomalyChance: 0.18,
  },
];

export class SimulatedBankFeedService {
  generateFeed(
    options: Partial<SimulatedBankFeedOptions> = {},
  ): SimulatedBankFeed {
    const normalizedOptions = this.normalizeOptions(options);
    const rng = this.createRng(normalizedOptions.seed);
    const generatedAt = normalizedOptions.endDate.toISOString();

    const transactions = this.buildTransactions(
      normalizedOptions,
      rng,
      generatedAt,
    );
    const summary = this.buildSummary(transactions);

    return {
      source: "simulated-bank",
      generatedAt,
      userId: normalizedOptions.userId,
      accountId: normalizedOptions.accountId,
      accountName: normalizedOptions.accountName,
      currency: normalizedOptions.currency,
      period: {
        startDate: normalizedOptions.startDate.toISOString(),
        endDate: normalizedOptions.endDate.toISOString(),
        days: normalizedOptions.days,
      },
      summary,
      transactions,
    };
  }

  generateTransactions(
    options: Partial<SimulatedBankFeedOptions> = {},
  ): SimulatedBankFeedTransaction[] {
    return this.generateFeed(options).transactions;
  }

  private buildTransactions(
    options: SimulatedBankFeedOptions,
    rng: () => number,
    generatedAt: string,
  ): SimulatedBankFeedTransaction[] {
    const transactions: SimulatedBankFeedTransaction[] = [];
    const daysWindow = Math.max(1, options.days);
    const recurringTransactionCount = Math.max(
      2,
      Math.round(options.transactionCount * 0.25),
    );
    const incomeTransactionCount = Math.max(
      1,
      Math.round(options.transactionCount * 0.15),
    );

    for (let index = 0; index < options.transactionCount; index += 1) {
      const isIncome =
        index < incomeTransactionCount ||
        (index === 0 && options.transactionCount > 3);
      const template = isIncome
        ? INCOME_TEMPLATE
        : this.pickExpenseTemplate(rng);
      const transactionDate = this.buildTransactionDate(
        options.endDate,
        daysWindow,
        rng,
        index,
      );
      const isRecurring =
        template.type === "income" ||
        (template.recurringChance ? rng() < template.recurringChance : false) ||
        (index < recurringTransactionCount && template.type === "expense");
      const isAnomaly =
        !isIncome && template.anomalyChance
          ? rng() < template.anomalyChance
          : false;

      transactions.push({
        id: this.buildTransactionId(options, index, transactionDate),
        userId: options.userId,
        accountId: options.accountId,
        sourceAccount: options.accountName,
        amount: this.buildAmount(template, rng, isIncome),
        category: template.category,
        date: transactionDate.toISOString(),
        description: template.description,
        merchantName: template.merchantName,
        normalizedMerchant: template.normalizedMerchant,
        merchantId: this.buildMerchantId(template, index),
        mcc: template.mcc,
        type: template.type,
        isRecurring,
        recurringFrequency: isRecurring
          ? template.recurringFrequency || "monthly"
          : undefined,
        recurringDueDate: isRecurring
          ? this.buildRecurringDueDate(
              transactionDate,
              template.recurringFrequency || "monthly",
            ).toISOString()
          : undefined,
        categoryConfidence: isIncome
          ? 0.98
          : this.buildConfidence(template, isRecurring),
        processedAt: generatedAt,
        ingestionType: "batch",
        isAnomaly,
        anomalyScore: isAnomaly
          ? Number((0.72 + rng() * 0.26).toFixed(2))
          : Number((0.04 + rng() * 0.16).toFixed(2)),
      });
    }

    return transactions.sort((left, right) =>
      right.date.localeCompare(left.date),
    );
  }

  private buildSummary(
    transactions: SimulatedBankFeedTransaction[],
  ): SimulatedBankFeedSummary {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const categoryMap = new Map<
      string,
      { amount: number; transactionCount: number }
    >();

    for (const transaction of transactions) {
      if (transaction.type === "income") {
        continue;
      }

      const current = categoryMap.get(transaction.category) || {
        amount: 0,
        transactionCount: 0,
      };
      current.amount += transaction.amount;
      current.transactionCount += 1;
      categoryMap.set(transaction.category, current);
    }

    return {
      transactionCount: transactions.length,
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netCashFlow: Number((totalIncome - totalExpenses).toFixed(2)),
      recurringTransactionCount: transactions.filter(
        (transaction) => transaction.isRecurring,
      ).length,
      anomalyCount: transactions.filter((transaction) => transaction.isAnomaly)
        .length,
      categoryBreakdown: Array.from(categoryMap.entries())
        .map(([category, value]) => ({
          category,
          amount: Number(value.amount.toFixed(2)),
          transactionCount: value.transactionCount,
        }))
        .sort((left, right) => right.amount - left.amount),
    };
  }

  private normalizeOptions(
    options: Partial<SimulatedBankFeedOptions>,
  ): SimulatedBankFeedOptions {
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const days = Math.max(7, Number(options.days) || 30);
    const transactionCount = Math.max(
      3,
      Number(options.transactionCount) || 14,
    );
    const startDate = options.startDate
      ? new Date(options.startDate)
      : new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    const userId = options.userId || "simulated-user";
    const accountId =
      options.accountId || `acct-${this.slug(userId).slice(0, 8)}`;
    const accountName = options.accountName || "Primary Checking";
    const currency = options.currency || "$";
    const seed =
      options.seed ||
      [
        userId,
        accountId,
        startDate.toISOString(),
        endDate.toISOString(),
        String(transactionCount),
      ].join(":");

    return {
      userId,
      accountId,
      accountName,
      currency,
      transactionCount,
      days,
      startDate,
      endDate,
      seed,
    };
  }

  private pickExpenseTemplate(rng: () => number): FeedTemplate {
    const index = Math.floor(rng() * EXPENSE_TEMPLATES.length);
    return EXPENSE_TEMPLATES[index];
  }

  private buildAmount(
    template: FeedTemplate,
    rng: () => number,
    isIncome: boolean,
  ): number {
    const amount =
      template.minAmount + rng() * (template.maxAmount - template.minAmount);
    return isIncome ? Math.round(amount) : Number(amount.toFixed(2));
  }

  private buildTransactionDate(
    endDate: Date,
    daysWindow: number,
    rng: () => number,
    index: number,
  ): Date {
    const dayOffset = Math.min(daysWindow - 1, Math.floor(rng() * daysWindow));
    const hour = 6 + Math.floor(rng() * 14);
    const minute = Math.floor(rng() * 60);
    const date = new Date(endDate);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(hour, minute, 0, 0);
    date.setMinutes(date.getMinutes() - index);
    return date;
  }

  private buildRecurringDueDate(
    date: Date,
    frequency: NonNullable<FeedTemplate["recurringFrequency"]>,
  ): Date {
    const dueDate = new Date(date);

    if (frequency === "weekly") {
      dueDate.setDate(dueDate.getDate() + 7);
    } else if (frequency === "quarterly") {
      dueDate.setMonth(dueDate.getMonth() + 3);
    } else {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    return dueDate;
  }

  private buildMerchantId(template: FeedTemplate, index: number): string {
    return `${this.slug(template.normalizedMerchant)}-${index + 1}`;
  }

  private buildTransactionId(
    options: SimulatedBankFeedOptions,
    index: number,
    date: Date,
  ): string {
    return `sim-${this.slug(options.accountId)}-${date.getTime()}-${index + 1}`;
  }

  private buildConfidence(
    template: FeedTemplate,
    isRecurring: boolean,
  ): number {
    const base = template.type === "income" ? 0.96 : 0.74;
    const recurringBonus = isRecurring ? 0.1 : 0;
    return Number(Math.min(0.99, base + recurringBonus).toFixed(2));
  }

  private createRng(seedValue: string): () => number {
    let state = this.hashSeed(seedValue);
    return () => {
      state += 0x6d2b79f5;
      let value = Math.imul(state ^ (state >>> 15), 1 | state);
      value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  private hashSeed(seedValue: string): number {
    let hash = 2166136261;

    for (let index = 0; index < seedValue.length; index += 1) {
      hash ^= seedValue.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  private slug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
