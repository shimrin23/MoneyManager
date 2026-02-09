import Loan, { ILoan } from '../schemas/loan.schema';
import Transaction from '../schemas/transaction.schema';

interface EMICalculationInput {
    principal: number;
    annualInterestRate: number;
    tenureMonths: number;
}

interface EMICalculationResult {
    monthlyEMI: number;
    totalInterest: number;
    totalPayable: number;
}

interface RepaymentScheduleItem {
    month: number;
    principalPayment: number;
    interestPayment: number;
    remainingBalance: number;
    dueDate: Date;
    paid: boolean;
    paidDate?: Date;
}

interface DebtPayoffStrategy {
    method: 'snowball' | 'avalanche';
    totalInterestSaved: number;
    timeToPayoff: number; // in months
    schedule: Array<{
        loanId: string;
        loanType: string;
        paymentAmount: number;
    }>;
}

interface WhatIfSimulation {
    scenarioName: string;
    monthlyEMI: number;
    totalInterest: number;
    totalPayable: number;
    timeToPayoff: number;
    schedule: RepaymentScheduleItem[];
    savings: {
        interestSaved: number;
        timeSaved: number;
    };
}

interface LoanAlert {
    type: 'due-soon' | 'overdue' | 'high-emi-ratio';
    message: string;
    severity: 'low' | 'medium' | 'high';
    loanId: string;
    actionRequired: boolean;
}

class LoanService {
    /**
     * Calculate EMI using the standard EMI formula
     * EMI = P * [r(1+r)^n] / [(1+r)^n - 1]
     */
    calculateEMI(input: EMICalculationInput): EMICalculationResult {
        const { principal, annualInterestRate, tenureMonths } = input;

        if (tenureMonths <= 0 || principal <= 0 || annualInterestRate < 0) {
            throw new Error('Invalid input parameters');
        }

        const monthlyRate = annualInterestRate / 12 / 100;

        let monthlyEMI = principal;

        if (monthlyRate === 0) {
            monthlyEMI = principal / tenureMonths;
        } else {
            const numerator = monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
            const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
            monthlyEMI = principal * (numerator / denominator);
        }

        const totalPayable = monthlyEMI * tenureMonths;
        const totalInterest = totalPayable - principal;

        return {
            monthlyEMI: Math.round(monthlyEMI * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalPayable: Math.round(totalPayable * 100) / 100
        };
    }

    /**
     * Generate month-wise repayment schedule
     */
    generateRepaymentSchedule(
        principal: number,
        annualInterestRate: number,
        tenureMonths: number,
        startDate: Date = new Date()
    ): RepaymentScheduleItem[] {
        const emiResult = this.calculateEMI({
            principal,
            annualInterestRate,
            tenureMonths
        });

        const monthlyRate = annualInterestRate / 12 / 100;
        const schedule: RepaymentScheduleItem[] = [];
        let remainingBalance = principal;
        let currentDate = new Date(startDate);

        for (let month = 1; month <= tenureMonths; month++) {
            const interestPayment =
                monthlyRate === 0
                    ? 0
                    : Math.round(remainingBalance * monthlyRate * 100) / 100;

            const principalPayment =
                month === tenureMonths
                    ? remainingBalance
                    : Math.round((emiResult.monthlyEMI - interestPayment) * 100) / 100;

            remainingBalance = Math.max(0, remainingBalance - principalPayment);

            currentDate.setMonth(currentDate.getMonth() + 1);

            schedule.push({
                month,
                principalPayment,
                interestPayment,
                remainingBalance,
                dueDate: new Date(currentDate),
                paid: false
            });
        }

        return schedule;
    }

    /**
     * Get loan alerts based on loan status and payment history
     */
    async generateLoanAlerts(
        loan: ILoan,
        userIncome: number
    ): Promise<LoanAlert[]> {
        const alerts: LoanAlert[] = [];
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Check for due soon
        if (loan.nextDueDate >= today && loan.nextDueDate <= sevenDaysFromNow && loan.status === 'Active') {
            alerts.push({
                type: 'due-soon',
                message: `EMI due in ${Math.ceil((loan.nextDueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))} days`,
                severity: 'medium',
                loanId: loan._id?.toString() || '',
                actionRequired: true
            });
        }

        // Check for overdue
        if (loan.nextDueDate < today && loan.status !== 'Closed') {
            alerts.push({
                type: 'overdue',
                message: 'Loan payment is overdue',
                severity: 'high',
                loanId: loan._id?.toString() || '',
                actionRequired: true
            });
        }

        // Check EMI to income ratio
        const emiToIncomeRatio = (loan.monthlyInstallment / userIncome) * 100;
        if (emiToIncomeRatio > 50) {
            alerts.push({
                type: 'high-emi-ratio',
                message: `High EMI ratio: ${emiToIncomeRatio.toFixed(2)}% of monthly income`,
                severity: 'high',
                loanId: loan._id?.toString() || '',
                actionRequired: false
            });
        } else if (emiToIncomeRatio > 30) {
            alerts.push({
                type: 'high-emi-ratio',
                message: `EMI ratio: ${emiToIncomeRatio.toFixed(2)}% of monthly income`,
                severity: 'medium',
                loanId: loan._id?.toString() || '',
                actionRequired: false
            });
        }

        return alerts;
    }

    /**
     * Debt Payoff Strategy: Snowball (smallest balance first)
     * Prioritize paying off loans with smallest remaining balance
     */
    calculateSnowballStrategy(loans: ILoan[]): DebtPayoffStrategy {
        const activeLoan = loans.filter(l => l.status === 'Active').sort((a, b) => a.remainingAmount - b.remainingAmount);

        let totalInterestSaved = 0;
        let maxMonths = 0;
        const schedule: Array<{ loanId: string; loanType: string; paymentAmount: number }> = [];

        activeLoan.forEach(loan => {
            schedule.push({
                loanId: loan._id?.toString() || '',
                loanType: loan.type,
                paymentAmount: loan.monthlyInstallment
            });
            totalInterestSaved += loan.totalInterest;
            const monthsRemaining = Math.ceil(loan.remainingAmount / loan.monthlyInstallment);
            maxMonths = Math.max(maxMonths, monthsRemaining);
        });

        return {
            method: 'snowball',
            totalInterestSaved,
            timeToPayoff: maxMonths,
            schedule
        };
    }

    /**
     * Debt Payoff Strategy: Avalanche (highest interest rate first)
     * Prioritize paying off loans with highest interest rates
     */
    calculateAvalancheStrategy(loans: ILoan[]): DebtPayoffStrategy {
        const activeLoans = loans.filter(l => l.status === 'Active').sort((a, b) => b.interestRate - a.interestRate);

        let totalInterestSaved = 0;
        let maxMonths = 0;
        const schedule: Array<{ loanId: string; loanType: string; paymentAmount: number }> = [];

        activeLoans.forEach(loan => {
            schedule.push({
                loanId: loan._id?.toString() || '',
                loanType: loan.type,
                paymentAmount: loan.monthlyInstallment
            });
            totalInterestSaved += loan.totalInterest;
            const monthsRemaining = Math.ceil(loan.remainingAmount / loan.monthlyInstallment);
            maxMonths = Math.max(maxMonths, monthsRemaining);
        });

        return {
            method: 'avalanche',
            totalInterestSaved,
            timeToPayoff: maxMonths,
            schedule
        };
    }

    /**
     * Calculate Loan-to-Income Ratio
     */
    calculateLoanToIncomeRatio(totalMonthlyEMI: number, monthlyIncome: number): {
        ratio: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        recommendation: string;
    } {
        const ratio = (totalMonthlyEMI / monthlyIncome) * 100;

        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        let recommendation = 'Your debt is well managed.';

        if (ratio <= 20) {
            riskLevel = 'low';
            recommendation = 'Your debt-to-income ratio is healthy. Keep it up!';
        } else if (ratio <= 35) {
            riskLevel = 'medium';
            recommendation = 'Your debt-to-income ratio is acceptable but monitor it closely.';
        } else if (ratio <= 50) {
            riskLevel = 'high';
            recommendation = 'Your debt-to-income ratio is high. Consider paying off loans faster.';
        } else {
            riskLevel = 'critical';
            recommendation = 'Your debt-to-income ratio is critical. Prioritize debt repayment.';
        }

        return {
            ratio: Math.round(ratio * 100) / 100,
            riskLevel,
            recommendation
        };
    }

    /**
     * What-If Simulation: Increase Monthly EMI
     */
    simulateIncreaseEMI(
        principal: number,
        annualInterestRate: number,
        currentEMI: number,
        increasedEMI: number,
        currentTenure: number
    ): WhatIfSimulation {
        const currentResult = this.calculateEMI({
            principal,
            annualInterestRate,
            tenureMonths: currentTenure
        });

        const monthlyRate = annualInterestRate / 12 / 100;
        let remainingBalance = principal;
        let month = 0;
        const schedule: RepaymentScheduleItem[] = [];

        while (remainingBalance > 0 && month < 360) {
            month++;
            const interestPayment =
                monthlyRate === 0
                    ? 0
                    : Math.round(remainingBalance * monthlyRate * 100) / 100;
            const principalPayment = Math.min(increasedEMI - interestPayment, remainingBalance);
            remainingBalance = Math.max(0, remainingBalance - principalPayment);

            schedule.push({
                month,
                principalPayment,
                interestPayment,
                remainingBalance,
                dueDate: new Date(new Date().setMonth(new Date().getMonth() + month)),
                paid: false
            });

            if (remainingBalance === 0) break;
        }

        const totalPayable = schedule.reduce((sum, item) => sum + item.principalPayment + item.interestPayment, 0);
        const totalInterest = totalPayable - principal;

        return {
            scenarioName: `Increased EMI to ${increasedEMI}`,
            monthlyEMI: increasedEMI,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalPayable: Math.round(totalPayable * 100) / 100,
            timeToPayoff: month,
            schedule,
            savings: {
                interestSaved: Math.round((currentResult.totalInterest - totalInterest) * 100) / 100,
                timeSaved: currentTenure - month
            }
        };
    }

    /**
     * What-If Simulation: Lump Sum Payment
     */
    simulateLumpSumPayment(
        principal: number,
        annualInterestRate: number,
        monthlyEMI: number,
        lumpSumAmount: number,
        monthToApply: number,
        currentTenure: number
    ): WhatIfSimulation {
        const currentResult = this.calculateEMI({
            principal,
            annualInterestRate,
            tenureMonths: currentTenure
        });

        const monthlyRate = annualInterestRate / 12 / 100;
        let remainingBalance = principal;
        let month = 0;
        const schedule: RepaymentScheduleItem[] = [];

        while (remainingBalance > 0 && month < 360) {
            month++;
            const interestPayment =
                monthlyRate === 0
                    ? 0
                    : Math.round(remainingBalance * monthlyRate * 100) / 100;
            const principalPayment = monthlyEMI - interestPayment;
            remainingBalance = remainingBalance - principalPayment;

            if (month === monthToApply) {
                remainingBalance = Math.max(0, remainingBalance - lumpSumAmount);
            }

            remainingBalance = Math.max(0, remainingBalance);

            schedule.push({
                month,
                principalPayment: month === monthToApply ? principalPayment + lumpSumAmount : principalPayment,
                interestPayment,
                remainingBalance,
                dueDate: new Date(new Date().setMonth(new Date().getMonth() + month)),
                paid: false
            });

            if (remainingBalance === 0) break;
        }

        const totalPayable = schedule.reduce((sum, item) => sum + item.principalPayment + item.interestPayment, 0) + lumpSumAmount;
        const totalInterest = totalPayable - principal - lumpSumAmount;

        return {
            scenarioName: `Lump Sum Payment of ${lumpSumAmount} in Month ${monthToApply}`,
            monthlyEMI: monthlyEMI,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalPayable: Math.round(totalPayable * 100) / 100,
            timeToPayoff: month,
            schedule,
            savings: {
                interestSaved: Math.round((currentResult.totalInterest - totalInterest) * 100) / 100,
                timeSaved: currentTenure - month
            }
        };
    }

    /**
     * What-If Simulation: Lower Interest Rate / Refinancing
     */
    simulateRefinancing(
        principal: number,
        currentInterestRate: number,
        newInterestRate: number,
        tenureMonths: number
    ): WhatIfSimulation {
        const currentResult = this.calculateEMI({
            principal,
            annualInterestRate: currentInterestRate,
            tenureMonths
        });

        const newResult = this.calculateEMI({
            principal,
            annualInterestRate: newInterestRate,
            tenureMonths
        });

        const schedule = this.generateRepaymentSchedule(principal, newInterestRate, tenureMonths);

        return {
            scenarioName: `Refinance from ${currentInterestRate}% to ${newInterestRate}%`,
            monthlyEMI: newResult.monthlyEMI,
            totalInterest: newResult.totalInterest,
            totalPayable: newResult.totalPayable,
            timeToPayoff: tenureMonths,
            schedule,
            savings: {
                interestSaved: Math.round((currentResult.totalInterest - newResult.totalInterest) * 100) / 100,
                timeSaved: 0
            }
        };
    }

    /**
     * Generate AI-powered loan insights
     */
    generateLoanInsights(loans: ILoan[], totalIncome: number): string[] {
        const insights: string[] = [];

        const totalMonthlyEMI = loans.reduce((sum, l) => sum + (l.status === 'Active' ? l.monthlyInstallment : 0), 0);
        const { riskLevel, recommendation } = this.calculateLoanToIncomeRatio(totalMonthlyEMI, totalIncome);

        // Insight 1: Income recommendation
        insights.push(recommendation);

        // Insight 2: Highest interest rate loans
        const highestInterestLoan = loans
            .filter(l => l.status === 'Active')
            .sort((a, b) => b.interestRate - a.interestRate)[0];

        if (highestInterestLoan) {
            insights.push(
                `Your ${highestInterestLoan.type} loan has the highest interest rate at ${highestInterestLoan.interestRate}%. Consider refinancing to reduce your total interest burden.`
            );
        }

        // Insight 3: Largest remaining balance
        const largestLoan = loans
            .filter(l => l.status === 'Active')
            .sort((a, b) => b.remainingAmount - a.remainingAmount)[0];

        if (largestLoan) {
            const monthsNeeded = Math.ceil(largestLoan.remainingAmount / largestLoan.monthlyInstallment);
            insights.push(`Your ${largestLoan.type} loan has a remaining balance of ${largestLoan.remainingAmount.toFixed(2)}. At current EMI, you'll pay it off in ${monthsNeeded} months.`);
        }

        // Insight 4: Quick win - smallest loan
        const smallestLoan = loans
            .filter(l => l.status === 'Active')
            .sort((a, b) => a.remainingAmount - b.remainingAmount)[0];

        if (smallestLoan && smallestLoan.remainingAmount > 0) {
            const monthsToPayoff = Math.ceil(smallestLoan.remainingAmount / smallestLoan.monthlyInstallment);
            insights.push(`You can clear your smallest loan (${smallestLoan.type}) in just ${monthsToPayoff} months with your current EMI. This would boost your confidence!`);
        }

        // Insight 5: Consolidation opportunity
        if (loans.filter(l => l.status === 'Active').length > 2) {
            insights.push('You have multiple active loans. Consider consolidation to simplify your payments and potentially reduce interest rates.');
        }

        // Insight 6: Savings opportunity
        if (totalMonthlyEMI < totalIncome * 0.2) {
            const extraCapacity = totalIncome * 0.2 - totalMonthlyEMI;
            insights.push(`You have extra capacity of ${extraCapacity.toFixed(2)} per month. Consider increasing EMI on your highest-interest loan to save on interest.`);
        }

        return insights;
    }
}

export default new LoanService();
