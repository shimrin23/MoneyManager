import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest, authenticateToken } from '../middlewares/authMiddleware';
import {
    CANCEL_REASONS,
    SubscriptionsService,
    advanceNextPayment,
    monthlyCostOf,
    validateSubscriptionInput,
} from '../services/subscriptions.service';

const router = Router();
const subscriptionsService = new SubscriptionsService();

// Finds a subscription that belongs to the user; null for a bad id or someone else's subscription
const findOwned = async (id: unknown, userId: string) => {
    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) return null;
    const sub = await subscriptionsService.findById(id);
    return sub && sub.userId === userId ? sub : null;
};

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/subscriptions - Get all active subscriptions for user
// (?includeInactive=true also returns cancelled / dismissed ones so they can be restored)
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Update zombie status first
        await subscriptionsService.updateZombieStatus(userId);

        const subscriptions = req.query.includeInactive === 'true'
            ? await subscriptionsService.getAllIncludingInactive(userId)
            : await subscriptionsService.getAll(userId);
        const totalMonthlyCost = await subscriptionsService.calculateMonthlyCost(userId);
        const zombieSubscriptions = await subscriptionsService.getZombieSubscriptions(userId);

        res.json({
            subscriptions,
            summary: {
                total: subscriptions.filter(s => s.isActive).length,
                totalMonthlyCost,
                zombieCount: zombieSubscriptions.length,
                potentialSavings: zombieSubscriptions.reduce((sum, sub) => sum + monthlyCostOf(sub), 0)
            }
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// POST /api/subscriptions - Create new subscription
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const validation = validateSubscriptionInput(req.body);
        if ('error' in validation) {
            return res.status(400).json({ error: validation.error });
        }

        const subscription = await subscriptionsService.create({ ...validation.data, userId });

        res.status(201).json({
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// PUT /api/subscriptions/:id - Update subscription (also used to dismiss and restore)
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { id } = req.params;

        // Verify subscription belongs to user
        const existingSubscription = await findOwned(id, userId);
        if (!existingSubscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const validation = validateSubscriptionInput(req.body, true);
        if ('error' in validation) {
            return res.status(400).json({ error: validation.error });
        }
        const updates: Record<string, unknown> = { ...validation.data };
        // Restoring a cancelled subscription clears the cancellation details
        if (updates.isActive === true && !existingSubscription.isActive) {
            updates.$unset = { cancelReason: 1, cancelledAt: 1 };
        }
        if (updates.isActive === false && existingSubscription.isActive) {
            updates.cancelledAt = new Date();
        }

        const updatedSubscription = await subscriptionsService.update(id as string, updates);

        res.json({
            message: 'Subscription updated successfully',
            data: updatedSubscription
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

// DELETE /api/subscriptions/:id - Cancel subscription (body: { reason }), or ?permanent=true to remove it for good
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { id } = req.params;

        // Verify subscription belongs to user
        const existingSubscription = await findOwned(id, userId);
        if (!existingSubscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        if (req.query.permanent === 'true') {
            await subscriptionsService.permanentlyDelete(id as string);
            return res.json({ message: 'Subscription deleted' });
        }

        const reason = req.body?.reason;
        if (reason !== undefined && reason !== '' && !CANCEL_REASONS.includes(reason)) {
            return res.status(400).json({ error: 'Invalid cancel reason' });
        }

        const cancelled = await subscriptionsService.delete(id as string, reason || undefined);

        if (!cancelled) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// GET /api/subscriptions/zombies - Get zombie subscriptions
router.get('/zombies', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const zombieSubscriptions = await subscriptionsService.getZombieSubscriptions(userId);

        res.json({
            zombies: zombieSubscriptions,
            potentialSavings: zombieSubscriptions.reduce((sum, sub) => sum + monthlyCostOf(sub), 0)
        });
    } catch (error) {
        console.error('Error fetching zombie subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch zombie subscriptions' });
    }
});

// POST /api/subscriptions/bulk-cancel - Cancel multiple subscriptions
router.post('/bulk-cancel', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { subscriptionIds } = req.body;

        if (!Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
            return res.status(400).json({ error: 'subscriptionIds array is required' });
        }
        if (!subscriptionIds.every((id) => typeof id === 'string' && mongoose.isValidObjectId(id))) {
            return res.status(400).json({ error: 'Invalid subscription id' });
        }

        const cancelledCount = await subscriptionsService.bulkCancel(userId, subscriptionIds);

        res.json({
            message: `Successfully cancelled ${cancelledCount} subscription(s)`,
            cancelledCount
        });
    } catch (error) {
        console.error('Error bulk cancelling subscriptions:', error);
        res.status(500).json({ error: 'Failed to cancel subscriptions' });
    }
});

// GET /api/subscriptions/trends - Real subscription spending for the last 6 months
router.get('/trends', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const trends = await subscriptionsService.getMonthlyTrend(userId, 6);
        res.json({ trends });
    } catch (error) {
        console.error('Error fetching subscription trends:', error);
        res.status(500).json({ error: 'Failed to fetch subscription trends' });
    }
});

// GET /api/subscriptions/upcoming - Get upcoming payments
router.get('/upcoming', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const days = parseInt(req.query.days as string) || 7;
        const upcomingPayments = await subscriptionsService.getUpcomingPayments(userId, days);

        res.json({ upcomingPayments });
    } catch (error) {
        console.error('Error fetching upcoming payments:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming payments' });
    }
});

// POST /api/subscriptions/detect - Detect recurring patterns in transactions
router.post('/detect', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const detectedCount = await subscriptionsService.detectRecurring(userId);

        res.json({
            message: 'Scan complete',
            detectedCount
        });
    } catch (error) {
        console.error('Error detecting recurring subscriptions:', error);
        res.status(500).json({ error: 'Failed to detect recurring subscriptions' });
    }
});

// POST /api/subscriptions/:id/pay - Log payment as a real transaction and advance next due date
router.post('/:id/pay', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        // Get the subscription
        const sub = await findOwned(id, userId);
        if (!sub) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        if (!sub.isActive) {
            return res.status(400).json({ error: 'Restore this subscription before logging a payment' });
        }

        // Create a real transaction from this subscription payment
        const Transaction = (await import('../schemas/transaction.schema')).default;
        await Transaction.create({
            userId,
            amount: sub.amount,
            category: sub.category,
            description: `${sub.name} - recurring payment`,
            merchantName: sub.provider,
            normalizedMerchant: sub.provider,
            type: 'expense',
            date: new Date(),
            isRecurring: true,
            recurringFrequency: sub.frequency,
        });

        // Advance the next payment date by one billing period (1 month, or 1 year for yearly) and update lastUsed
        const nextPayment = advanceNextPayment(sub.nextPayment, sub.frequency);
        await subscriptionsService.update(id, {
            lastUsed: new Date(),
            nextPayment,
            isZombie: false
        });

        res.json({ message: 'Payment logged successfully', nextPayment });
    } catch (error) {
        console.error('Error logging subscription payment:', error);
        res.status(500).json({ error: 'Failed to log payment' });
    }
});

// GET /api/subscriptions/ai-insights - Generate AI insights for all subscriptions
router.get('/ai-insights', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const subscriptions = await subscriptionsService.getAll(userId);
        if (subscriptions.length === 0) {
            return res.json({ insights: {} });
        }

        const { FinancialAgent } = await import('../ai/agent');
        const agent = new FinancialAgent();

        const prompt = `Analyze these subscriptions for a user:
${JSON.stringify(subscriptions, null, 2)}

For each subscription, provide a brief financial insight (max 1 sentence) and 1-2 real-world cheaper alternatives if applicable (in Sri Lankan Rupees LKR).
Return exactly in this JSON format:
{
  "insights": {
    "subscription_id_here": {
      "insight": "Your insight string here.",
      "alternatives": [
        { "name": "Alternative Name", "price": 0, "savings": 100, "provider": "Provider Name" }
      ]
    }
  }
}
Do not include markdown blocks like \`\`\`json, just return the raw JSON object. Use the exact _id values from the input for the keys.`;

        const responseString = await agent.generateResearch(prompt);
        let parsed;
        try {
            parsed = JSON.parse(responseString.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", responseString);
            return res.status(500).json({ error: 'Failed to parse AI response' });
        }

        res.json(parsed);
    } catch (error) {
        console.error('Error generating subscription insights:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

export default router;
