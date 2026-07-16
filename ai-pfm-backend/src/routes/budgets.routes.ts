import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/authMiddleware';
import Budget from '../schemas/budget.schema';
import Transaction from '../schemas/transaction.schema';

const router = Router();

router.get('/smart', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        // 1. Get current month's spending grouped by category
        const currentMonthSpending = await Transaction.aggregate([
            { $match: { userId, type: 'expense', date: { $gte: startOfCurrentMonth } } },
            { $group: { _id: '$category', totalSpent: { $sum: '$amount' } } }
        ]);

        // 2. Get last month's spending grouped by category for trends
        const lastMonthSpending = await Transaction.aggregate([
            { $match: { userId, type: 'expense', date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: '$category', totalSpent: { $sum: '$amount' } } }
        ]);
        const lastMonthMap = new Map(lastMonthSpending.map(s => [s._id, s.totalSpent]));

        // 3. Get existing defined budgets
        let userBudgets = await Budget.find({ userId });

        // 4. If spending exists in a category without a budget, create a baseline
        const existingBudgetCategories = new Set(userBudgets.map(b => b.category));
        const newBudgetsToCreate = [];

        for (const spend of currentMonthSpending) {
            if (!existingBudgetCategories.has(spend._id)) {
                // Auto-generate budget (e.g., 20% higher than current spend, minimum 5000)
                const autoAllocated = Math.max(5000, Math.ceil((spend.totalSpent * 1.2) / 1000) * 1000);
                newBudgetsToCreate.push({
                    userId,
                    category: spend._id,
                    allocatedAmount: autoAllocated
                });
            }
        }

        if (newBudgetsToCreate.length > 0) {
            await Budget.insertMany(newBudgetsToCreate);
            userBudgets = await Budget.find({ userId });
        }

        // 5. Construct the smart budgets response
        const smartBudgets = [];
        let totalIncome = 0;

        // Calculate total income for context
        const incomeAgg = await Transaction.aggregate([
            { $match: { userId, type: 'income', date: { $gte: startOfCurrentMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        if (incomeAgg.length > 0) {
            totalIncome = incomeAgg[0].total;
        } else {
             // Fallback income if no income transactions
             totalIncome = 150000;
        }

        const spendMap = new Map(currentMonthSpending.map(s => [s._id, s.totalSpent]));

        for (const budget of userBudgets) {
            const spentAmount = spendMap.get(budget.category) || 0;
            const remainingAmount = budget.allocatedAmount - spentAmount;
            const percentageUsed = budget.allocatedAmount > 0 
                ? (spentAmount / budget.allocatedAmount) * 100 
                : 100;
            const isOverBudget = spentAmount > budget.allocatedAmount;

            const lastMonth = lastMonthMap.get(budget.category) || 0;
            let change = 0;
            if (lastMonth > 0) {
                change = ((spentAmount - lastMonth) / lastMonth) * 100;
            }

            let aiRecommendation = '';
            if (percentageUsed > 100) {
                aiRecommendation = `CRITICAL: ${budget.category} spending is ${Math.round(percentageUsed - 100)}% over budget. Immediate adjustment needed.`;
            } else if (percentageUsed > 80) {
                aiRecommendation = `Warning: Approaching limit for ${budget.category}. Only ${remainingAmount.toLocaleString()} left.`;
            } else if (percentageUsed > 50) {
                aiRecommendation = `On track. Keep monitoring your ${budget.category} expenses.`;
            } else {
                aiRecommendation = `Excellent control! Consider transferring excess to savings at month-end.`;
            }

            smartBudgets.push({
                _id: budget._id,
                category: budget.category,
                allocatedAmount: budget.allocatedAmount,
                spentAmount,
                remainingAmount,
                percentageUsed: Math.round(percentageUsed),
                aiRecommendation,
                isOverBudget,
                trends: {
                    lastMonth,
                    change: Math.round(change * 10) / 10
                }
            });
        }

        res.json({ budgets: smartBudgets, income: totalIncome });
    } catch (error) {
        console.error('Error fetching smart budgets:', error);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});

// UPDATE a budget manually
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const budgetId = req.params.id;
        const { allocatedAmount } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (typeof allocatedAmount !== 'number' || allocatedAmount < 0) {
            return res.status(400).json({ error: 'Invalid allocated amount' });
        }

        const updatedBudget = await Budget.findOneAndUpdate(
            { _id: budgetId, userId },
            { allocatedAmount },
            { new: true }
        );

        if (!updatedBudget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json({ message: 'Budget updated successfully', budget: updatedBudget });
    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({ error: 'Failed to update budget' });
    }
});

// CREATE a new budget category manually
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { category, allocatedAmount } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!category || typeof category !== 'string') {
            return res.status(400).json({ error: 'Valid category name is required' });
        }
        if (typeof allocatedAmount !== 'number' || allocatedAmount < 0) {
            return res.status(400).json({ error: 'Invalid allocated amount' });
        }

        // Check if budget for this category already exists
        const existingBudget = await Budget.findOne({ userId, category });
        if (existingBudget) {
            return res.status(400).json({ error: `Budget for ${category} already exists` });
        }

        const newBudget = new Budget({
            userId,
            category,
            allocatedAmount
        });

        await newBudget.save();

        res.status(201).json({ message: 'Budget created successfully', budget: newBudget });
    } catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({ error: 'Failed to create budget' });
    }
});

export default router;
