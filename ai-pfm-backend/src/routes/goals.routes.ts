import { Router } from 'express';
import { Request, Response } from 'express';
import Goal from '../schemas/goal.schema';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/goals - Get all goals for user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
        res.json({ goals });
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// POST /api/goals - Create new goal
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { title, targetAmount, currentAmount, deadline } = req.body;

        if (!title || !targetAmount || !deadline) {
            return res.status(400).json({ error: 'Title, target amount, and deadline are required' });
        }

        const newGoal = new Goal({
            userId,
            title,
            targetAmount: Number(targetAmount),
            currentAmount: Number(currentAmount) || 0,
            deadline: new Date(deadline),
            status: 'In Progress'
        });

        await newGoal.save();
        res.status(201).json({ goal: newGoal });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// PUT /api/goals/:id - Update goal
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const updates = req.body;

        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json({ goal });
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        const goal = await Goal.findOneAndDelete({ _id: id, userId });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// POST /api/goals/:id/progress - Add progress to goal
router.post('/:id/progress', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        const goal = await Goal.findOne({ _id: id, userId });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        goal.currentAmount = Math.min(goal.currentAmount + Number(amount), goal.targetAmount);
        
        // Auto-complete if target reached
        if (goal.currentAmount >= goal.targetAmount) {
            goal.status = 'Completed';
        }

        await goal.save();
        res.json({ goal });
    } catch (error) {
        console.error('Error adding progress:', error);
        res.status(500).json({ error: 'Failed to add progress' });
    }
});

export default router;