import { Router } from 'express';
import { Request, Response } from 'express';
import Loan from '../schemas/loan.schema';
import User from '../schemas/user.schema';
import LoanService from '../services/loan.service';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/loans/calculate-emi - Calculate EMI
router.post('/calculate-emi', async (req: Request, res: Response) => {
    try {
        const { principal, annualInterestRate, tenureMonths } = req.body;

        if (!principal || annualInterestRate === undefined || !tenureMonths) {
            return res.status(400).json({ error: 'Principal, interest rate, and tenure are required' });
        }

        const result = LoanService.calculateEMI({
            principal: Number(principal),
            annualInterestRate: Number(annualInterestRate),
            tenureMonths: Number(tenureMonths)
        });

        res.json(result);
    } catch (error: any) {
        console.error('Error calculating EMI:', error);
        res.status(400).json({ error: error.message || 'Failed to calculate EMI' });
    }
});

// POST /api/loans/repayment-schedule - Get repayment schedule
router.post('/repayment-schedule', async (req: Request, res: Response) => {
    try {
        const { principal, annualInterestRate, tenureMonths, startDate } = req.body;

        if (!principal || annualInterestRate === undefined || !tenureMonths) {
            return res.status(400).json({ error: 'Principal, interest rate, and tenure are required' });
        }

        const schedule = LoanService.generateRepaymentSchedule(
            Number(principal),
            Number(annualInterestRate),
            Number(tenureMonths),
            startDate ? new Date(startDate) : new Date()
        );

        res.json({ schedule });
    } catch (error: any) {
        console.error('Error generating schedule:', error);
        res.status(400).json({ error: error.message || 'Failed to generate schedule' });
    }
});

// GET /api/loans/debt-payoff-strategies - Get debt payoff strategies
router.get('/debt-payoff-strategies', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const loans = await Loan.find({ userId, status: 'Active' });

        if (loans.length === 0) {
            return res.json({ strategies: [] });
        }

        const snowball = LoanService.calculateSnowballStrategy(loans);
        const avalanche = LoanService.calculateAvalancheStrategy(loans);

        const strategies = [
            {
                name: 'Debt Snowball',
                description: 'Pay off smallest debts first for psychological wins',
                ...snowball
            },
            {
                name: 'Debt Avalanche',
                description: 'Pay off highest interest rates first to save money',
                ...avalanche
            }
        ];

        res.json({ strategies });
    } catch (error) {
        console.error('Error calculating strategies:', error);
        res.status(500).json({ error: 'Failed to calculate strategies' });
    }
});

// GET /api/loans/loan-to-income-ratio - Calculate debt-to-income ratio
router.get('/loan-to-income-ratio', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const loans = await Loan.find({ userId, status: 'Active' });

        const user = await User.findById(userId);
        const monthlyIncome = user?.monthlyIncome || 50000;

        const totalMonthlyEMI = loans.reduce((sum, loan) => sum + loan.monthlyInstallment, 0);
        const ratio = LoanService.calculateLoanToIncomeRatio(totalMonthlyEMI, monthlyIncome);

        res.json({
            totalMonthlyEMI,
            monthlyIncome,
            ...ratio
        });
    } catch (error) {
        console.error('Error calculating ratio:', error);
        res.status(500).json({ error: 'Failed to calculate ratio' });
    }
});

// GET /api/loans/ai-insights - Get AI-powered loan insights
router.get('/ai-insights', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const loans = await Loan.find({ userId });

        const user = await User.findById(userId);
        const monthlyIncome = user?.monthlyIncome || 50000;

        const insights = LoanService.generateLoanInsights(loans, monthlyIncome);

        res.json({ insights });
    } catch (error) {
        console.error('Error generating insights:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

// GET /api/loans - Get all loans for user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const loans = await Loan.find({ userId }).sort({ createdAt: -1 });
        res.json({ loans });
    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

// POST /api/loans - Create new loan with auto-calculated values
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { type, provider, principal, interestRate, tenure, startDate, customNotes } = req.body;

        if (!type || !provider || !principal || interestRate === undefined || !tenure) {
            return res.status(400).json({ error: 'Type, provider, principal, interest rate, and tenure are required' });
        }

        // Calculate EMI
        const emiResult = LoanService.calculateEMI({
            principal: Number(principal),
            annualInterestRate: Number(interestRate),
            tenureMonths: Number(tenure)
        });

        // Generate repayment schedule
        const scheduleStartDate = startDate ? new Date(startDate) : new Date();
        const paymentSchedule = LoanService.generateRepaymentSchedule(
            Number(principal),
            Number(interestRate),
            Number(tenure),
            scheduleStartDate
        );

        // Calculate dates
        const endDate = new Date(scheduleStartDate);
        endDate.setMonth(endDate.getMonth() + Number(tenure));

        const newLoan = new Loan({
            userId,
            type,
            provider,
            principal: Number(principal),
            totalAmount: emiResult.totalPayable,
            remainingAmount: emiResult.totalPayable,
            interestRate: Number(interestRate),
            tenure: Number(tenure),
            monthlyInstallment: emiResult.monthlyEMI,
            totalInterest: emiResult.totalInterest,
            startDate: scheduleStartDate,
            nextDueDate: new Date(scheduleStartDate.getTime() + 30 * 24 * 60 * 60 * 1000),
            endDate,
            status: 'Active',
            paymentSchedule,
            customNotes
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
        const userId = (req as any).user.id;
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
        const userId = (req as any).user.id;
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

// POST /api/loans/:id/payment - Record loan payment
router.post('/:id/payment', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { amount, paidDate } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid payment amount is required' });
        }

        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        loan.remainingAmount = Math.max(loan.remainingAmount - Number(amount), 0);
        
        // Update payment schedule
        if (loan.paymentSchedule && loan.paymentSchedule.length > 0) {
            for (let i = 0; i < loan.paymentSchedule.length; i++) {
                if (!loan.paymentSchedule[i].paid) {
                    loan.paymentSchedule[i].paid = true;
                    loan.paymentSchedule[i].paidDate = paidDate ? new Date(paidDate) : new Date();
                    break;
                }
            }
        }
        
        // Auto-close if fully paid
        if (loan.remainingAmount === 0) {
            loan.status = 'Closed';
        }

        // Update next due date
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

// GET /api/loans/:id/alerts - Get loan alerts
router.get('/:id/alerts', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Get user income for alert calculation
        const user = await User.findById(userId);
        const monthlyIncome = user?.monthlyIncome || 50000;

        const alerts = await LoanService.generateLoanAlerts(loan, monthlyIncome);
        res.json({ alerts });
    } catch (error) {
        console.error('Error generating alerts:', error);
        res.status(500).json({ error: 'Failed to generate alerts' });
    }
});

// POST /api/loans/:id/simulate-increased-emi - Simulate increased EMI
router.post('/:id/simulate-increased-emi', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { increasedEMI } = req.body;

        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (!increasedEMI || increasedEMI <= loan.monthlyInstallment) {
            return res.status(400).json({ error: 'Increased EMI must be greater than current EMI' });
        }

        const simulation = LoanService.simulateIncreaseEMI(
            loan.principal,
            loan.interestRate,
            loan.monthlyInstallment,
            Number(increasedEMI),
            loan.tenure
        );

        res.json(simulation);
    } catch (error) {
        console.error('Error simulating increased EMI:', error);
        res.status(500).json({ error: 'Failed to simulate increased EMI' });
    }
});

// POST /api/loans/:id/simulate-lump-sum - Simulate lump sum payment
router.post('/:id/simulate-lump-sum', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { lumpSumAmount, monthToApply } = req.body;

        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (!lumpSumAmount || lumpSumAmount <= 0) {
            return res.status(400).json({ error: 'Valid lump sum amount is required' });
        }

        const simulation = LoanService.simulateLumpSumPayment(
            loan.principal,
            loan.interestRate,
            loan.monthlyInstallment,
            Number(lumpSumAmount),
            Number(monthToApply) || 1,
            loan.tenure
        );

        res.json(simulation);
    } catch (error) {
        console.error('Error simulating lump sum:', error);
        res.status(500).json({ error: 'Failed to simulate lump sum payment' });
    }
});

// POST /api/loans/:id/simulate-refinance - Simulate refinancing
router.post('/:id/simulate-refinance', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { newInterestRate } = req.body;

        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (!newInterestRate === undefined || newInterestRate < 0) {
            return res.status(400).json({ error: 'Valid new interest rate is required' });
        }

        const simulation = LoanService.simulateRefinancing(
            loan.principal,
            loan.interestRate,
            Number(newInterestRate),
            loan.tenure
        );

        res.json(simulation);
    } catch (error) {
        console.error('Error simulating refinance:', error);
        res.status(500).json({ error: 'Failed to simulate refinancing' });
    }
});

export default router;