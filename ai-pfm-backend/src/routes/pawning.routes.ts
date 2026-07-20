import { Router, Request, Response } from 'express';
import Pawning from '../schemas/pawning.schema';
import { AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

// GET all pawning items for user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const pawning = await Pawning.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
        
        // Dynamically update days remaining and total interest accrued on fetch
        const now = new Date();
        const updatedPawning = await Promise.all(pawning.map(async (item) => {
            if (item.status === 'active') {
                const diffTime = Math.max(0, item.redemptionDate.getTime() - now.getTime());
                item.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                const monthsElapsed = Math.max(0, (now.getFullYear() - item.pledgeDate.getFullYear()) * 12 + (now.getMonth() - item.pledgeDate.getMonth()));
                item.totalInterestAccrued = item.monthlyInterest * monthsElapsed;
                item.totalDue = item.loanAmount + item.totalInterestAccrued;
                
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
        const { itemDescription, itemType, pledgedValue, loanAmount, interestRate, pledgeDate, redemptionDate, branch, ticketNumber, icon } = req.body;
        
        const start = new Date(pledgeDate);
        const end = new Date(redemptionDate);
        
        const monthlyInterest = (Number(loanAmount) * (Number(interestRate) / 100)) / 12;
        
        const now = new Date();
        let daysRemaining = 0;
        let totalInterestAccrued = 0;
        
        if (now < end) {
            const diffTime = end.getTime() - now.getTime();
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const monthsElapsed = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
        totalInterestAccrued = monthlyInterest * monthsElapsed;
        
        const totalDue = Number(loanAmount) + totalInterestAccrued;

        const newPawning = new Pawning({
            userId: req.user?.userId,
            itemDescription,
            itemType,
            icon: icon || '💍',
            pledgedValue: Number(pledgedValue),
            loanAmount: Number(loanAmount),
            interestRate: Number(interestRate),
            monthlyInterest,
            pledgeDate: start,
            redemptionDate: end,
            branch,
            ticketNumber,
            daysRemaining,
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
        const item = await Pawning.findOneAndUpdate(
            { _id: req.params.id, userId: req.user?.userId },
            { status },
            { new: true }
        );
        if (!item) {
            return res.status(404).json({ message: 'Pawning item not found' });
        }
        res.json({ message: 'Pawning item updated', pawning: item });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating pawning item', error: error.message });
    }
});

// DELETE pawning item
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const item = await Pawning.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });
        if (!item) {
            return res.status(404).json({ message: 'Pawning item not found' });
        }
        res.json({ message: 'Pawning item deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting pawning item', error: error.message });
    }
});

export default router;
