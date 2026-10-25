import { Router } from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Loan from '../schemas/loan.schema';
import User from '../schemas/user.schema';
import LoanService from '../services/loan.service';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

const LOAN_TYPES = ['Personal', 'Home', 'Vehicle', 'Education', 'Lease', 'Pawning'];
const LOAN_STATUSES = ['Active', 'Closed', 'Overdue'];

const toNumber = (value: unknown) => (value === '' || value === null || value === undefined ? NaN : Number(value));

// Returns an error message, or null when the loan terms are usable
const validateLoanTerms = (principal: number, interestRate: number, tenure: number) => {
    if (!Number.isFinite(principal) || principal <= 0) return 'Principal must be more than 0';
    if (!Number.isFinite(interestRate) || interestRate < 0 || interestRate > 100) return 'Interest rate must be between 0 and 100';
    if (!Number.isInteger(tenure) || tenure <= 0 || tenure > 600) return 'Tenure must be a whole number of months between 1 and 600';
    return null;
};

// The user's own monthly income from Profile, or 0 when they have not entered one
const getMonthlyIncome = async (userId: string) => {
    const user = await User.findById(userId).select('monthlyIncome');
    const income = Number(user?.monthlyIncome);
    return Number.isFinite(income) && income > 0 ? income : 0;
};

// POST /api/loans/calculate-emi - Calculate EMI
router.post('/calculate-emi', async (req: Request, res: Response) => {
    try {
        const { principal, annualInterestRate, tenureMonths } = req.body;

        const termsError = validateLoanTerms(toNumber(principal), toNumber(annualInterestRate), toNumber(tenureMonths));
        if (termsError) {
            return res.status(400).json({ error: termsError });
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

        const termsError = validateLoanTerms(toNumber(principal), toNumber(annualInterestRate), toNumber(tenureMonths));
        if (termsError) {
            return res.status(400).json({ error: termsError });
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
        const monthlyIncome = await getMonthlyIncome(userId);

        const totalMonthlyEMI = Math.round(loans.reduce((sum, loan) => sum + loan.monthlyInstallment, 0) * 100) / 100;

        // Without a real income the ratio would be made up, so ask the user for it instead
        if (monthlyIncome === 0) {
            return res.json({
                totalMonthlyEMI,
                monthlyIncome: 0,
                incomeMissing: true,
                ratio: null,
                riskLevel: null,
                recommendation: 'Add your monthly income in your Profile to see your debt-to-income ratio.'
            });
        }

        const ratio = LoanService.calculateLoanToIncomeRatio(totalMonthlyEMI, monthlyIncome);

        res.json({
            totalMonthlyEMI,
            monthlyIncome,
            incomeMissing: false,
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
        const monthlyIncome = await getMonthlyIncome(userId);

        const insights = await LoanService.generateLoanInsights(loans, monthlyIncome);

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
        const { type, interestRate, tenure, startDate, customNotes } = req.body;
        const provider = typeof req.body.provider === 'string' ? req.body.provider.trim() : '';
        const principal = toNumber(req.body.principal);

        if (!LOAN_TYPES.includes(type)) {
            return res.status(400).json({ error: 'Please choose a valid loan type' });
        }
        if (!provider) {
            return res.status(400).json({ error: 'Provider / bank is required' });
        }
        const termsError = validateLoanTerms(principal, toNumber(interestRate), toNumber(tenure));
        if (termsError) {
            return res.status(400).json({ error: termsError });
        }
        const scheduleStartDate = startDate ? new Date(startDate) : new Date();
        if (isNaN(scheduleStartDate.getTime())) {
            return res.status(400).json({ error: 'Start date is not valid' });
        }

        // Calculate EMI
        const emiResult = LoanService.calculateEMI({
            principal,
            annualInterestRate: Number(interestRate),
            tenureMonths: Number(tenure)
        });

        // Generate repayment schedule
        const paymentSchedule = LoanService.generateRepaymentSchedule(
            principal,
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
            principal,
            totalAmount: emiResult.totalPayable,
            remainingAmount: emiResult.totalPayable,
            interestRate: Number(interestRate),
            tenure: Number(tenure),
            monthlyInstallment: emiResult.monthlyEMI,
            totalInterest: emiResult.totalInterest,
            startDate: scheduleStartDate,
            // First installment is due one month after the start date (same as the schedule)
            nextDueDate: paymentSchedule[0].dueDate,
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

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Only these fields can be changed; EMI and totals are always recalculated, never typed in
        const { type, status, nextDueDate, customNotes } = req.body;
        if (req.body.provider !== undefined) {
            const provider = typeof req.body.provider === 'string' ? req.body.provider.trim() : '';
            if (!provider) return res.status(400).json({ error: 'Provider / bank is required' });
            loan.provider = provider;
        }
        if (type !== undefined) {
            if (!LOAN_TYPES.includes(type)) return res.status(400).json({ error: 'Please choose a valid loan type' });
            loan.type = type;
        }
        if (status !== undefined) {
            if (!LOAN_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
            loan.status = status;
        }
        if (nextDueDate !== undefined && nextDueDate !== null) {
            const due = new Date(nextDueDate);
            if (isNaN(due.getTime())) return res.status(400).json({ error: 'Next due date is not valid' });
            loan.nextDueDate = due;
        }
        if (customNotes !== undefined) loan.customNotes = customNotes;

        const newRate = req.body.interestRate !== undefined ? toNumber(req.body.interestRate) : loan.interestRate;
        const newTenure = req.body.tenure !== undefined ? toNumber(req.body.tenure) : loan.tenure;

        if (newRate !== loan.interestRate || newTenure !== loan.tenure) {
            const termsError = validateLoanTerms(loan.principal, newRate, newTenure);
            if (termsError) return res.status(400).json({ error: termsError });

            // Recalculate EMI, totals and schedule, keeping the installments already paid
            const amountPaid = Math.max(0, loan.totalAmount - loan.remainingAmount);
            const oldSchedule = loan.paymentSchedule || [];
            const emiResult = LoanService.calculateEMI({ principal: loan.principal, annualInterestRate: newRate, tenureMonths: newTenure });
            const schedule = LoanService.generateRepaymentSchedule(loan.principal, newRate, newTenure, loan.startDate);
            schedule.forEach((item, i) => {
                if (oldSchedule[i]?.paid) {
                    item.paid = true;
                    item.paidDate = oldSchedule[i].paidDate;
                }
            });

            const endDate = new Date(loan.startDate);
            endDate.setMonth(endDate.getMonth() + newTenure);

            loan.interestRate = newRate;
            loan.tenure = newTenure;
            loan.monthlyInstallment = emiResult.monthlyEMI;
            loan.totalInterest = emiResult.totalInterest;
            loan.totalAmount = emiResult.totalPayable;
            loan.remainingAmount = Math.max(0, Math.round((emiResult.totalPayable - amountPaid) * 100) / 100);
            loan.paymentSchedule = schedule;
            loan.endDate = endDate;
            if (loan.remainingAmount === 0) loan.status = 'Closed';
        }

        await loan.save();
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
        const { paidDate } = req.body;
        const amount = toNumber(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Please enter a payment amount greater than 0' });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        if (loan.status === 'Closed') {
            return res.status(400).json({ error: 'This loan is already fully paid' });
        }
        // Allow a few cents of rounding, but not paying more than is owed
        if (amount > loan.remainingAmount + 0.01) {
            return res.status(400).json({ error: `Payment is more than the remaining amount (Rs ${loan.remainingAmount.toFixed(2)})` });
        }

        loan.remainingAmount = Math.max(Math.round((loan.remainingAmount - amount) * 100) / 100, 0);
        
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

        // Get user income for alert calculation (0 = not entered, so no ratio alert)
        const monthlyIncome = await getMonthlyIncome(userId);

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

        const rate = toNumber(newInterestRate);
        if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
            return res.status(400).json({ error: 'Valid new interest rate is required' });
        }

        const simulation = LoanService.simulateRefinancing(
            loan.principal,
            loan.interestRate,
            rate,
            loan.tenure
        );

        res.json(simulation);
    } catch (error) {
        console.error('Error simulating refinance:', error);
        res.status(500).json({ error: 'Failed to simulate refinancing' });
    }
});

export default router;