import { Router, Response } from 'express';
import Lease, { ILease } from '../schemas/lease.schema';
import { AuthRequest } from '../middlewares/authMiddleware';
import {
    LEASE_STATUSES,
    addMonths,
    installmentsDue,
    leaseProgress,
    toNumber,
    validateLeaseInput,
} from '../services/fd-lease-pawning.service';

const router = Router();

// Leases added before payments were tracked have no paidMonths; work it out from what was saved
const paidMonthsOf = (lease: ILease) =>
    lease.paidMonths ?? lease.tenureMonths - lease.remainingMonths;

// Recalculates remaining months, outstanding balance and next due date from the installments paid
const syncProgress = (lease: ILease) => {
    const paid = lease.status === 'completed' ? lease.tenureMonths : paidMonthsOf(lease);
    lease.set(leaseProgress(lease.principalAmount, lease.tenureMonths, lease.startDate, paid));
};

// GET all leases for user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const leases = await Lease.find({ userId }).sort({ createdAt: -1 });

        await Promise.all(leases.map(async (lease) => {
            syncProgress(lease);
            if (lease.isModified()) await lease.save();
        }));

        res.json({ leases });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching leases', error: error.message });
    }
});

// POST new lease
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const validationError = validateLeaseInput(req.body);
        if (validationError) return res.status(400).json({ error: validationError });

        const { assetName, assetType, lessor, icon } = req.body;
        const principalAmount = toNumber(req.body.principalAmount);
        const tenureMonths = toNumber(req.body.tenureMonths);
        const start = new Date(req.body.startDate);

        // Installments already due before today are counted as paid
        const progress = leaseProgress(principalAmount, tenureMonths, start, installmentsDue(start, tenureMonths, new Date()));

        const userId = req.user?.id || req.user?.userId;
        const newLease = new Lease({
            userId,
            assetName: assetName.trim(),
            assetType,
            lessor: lessor.trim(),
            principalAmount,
            monthlyPayment: toNumber(req.body.monthlyPayment),
            interestRate: toNumber(req.body.interestRate),
            tenureMonths,
            ...progress,
            status: progress.remainingMonths === 0 ? 'completed' : 'active',
            startDate: start,
            endDate: addMonths(start, tenureMonths),
            icon: icon || '📄'
        });

        await newLease.save();
        res.status(201).json({ message: 'Lease created successfully', lease: newLease });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating lease', error: error.message });
    }
});

// POST record one monthly payment
router.post('/:id/payments', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const lease = await Lease.findOne({ _id: req.params.id, userId });
        if (!lease) return res.status(404).json({ error: 'Lease not found' });
        if (lease.status !== 'active') return res.status(400).json({ error: 'Payments can only be recorded for an active lease' });

        const amount = req.body.amount === undefined ? lease.monthlyPayment : toNumber(req.body.amount);
        if (isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'Payment amount must be greater than 0' });

        lease.payments.push({ amount, date: new Date() });
        lease.set(leaseProgress(lease.principalAmount, lease.tenureMonths, lease.startDate, paidMonthsOf(lease) + 1));
        if (lease.remainingMonths === 0) lease.status = 'completed';

        await lease.save();
        res.json({ message: 'Payment recorded', lease });
    } catch (error: any) {
        res.status(500).json({ message: 'Error recording payment', error: error.message });
    }
});

// PUT update lease status
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        if (!LEASE_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid lease status' });

        const userId = req.user?.id || req.user?.userId;
        const lease = await Lease.findOne({ _id: req.params.id, userId });
        if (!lease) {
            return res.status(404).json({ error: 'Lease not found' });
        }

        lease.status = status;
        // A completed lease has nothing left to pay
        syncProgress(lease);
        await lease.save();
        res.json({ message: 'Lease updated', lease });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating lease', error: error.message });
    }
});

// DELETE lease
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const lease = await Lease.findOneAndDelete({ _id: req.params.id, userId });
        if (!lease) {
            return res.status(404).json({ message: 'Lease not found' });
        }
        res.json({ message: 'Lease deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting lease', error: error.message });
    }
});

export default router;
