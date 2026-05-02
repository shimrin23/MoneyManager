import { useState, useEffect } from 'react';
import { apiClient } from '../api/client.ts';
import axios from 'axios';
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
    const [hasPFMConsent, setHasPFMConsent] = useState<boolean | null>(null);
    const [syncing, setSyncing] = useState<boolean>(false);
    const [syncMode, setSyncMode] = useState<'mock' | 'real' | 'unknown'>('unknown');

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

    const fetchConsentStatus = async () => {
        try {
            const response = await apiClient.get('/consent/check/pfm_analysis');
            setHasPFMConsent(!!response.data?.hasConsent);
        } catch (error) {
            console.error('Failed to fetch consent status', error);
            setHasPFMConsent(false);
        }
    };

    const fetchSyncHealth = async () => {
        try {
            const response = await apiClient.get('/transactions/sync/health');
            const mode = response.data?.bankingIntegration?.mode;
            if (mode === 'mock' || mode === 'real') {
                setSyncMode(mode);
                return;
            }
            setSyncMode('unknown');
        } catch (error) {
            console.error('Failed to fetch sync health', error);
            setSyncMode('unknown');
        }
    };
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
        fetchTransactions();
        fetchConsentStatus();
        fetchSyncHealth();
    }, []);

    const syncBank = async () => {
        if (!hasPFMConsent) {
            alert('PFM consent is required. Use Transactions page to enable PFM Consent first.');
            return;
        }

        try {
            setSyncing(true);
            await apiClient.post('/transactions/sync');
            await fetchTransactions();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const apiMessage =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.response?.data?.details;
                alert(apiMessage ? `Sync failed: ${apiMessage}` : 'Sync failed');
            } else {
                alert('Sync failed');
            }
        } finally {
            setSyncing(false);
        }
    };

    // Helper to determine color based on score
    const getScoreColor = (s: number) => {
        if (s >= 70) return 'var(--success)'; // Green
        if (s >= 40) return '#facc15';       // Yellow
        return 'var(--danger)';              // Red
    };

    const getStatusLabel = (s: number) => {
        if (s >= 70) return 'Excellent';
        if (s >= 40) return 'Needs Work';
        return 'Critical';
    };

    const getRiskLevel = (s: number) => {
        if (s >= 70) return 'Low';
        if (s >= 40) return 'Medium';
        return 'High';
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

            <div className="dashboard-layout dashboard-modern">
                {/* Top Row: Health Score & Cash Flow */}
                <div className="dashboard-top-row">
                    {/* Financial Health Score Card */}
                    <div className="card health-score-card">
                        <div className="score-card-header">
                            <div className="score-card-icon">♡</div>
                            <h3>Financial Health Score</h3>
                        </div>

                        <div className="score-display">
                            <div 
                                className="score-circle"
                                style={{
                                    background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, rgba(71, 85, 105, 0.55) 0deg)`
                                }}
                            >
                                <div className="score-inner">
                                    <span className="score-number">{loadingScore ? "..." : score}</span>
                                    <span className="score-label">/ 100</span>
                                </div>
                            </div>

                            <div className="score-status">
                                <span className={`status-text status-${getRiskLevel(score).toLowerCase()}`}>
                                    <span className="status-dot">●</span>
                                    {getStatusLabel(score)}
                                </span>
                                <p className="status-description">
                                    {score >= 70 ? "Great financial habits" : 
                                     score >= 40 ? "Room for improvement" : "Immediate attention needed"}
                                </p>
                            </div>
                        </div>

                        <div className="score-stats-grid">
                            <div className="score-stat-item">
                                <span className="score-stat-value">—</span>
                                <span className="score-stat-label">Savings</span>
                            </div>
                            <div className="score-stat-item">
                                <span className="score-stat-value">{loadingScore ? '...' : `${score}%`}</span>
                                <span className="score-stat-label">Score</span>
                            </div>
                            <div className="score-stat-item">
                                <span className="score-stat-value">{getRiskLevel(score)}</span>
                                <span className="score-stat-label">Risk</span>
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
                        <div className="transactions-header-actions">
                            <span className={`sync-mode-badge ${syncMode}`}>
                                Sync Mode: {syncMode.toUpperCase()}
                            </span>
                            <button
                                className="btn-sync"
                                onClick={syncBank}
                                disabled={syncing || hasPFMConsent === false}
                                title={hasPFMConsent === false ? 'Enable consent in Transactions page first' : 'Sync latest bank transactions'}
                            >
                                <span>🔄</span>
                                <span>{syncing ? 'Syncing...' : 'Sync Bank'}</span>
                            </button>
                        </div>
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
