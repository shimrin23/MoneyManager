import Notification from '../schemas/notification.schema';
import Budget from '../schemas/budget.schema';
import Transaction from '../schemas/transaction.schema';

export interface NewNotification {
    type: 'info' | 'warning' | 'success' | 'alert';
    title: string;
    message: string;
    link?: string;
    actionRequired?: boolean;
}

// Saves a notification for a user. A failure here must never break the action that triggered it.
export const createNotification = async (userId: string, data: NewNotification) => {
    try {
        await Notification.create({ userId, ...data });
    } catch (err: any) {
        console.error('[Notifications] Failed to create notification:', err?.message || err);
    }
};

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Call after an expense is saved. Notifies only when this expense crosses the alert threshold or the budget limit.
export const checkBudgetAfterExpense = async (userId: string, category: string, amount: number, date: Date) => {
    try {
        const categoryMatch = new RegExp(`^${escapeRegex(category.trim())}$`, 'i');
        const budget = await Budget.findOne({ userId, category: categoryMatch }).lean();
        if (!budget || budget.allocatedAmount <= 0) return;

        const monthStart = new Date(date);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const totals = await Transaction.aggregate([
            { $match: { userId, type: 'expense', category: categoryMatch, date: { $gte: monthStart, $lt: monthEnd } } },
            { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
        ]);
        const spentAfter = totals[0]?.total || 0;
        const spentBefore = spentAfter - Math.abs(amount);
        const limit = budget.allocatedAmount;
        const thresholdAmount = budget.alertThreshold ? (limit * budget.alertThreshold) / 100 : null;
        const money = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 0 });

        if (spentBefore <= limit && spentAfter > limit) {
            await createNotification(userId, {
                type: 'warning',
                title: 'Budget exceeded',
                message: `You have spent ${money(spentAfter)} of your ${money(limit)} ${budget.category} budget this month.`,
                link: '/smart-budgets',
                actionRequired: true
            });
        } else if (thresholdAmount !== null && spentBefore < thresholdAmount && spentAfter >= thresholdAmount && spentAfter <= limit) {
            await createNotification(userId, {
                type: 'warning',
                title: 'Budget Alert',
                message: `You have spent ${Math.round((spentAfter / limit) * 100)}% of your ${budget.category} budget this month.`,
                link: '/smart-budgets',
                actionRequired: true
            });
        }
    } catch (err: any) {
        console.error('[Notifications] Budget check failed:', err?.message || err);
    }
};
