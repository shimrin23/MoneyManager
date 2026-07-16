import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/authMiddleware';
import Transaction from '../schemas/transaction.schema';
import Subscription from '../schemas/subscription.schema';

const router = express.Router();

router.get('/cash-flow-forecast', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // 1. Calculate Actual Current Balance
        const transactions = await Transaction.find({ userId });
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') totalIncome += t.amount;
            else if (t.type === 'expense') totalExpense += t.amount;
        });

        const currentBalance = totalIncome - totalExpense;

        // 2. Get Active Subscriptions to forecast expenses
        const subscriptions = await Subscription.find({ userId, status: 'active' });

        // 3. Generate 30-Day Forecast
        const forecast = [];
        let runningBalance = currentBalance;
        
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const forecastDate = new Date();
            forecastDate.setDate(today.getDate() + i);
            const dayOfMonth = forecastDate.getDate();

            // Find subscriptions due on this day (assuming monthly for simplicity)
            // Real logic might handle weekly/yearly, but for now we map 'monthly' to dayOfMonth
            const dueSubscriptions = subscriptions.filter(sub => {
                // If it's a monthly sub, we assume it's due on the day it started
                if (sub.billingCycle === 'monthly' && sub.startDate) {
                    const startDay = new Date(sub.startDate).getDate();
                    return startDay === dayOfMonth;
                }
                return false; // ignore other cycles for this basic forecast
            });

            // Subtract expenses
            let dailyExpense = 0;
            dueSubscriptions.forEach(sub => dailyExpense += sub.cost);
            runningBalance -= dailyExpense;

            // Determine Risk Level
            let riskLevel = 'LOW';
            let recommendedActions: string[] = [];

            if (runningBalance < 0) {
                riskLevel = 'HIGH';
                recommendedActions = ['You are projected to go into overdraft!', 'Cancel upcoming subscriptions immediately.'];
            } else if (runningBalance < (totalIncome * 0.1)) { // Less than 10% of total income
                riskLevel = 'MEDIUM';
                recommendedActions = ['Delay non-essential purchases.', 'Review upcoming subscriptions.'];
            }

            forecast.push({
                date: forecastDate.toISOString().split('T')[0],
                predictedBalance: runningBalance,
                riskLevel,
                recommendedActions
            });
        }

        res.json(forecast);
    } catch (error) {
        console.error('Error generating cash flow forecast:', error);
        res.status(500).json({ error: 'Failed to generate forecast' });
    }
});

router.get('/budget-analysis', authenticateToken, async (req: AuthRequest, res: Response) => {
    // Stub for now to prevent 404 in Dashboard
    res.json([]);
});

export default router;
