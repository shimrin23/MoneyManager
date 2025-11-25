import { Router } from 'express';
import { Request, Response } from 'express';
import CreditCard from '../schemas/creditcard.schema';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/credit-cards - Get all credit cards for user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const cards = await CreditCard.find({ userId }).sort({ createdAt: -1 });
        
        // Calculate available limit for each card
        const cardsWithCalculations = cards.map(card => {
            const availableLimit = card.creditLimit - card.currentBalance;
            return {
                ...card.toObject(),
                availableLimit
            };
        });
        
        res.json({ cards: cardsWithCalculations });
    } catch (error) {
        console.error('Error fetching credit cards:', error);
        res.status(500).json({ error: 'Failed to fetch credit cards' });
    }
});

// POST /api/credit-cards - Create new credit card
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { cardName, provider, creditLimit, currentBalance, minPaymentDue, dueDate, statementDate } = req.body;

        if (!cardName || !provider || !creditLimit || !dueDate) {
            return res.status(400).json({ error: 'Card name, provider, credit limit, and due date are required' });
        }

        const availableLimit = Number(creditLimit) - (Number(currentBalance) || 0);

        const newCard = new CreditCard({
            userId,
            cardName,
            provider,
            creditLimit: Number(creditLimit),
            currentBalance: Number(currentBalance) || 0,
            availableLimit,
            minPaymentDue: Number(minPaymentDue) || 0,
            dueDate: new Date(dueDate),
            statementDate: statementDate ? new Date(statementDate) : new Date()
        });

        await newCard.save();
        res.status(201).json({ card: newCard });
    } catch (error) {
        console.error('Error creating credit card:', error);
        res.status(500).json({ error: 'Failed to create credit card' });
    }
});

// PUT /api/credit-cards/:id - Update credit card
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const updates = req.body;

        // Recalculate available limit if balance or limit changes
        if (updates.currentBalance !== undefined || updates.creditLimit !== undefined) {
            const card = await CreditCard.findOne({ _id: id, userId });
            if (card) {
                const newBalance = updates.currentBalance !== undefined ? updates.currentBalance : card.currentBalance;
                const newLimit = updates.creditLimit !== undefined ? updates.creditLimit : card.creditLimit;
                updates.availableLimit = newLimit - newBalance;
            }
        }

        const card = await CreditCard.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true }
        );

        if (!card) {
            return res.status(404).json({ error: 'Credit card not found' });
        }

        res.json({ card });
    } catch (error) {
        console.error('Error updating credit card:', error);
        res.status(500).json({ error: 'Failed to update credit card' });
    }
});

// DELETE /api/credit-cards/:id - Delete credit card
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        const card = await CreditCard.findOneAndDelete({ _id: id, userId });
        if (!card) {
            return res.status(404).json({ error: 'Credit card not found' });
        }

        res.json({ message: 'Credit card deleted successfully' });
    } catch (error) {
        console.error('Error deleting credit card:', error);
        res.status(500).json({ error: 'Failed to delete credit card' });
    }
});

// POST /api/credit-cards/:id/payment - Record credit card payment
router.post('/:id/payment', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid payment amount is required' });
        }

        const card = await CreditCard.findOne({ _id: id, userId });
        if (!card) {
            return res.status(404).json({ error: 'Credit card not found' });
        }

        // Reduce balance and increase available limit
        card.currentBalance = Math.max(card.currentBalance - Number(amount), 0);
        card.availableLimit = card.creditLimit - card.currentBalance;
        
        // Reduce minimum payment due
        card.minPaymentDue = Math.max(card.minPaymentDue - Number(amount), 0);

        await card.save();
        res.json({ card });
    } catch (error) {
        console.error('Error making payment:', error);
        res.status(500).json({ error: 'Failed to make payment' });
    }
});

// POST /api/credit-cards/:id/charge - Add charge to credit card
router.post('/:id/charge', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid charge amount is required' });
        }

        const card = await CreditCard.findOne({ _id: id, userId });
        if (!card) {
            return res.status(404).json({ error: 'Credit card not found' });
        }

        // Check if charge exceeds available limit
        if (Number(amount) > card.availableLimit) {
            return res.status(400).json({ error: 'Charge exceeds available credit limit' });
        }

        // Increase balance and decrease available limit
        card.currentBalance = card.currentBalance + Number(amount);
        card.availableLimit = card.creditLimit - card.currentBalance;
        
        // Increase minimum payment (typically 2-3% of balance)
        card.minPaymentDue = Math.max(card.currentBalance * 0.02, card.minPaymentDue);

        await card.save();
        res.json({ card });
    } catch (error) {
        console.error('Error adding charge:', error);
        res.status(500).json({ error: 'Failed to add charge' });
    }
});

// GET /api/credit-cards/summary - Get credit card summary
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const cards = await CreditCard.find({ userId });

        const summary = {
            totalCards: cards.length,
            totalCreditLimit: cards.reduce((sum, card) => sum + card.creditLimit, 0),
            totalBalance: cards.reduce((sum, card) => sum + card.currentBalance, 0),
            totalAvailableCredit: cards.reduce((sum, card) => sum + (card.creditLimit - card.currentBalance), 0),
            totalMinPaymentDue: cards.reduce((sum, card) => sum + card.minPaymentDue, 0),
            averageUtilization: cards.length > 0 
                ? (cards.reduce((sum, card) => sum + (card.currentBalance / card.creditLimit), 0) / cards.length) * 100 
                : 0
        };

        res.json({ summary });
    } catch (error) {
        console.error('Error fetching credit card summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

export default router;