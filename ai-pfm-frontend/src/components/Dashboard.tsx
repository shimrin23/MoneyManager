import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client.ts';
import axios from 'axios';
import { CashFlowForecast } from './CashFlowForecast';
import { AIAssistant } from './AIAssistant';

export const Dashboard = () => {
    const [aiOpen, setAiOpen] = useState(false);
    const [score, setScore] = useState<number>(0);
    const [loadingScore, setLoadingScore] = useState<boolean>(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
    const [hasPFMConsent, setHasPFMConsent] = useState<boolean | null>(null);
    const [syncing, setSyncing] = useState<boolean>(false);
    const [syncMode, setSyncMode] = useState<'mock' | 'real' | 'unknown'>('unknown');
    const [displayScore, setDisplayScore] = useState(0);
    const animFrameRef = useRef<number>(0);

    const fetchTransactions = async () => {
        try {
            const response = await apiClient.get('/transactions');
            setTransactions((response.data?.data ?? []).slice(0, 6));
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const fetchConsentStatus = async () => {
        try {
            const response = await apiClient.get('/consent/check/pfm_analysis');
            setHasPFMConsent(!!response.data?.hasConsent);
        } catch {
            setHasPFMConsent(false);
        }
    };

    const fetchSyncHealth = async () => {
        try {
            const response = await apiClient.get('/transactions/sync/health');
            const mode = response.data?.bankingIntegration?.mode;
            setSyncMode(mode === 'mock' || mode === 'real' ? mode : 'unknown');
        } catch {
            setSyncMode('unknown');
        }
    };

    useEffect(() => {
        const fetchScore = async () => {
            try {
                const response = await apiClient.get('/transactions/score');
                setScore(response.data.score);
            } catch {
                console.error('Failed to fetch score');
            } finally {
                setLoadingScore(false);
            }
        };
        fetchScore();
    }, []);

    // Animate score counter
    useEffect(() => {
        if (loadingScore) return;
        const start = performance.now();
        const duration = 1200;
        const animate = (now: number) => {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            setDisplayScore(Math.round(eased * score));
            if (elapsed < 1) animFrameRef.current = requestAnimationFrame(animate);
        };
        animFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [score, loadingScore]);

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
                const msg = error.response?.data?.message || error.response?.data?.error || error.response?.data?.details;
                alert(msg ? `Sync failed: ${msg}` : 'Sync failed');
            } else {
                alert('Sync failed');
            }
        } finally {
            setSyncing(false);
        }
    };

    const getScoreColor = (s: number) => {
        if (s >= 70) return '#10b981';
        if (s >= 40) return '#f59e0b';
        return '#ef4444';
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatAmount = (amount: number, type: string) => {
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD'
        }).format(Math.abs(amount));
        return type === 'expense' ? `-${formatted}` : `+${formatted}`;
    };

    const getCategoryColor = (category: string) => {
        const map: Record<string, string> = {
            'Food & Dining': '#f59e0b', 'Shopping': '#8b5cf6', 'Entertainment': '#ec4899',
            'Transport': '#06b6d4', 'Bills & Utilities': '#ef4444', 'Healthcare': '#10b981',
            'Education': '#3b82f6', 'Travel': '#f97316', 'Salary': '#10b981',
            'Freelance': '#6366f1', 'Business': '#06b6d4', 'Investment': '#8b5cf6',
        };
        return map[category] || '#64748b';
    };

    // SVG ring values
    const RADIUS = 54;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const scoreColor = getScoreColor(score);
    const dashOffset = CIRCUMFERENCE - (displayScore / 100) * CIRCUMFERENCE;

    return (
        <div className="page-container" style={{ width: '100%' }}>
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="page-subtitle">Your financial overview at a glance</p>
                </div>
            </div>

            <div className="dashboard-grid">

                {/* ── Financial Health Score Card ── */}
                <div className="card health-score-card" style={{ padding: '1.75rem' }}>
                    <div className="score-card-header">
                        <div className="score-card-icon" style={{
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                            ♡
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="ds-card-title">Financial Health</div>
                            <div className="ds-card-subtitle">Based on your transactions</div>
                        </div>
                    </div>

                    <div className="score-display">
                        {/* SVG Animated Ring */}
                        <div className="score-ring-wrap" style={{ width: 128, height: 128 }}>
                            <svg
                                width="128"
                                height="128"
                                viewBox="0 0 128 128"
                                role="img"
                                aria-label={`Financial health score: ${score} out of 100`}
                            >
                                {/* Gradient definition */}
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={scoreColor} />
                                        <stop offset="100%" stopColor={scoreColor} stopOpacity={0.7} />
                                    </linearGradient>
                                </defs>
                                {/* Track */}
                                <circle
                                    cx="64" cy="64" r={RADIUS}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.06)"
                                    strokeWidth="12"
                                    transform="rotate(-90 64 64)"
                                />
                                {/* Fill */}
                                <circle
                                    cx="64" cy="64" r={RADIUS}
                                    fill="none"
                                    stroke={`url(#scoreGrad)`}
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={CIRCUMFERENCE}
                                    strokeDashoffset={loadingScore ? CIRCUMFERENCE : dashOffset}
                                    transform="rotate(-90 64 64)"
                                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                                />
                            </svg>
                            {/* Center label */}
                            <div className="score-ring-center">
                                <span className="score-number" style={{ color: scoreColor }}>
                                    {loadingScore ? '…' : displayScore}
                                </span>
                                <span className="score-label">/100</span>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="score-status">
                            <span className={`status-text status-${getRiskLevel(score).toLowerCase()}`}>
                                <span className="status-dot" aria-hidden="true">●</span>
                                {getStatusLabel(score)}
                            </span>
                            <p className="status-description" style={{ marginTop: '0.5rem' }}>
                                {score >= 70 ? 'Great financial habits! Keep it up.' :
                                 score >= 40 ? 'Good start — there\'s room to grow.' :
                                 'Attention needed — let\'s improve together.'}
                            </p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="score-stats-grid">
                        <div className="score-stat-item">
                            <span className="score-stat-value" style={{ color: scoreColor }}>
                                {loadingScore ? '—' : `${score}%`}
                            </span>
                            <span className="score-stat-label">Score</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value">—</span>
                            <span className="score-stat-label">Savings</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value">{getRiskLevel(score)}</span>
                            <span className="score-stat-label">Risk</span>
                        </div>
                    </div>
                </div>

                {/* ── Cash Flow Forecast Card ── */}
                <CashFlowForecast />

                {/* ── Recent Transactions Card ── */}
                <div className="card transactions-card" style={{ padding: '1.75rem' }}>
                    <div className="transactions-header">
                        <div>
                            <h3 style={{ marginBottom: 2 }}>Recent Transactions</h3>
                            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                                Latest {transactions.length} activities
                            </p>
                        </div>
                        <div className="transactions-header-actions">
                            <span className={`sync-mode-badge ${syncMode}`}>
                                {syncMode.toUpperCase()}
                            </span>
                            <button
                                className="btn-sync"
                                onClick={syncBank}
                                disabled={syncing || hasPFMConsent === false}
                                title={hasPFMConsent === false ? 'Enable consent in Transactions page first' : 'Sync latest bank transactions'}
                                aria-label="Sync bank transactions"
                            >
                                <span aria-hidden="true">{syncing ? '⏳' : '🔄'}</span>
                                <span>{syncing ? 'Syncing…' : 'Sync'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="transactions-table-container">
                        <table className="transactions-table responsive-table" aria-label="Recent transactions">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingTransactions ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            Loading transactions…
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            No transactions yet. Add your first transaction to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx._id || tx.id}>
                                            <td data-label="Date" style={{ color: 'var(--color-text-muted)' }}>
                                                {formatDate(tx.date)}
                                            </td>
                                            <td data-label="Description" style={{ fontWeight: 500, maxWidth: 220 }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 200 }}>
                                                    {tx.description || '—'}
                                                </span>
                                            </td>
                                            <td data-label="Category">
                                                <span
                                                    className="category-badge"
                                                    style={{
                                                        background: `${getCategoryColor(tx.category)}18`,
                                                        color: getCategoryColor(tx.category),
                                                        borderColor: `${getCategoryColor(tx.category)}30`,
                                                    }}
                                                >
                                                    {tx.category}
                                                </span>
                                            </td>
                                            <td
                                                data-label="Amount"
                                                className={`text-right ${tx.type === 'expense' ? 'text-danger' : 'text-success'}`}
                                                style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatAmount(tx.amount, tx.type)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Recurring Subscriptions Card ── */}
                <div className="card subscriptions-card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div className="ds-card-icon" style={{
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.2)'
                        }}>📅</div>
                        <div>
                            <div className="ds-card-title">Subscriptions</div>
                            <div className="ds-card-subtitle">Recurring charges detected</div>
                        </div>
                        <button
                            type="button"
                            className="ds-btn ds-btn-ghost ds-btn-sm"
                            onClick={() => setAiOpen(true)}
                            style={{ marginLeft: 'auto', fontSize: 12 }}
                            aria-label="Open AI Assistant"
                        >
                            🤖 AI Coach
                        </button>
                    </div>

                    <div className="subscriptions-content">
                        <div className="subscriptions-icon">📅</div>
                        <div className="subscriptions-info">
                            <h3>Recurring Subscriptions</h3>
                            <p>Detected from your transaction history.</p>
                        </div>
                        <div className="subscriptions-status">
                            <p>None found</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* AI Assistant Modal */}
            <AIAssistant open={aiOpen} onOpenChange={setAiOpen} />
        </div>
    );
};
