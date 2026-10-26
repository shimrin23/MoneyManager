import { Router, Response } from 'express';
import Pawning from '../schemas/pawning.schema';
import { AuthRequest } from '../middlewares/authMiddleware';
import {
    PAWN_STATUSES,
    pawnDaysRemaining,
    pawnInterest,
    toNumber,
    validatePawnInput,
} from '../services/fd-lease-pawning.service';

const router = Router();

// GET all pawning items for user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const pawning = await Pawning.find({ userId }).sort({ createdAt: -1 });

        // Dynamically update days remaining and total interest accrued on fetch.
        // Days go negative once the redemption date has passed, so the page can show the item as overdue.
        const now = new Date();
        const updatedPawning = await Promise.all(pawning.map(async (item) => {
            if (item.status === 'active') {
                item.daysRemaining = pawnDaysRemaining(item.redemptionDate, now);
                const { totalInterestAccrued, totalDue } = pawnInterest(item.loanAmount, item.interestRate, item.pledgeDate, now);
                item.totalInterestAccrued = totalInterestAccrued;
                item.totalDue = totalDue;

                await item.save();
            }
            return item;
        }));

        res.json({ pawning: updatedPawning });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching pawning items', error: error.message });
    }
});

// POST new pawning item
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const validationError = validatePawnInput(req.body);
        if (validationError) return res.status(400).json({ error: validationError });

        const { itemDescription, itemType, branch, ticketNumber, icon } = req.body;
        const pledgedValue = toNumber(req.body.pledgedValue);
        const loanAmount = toNumber(req.body.loanAmount);
        const interestRate = toNumber(req.body.interestRate);
        const start = new Date(req.body.pledgeDate);
        const end = new Date(req.body.redemptionDate);

        const now = new Date();
        const { monthlyInterest, totalInterestAccrued, totalDue } = pawnInterest(loanAmount, interestRate, start, now);

        const userId = req.user?.id || req.user?.userId;

        // A pawn ticket number identifies one pledge, so the same user can't add it twice (any letter case)
        const ticket = ticketNumber.trim();
        const existing = await Pawning.findOne({
            userId,
            ticketNumber: { $regex: `^${ticket.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        });
        if (existing) {
            return res.status(409).json({
                error: `You already have a pawn item with ticket ${existing.ticketNumber} (${existing.itemDescription}).`
            });
        }

        const newPawning = new Pawning({
            userId,
            itemDescription: itemDescription.trim(),
            itemType,
            icon: icon || '💍',
            pledgedValue,
            loanAmount,
            interestRate,
            monthlyInterest,
            pledgeDate: start,
            redemptionDate: end,
            branch: branch.trim(),
            ticketNumber: ticketNumber.trim(),
            daysRemaining: pawnDaysRemaining(end, now),
            totalInterestAccrued,
            totalDue
        });

        await newPawning.save();
        res.status(201).json({ message: 'Pawning item created successfully', pawning: newPawning });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating pawning item', error: error.message });
    }
});

// PUT update pawning status
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        if (!PAWN_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid pawning status' });

        const userId = req.user?.id || req.user?.userId;
        const item = await Pawning.findOneAndUpdate(
            { _id: req.params.id, userId },
            { status },
            { new: true }
        );
        if (!item) {
            return res.status(404).json({ error: 'Pawning item not found' });
        }
        res.json({ message: 'Pawning item updated', pawning: item });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating pawning item', error: error.message });
    }
});

// DELETE pawning item
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const item = await Pawning.findOneAndDelete({ _id: req.params.id, userId });
        if (!item) {
            return res.status(404).json({ message: 'Pawning item not found' });
        }
        res.json({ message: 'Pawning item deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting pawning item', error: error.message });
    }
});

export default router;
