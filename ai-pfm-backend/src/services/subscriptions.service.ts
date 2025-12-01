import Subscription, { ISubscription } from '../schemas/subscription.schema';

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
}