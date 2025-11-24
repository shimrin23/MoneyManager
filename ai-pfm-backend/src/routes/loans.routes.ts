import { Router } from 'express';
import { Request, Response } from 'express';
import Loan from '../schemas/loan.schema';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/loans - Get all loans for user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const loans = await Loan.find({ userId }).sort({ createdAt: -1 });
        res.json({ loans });
    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

// POST /api/loans - Create new loan
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { type, provider, totalAmount, remainingAmount, interestRate, monthlyInstallment, nextDueDate } = req.body;

        if (!type || !provider || !totalAmount || !interestRate || !monthlyInstallment || !nextDueDate) {
            return res.status(400).json({ error: 'All loan fields are required' });
        }

        const newLoan = new Loan({
            userId,
            type,
            provider,
            totalAmount: Number(totalAmount),
            remainingAmount: Number(remainingAmount) || Number(totalAmount),
            interestRate: Number(interestRate),
            monthlyInstallment: Number(monthlyInstallment),
            nextDueDate: new Date(nextDueDate),
            status: 'Active'
        });

        await newLoan.save();
        res.status(201).json({ loan: newLoan });
    } catch (error) {
        console.error('Error creating loan:', error);
        res.status(500).json({ error: 'Failed to create loan' });
    }
});

// PUT /api/loans/:id - Update loan
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        const updates = req.body;

        const loan = await Loan.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true }
        );

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        res.json({ loan });
    } catch (error) {
        console.error('Error updating loan:', error);
        res.status(500).json({ error: 'Failed to update loan' });
    }
});

// DELETE /api/loans/:id - Delete loan
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;

        const loan = await Loan.findOneAndDelete({ _id: id, userId });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        res.json({ message: 'Loan deleted successfully' });
    } catch (error) {
        console.error('Error deleting loan:', error);
        res.status(500).json({ error: 'Failed to delete loan' });
    }
});

// POST /api/loans/:id/payment - Make loan payment
router.post('/:id/payment', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid payment amount is required' });
        }

        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        loan.remainingAmount = Math.max(loan.remainingAmount - Number(amount), 0);
        
        // Auto-close if fully paid
        if (loan.remainingAmount === 0) {
            loan.status = 'Closed';
        }

        // Update next due date (simple logic - add 1 month)
        const nextDue = new Date(loan.nextDueDate);
        nextDue.setMonth(nextDue.getMonth() + 1);
        loan.nextDueDate = nextDue;

        await loan.save();
        res.json({ loan });
    } catch (error) {
        console.error('Error making payment:', error);
        res.status(500).json({ error: 'Failed to make payment' });
    }
});

// GET /api/loans/strategies - Get debt payoff strategies
router.get('/strategies', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const loans = await Loan.find({ userId, status: 'Active' });

        if (loans.length === 0) {
            return res.json({ strategies: [] });
        }

        // Calculate Debt Snowball (smallest balance first)
        const snowballLoans = [...loans].sort((a, b) => a.remainingAmount - b.remainingAmount);
        const snowballMonths = calculatePayoffTime(snowballLoans, 'snowball');
        const snowballInterest = calculateTotalInterest(snowballLoans, snowballMonths);

        // Calculate Debt Avalanche (highest interest first)
        const avalancheLoans = [...loans].sort((a, b) => b.interestRate - a.interestRate);
        const avalancheMonths = calculatePayoffTime(avalancheLoans, 'avalanche');
        const avalancheInterest = calculateTotalInterest(avalancheLoans, avalancheMonths);

        const strategies = [
            {
                name: 'Debt Snowball',
                description: 'Pay off smallest debts first for psychological wins',
                timeToPayoff: snowballMonths,
                totalInterest: snowballInterest,
                totalPayoff: loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
            },
            {
                name: 'Debt Avalanche',
                description: 'Pay off highest interest rate debts first to save money',
                timeToPayoff: avalancheMonths,
                totalInterest: avalancheInterest,
                totalPayoff: loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
            }
        ];

        res.json({ strategies });
    } catch (error) {
        console.error('Error calculating strategies:', error);
        res.status(500).json({ error: 'Failed to calculate strategies' });
    }
});

// Helper functions
function calculatePayoffTime(loans: any[], strategy: string): number {
    // Simplified calculation - in reality this would be more complex
    const totalDebt = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
    const totalMonthlyPayments = loans.reduce((sum, loan) => sum + loan.monthlyInstallment, 0);
    
    if (totalMonthlyPayments === 0) return 0;
    
    // Basic estimate
    return Math.ceil(totalDebt / totalMonthlyPayments);
}

function calculateTotalInterest(loans: any[], months: number): number {
    // Simplified interest calculation
    return loans.reduce((total, loan) => {
        const monthlyRate = loan.interestRate / 100 / 12;
        const interest = loan.remainingAmount * monthlyRate * months * 0.5; // Approximate
        return total + interest;
    }, 0);
}

export default router;