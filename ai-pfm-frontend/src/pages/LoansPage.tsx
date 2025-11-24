import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface Loan {
    _id?: string;
    type: 'Personal' | 'Home' | 'Lease' | 'Pawning';
    provider: string;
    totalAmount: number;
    remainingAmount: number;
    interestRate: number;
    monthlyInstallment: number;
    nextDueDate: string;
    status: 'Active' | 'Closed' | 'Overdue';
}

interface DebtStrategy {
    name: string;
    description: string;
    totalPayoff: number;
    timeToPayoff: number;
    totalInterest: number;
}

export const LoansPage = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [strategies, setStrategies] = useState<DebtStrategy[]>([]);
    const [selectedStrategy, setSelectedStrategy] = useState<string>('snowball');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoans();
        calculateStrategies();
    }, []);

    const fetchLoans = async () => {
        try {
            const response = await apiClient.get('/loans');
            setLoans(response.data.loans || []);
        } catch (error) {
            console.error('Error fetching loans:', error);
            // Fallback to empty array on error
            setLoans([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStrategies = async () => {
        try {
            const response = await apiClient.get('/loans/strategies');
            setStrategies(response.data.strategies || []);
        } catch (error) {
            console.error('Error fetching strategies:', error);
            // Fallback to mock data
            const mockStrategies: DebtStrategy[] = [
                {
                    name: 'Debt Snowball',
                    description: 'Pay off smallest debts first for psychological wins',
                    totalPayoff: 0,
                    timeToPayoff: 0,
                    totalInterest: 0
                },
                {
                    name: 'Debt Avalanche', 
                    description: 'Pay off highest interest rate debts first to save money',
                    totalPayoff: 0,
                    timeToPayoff: 0,
                    totalInterest: 0
                }
            ];
            setStrategies(mockStrategies);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getTotalDebt = () => {
        return loans.reduce((total, loan) => total + loan.remainingAmount, 0);
    };

    const getMonthlyPayments = () => {
        return loans.reduce((total, loan) => total + loan.monthlyInstallment, 0);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            Active: 'text-green-600',
            Overdue: 'text-red-600',
            Closed: 'text-gray-600'
        };
        return colors[status as keyof typeof colors] || 'text-gray-600';
    };

    const getLoanTypeIcon = (type: string) => {
        const icons = {
            Personal: '👤',
            Home: '🏠',
            Lease: '🚗',
            Pawning: '💍'
        };
        return icons[type as keyof typeof icons] || '📄';
    };

    if (loading) return <div className="loading">Loading your loans...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>💳 Loans & Debt Management</h1>
                <p className="page-subtitle">Manage your debts and plan optimal payoff strategies</p>
            </div>

            {/* Debt Overview */}
            <div className="debt-overview-grid">
                <div className="card overview-card">
                    <h3>Total Debt</h3>
                    <div className="amount-large">{formatCurrency(getTotalDebt())}</div>
                    <p className="text-muted">{loans.filter(l => l.status === 'Active').length} active loans</p>
                </div>
                <div className="card overview-card">
                    <h3>Monthly Payments</h3>
                    <div className="amount-large">{formatCurrency(getMonthlyPayments())}</div>
                    <p className="text-muted">Due each month</p>
                </div>
                <div className="card overview-card">
                    <h3>Next Due</h3>
                    <div className="amount-large">Jan 1</div>
                    <p className="text-muted">Home loan payment</p>
                </div>
            </div>

            {/* Debt Payoff Strategies */}
            <div className="card strategies-card">
                <h3>🎯 Debt Payoff Strategies</h3>
                <div className="strategies-grid">
                    {strategies.map((strategy) => (
                        <div 
                            key={strategy.name}
                            className={`strategy-option ${selectedStrategy === strategy.name.toLowerCase().replace(' ', '') ? 'selected' : ''}`}
                            onClick={() => setSelectedStrategy(strategy.name.toLowerCase().replace(' ', ''))}
                        >
                            <h4>{strategy.name}</h4>
                            <p>{strategy.description}</p>
                            <div className="strategy-stats">
                                <div className="stat">
                                    <span className="stat-label">Time to Payoff</span>
                                    <span className="stat-value">{strategy.timeToPayoff} months</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Total Interest</span>
                                    <span className="stat-value">{formatCurrency(strategy.totalInterest)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loans List */}
            <div className="card loans-card">
                <h3>Your Active Loans</h3>
                <div className="loans-list">
                    {loans.map((loan) => {
                        const progress = ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100;
                        return (
                            <div key={loan._id} className="loan-item">
                                <div className="loan-header">
                                    <div className="loan-title">
                                        <span className="loan-icon">{getLoanTypeIcon(loan.type)}</span>
                                        <div>
                                            <h4>{loan.type} Loan</h4>
                                            <p className="loan-provider">{loan.provider}</p>
                                        </div>
                                    </div>
                                    <div className="loan-status">
                                        <span className={`status ${getStatusColor(loan.status)}`}>
                                            {loan.status}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="loan-details">
                                    <div className="detail-item">
                                        <span className="label">Remaining</span>
                                        <span className="value">{formatCurrency(loan.remainingAmount)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Monthly Payment</span>
                                        <span className="value">{formatCurrency(loan.monthlyInstallment)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Interest Rate</span>
                                        <span className="value">{loan.interestRate}% p.a.</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Next Due</span>
                                        <span className="value">{new Date(loan.nextDueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="loan-progress">
                                    <div className="progress-info">
                                        <span>Paid: {progress.toFixed(1)}%</span>
                                        <span>Total: {formatCurrency(loan.totalAmount)}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {loans.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <h3>No Loans Found</h3>
                    <p>You don't have any active loans. Great job managing your finances!</p>
                </div>
            )}
        </div>
    );
};