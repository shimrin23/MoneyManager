import Subscription, { ISubscription } from '../schemas/subscription.schema';
import Transaction from '../schemas/transaction.schema';
export class SubscriptionsService {
    
    async create(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
        const subscription = new Subscription(subscriptionData);
        return await subscription.save();
    }

    async getAll(userId: string): Promise<ISubscription[]> {
        return await Subscription.find({ userId, isActive: true }).sort({ nextPayment: 1 });
    }

    async findById(id: string): Promise<ISubscription | null> {
        return await Subscription.findById(id);
    }

    async update(id: string, updates: Partial<ISubscription>): Promise<ISubscription | null> {
        return await Subscription.findByIdAndUpdate(id, updates, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await Subscription.findByIdAndUpdate(
            id, 
            { isActive: false }, 
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
            { $set: { isActive: false } }
        );
        
        return result.modifiedCount;
    }

    async calculateMonthlyCost(userId: string): Promise<number> {
        const subscriptions = await this.getAll(userId);
        
        return subscriptions.reduce((total, sub) => {
            const monthlyCost = sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount;
            return total + monthlyCost;
        }, 0);
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