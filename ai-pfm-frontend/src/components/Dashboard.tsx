import { useState, useEffect } from 'react';
import { apiClient } from '../api/client.ts';
import { CashFlowForecast } from './CashFlowForecast';
import { AIAssistant } from './AIAssistant';

export const Dashboard = () => {
    const [aiOpen, setAiOpen] = useState(false);
    // New State for Score
    const [score, setScore] = useState<number>(0);
    const [loadingScore, setLoadingScore] = useState<boolean>(true);
    // State for transactions
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
    // 1. Fetch Score on Load
    useEffect(() => {
        const fetchScore = async () => {
            try {
                const response = await apiClient.get('/transactions/score');
                setScore(response.data.score);
            } catch (error) {
                console.error("Failed to fetch score", error);
            } finally {
                setLoadingScore(false);
            }
        };
        fetchScore();
    }, []);

    // 2. Fetch Recent Transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await apiClient.get('/transactions');
                setTransactions((response.data?.data ?? []).slice(0, 5)); // Get latest 5
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoadingTransactions(false);
            }
        };
        fetchTransactions();
    }, []);

    // Helper to determine color based on score
    const getScoreColor = (s: number) => {
        if (s >= 70) return 'var(--success)'; // Green
        if (s >= 40) return '#facc15';       // Yellow
        return 'var(--danger)';              // Red
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Helper to format amount
    const formatAmount = (amount: number, type: string) => {
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(Math.abs(amount));
        return type === 'expense' ? `-${formatted}` : `+${formatted}`;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Welcome back!</h1>
                    <p className="page-subtitle">Your financial overview at a glance</p>
                </div>
            </div>

            <div className="dashboard-layout" style={{ padding: '1.5rem', maxWidth: '100%' }}>
                {/* Top Row: Health Score & Cash Flow */}
                <div className="dashboard-top-row">
                    {/* Financial Health Score Card */}
                    <div className="card health-score-card">
                    <h3>💚 Financial Health Score</h3>
                    <div className="score-display">
                        <div 
                            className="score-circle"
                            style={{
                                background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                            }}
                        >
                            <span className="score-number">{loadingScore ? "..." : score}</span>
                            <span className="score-label">/ 100</span>
                        </div>
                        <div className="score-status">
                            <span className="status-text">
                                {score >= 70 ? "Excellent 🎉" : score >= 40 ? "Needs Work ⚠️" : "Critical 🚨"}
                            </span>
                            <p className="status-description">
                                {score >= 70 ? "Great financial habits!" : 
                                 score >= 40 ? "Room for improvement" : "Immediate attention needed"}
                            </p>
                        </div>
                    </div>
                </div>

                    {/* Cash Flow Forecast Card */}
                    <CashFlowForecast />
                </div>

                {/* Recent Transactions Card */}
                <div className="card transactions-card">
                    <div className="transactions-header">
                        <h3>Recent Transactions</h3>
                        <button className="btn-sync">
                            <span>🔄</span>
                            <span>Sync Bank</span>
                        </button>
                    </div>
                    
                    <div className="transactions-table-container">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>DATE</th>
                                    <th>DESCRIPTION</th>
                                    <th>CATEGORY</th>
                                    <th className="text-right">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingTransactions ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">Loading transactions...</td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            No transactions yet. Add your first transaction to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => (
                                        <tr key={transaction._id || transaction.id}>
                                            <td>{formatDate(transaction.date)}</td>
                                            <td>{transaction.description}</td>
                                            <td>
                                                <span className="category-badge">
                                                    {transaction.category}
                                                </span>
                                            </td>
                                            <td className={`text-right ${transaction.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                                                {formatAmount(transaction.amount, transaction.type)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recurring Subscriptions Card */}
                <div className="card subscriptions-card">
                    <div className="subscriptions-content">
                        <div className="subscriptions-icon">📅</div>
                        <div className="subscriptions-info">
                            <h3>Recurring Subscriptions</h3>
                            <p>Detected from your transaction history.</p>
                        </div>
                        <div className="subscriptions-status">
                            <p>No subscriptions found.</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* AI Assistant Modal */}
            <AIAssistant open={aiOpen} onOpenChange={setAiOpen} />
        </div>
    );
};
