import { Router } from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CreditCard from '../schemas/creditcard.schema';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

const toNumber = (value: unknown) => (value === '' || value === null || value === undefined ? NaN : Number(value));
const round2 = (n: number) => Math.round(n * 100) / 100;

interface CardFields {
    cardName: string;
    provider: string;
    lastFour?: string;
    creditLimit: number;
    currentBalance: number;
    minPaymentDue: number;
    dueDate: Date;
    statementDate?: Date;
}

// Returns an error message, or null when the card values make sense together
const validateCard = (card: CardFields) => {
    if (!card.cardName) return 'Card name is required';
    if (!card.provider) return 'Provider is required';
    if (card.lastFour && !/^\d{4}$/.test(card.lastFour)) return 'Last 4 digits must be exactly 4 numbers';
    if (!Number.isFinite(card.creditLimit) || card.creditLimit <= 0) return 'Credit limit must be more than 0';
    if (!Number.isFinite(card.currentBalance) || card.currentBalance < 0) return 'Current balance cannot be negative';
    if (card.currentBalance > card.creditLimit) return 'Current balance cannot be more than the credit limit';
    if (!Number.isFinite(card.minPaymentDue) || card.minPaymentDue < 0) return 'Minimum payment cannot be negative';
    if (card.minPaymentDue > card.currentBalance) return 'Minimum payment cannot be more than the current balance';
    if (!(card.dueDate instanceof Date) || isNaN(card.dueDate.getTime())) return 'A valid payment due date is required';
    if (card.statementDate && isNaN(card.statementDate.getTime())) return 'Statement date is not valid';
    return null;
};

// Card fields from a request body, falling back to `current` for anything not sent
const readCardFields = (body: any, current?: CardFields): CardFields => {
    const text = (key: 'cardName' | 'provider' | 'lastFour') =>
        body[key] !== undefined ? String(body[key] ?? '').trim() : current?.[key] ?? '';
    const number = (key: 'creditLimit' | 'currentBalance' | 'minPaymentDue', fallback: number) =>
        body[key] !== undefined && body[key] !== '' ? toNumber(body[key]) : current?.[key] ?? fallback;
    const date = (key: 'dueDate' | 'statementDate') =>
        body[key] ? new Date(body[key]) : current?.[key];

    return {
        cardName: text('cardName'),
        provider: text('provider'),
        lastFour: text('lastFour') || undefined,
        creditLimit: number('creditLimit', NaN),
        currentBalance: number('currentBalance', 0),
        minPaymentDue: number('minPaymentDue', 0),
        dueDate: date('dueDate') as Date,
        statementDate: date('statementDate'),
    };
};

const findUserCard = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        res.status(404).json({ error: 'Credit card not found' });
        return null;
    }
    const card = await CreditCard.findOne({ _id: id, userId });
    if (!card) {
        res.status(404).json({ error: 'Credit card not found' });
        return null;
    }
    return card;
};

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

// GET /api/credit-cards/summary - Get credit card summary
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const cards = await CreditCard.find({ userId });

        const summary = {
            totalCards: cards.length,
            totalCreditLimit: cards.reduce((sum, card) => sum + card.creditLimit, 0),
            totalBalance: cards.reduce((sum, card) => sum + card.currentBalance, 0),
            totalAvailableCredit: cards.reduce((sum, card) => sum + (card.creditLimit - card.currentBalance), 0),
            totalMinPaymentDue: cards.reduce((sum, card) => sum + card.minPaymentDue, 0),
            averageUtilization: cards.length > 0
                ? (cards.reduce((sum, card) => sum + (card.creditLimit > 0 ? card.currentBalance / card.creditLimit : 0), 0) / cards.length) * 100
                : 0
        };

        res.json({ summary });
    } catch (error) {
        console.error('Error fetching credit card summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

// POST /api/credit-cards - Create new credit card
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const fields = readCardFields(req.body);
        if (!fields.statementDate) fields.statementDate = new Date();

        const error = validateCard(fields);
        if (error) {
            return res.status(400).json({ error });
        }

        const newCard = new CreditCard({
            userId,
            ...fields,
            availableLimit: fields.creditLimit - fields.currentBalance,
        });

        await newCard.save();
        res.status(201).json({ card: newCard });
    } catch (error) {
        console.error('Error creating credit card:', error);
        res.status(500).json({ error: 'Failed to create credit card' });
    }
});

// PUT /api/credit-cards/:id - Update credit card (only the card's own fields)
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const card = await findUserCard(req, res);
        if (!card) return;

        const fields = readCardFields(req.body, card.toObject() as CardFields);
        const error = validateCard(fields);
        if (error) {
            return res.status(400).json({ error });
        }

        card.set({ ...fields, lastFour: fields.lastFour, availableLimit: fields.creditLimit - fields.currentBalance });
        await card.save();
        res.json({ card });
    } catch (error) {
        console.error('Error updating credit card:', error);
        res.status(500).json({ error: 'Failed to update credit card' });
    }
});

// DELETE /api/credit-cards/:id - Delete credit card
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const card = await findUserCard(req, res);
        if (!card) return;

        await card.deleteOne();
        res.json({ message: 'Credit card deleted successfully' });
    } catch (error) {
        console.error('Error deleting credit card:', error);
        res.status(500).json({ error: 'Failed to delete credit card' });
    }
});

// POST /api/credit-cards/:id/payment - Record credit card payment
router.post('/:id/payment', async (req: Request, res: Response) => {
    try {
        const amount = toNumber(req.body.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Please enter a payment amount greater than 0' });
        }

        const card = await findUserCard(req, res);
        if (!card) return;

        if (card.currentBalance <= 0) {
            return res.status(400).json({ error: 'This card has no balance to pay' });
        }
        if (amount > card.currentBalance + 0.01) {
            return res.status(400).json({ error: `Payment is more than the current balance (Rs. ${card.currentBalance.toLocaleString()})` });
        }

        // Reduce balance and increase available limit
        card.currentBalance = round2(Math.max(card.currentBalance - amount, 0));
        card.availableLimit = card.creditLimit - card.currentBalance;

        // Reduce minimum payment due
        card.minPaymentDue = round2(Math.max(card.minPaymentDue - amount, 0));
        card.activity.push({ type: 'payment', amount, date: new Date(), note: req.body.note });

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
        const amount = toNumber(req.body.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Please enter a charge amount greater than 0' });
        }

        const card = await findUserCard(req, res);
        if (!card) return;

        // Check if charge exceeds available limit
        const available = card.creditLimit - card.currentBalance;
        if (amount > available) {
            return res.status(400).json({ error: `Charge is more than the available limit (Rs. ${available.toLocaleString()})` });
        }

        // Increase balance and decrease available limit
        card.currentBalance = round2(card.currentBalance + amount);
        card.availableLimit = card.creditLimit - card.currentBalance;

        // Increase minimum payment (typically 2-3% of balance)
        card.minPaymentDue = round2(Math.max(card.currentBalance * 0.02, card.minPaymentDue));
        card.activity.push({ type: 'charge', amount, date: new Date(), note: req.body.note });

        await card.save();
        res.json({ card });
    } catch (error) {
        console.error('Error adding charge:', error);
        res.status(500).json({ error: 'Failed to add charge' });
    }
});

export default router;
