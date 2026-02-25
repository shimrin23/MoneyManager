import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface Loan {
    _id: string;
    type: string;
    provider: string;
    principal: number;
    totalAmount: number;
    remainingAmount: number;
    interestRate: number;
    tenure: number;
    monthlyInstallment: number;
    totalInterest: number;
    startDate: Date;
    nextDueDate: Date;
    endDate: Date;
    status: string;
    paymentSchedule?: any[];
    customNotes?: string;
}

interface EMIResult {
    monthlyEMI: number;
    totalInterest: number;
    totalPayable: number;
}

interface ScheduleItem {
    month: number;
    principalPayment: number;
    interestPayment: number;
    remainingBalance: number;
    dueDate: Date;
    paid: boolean;
}

export const useLoans = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLoans = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/loans');
            setLoans(response.data.loans);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch loans');
        } finally {
            setLoading(false);
        }
    };

    const createLoan = async (loanData: any) => {
        try {
            const response = await apiClient.post('/loans', loanData);
            setLoans([response.data.loan, ...loans]);
            return response.data.loan;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to create loan');
        }
    };

    const updateLoan = async (loanId: string, updates: any) => {
        try {
            const response = await apiClient.put(`/loans/${loanId}`, updates);
            setLoans(loans.map(l => l._id === loanId ? response.data.loan : l));
            return response.data.loan;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to update loan');
        }
    };

    const deleteLoan = async (loanId: string) => {
        try {
            await apiClient.delete(`/loans/${loanId}`);
            setLoans(loans.filter(l => l._id !== loanId));
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to delete loan');
        }
    };

    const calculateEMI = async (principal: number, rate: number, tenure: number): Promise<EMIResult> => {
        try {
            const response = await apiClient.post('/loans/calculate-emi', {
                principal,
                annualInterestRate: rate,
                tenureMonths: tenure
            });
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to calculate EMI');
        }
    };

    const getSchedule = async (principal: number, rate: number, tenure: number, startDate?: Date): Promise<ScheduleItem[]> => {
        try {
            const response = await apiClient.post('/loans/repayment-schedule', {
                principal,
                annualInterestRate: rate,
                tenureMonths: tenure,
                startDate
            });
            return response.data.schedule;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to get schedule');
        }
    };

    const getDebtPayoffStrategies = async () => {
        try {
            const response = await apiClient.get('/loans/debt-payoff-strategies');
            return response.data.strategies;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to get strategies');
        }
    };

    const getLoanAlerts = async (loanId: string) => {
        try {
            const response = await apiClient.get(`/loans/${loanId}/alerts`);
            return response.data.alerts;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to get alerts');
        }
    };

    const getLoanToIncomeRatio = async () => {
        try {
            const response = await apiClient.get('/loans/loan-to-income-ratio');
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to get ratio');
        }
    };

    const getAIInsights = async () => {
        try {
            const response = await apiClient.get('/loans/ai-insights');
            return response.data.insights;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to get insights');
        }
    };

    const simulateIncreasedEMI = async (loanId: string, increasedEMI: number) => {
        try {
            const response = await apiClient.post(`/loans/${loanId}/simulate-increased-emi`, {
                increasedEMI
            });
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to simulate');
        }
    };

    const simulateLumpSum = async (loanId: string, lumpSumAmount: number, monthToApply: number) => {
        try {
            const response = await apiClient.post(`/loans/${loanId}/simulate-lump-sum`, {
                lumpSumAmount,
                monthToApply
            });
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to simulate');
        }
    };

    const simulateRefinance = async (loanId: string, newInterestRate: number) => {
        try {
            const response = await apiClient.post(`/loans/${loanId}/simulate-refinance`, {
                newInterestRate
            });
            return response.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to simulate');
        }
    };

    const recordPayment = async (loanId: string, amount: number, paidDate?: Date) => {
        try {
            const response = await apiClient.post(`/loans/${loanId}/payment`, {
                amount,
                paidDate
            });
            setLoans(loans.map(l => l._id === loanId ? response.data.loan : l));
            return response.data.loan;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to record payment');
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    return {
        loans,
        loading,
        error,
        fetchLoans,
        createLoan,
        updateLoan,
        deleteLoan,
        calculateEMI,
        getSchedule,
        getDebtPayoffStrategies,
        getLoanAlerts,
        getLoanToIncomeRatio,
        getAIInsights,
        simulateIncreasedEMI,
        simulateLumpSum,
        simulateRefinance,
        recordPayment
    };
};
