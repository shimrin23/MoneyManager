import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/authMiddleware';
import Recommendation from '../schemas/recommendation.schema';
import { FinancialHealthService } from '../services/financial-health.service';

const router = Router();
const healthService = new FinancialHealthService();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Fetch existing pending or snoozed recommendations
        let recs = await Recommendation.find({ userId });

        // If none exist, let's generate some based on current metrics
        if (recs.length === 0) {
            const health = await healthService.getHealthReport(userId);
            const metrics = health.metrics;
            const newRecs = [];

            if (metrics.savingsRate < 0.1) {
                newRecs.push({
                    userId,
                    category: 'budget',
                    icon: '🍔',
                    title: 'Increase Your Savings Rate',
                    reason: 'Your savings rate is currently below the recommended 10% minimum threshold.',
                    action: 'Set up an automated transfer to savings on payday.',
                    projectedImpact: 'Build a safety net and increase your financial health score.',
                    executionPath: 'Smart Budgets → Create Budget → Savings Goal',
                    priority: 'critical'
                });
            }

            if (metrics.debtToIncomeRatio > 0.3) {
                newRecs.push({
                    userId,
                    category: 'debt',
                    icon: '💳',
                    title: 'Reduce High Debt-to-Income',
                    reason: 'Your debt obligations consume more than 30% of your income.',
                    action: 'Prioritize paying down high-interest debt like credit cards.',
                    projectedImpact: 'Free up cash flow and reduce interest payments.',
                    executionPath: 'Loans → View Debt → Apply extra payment',
                    priority: 'high'
                });
            }

            if (metrics.emergencyFundMonths < 3) {
                newRecs.push({
                    userId,
                    category: 'goal',
                    icon: '🏠',
                    title: 'Build Emergency Fund',
                    reason: 'You have less than 3 months of expenses saved for emergencies.',
                    action: 'Set up a dedicated Emergency Fund goal.',
                    projectedImpact: 'Create a 3-6 month safety buffer for unexpected events.',
                    executionPath: 'Goals → New Goal → Emergency Fund',
                    priority: 'high'
                });
            }

            if (metrics.creditUtilization > 0.3) {
                newRecs.push({
                    userId,
                    category: 'alert',
                    icon: '⚠️',
                    title: 'High Credit Utilization',
                    reason: 'Using more than 30% of your credit limit negatively impacts your credit score.',
                    action: 'Pay down credit card balances before the statement date.',
                    projectedImpact: 'Improve credit score and reduce interest charges.',
                    executionPath: 'Cards → Select Card → Pay Bill',
                    priority: 'medium'
                });
            }

            if (newRecs.length > 0) {
                recs = await Recommendation.insertMany(newRecs);
            }
        }

        res.json({ recommendations: recs });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { status } = req.body;
        
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const updated = await Recommendation.findOneAndUpdate(
            { _id: req.params.id, userId },
            { status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Recommendation not found' });
        }

        res.json({ recommendation: updated });
    } catch (error) {
        console.error('Error updating recommendation:', error);
        res.status(500).json({ error: 'Failed to update recommendation' });
    }
});

export default router;
