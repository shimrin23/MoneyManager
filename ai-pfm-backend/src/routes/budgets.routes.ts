import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/authMiddleware';
import Budget from '../schemas/budget.schema';
import Transaction from '../schemas/transaction.schema';
import { buildCategoryTips } from '../services/budget-tips';

const router = Router();

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const categoryKey = (c: string) => c.trim().toLowerCase();

// Totals per category, ignoring letter case
const totalsByCategory = (rows: { _id: string; totalSpent: number }[]) => {
    const totals = new Map<string, number>();
    for (const r of rows) totals.set(categoryKey(r._id), (totals.get(categoryKey(r._id)) || 0) + r.totalSpent);
    return totals;
};

// Case-insensitive lookup so "vacation" and "Vacation" are treated as the same budget
const findBudgetByCategory = (userId: string, category: string) =>
    Budget.findOne({ userId, category: { $regex: `^${escapeRegex(category.trim())}$`, $options: 'i' } });

// GET /api/budgets - plain list of the user's budgets (no AI), e.g. for category pickers
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const budgets = await Budget.find({ userId }).sort({ category: 1 });
        res.json({ budgets });
    } catch (error) {
        console.error('Error listing budgets:', error);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});

// GET /api/budgets/tips?category=Food%20%26%20Dining - numbers and tips for one category (the "Optimize" button)
router.get('/tips', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
        if (!category) return res.status(400).json({ error: 'category is required' });

        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const categoryMatch = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };

        const [budget, thisMonth, lastMonthAgg] = await Promise.all([
            findBudgetByCategory(userId, category),
            Transaction.find({ userId, type: 'expense', category: categoryMatch, date: { $gte: startOfCurrentMonth } })
                .select('amount description merchantName')
                .lean(),
            Transaction.aggregate([
                { $match: { userId, type: 'expense', category: categoryMatch, date: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
        ]);

        // Where the money went this month, grouped by merchant or description
        const places = new Map<string, { name: string; amount: number; count: number }>();
        for (const t of thisMonth) {
            const name = (t.merchantName || t.description || 'Other').trim();
            const place = places.get(name.toLowerCase()) || { name, amount: 0, count: 0 };
            place.amount += t.amount;
            place.count += 1;
            places.set(name.toLowerCase(), place);
        }

        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        res.json(buildCategoryTips({
            category: budget?.category || category,
            allocated: budget ? budget.allocatedAmount : null,
            spent: thisMonth.reduce((s, t) => s + t.amount, 0),
            lastMonth: lastMonthAgg[0]?.total || 0,
            topPlaces: [...places.values()].sort((a, b) => b.amount - a.amount).slice(0, 3),
            daysLeft: lastDay - now.getDate() + 1,
        }));
    } catch (error) {
        console.error('Error building category tips:', error);
        res.status(500).json({ error: 'Failed to load tips for this category' });
    }
});

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
        const lastMonthMap = totalsByCategory(lastMonthSpending);

        // 3. Get existing defined budgets
        let userBudgets = await Budget.find({ userId });

        // 4. If spending exists in a category without a budget, create a baseline
        const existingBudgetCategories = new Set(userBudgets.map(b => categoryKey(b.category)));
        const newBudgetsToCreate = [];

        for (const spend of currentMonthSpending) {
            if (!existingBudgetCategories.has(categoryKey(spend._id))) {
                existingBudgetCategories.add(categoryKey(spend._id));
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
        }

        const spendMap = totalsByCategory(currentMonthSpending);

        for (const budget of userBudgets) {
            const spentAmount = spendMap.get(categoryKey(budget.category)) || 0;
            const remainingAmount = budget.allocatedAmount - spentAmount;
            const percentageUsed = budget.allocatedAmount > 0 
                ? (spentAmount / budget.allocatedAmount) * 100 
                : 100;
            const isOverBudget = spentAmount > budget.allocatedAmount;

            const lastMonth = lastMonthMap.get(categoryKey(budget.category)) || 0;
            let change = 0;
            if (lastMonth > 0) {
                change = ((spentAmount - lastMonth) / lastMonth) * 100;
            }

            smartBudgets.push({
                _id: budget._id,
                category: budget.category,
                allocatedAmount: budget.allocatedAmount,
                spentAmount,
                remainingAmount,
                percentageUsed: Math.round(percentageUsed),
                aiRecommendation: "", // Will be filled by Gemini below
                isOverBudget,
                alertThreshold: budget.alertThreshold ?? null,
                alertTriggered: budget.alertThreshold != null && spentAmount > 0 && percentageUsed >= budget.alertThreshold,
                trends: {
                    lastMonth,
                    change: Math.round(change * 10) / 10
                }
            });
        }

        // 6. Generate real AI Recommendations via Gemini
        const { FinancialAgent } = await import('../ai/agent');
        const agent = new FinancialAgent();
        let aiRecommendations: Record<string, string> = {};
        
        if (smartBudgets.length > 0) {
            try {
                const prompt = `Analyze this budget data for a user:\n${JSON.stringify(smartBudgets.map(b => ({
                    category: b.category,
                    allocated: b.allocatedAmount,
                    spent: b.spentAmount,
                    percentageUsed: b.percentageUsed,
                    trendChange: b.trends.change
                })), null, 2)}\n\nFor each category, provide a concise, personalized 1-sentence financial recommendation. Do not use generic text. Return exactly a JSON object where keys are the category names and values are the string recommendations.\nExample: { "Food": "Since your food spending is up 10%, consider cooking at home this weekend." }`;
                
                const responseString = await agent.generateResearch(prompt);
                aiRecommendations = JSON.parse(responseString.replace(/```json/g, '').replace(/```/g, '').trim());
            } catch (err) {
                console.error("AI budget generation failed:", err);
            }
        }

        // Merge AI recommendations back into the response
        for (const budget of smartBudgets) {
            budget.aiRecommendation = aiRecommendations[budget.category] || "AI analysis is currently unavailable for this category.";
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
        const { allocatedAmount } = req.body;
        const category = typeof req.body.category === 'string' ? req.body.category.trim() : '';

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!category) {
            return res.status(400).json({ error: 'Valid category name is required' });
        }
        if (typeof allocatedAmount !== 'number' || !Number.isFinite(allocatedAmount) || allocatedAmount < 0) {
            return res.status(400).json({ error: 'Invalid allocated amount' });
        }

        // Check if budget for this category already exists (ignoring letter case)
        const existingBudget = await findBudgetByCategory(userId, category);
        if (existingBudget) {
            return res.status(400).json({ error: `Budget for ${existingBudget.category} already exists` });
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

// SET or CLEAR a budget alert (alertThreshold: 1-100, or null to remove)
router.patch('/:id/alert', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { alertThreshold } = req.body;
        const clearing = alertThreshold === null;
        if (!clearing && (typeof alertThreshold !== 'number' || !Number.isFinite(alertThreshold) || alertThreshold < 1 || alertThreshold > 100)) {
            return res.status(400).json({ error: 'Alert level must be between 1 and 100 percent' });
        }

        const updatedBudget = await Budget.findOneAndUpdate(
            { _id: req.params.id, userId },
            clearing ? { $unset: { alertThreshold: 1 } } : { alertThreshold },
            { new: true }
        );
        if (!updatedBudget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json({ message: clearing ? 'Budget alert removed' : 'Budget alert set', budget: updatedBudget });
    } catch (error) {
        console.error('Error setting budget alert:', error);
        res.status(500).json({ error: 'Failed to set budget alert' });
    }
});

// DELETE a budget category
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const budget = await Budget.findOne({ _id: req.params.id, userId });
        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        // A category with spending this month would be re-created automatically on the next load
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const hasSpendingThisMonth = await Transaction.exists({
            userId,
            type: 'expense',
            category: { $regex: `^${escapeRegex(budget.category)}$`, $options: 'i' },
            date: { $gte: startOfCurrentMonth },
        });
        if (hasSpendingThisMonth) {
            return res.status(400).json({
                error: `${budget.category} has spending this month, so it can't be removed. You can change its limit instead.`,
            });
        }

        await budget.deleteOne();
        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ error: 'Failed to delete budget' });
    }
});

export default router;
