import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middlewares/authMiddleware';
import FixedDeposit from '../schemas/fixedDeposit.schema';
import {
    applyMaturity,
    calculateFD,
    fdTenureMonths,
    renewFD,
    toNumber,
    validateFDInput,
} from '../services/fd-lease-pawning.service';

const router = Router();
router.use(authenticateToken);

// GET /api/fixed-deposits
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fixedDeposits = await FixedDeposit.find({ userId }).sort({ createdAt: -1 });

        // FDs whose maturity date has passed become "matured" (or roll over when auto-renewal is on)
        const now = new Date();
        await Promise.all(fixedDeposits.map(async (fd) => {
            const changes = applyMaturity(fd, now);
            if (changes) {
                fd.set(changes);
                await fd.save();
            }
        }));

        res.json({ fixedDeposits });
    } catch (error) {
        console.error('Error fetching fixed deposits:', error);
        res.status(500).json({ error: 'Failed to fetch fixed deposits' });
    }
});

// POST /api/fixed-deposits
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const validationError = validateFDInput(req.body);
        if (validationError) return res.status(400).json({ error: validationError });

        const { type, autoRenewal, bank } = req.body;
        const principalAmount = toNumber(req.body.principalAmount);
        const interestRate = toNumber(req.body.interestRate);
        const tenure = toNumber(req.body.tenure);
        const tenureUnit = req.body.tenureUnit || 'months';
        const startDate = new Date();

        const { interestEarned, maturityAmount, maturityDate } = calculateFD(
            principalAmount, interestRate, fdTenureMonths(tenure, tenureUnit), startDate
        );

        const accountNumber = `FD-****-${Math.floor(1000 + Math.random() * 9000)}`;
        const fd = await FixedDeposit.create({
            userId,
            bank: typeof bank === 'string' && bank.trim() ? bank.trim() : 'Your Bank',
            accountNumber,
            principalAmount,
            interestRate,
            tenure,
            tenureUnit,
            startDate,
            maturityDate,
            maturityAmount,
            interestEarned,
            type: type || 'Standard',
            autoRenewal: autoRenewal === true,
            status: 'active'
        });

        res.status(201).json({ message: 'Fixed deposit created successfully', fixedDeposit: fd });
    } catch (error) {
        console.error('Error creating fixed deposit:', error);
        res.status(500).json({ error: 'Failed to create fixed deposit' });
    }
});

// PUT /api/fixed-deposits/:id - Withdraw early, or change bank name / auto-renewal
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fd = await FixedDeposit.findOne({ _id: req.params.id, userId });
        if (!fd) return res.status(404).json({ error: 'Fixed deposit not found' });

        const { status, autoRenewal, bank } = req.body;
        if (status !== undefined) {
            // Maturing happens by date and renewing has its own endpoint, so only early withdrawal is allowed here
            if (status !== 'prematurely-closed') return res.status(400).json({ error: 'Only early withdrawal can be set here' });
            if (fd.status !== 'active') return res.status(400).json({ error: 'Only an active FD can be withdrawn early' });
            fd.status = 'prematurely-closed';
        }
        if (autoRenewal !== undefined) {
            if (typeof autoRenewal !== 'boolean') return res.status(400).json({ error: 'autoRenewal must be true or false' });
            fd.autoRenewal = autoRenewal;
        }
        if (bank !== undefined) {
            if (typeof bank !== 'string' || !bank.trim()) return res.status(400).json({ error: 'Bank name cannot be empty' });
            fd.bank = bank.trim();
        }

        await fd.save();
        res.json({ message: 'Fixed deposit updated', fixedDeposit: fd });
    } catch (error) {
        console.error('Error updating fixed deposit:', error);
        res.status(500).json({ error: 'Failed to update fixed deposit' });
    }
});

// POST /api/fixed-deposits/:id/renew - Start a new term from today with the maturity amount as principal
router.post('/:id/renew', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fd = await FixedDeposit.findOne({ _id: req.params.id, userId });
        if (!fd) return res.status(404).json({ error: 'Fixed deposit not found' });
        if (fd.status !== 'matured') return res.status(400).json({ error: 'Only a matured FD can be renewed' });

        fd.set(renewFD(fd, new Date()));
        await fd.save();
        res.json({ message: 'Fixed deposit renewed', fixedDeposit: fd });
    } catch (error) {
        console.error('Error renewing fixed deposit:', error);
        res.status(500).json({ error: 'Failed to renew fixed deposit' });
    }
});

// DELETE /api/fixed-deposits/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fd = await FixedDeposit.findOne({ _id: req.params.id, userId });
        if (!fd) return res.status(404).json({ error: 'Fixed deposit not found' });

        await FixedDeposit.findByIdAndDelete(req.params.id);
        res.json({ message: 'Fixed deposit deleted' });
    } catch (error) {
        console.error('Error deleting fixed deposit:', error);
        res.status(500).json({ error: 'Failed to delete fixed deposit' });
    }
});

export default router;
