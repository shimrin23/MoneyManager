import Subscription, { ISubscription } from '../schemas/subscription.schema';
import Transaction from '../schemas/transaction.schema';
import { addMonths } from './fd-lease-pawning.service';

export const SUBSCRIPTION_FREQUENCIES = ['monthly', 'yearly'];
export const CANCEL_REASONS = ['too-expensive', 'not-used', 'found-alternative', 'temporary-pause', 'other', 'zombie-bulk-cancel'];

// Fields a user may set when adding or editing a subscription
const EDITABLE_FIELDS = ['name', 'provider', 'amount', 'frequency', 'nextPayment', 'category', 'isActive', 'isZombie'];

/**
 * Checks a new subscription (partial = false) or an edit (partial = true).
 * Returns the cleaned fields, or an error message.
 */
export const validateSubscriptionInput = (
    body: Record<string, unknown>,
    partial = false
): { error: string } | { data: Partial<ISubscription> } => {
    const data: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
        if (body[field] !== undefined) data[field] = body[field];
    }

    const requireText = (field: string, label: string) => {
        if (data[field] === undefined && partial) return null;
        if (typeof data[field] !== 'string' || !(data[field] as string).trim()) return `${label} is required`;
        data[field] = (data[field] as string).trim();
        return null;
    };
    const textError = requireText('name', 'Name') || requireText('provider', 'Provider') || requireText('category', 'Category');
    if (textError) return { error: textError };

    if (data.amount !== undefined || !partial) {
        const amount = Number(data.amount);
        if (data.amount === '' || data.amount === null || !Number.isFinite(amount)) return { error: 'Amount is required' };
        if (amount <= 0) return { error: 'Amount must be greater than 0' };
        data.amount = amount;
    }
    if (data.frequency !== undefined || !partial) {
        if (data.frequency === undefined) data.frequency = 'monthly';
        if (!SUBSCRIPTION_FREQUENCIES.includes(data.frequency as string)) return { error: 'Frequency must be monthly or yearly' };
    }
    if (data.nextPayment !== undefined || !partial) {
        const next = new Date(data.nextPayment as string);
        if (!data.nextPayment || isNaN(next.getTime())) return { error: 'A valid next payment date is required' };
        data.nextPayment = next;
    }
    for (const flag of ['isActive', 'isZombie']) {
        if (data[flag] !== undefined && typeof data[flag] !== 'boolean') return { error: `${flag} must be true or false` };
    }
    return { data: data as Partial<ISubscription> };
};

// The next due date after a payment: one month later for monthly, a year later for yearly
export const advanceNextPayment = (nextPayment: Date, frequency: string) =>
    addMonths(new Date(nextPayment), frequency === 'yearly' ? 12 : 1);

export const monthlyCostOf = (sub: { amount: number; frequency: string }) =>
    sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount;

export class SubscriptionsService {
    
    async create(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
        const subscription = new Subscription(subscriptionData);
        return await subscription.save();
    }

    async getAll(userId: string): Promise<ISubscription[]> {
        return await Subscription.find({ userId, isActive: true }).sort({ nextPayment: 1 });
    }

    // Active subscriptions plus cancelled / dismissed ones, so they can be shown and restored
    async getAllIncludingInactive(userId: string): Promise<ISubscription[]> {
        return await Subscription.find({ userId }).sort({ isActive: -1, nextPayment: 1 });
    }

    async permanentlyDelete(id: string): Promise<boolean> {
        const result = await Subscription.findByIdAndDelete(id);
        return !!result;
    }

    /**
     * Real subscription spending for each of the last `months` months (oldest first):
     * recurring payments logged from the app plus expenses from the same providers.
     */
    async getMonthlyTrend(userId: string, months = 6): Promise<{ month: string; amount: number }[]> {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

        const subscriptions = await Subscription.find({ userId });
        const providers = [...new Set(subscriptions.flatMap((s) => [s.provider, s.name]).filter(Boolean))];

        const expenses = await Transaction.find({
            userId,
            type: 'expense',
            date: { $gte: start },
            $or: [
                { isRecurring: true },
                { merchantName: { $in: providers } },
                { normalizedMerchant: { $in: providers } },
            ],
        }).select('amount date');

        const buckets = Array.from({ length: months }, (_, i) => {
            const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
            return { key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString('en-LK', { month: 'short', year: '2-digit' }), amount: 0 };
        });
        for (const tx of expenses) {
            const d = new Date(tx.date);
            const bucket = buckets.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`);
            if (bucket) bucket.amount += tx.amount;
        }
        return buckets.map(({ month, amount }) => ({ month, amount: Math.round(amount * 100) / 100 }));
    }

    async findById(id: string): Promise<ISubscription | null> {
        return await Subscription.findById(id);
    }

    async update(id: string, updates: Partial<ISubscription>): Promise<ISubscription | null> {
        return await Subscription.findByIdAndUpdate(id, updates, { new: true });
    }

    async delete(id: string, reason?: string): Promise<boolean> {
        const result = await Subscription.findByIdAndUpdate(
            id, 
            { isActive: false, cancelledAt: new Date(), ...(reason ? { cancelReason: reason } : {}) }, 
            { new: true }
        );
        return !!result;
    }

    async getZombieSubscriptions(userId: string): Promise<ISubscription[]> {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        return await Subscription.find({
            userId,
            isActive: true,
            $or: [
                { lastUsed: { $lt: threeMonthsAgo } },
                { isZombie: true }
            ]
        });
    }

    async updateZombieStatus(userId: string): Promise<void> {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        // Mark subscriptions as zombie if not used in 3 months
        await Subscription.updateMany(
            {
                userId,
                isActive: true,
                lastUsed: { $lt: threeMonthsAgo }
            },
            { $set: { isZombie: true } }
        );
    }

    async bulkCancel(userId: string, subscriptionIds: string[]): Promise<number> {
        const result = await Subscription.updateMany(
            {
                _id: { $in: subscriptionIds },
                userId,
                isActive: true
            },
            { $set: { isActive: false, cancelledAt: new Date(), cancelReason: 'zombie-bulk-cancel' } }
        );
        
        return result.modifiedCount;
    }

    async calculateMonthlyCost(userId: string): Promise<number> {
        const subscriptions = await this.getAll(userId);
        
        return subscriptions.reduce((total, sub) => total + monthlyCostOf(sub), 0);
    }

    async getUpcomingPayments(userId: string, days: number = 7): Promise<ISubscription[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        
        return await Subscription.find({
            userId,
            isActive: true,
            nextPayment: { $lte: futureDate }
        }).sort({ nextPayment: 1 });
    }

    async detectRecurring(userId: string): Promise<number> {
        // Find all expenses for the user in the last 6 months to detect patterns
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const expenses = await Transaction.find({
            userId,
            type: 'expense',
            date: { $gte: sixMonthsAgo }
        }).sort({ date: 1 });

        // Group by normalizedMerchant, merchantName, or description
        const grouped: Record<string, typeof expenses> = {};
        for (const tx of expenses) {
            const key = tx.normalizedMerchant || tx.merchantName || tx.description || 'Unknown';
            if (key === 'Unknown') continue;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(tx);
        }

        let detectedCount = 0;

        for (const [merchant, txs] of Object.entries(grouped)) {
            if (txs.length < 2) continue;

            // Simple detection: look for consecutive transactions roughly 1 month apart
            let patternFound = false;
            let lastTx = txs[txs.length - 1];
            let previousTx = txs[txs.length - 2];

            const diffDays = (lastTx.date.getTime() - previousTx.date.getTime()) / (1000 * 60 * 60 * 24);
            
            // If they are between 25 and 35 days apart, it's a monthly pattern
            if (diffDays >= 25 && diffDays <= 35) {
                // Check if amount is similar (within 10% tolerance)
                const amountDiff = Math.abs(lastTx.amount - previousTx.amount) / previousTx.amount;
                if (amountDiff < 0.1) {
                    patternFound = true;
                }
            }

            if (patternFound) {
                // Check if subscription already exists for this provider
                const existing = await Subscription.findOne({
                    userId,
                    provider: merchant,
                    isActive: true
                });

                if (!existing) {
                    // Create unconfirmed subscription
                    const nextPayment = new Date(lastTx.date);
                    nextPayment.setMonth(nextPayment.getMonth() + 1);

                    const newSub = new Subscription({
                        userId,
                        name: merchant,
                        provider: merchant,
                        amount: lastTx.amount,
                        frequency: 'monthly',
                        nextPayment,
                        category: lastTx.category || 'Uncategorized',
                        isActive: true,
                        isZombie: true, // Mark as unconfirmed
                        lastUsed: lastTx.date
                    });
                    await newSub.save();
                    detectedCount++;
                }
            }
        }
        
        return detectedCount;
    }
}