import { Router, Request, Response } from 'express';
import Lease from '../schemas/lease.schema';
import { AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

// GET all leases for user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const leases = await Lease.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
        res.json({ leases });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching leases', error: error.message });
    }
});

// POST new lease
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { assetName, assetType, lessor, principalAmount, monthlyPayment, interestRate, tenureMonths, startDate, icon } = req.body;
        
        const start = new Date(startDate);
        const end = new Date(start);
        end.setMonth(start.getMonth() + Number(tenureMonths));

        const now = new Date();
        let remainingMonths = Number(tenureMonths);
        
        if (now > start) {
            const monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
            remainingMonths = Math.max(0, Number(tenureMonths) - monthsPassed);
        }

        const outstandingBalance = Number(principalAmount) * (remainingMonths / Number(tenureMonths));
        
        const nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, start.getDate());

        const newLease = new Lease({
            userId: req.user?.userId,
            assetName,
            assetType,
            lessor,
            principalAmount: Number(principalAmount),
            monthlyPayment: Number(monthlyPayment),
            interestRate: Number(interestRate),
            tenureMonths: Number(tenureMonths),
            remainingMonths,
            outstandingBalance,
            startDate: start,
            endDate: end,
            nextPaymentDate,
            icon: icon || '📄'
        });

        await newLease.save();
        res.status(201).json({ message: 'Lease created successfully', lease: newLease });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating lease', error: error.message });
    }
});

// PUT update lease status
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const lease = await Lease.findOneAndUpdate(
            { _id: req.params.id, userId: req.user?.userId },
            { status },
            { new: true }
        );
        if (!lease) {
            return res.status(404).json({ message: 'Lease not found' });
        }
        res.json({ message: 'Lease updated', lease });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating lease', error: error.message });
    }
});

// DELETE lease
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const lease = await Lease.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });
        if (!lease) {
            return res.status(404).json({ message: 'Lease not found' });
        }
        res.json({ message: 'Lease deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting lease', error: error.message });
    }
});

export default router;
