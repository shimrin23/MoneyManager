import Notification from '../schemas/notification.schema';
import Budget from '../schemas/budget.schema';
import Transaction from '../schemas/transaction.schema';
import User from '../schemas/user.schema';
import { schedule } from 'node-cron';
import { sendNotificationEmail } from '../utils/email';
import { sendSmsNotification } from '../utils/sms';

export interface NewNotification {
    type: 'info' | 'warning' | 'success' | 'alert';
    title: string;
    message: string;
    link?: string;
    actionRequired?: boolean;
}

// Saves a notification for a user. A failure here must never break the action that triggered it.
// Same defaults the Settings page shows; used when the user has not changed a switch yet
const NOTIFICATION_PREF_DEFAULTS: Record<string, boolean> = {
    budgetAlerts: true,
    transactionAlerts: true,
    goalReminders: true,
    weeklyReports: true,
    monthlyReports: true,
    marketingEmails: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    securityAlerts: true
};

// True unless the user has switched this notification off in Settings
export const wantsNotification = async (userId: string, prefKey: string): Promise<boolean> => {
    try {
        const user = await User.findById(userId).select('settings.notifications').lean();
        const saved = ((user as any)?.settings?.notifications) || {};
        const value = saved[prefKey] !== undefined ? saved[prefKey] : NOTIFICATION_PREF_DEFAULTS[prefKey];
        return value !== false;
    } catch {
        return true;
    }
};

// Also email the notification when the user has Email Notifications switched on
const emailNotification = async (userId: string, data: NewNotification) => {
    try {
        if (!(await wantsNotification(userId, 'emailNotifications'))) return;
        const user = await User.findById(userId).select('email').lean();
        if (!(user as any)?.email) return;
        await sendNotificationEmail((user as any).email, data.title, data.message, data.link);
    } catch (err: any) {
        console.error('[Notifications] Email failed:', err?.message || err);
    }
};

// Also text the notification when SMS Notifications is on and the user has a phone number
const smsNotification = async (userId: string, data: NewNotification) => {
    try {
        if (!(await wantsNotification(userId, 'smsNotifications'))) return;
        const user = await User.findById(userId).select('phone').lean();
        const phone = (user as any)?.phone;
        if (!phone) return;
        await sendSmsNotification(phone, `${data.title}: ${data.message}`);
    } catch (err: any) {
        console.error('[Notifications] SMS failed:', err?.message || err);
    }
};

export const createNotification = async (userId: string, data: NewNotification, prefKey?: string) => {
    try {
        // The category switch (for example Budget Alerts) turns off every channel for that alert
        const categoryOn = !prefKey || (await wantsNotification(userId, prefKey));
        if (!categoryOn) return;
        // Push Notifications is the in-app list: when it is off, the in-app notification is not created
        if (await wantsNotification(userId, 'pushNotifications')) {
            await Notification.create({ userId, ...data });
        }
        await emailNotification(userId, data);
        await smsNotification(userId, data);
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
            }, 'budgetAlerts');
        } else if (thresholdAmount !== null && spentBefore < thresholdAmount && spentAfter >= thresholdAmount && spentAfter <= limit) {
            await createNotification(userId, {
                type: 'warning',
                title: 'Budget Alert',
                message: `You have spent ${Math.round((spentAfter / limit) * 100)}% of your ${budget.category} budget this month.`,
                link: '/smart-budgets',
                actionRequired: true
            }, 'budgetAlerts');
        }
    } catch (err: any) {
        console.error('[Notifications] Budget check failed:', err?.message || err);
    }
};

const formatAmount = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 0 });

// Adds a summary of income and expenses for the period to every user who has this report switched on
const sendPeriodSummaries = async (periodStart: Date, periodEnd: Date, prefKey: 'weeklyReports' | 'monthlyReports', title: string) => {
    const users = await User.find({}, { _id: 1 }).lean();
    for (const user of users) {
        const userId = String(user._id);
        try {
            const rows = await Transaction.aggregate([
                { $match: { userId, date: { $gte: periodStart, $lt: periodEnd } } },
                { $group: { _id: '$type', total: { $sum: '$amount' } } }
            ]);
            const income = rows.find(r => r._id === 'income')?.total ?? 0;
            const expense = rows.find(r => r._id === 'expense')?.total ?? 0;
            await createNotification(userId, {
                type: 'info',
                title,
                message: `Income ${formatAmount(income)} and expenses ${formatAmount(expense)} in this period.`,
                link: '/financial-health'
            }, prefKey);
        } catch (err: any) {
            console.error('[Notifications] Summary failed for user:', err?.message || err);
        }
    }
};

// Weekly summary every Monday at 9:00 (last 7 days); monthly summary on the 1st at 9:00 (previous month)
export const startReportJobs = () => {
    const timezone = 'Asia/Colombo';
    schedule('0 9 * * 1', () => {
        const end = new Date();
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        sendPeriodSummaries(start, end, 'weeklyReports', 'Weekly summary');
    }, { timezone });
    schedule('0 9 1 * *', () => {
        const end = new Date();
        end.setDate(1);
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setMonth(start.getMonth() - 1);
        sendPeriodSummaries(start, end, 'monthlyReports', 'Monthly summary');
    }, { timezone });
};
