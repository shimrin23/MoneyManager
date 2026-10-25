import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticateToken, AuthRequest } from '../middlewares/authMiddleware';
import Recommendation from '../schemas/recommendation.schema';
import Goal from '../schemas/goal.schema';
import { FinancialHealthService } from '../services/financial-health.service';
import { isEmergencyGoal } from '../services/health-score.utils';
import {
    RECOMMENDATION_LINKS,
    buildRecommendations,
    emergencyFundTarget,
    recommendationKeyOf,
} from '../services/recommendation-rules';

const router = Router();
const healthService = new FinancialHealthService();

const RECOMMENDATION_STATUSES = ['pending', 'accepted', 'declined', 'snoozed'];
// Snoozed recommendations come back after this long
const SNOOZE_DAYS = 7;

const isValidId = (id: unknown): id is string => typeof id === 'string' && mongoose.isValidObjectId(id);

/**
 * GET /api/recommendations
 * Re-checks the user's current numbers on every visit: new problems get a recommendation,
 * pending ones are updated with the latest numbers, and pending ones that no longer
 * apply are removed. Accepted and declined ones are left as the user set them.
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const health = await healthService.getHealthReport(userId);
        const rules = health.hasData ? buildRecommendations(health.metrics) : [];
        const existing = await Recommendation.find({ userId });

        const snoozeCutoff = new Date(Date.now() - SNOOZE_DAYS * 24 * 60 * 60 * 1000);
        const activeKeys = new Set(rules.map(r => r.key));

        for (const rule of rules) {
            const match = existing.find(r => recommendationKeyOf(r) === rule.key);
            if (!match) {
                await Recommendation.create({ userId, icon: '', ...rule });
            } else if (match.status === 'pending' || (match.status === 'snoozed' && match.updatedAt < snoozeCutoff)) {
                match.set({ ...rule, status: 'pending' });
                await match.save();
            }
        }

        // A pending recommendation whose problem is fixed is no longer needed
        for (const rec of existing) {
            const key = recommendationKeyOf(rec);
            if (rec.status === 'pending' && key && !activeKeys.has(key)) {
                await rec.deleteOne();
            }
        }

        const recommendations = await Recommendation.find({ userId }).sort({ createdAt: 1 });
        res.json({ recommendations, hasData: health.hasData });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

/**
 * POST /api/recommendations/:id/execute
 * Does the recommendation where the app can (creates the Emergency Fund goal),
 * otherwise returns the page where the user can act on it. Marks it accepted.
 */
router.post('/:id/execute', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Recommendation not found' });

        const rec = await Recommendation.findOne({ _id: req.params.id, userId });
        if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

        const key = recommendationKeyOf(rec);
        const link = key ? RECOMMENDATION_LINKS[key] : '/dashboard';
        let message: string;
        let goal = null;

        if (key === 'emergency-fund') {
            const goals = await Goal.find({ userId });
            const existingGoal = goals.find(g => isEmergencyGoal(g) && g.status !== 'Completed');
            if (existingGoal) {
                message = `You already have an "${existingGoal.title}" goal. Add contributions to it on the Goals page.`;
                goal = existingGoal;
            } else {
                const health = await healthService.getHealthReport(userId);
                const target = Math.max(1, emergencyFundTarget(health.metrics));
                const deadline = new Date();
                deadline.setFullYear(deadline.getFullYear() + 1);
                goal = await Goal.create({
                    userId,
                    title: 'Emergency Fund',
                    targetAmount: target,
                    currentAmount: 0,
                    deadline,
                    category: 'Emergency',
                    priority: 'High',
                    description: 'Created from the "Build Emergency Fund" recommendation: 3 months of expenses.',
                });
                message = `Created an "Emergency Fund" goal of LKR ${target.toLocaleString('en-US')} due in 12 months.`;
            }
        } else if (key === 'savings-rate') {
            message = 'Open Smart Budgets to set spending limits for your biggest categories.';
        } else if (key === 'debt-to-income') {
            message = 'Open Loans and use the Strategies tab to plan extra payments.';
        } else if (key === 'credit-utilization') {
            message = 'Open Cards and use Make Payment to bring your balances down.';
        } else {
            message = 'Recommendation accepted.';
        }

        rec.status = 'accepted';
        await rec.save();

        res.json({ recommendation: rec, message, link, goal });
    } catch (error) {
        console.error('Error executing recommendation:', error);
        res.status(500).json({ error: 'Failed to execute recommendation' });
    }
});

router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { status } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!RECOMMENDATION_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Status must be pending, accepted, declined or snoozed' });
        }
        if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Recommendation not found' });

        const updated = await Recommendation.findOneAndUpdate(
            { _id: req.params.id, userId },
            { status },
            { new: true, runValidators: true }
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
