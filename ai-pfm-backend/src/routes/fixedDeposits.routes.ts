import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middlewares/authMiddleware';
import FixedDeposit from '../schemas/fixedDeposit.schema';

const router = Router();
router.use(authenticateToken);

// Helper: calculate maturity amount and interest earned
const calculateFD = (principal: number, rate: number, tenure: number, tenureUnit: 'months' | 'years') => {
    const tenureMonths = tenureUnit === 'years' ? tenure * 12 : tenure;
    const interestEarned = (principal * rate * tenureMonths) / (100 * 12);
    const maturityAmount = principal + interestEarned;
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);
    return { interestEarned, maturityAmount, maturityDate };
};

// GET /api/fixed-deposits
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fixedDeposits = await FixedDeposit.find({ userId }).sort({ createdAt: -1 });
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

        const { principalAmount, interestRate, tenure, tenureUnit, type, autoRenewal, bank } = req.body;

        if (!principalAmount || !interestRate || !tenure) {
            return res.status(400).json({ error: 'principalAmount, interestRate, and tenure are required' });
        }

        const { interestEarned, maturityAmount, maturityDate } = calculateFD(
            Number(principalAmount), Number(interestRate), Number(tenure), tenureUnit || 'months'
        );

        const accountNumber = `FD-****-${Math.floor(1000 + Math.random() * 9000)}`;
        const fd = await FixedDeposit.create({
            userId,
            bank: bank || 'Your Bank',
            accountNumber,
            principalAmount: Number(principalAmount),
            interestRate: Number(interestRate),
            tenure: Number(tenure),
            tenureUnit: tenureUnit || 'months',
            startDate: new Date(),
            maturityDate,
            maturityAmount,
            interestEarned,
            type: type || 'Standard',
            autoRenewal: autoRenewal || false,
            status: 'active'
        });

        res.status(201).json({ message: 'Fixed deposit created successfully', fixedDeposit: fd });
    } catch (error) {
        console.error('Error creating fixed deposit:', error);
        res.status(500).json({ error: 'Failed to create fixed deposit' });
    }
});

// PUT /api/fixed-deposits/:id - Update status (e.g. mark matured, close early)
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fd = await FixedDeposit.findOne({ _id: req.params.id, userId });
        if (!fd) return res.status(404).json({ error: 'Fixed deposit not found' });

        const updated = await FixedDeposit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Fixed deposit updated', fixedDeposit: updated });
    } catch (error) {
        console.error('Error updating fixed deposit:', error);
        res.status(500).json({ error: 'Failed to update fixed deposit' });
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
