type TransactionInput = {
    id?: string;
    amount: number;
    category?: string;
    description?: string;
    type?: string;
    date?: string;
    mcc?: string;
};

type EnrichedTransaction = TransactionInput & {
    normalizedMerchant?: string;
    category?: string;
    categoryConfidence?: number;
    isAnomaly?: boolean;
    anomalyScore?: number;
    isRecurring?: boolean;
};

const merchantAliases: Record<string, string> = {
    'amazon marketplace': 'amazon',
    'amazon.com': 'amazon',
    'amzn mktp': 'amazon',
    'starbucks coffee': 'starbucks',
    'netflix.com': 'netflix',
    spotify: 'spotify',
};

const categoryRules: Array<{
    pattern: RegExp;
    category: string;
    confidence: number;
}> = [
        { pattern: /netflix|disney|spotify|hulu/i, category: 'Entertainment', confidence: 0.9 },
        { pattern: /uber|lyft|taxi|ride/i, category: 'Transport', confidence: 0.75 },
        { pattern: /grocery|market|supermart|supermarket/i, category: 'Groceries', confidence: 0.85 },
        { pattern: /rent|lease|mortgage/i, category: 'Housing', confidence: 0.9 },
        { pattern: /gym|fitness|yoga/i, category: 'Health', confidence: 0.7 },
        { pattern: /salary|payroll/i, category: 'Income', confidence: 0.95 },
    ];

export class EnrichmentService {
    normalizeMerchant(raw?: string): string | undefined {
        if (!raw) return undefined;
        const cleaned = raw.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        if (merchantAliases[cleaned]) return merchantAliases[cleaned];
        return cleaned.replace(/\s+/g, ' ');
    }

    classifyCategory(description?: string, fallback?: string): { category?: string; confidence: number } {
        if (!description) return { category: fallback, confidence: fallback ? 0.4 : 0 };
        for (const rule of categoryRules) {
            if (rule.pattern.test(description)) {
                return { category: rule.category, confidence: rule.confidence };
            }
        }
        return { category: fallback, confidence: fallback ? 0.4 : 0 };
    }

    computeAnomaly(amount: number, recentAvg = 100, recentStd = 50): { score: number; isAnomaly: boolean } {
        const z = recentStd ? Math.abs((amount - recentAvg) / recentStd) : 0;
        return { score: Number(z.toFixed(2)), isAnomaly: z > 2.5 };
    }

    inferRecurring(description?: string, existingHits = 0): boolean {
        if (!description) return false;
        if (/subscription|renewal|monthly|membership/i.test(description)) return true;
        return existingHits >= 2;
    }

    enrich(tx: TransactionInput): EnrichedTransaction {
        const normalizedMerchant = this.normalizeMerchant(tx.description);
        const classification = this.classifyCategory(tx.description, tx.category);
        const anomaly = this.computeAnomaly(tx.amount);
        const isRecurring = this.inferRecurring(tx.description);

        return {
            ...tx,
            normalizedMerchant,
            category: classification.category,
            categoryConfidence: Number(classification.confidence.toFixed(2)),
            isAnomaly: anomaly.isAnomaly,
            anomalyScore: anomaly.score,
            isRecurring,
        };
    }
}

export const enrichmentService = new EnrichmentService();