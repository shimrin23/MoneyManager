import Transaction from '../schemas/transaction.schema';

export type AnomalyType = 'duplicate' | 'spike' | 'unusual-merchant' | 'unusual-time' | 'geo-mismatch';
export type AnomalyStatus = 'open' | 'reviewed-safe' | 'reviewed-fraud' | 'dismissed';

export const ANOMALY_STATUSES: AnomalyStatus[] = ['open', 'reviewed-safe', 'reviewed-fraud', 'dismissed'];

export interface AnomalyAlert {
    _id: string;
    type: AnomalyType;
    title: string;
    description: string;
    transactionId: string;
    amount: number;
    merchant: string;
    date: string;
    time: string;
    category: string;
    riskScore: number; // 0-100
    status: AnomalyStatus;
    detectedReason: string;
}

// Minimal transaction shape needed for detection (keeps the logic testable without MongoDB)
export interface AnomalyInputTransaction {
    _id: any;
    amount: number;
    category: string;
    date: Date | string;
    description?: string;
    merchantName?: string;
    type: 'income' | 'expense';
    isAnomaly?: boolean;
    anomalyScore?: number;
    anomalyStatus?: AnomalyStatus;
    createdAt?: Date | string;
}

const MIN_BASELINE_SIZE = 4;        // other expenses needed before judging a spike
const CATEGORY_Z_THRESHOLD = 2.5;   // same threshold the bank-sync enrichment uses
const OVERALL_SPIKE_MULTIPLIER = 5; // amount must be 5x the user's median expense
const OVERALL_SPIKE_MIN_AMOUNT = 10000;

const dayKey = (d: Date | string) => new Date(d).toISOString().split('T')[0];
const labelOf = (t: AnomalyInputTransaction) => (t.description || t.merchantName || t.category || '').trim();
const formatLKR = (n: number) => `LKR ${Math.round(n).toLocaleString('en-US')}`;

const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const buildAlert = (
    t: AnomalyInputTransaction,
    type: AnomalyType,
    riskScore: number,
    title: string,
    description: string,
    detectedReason: string,
): AnomalyAlert => ({
    _id: String(t._id),
    type,
    title,
    description,
    transactionId: String(t._id),
    amount: Math.abs(t.amount),
    merchant: labelOf(t) || 'Unknown',
    date: dayKey(t.date),
    time: '—',
    category: t.category,
    riskScore: Math.max(0, Math.min(100, Math.round(riskScore))),
    status: t.anomalyStatus || 'open',
    detectedReason,
});

/**
 * Rule-based anomaly detection over a user's expenses:
 *  - duplicate: same amount + same description on the same day (every copy after the first is flagged)
 *  - spike: unusually large vs. the user's other expenses in the same category (z-score),
 *           or vs. their overall median expense when the category has too little history
 *  - transactions already flagged by bank-sync enrichment (isAnomaly) are always included
 */
export function detectAnomalies(transactions: AnomalyInputTransaction[]): AnomalyAlert[] {
    const expenses = transactions.filter(t => t.type === 'expense' && Number.isFinite(t.amount));
    const alerts = new Map<string, AnomalyAlert>();

    // 1. Duplicates
    const groups = new Map<string, AnomalyInputTransaction[]>();
    for (const t of expenses) {
        const key = `${Math.abs(t.amount)}|${labelOf(t).toLowerCase()}|${dayKey(t.date)}`;
        groups.set(key, [...(groups.get(key) || []), t]);
    }
    for (const group of groups.values()) {
        if (group.length < 2) continue;
        const ordered = [...group].sort((a, b) =>
            new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime());
        for (const dup of ordered.slice(1)) {
            alerts.set(String(dup._id), buildAlert(
                dup, 'duplicate', 90,
                `Possible duplicate charge: ${labelOf(dup) || dup.category}`,
                `${formatLKR(Math.abs(dup.amount))} was recorded ${group.length} times on ${dayKey(dup.date)}.`,
                'Same amount, same description and same day as another transaction.',
            ));
        }
    }

    // 2. Spending spikes
    for (const t of expenses) {
        const id = String(t._id);
        if (alerts.has(id)) continue;
        const amount = Math.abs(t.amount);
        const others = expenses.filter(o => String(o._id) !== id);
        const sameCategory = others.filter(o => o.category === t.category).map(o => Math.abs(o.amount));

        let spike: { riskScore: number; reason: string } | null = null;

        if (sameCategory.length >= MIN_BASELINE_SIZE) {
            const avg = sameCategory.reduce((s, a) => s + a, 0) / sameCategory.length;
            const std = Math.sqrt(sameCategory.reduce((s, a) => s + (a - avg) ** 2, 0) / sameCategory.length);
            const z = std === 0 ? (amount > avg * 3 ? Infinity : 0) : (amount - avg) / std;
            if (z > CATEGORY_Z_THRESHOLD) {
                spike = {
                    riskScore: 60 + Math.min(z / 5, 1) * 39,
                    reason: `Amount is far above your usual ${t.category} spending (average ${formatLKR(avg)}).`,
                };
            }
        } else if (others.length >= MIN_BASELINE_SIZE) {
            const med = median(others.map(o => Math.abs(o.amount)));
            if (med > 0 && amount >= med * OVERALL_SPIKE_MULTIPLIER && amount >= OVERALL_SPIKE_MIN_AMOUNT) {
                spike = {
                    riskScore: 60 + 10 * Math.log2(amount / med),
                    reason: `Amount is ${Math.round(amount / med)}x your typical expense (median ${formatLKR(med)}).`,
                };
            }
        }

        if (!spike && t.isAnomaly) {
            spike = {
                riskScore: (t.anomalyScore ?? 0.7) * 100,
                reason: 'Flagged as unusual by the bank transaction analysis.',
            };
        }

        if (spike) {
            alerts.set(id, buildAlert(
                t, 'spike', spike.riskScore,
                `Unusually large ${t.category} expense`,
                `${formatLKR(amount)} spent on ${labelOf(t) || t.category} on ${dayKey(t.date)}.`,
                spike.reason,
            ));
        }
    }

    return [...alerts.values()].sort((a, b) => b.riskScore - a.riskScore || b.date.localeCompare(a.date));
}

export default class AnomalyDetectionService {
    async getAnomalies(userId: string): Promise<AnomalyAlert[]> {
        const transactions = await Transaction.find({ userId, type: 'expense' })
            .sort({ date: -1 })
            .limit(500)
            .lean();
        return detectAnomalies(transactions as unknown as AnomalyInputTransaction[]);
    }

    // Only updates a transaction owned by this user; returns null if not found
    async updateStatus(userId: string, transactionId: string, status: AnomalyStatus) {
        return Transaction.findOneAndUpdate(
            { _id: transactionId, userId },
            { anomalyStatus: status },
            { new: true },
        );
    }
}
