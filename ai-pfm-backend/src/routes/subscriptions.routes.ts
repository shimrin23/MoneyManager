import { Router, Request, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middlewares/authMiddleware';
import { SubscriptionsService } from '../services/subscriptions.service';

const router = Router();
const subscriptionsService = new SubscriptionsService();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/subscriptions - Get all active subscriptions for user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Update zombie status first
        await subscriptionsService.updateZombieStatus(userId);
        
        const subscriptions = await subscriptionsService.getAll(userId);
        const totalMonthlyCost = await subscriptionsService.calculateMonthlyCost(userId);
        const zombieSubscriptions = await subscriptionsService.getZombieSubscriptions(userId);
        
        res.json({
            subscriptions,
            summary: {
                total: subscriptions.length,
                totalMonthlyCost,
                zombieCount: zombieSubscriptions.length,
                potentialSavings: zombieSubscriptions.reduce((sum, sub) => {
                    const monthlyCost = sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount;
                    return sum + monthlyCost;
                }, 0)
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

        const subscriptionData = { ...req.body, userId };
        
        // Validation
        if (!subscriptionData.name || !subscriptionData.provider || !subscriptionData.amount || !subscriptionData.nextPayment) {
            return res.status(400).json({ 
                error: 'Name, provider, amount, and nextPayment are required' 
            });
        }

        const subscription = await subscriptionsService.create(subscriptionData);
        
        res.status(201).json({
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// PUT /api/subscriptions/:id - Update subscription
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { id } = req.params;
        const updates = req.body;
        
        // Verify subscription belongs to user
        const existingSubscription = await subscriptionsService.findById(id);
        if (!existingSubscription || existingSubscription.userId !== userId) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const updatedSubscription = await subscriptionsService.update(id, updates);
        
        res.json({
            message: 'Subscription updated successfully',
            data: updatedSubscription
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

// DELETE /api/subscriptions/:id - Cancel subscription
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { id } = req.params;
        
        // Verify subscription belongs to user
        const existingSubscription = await subscriptionsService.findById(id);
        if (!existingSubscription || existingSubscription.userId !== userId) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const cancelled = await subscriptionsService.delete(id);
        
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
            potentialSavings: zombieSubscriptions.reduce((sum, sub) => {
                const monthlyCost = sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount;
                return sum + monthlyCost;
            }, 0)
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

export default router;