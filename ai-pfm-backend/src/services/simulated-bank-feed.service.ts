/**
 * SimulatedBankFeedService
 * Generates deterministic, seeded fake bank transaction feeds for use in tests
 * and local development without a real banking API connection.
 */

export interface SimulatedTransaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    merchantName: string;
    mcc: string;
    date: string;
    sourceAccount: string;
    ingestionType: 'batch';
    isRecurring: boolean;
}

export interface SimulatedFeedSummary {
    transactionCount: number;
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    dateRange: { from: string; to: string };
}

export interface SimulatedFeed {
    source: 'simulated-bank';
    userId: string;
    accountId: string;
    accountName: string;
    generatedAt: string;
    transactions: SimulatedTransaction[];
    summary: SimulatedFeedSummary;
}

export interface GenerateFeedOptions {
    userId: string;
    accountId: string;
    accountName: string;
    transactionCount?: number;
    days?: number;
    endDate?: Date;
    seed?: string;
    generatedAt?: string | Date;
}

const MERCHANT_POOL = [
    { name: 'Netflix',        category: 'Entertainment', mcc: '5814', type: 'expense', recurring: true  },
    { name: 'Spotify',        category: 'Entertainment', mcc: '5814', type: 'expense', recurring: true  },
    { name: 'Amazon Prime',   category: 'Entertainment', mcc: '5999', type: 'expense', recurring: true  },
    { name: 'Keells Super',   category: 'Groceries',     mcc: '5411', type: 'expense', recurring: false },
    { name: 'Arpico',         category: 'Groceries',     mcc: '5411', type: 'expense', recurring: false },
    { name: 'Dialog Axiata',  category: 'Telecom',       mcc: '4814', type: 'expense', recurring: true  },
    { name: 'Uber Lanka',     category: 'Transport',     mcc: '4121', type: 'expense', recurring: false },
    { name: 'Lanka IOC',      category: 'Fuel',          mcc: '5542', type: 'expense', recurring: false },
    { name: 'CEB Bill',       category: 'Utilities',     mcc: '5999', type: 'expense', recurring: true  },
    { name: 'Salary Deposit', category: 'Income',        mcc: '0000', type: 'income',  recurring: true  },
];

/**
 * Simple deterministic pseudo-random number generator (LCG).
 * Returns a function that gives a number between 0 and 1 each call.
 */
function makePrng(seed: string): () => number {
    let state = 0;
    for (let i = 0; i < seed.length; i++) {
        state = (state * 31 + seed.charCodeAt(i)) >>> 0;
    }

    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0xffffffff;
    };
}

export class SimulatedBankFeedService {
    /**
     * Generate a deterministic bank transaction feed.
     * Calling this twice with the same options + seed produces identical output.
     */
    generateFeed(options: GenerateFeedOptions): SimulatedFeed {
        const {
            userId,
            accountId,
            accountName,
            transactionCount = 20,
            days = 30,
            endDate = new Date(),
            seed = `${userId}-${accountId}`,
            generatedAt,
        } = options;

        const effectiveGeneratedAt = generatedAt
            ? (typeof generatedAt === 'string' ? generatedAt : generatedAt.toISOString())
            : (options.endDate ? options.endDate.toISOString() : endDate.toISOString());

        const rand = makePrng(seed);

        const endMs = endDate.getTime();
        const startMs = endMs - days * 24 * 60 * 60 * 1000;

        const transactions: SimulatedTransaction[] = [];

        for (let i = 0; i < transactionCount; i++) {
            const merchant = MERCHANT_POOL[Math.floor(rand() * MERCHANT_POOL.length)];
            const dateMs = startMs + Math.floor(rand() * (endMs - startMs));
            const date = new Date(dateMs).toISOString();

            const baseAmount = merchant.type === 'income'
                ? 50000 + Math.floor(rand() * 100000)   // salary 50k–150k LKR
                : 100 + Math.floor(rand() * 9900);       // expense 100–10000 LKR

            transactions.push({
                id: `sim-${seed}-${i}`,
                amount: baseAmount,
                type: merchant.type as 'income' | 'expense',
                category: merchant.category,
                description: `${merchant.name} payment`,
                merchantName: merchant.name,
                mcc: merchant.mcc,
                date,
                sourceAccount: accountId,
                ingestionType: 'batch',
                isRecurring: merchant.recurring,
            });
        }

        // Sort chronologically
        transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        return {
            source: 'simulated-bank',
            userId,
            accountId,
            accountName,
            generatedAt: effectiveGeneratedAt,
            transactions,
            summary: {
                transactionCount: transactions.length,
                totalIncome,
                totalExpenses,
                netBalance: totalIncome - totalExpenses,
                dateRange: {
                    from: new Date(startMs).toISOString(),
                    to:   endDate.toISOString(),
                },
            },
        };
    }
}
