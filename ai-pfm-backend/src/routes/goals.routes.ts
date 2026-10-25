import { Router } from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Goal from '../schemas/goal.schema';
import { authenticateToken } from '../middlewares/authMiddleware';
import { createNotification } from '../services/notification.service';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Fields a user may set on a goal (userId, _id, timestamps are never taken from the request)
const EDITABLE_FIELDS = ['title', 'targetAmount', 'currentAmount', 'deadline', 'status', 'category', 'priority', 'description'] as const;
const STATUSES = ['In Progress', 'Completed', 'Paused'];
const PRIORITIES = ['High', 'Medium', 'Low'];

// Returns an error message, or null if the goal values are valid
const validateGoal = (goal: { title?: unknown; targetAmount?: unknown; currentAmount?: unknown; deadline?: unknown; status?: unknown; priority?: unknown }) => {
    if (typeof goal.title !== 'string' || !goal.title.trim()) return 'Goal title is required';
    if (typeof goal.targetAmount !== 'number' || !Number.isFinite(goal.targetAmount) || goal.targetAmount <= 0) {
        return 'Target amount must be more than 0';
    }
    if (typeof goal.currentAmount !== 'number' || !Number.isFinite(goal.currentAmount) || goal.currentAmount < 0) {
        return 'Current savings cannot be negative';
    }
    if (!(goal.deadline instanceof Date) || isNaN(goal.deadline.getTime())) return 'A valid deadline is required';
    if (goal.status !== undefined && !STATUSES.includes(goal.status as string)) return 'Invalid status';
    if (goal.priority !== undefined && !PRIORITIES.includes(goal.priority as string)) return 'Invalid priority';
    return null;
};

const toNumber = (value: unknown) => (value === '' || value === null || value === undefined ? NaN : Number(value));

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
        const { title, targetAmount, currentAmount, deadline, category, priority, description } = req.body;

        const fields = {
            title: typeof title === 'string' ? title.trim() : title,
            targetAmount: toNumber(targetAmount),
            currentAmount: currentAmount === undefined || currentAmount === '' ? 0 : toNumber(currentAmount),
            deadline: deadline ? new Date(deadline) : undefined,
            priority,
        };
        const error = validateGoal(fields);
        if (error) {
            return res.status(400).json({ error });
        }
        // Allow "today" in any timezone, but not a date that has already passed
        if (fields.deadline!.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
            return res.status(400).json({ error: 'Deadline cannot be in the past' });
        }

        const newGoal = new Goal({
            userId,
            ...fields,
            category: typeof category === 'string' && category.trim() ? category.trim() : undefined,
            description: typeof description === 'string' ? description : undefined,
            // Already saved enough? Then the goal is complete from the start
            status: fields.currentAmount >= fields.targetAmount ? 'Completed' : 'In Progress'
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

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        const goal = await Goal.findOne({ _id: id, userId });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        const wasCompleted = goal.status === 'Completed';

        for (const field of EDITABLE_FIELDS) {
            if (req.body[field] === undefined) continue;
            const value = req.body[field];
            if (field === 'targetAmount' || field === 'currentAmount') goal.set(field, toNumber(value));
            else if (field === 'deadline') goal.set(field, new Date(value));
            else if (field === 'title' && typeof value === 'string') goal.set(field, value.trim());
            else goal.set(field, value);
        }

        const error = validateGoal(goal);
        if (error) {
            return res.status(400).json({ error });
        }

        // Saved enough to reach the target → mark as complete
        if (goal.currentAmount >= goal.targetAmount) {
            goal.status = 'Completed';
        }

        await goal.save();
        if (!wasCompleted && goal.status === 'Completed') {
            await createNotification(userId, {
                type: 'success',
                title: 'Goal achieved',
                message: `Congratulations! You reached your goal "${goal.title}".`,
                link: '/goals'
            });
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

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ error: 'Goal not found' });
        }
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
        const amount = toNumber(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Please enter an amount greater than 0' });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        const goal = await Goal.findOne({ _id: id, userId });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        const wasCompleted = goal.status === 'Completed';
        goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
        
        // Auto-complete if target reached
        if (goal.currentAmount >= goal.targetAmount) {
            goal.status = 'Completed';
        }

        await goal.save();
        if (!wasCompleted && goal.status === 'Completed') {
            await createNotification(userId, {
                type: 'success',
                title: 'Goal achieved',
                message: `Congratulations! You reached your goal "${goal.title}".`,
                link: '/goals'
            });
        }
        res.json({ goal });
    } catch (error) {
        console.error('Error adding progress:', error);
        res.status(500).json({ error: 'Failed to add progress' });
    }
});

export default router;