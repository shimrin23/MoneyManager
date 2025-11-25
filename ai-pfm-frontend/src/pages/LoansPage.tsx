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
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLoan, setNewLoan] = useState<Loan>({
        type: 'Personal',
        provider: '',
        totalAmount: 0,
        remainingAmount: 0,
        interestRate: 0,
        monthlyInstallment: 0,
        nextDueDate: '',
        status: 'Active'
    });

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

    const handleCreateLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/loans', newLoan);
            setLoans([...loans, response.data.loan]);
            setNewLoan({
                type: 'Personal',
                provider: '',
                totalAmount: 0,
                remainingAmount: 0,
                interestRate: 0,
                monthlyInstallment: 0,
                nextDueDate: '',
                status: 'Active'
            });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error creating loan:', error);
            alert('Failed to create loan. Please try again.');
        }
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
                <div>
                    <h1>🏦 Loans & Debt</h1>
                    <p className="page-subtitle">Manage your loans and optimize debt repayment</p>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    + Add Loan
                </button>
            </div>

            {showAddForm && (
                <div className="card form-card">
                    <h3>Add New Loan</h3>
                    <form onSubmit={handleCreateLoan} className="loan-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Loan Type</label>
                                <select
                                    value={newLoan.type}
                                    onChange={(e) => setNewLoan({...newLoan, type: e.target.value as 'Personal' | 'Home' | 'Lease' | 'Pawning'})}
                                    required
                                >
                                    <option value="Personal">Personal Loan</option>
                                    <option value="Home">Home Loan</option>
                                    <option value="Lease">Vehicle Lease</option>
                                    <option value="Pawning">Pawning</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Provider/Bank</label>
                                <input
                                    type="text"
                                    value={newLoan.provider}
                                    onChange={(e) => setNewLoan({...newLoan, provider: e.target.value})}
                                    placeholder="e.g., Commercial Bank"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Total Amount (LKR)</label>
                                <input
                                    type="number"
                                    value={newLoan.totalAmount}
                                    onChange={(e) => setNewLoan({...newLoan, totalAmount: Number(e.target.value)})}
                                    placeholder="1000000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Remaining Amount (LKR)</label>
                                <input
                                    type="number"
                                    value={newLoan.remainingAmount}
                                    onChange={(e) => setNewLoan({...newLoan, remainingAmount: Number(e.target.value)})}
                                    placeholder="800000"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newLoan.interestRate}
                                    onChange={(e) => setNewLoan({...newLoan, interestRate: Number(e.target.value)})}
                                    placeholder="12.5"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Monthly Installment (LKR)</label>
                                <input
                                    type="number"
                                    value={newLoan.monthlyInstallment}
                                    onChange={(e) => setNewLoan({...newLoan, monthlyInstallment: Number(e.target.value)})}
                                    placeholder="50000"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Next Due Date</label>
                                <input
                                    type="date"
                                    value={newLoan.nextDueDate}
                                    onChange={(e) => setNewLoan({...newLoan, nextDueDate: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Add Loan
                            </button>
                        </div>
                    </form>
                </div>
            )}

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