import { formatDate as formatAppDate, formatMoney } from '../utils/appFormat';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { getAppPrefs } from '../utils/appFormat';
import { notify } from '../utils/systemMessages';
import axios from 'axios';
import { AIAssistant } from './AIAssistant';
import { SpendingTrends } from './SpendingTrends';
import { IconRefreshCw, IconRepeat, IconBrain } from './Icons';
import { getHealthStatus, noScoreMessage } from '../utils/healthScore';

// Minimal layout: balance across all recorded transactions, and this month's income and expenses
const BalanceSummary = () => {
    const [totals, setTotals] = useState<{ balance: number; income: number; expenses: number } | null>(null);

    useEffect(() => {
        apiClient.get('/transactions')
            .then(response => {
                const list: any[] = response.data?.data ?? [];
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                let balance = 0;
                let income = 0;
                let expenses = 0;
                list.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    const isIncome = t.type === 'income';
                    balance += isIncome ? amount : -amount;
                    if (new Date(t.date) >= monthStart) {
                        if (isIncome) income += amount;
                        else expenses += amount;
                    }
                });
                setTotals({ balance, income, expenses });
            })
            .catch(() => setTotals(null));
    }, []);

    const money = (value: number) => formatMoney(value);

    return (
        <div className="card" style={{ padding: '1.75rem', gridColumn: '1 / -1' }}>
            <div className="ds-card-title">Balance Summary</div>
            <div className="ds-card-subtitle">All recorded transactions, and this month&apos;s totals</div>
            <div className="score-stats-grid" style={{ marginTop: '1rem' }}>
                <div className="score-stat-item">
                    <span className="score-stat-value">{totals ? money(totals.balance) : '—'}</span>
                    <span className="score-stat-label">Balance</span>
                </div>
                <div className="score-stat-item">
                    <span className="score-stat-value" style={{ color: '#10b981' }}>{totals ? money(totals.income) : '—'}</span>
                    <span className="score-stat-label">Income this month</span>
                </div>
                <div className="score-stat-item">
                    <span className="score-stat-value" style={{ color: '#f43f5e' }}>{totals ? money(totals.expenses) : '—'}</span>
                    <span className="score-stat-label">Expenses this month</span>
                </div>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    // Dashboard layout chosen in Settings: detailed, compact or minimal
    const layout = getAppPrefs().dashboardLayout;
    const navigate = useNavigate();
    const [aiOpen, setAiOpen] = useState(false);
    const [score, setScore] = useState<number>(0);
    // 'none' = not enough data for a score yet; 'error' = the score could not be loaded
    const [scoreState, setScoreState] = useState<'ok' | 'none' | 'error'>('ok');
    const [noDataReason, setNoDataReason] = useState<string | null>(null);
    const [savingsRate, setSavingsRate] = useState<number | null>(null);
    const [loadingScore, setLoadingScore] = useState<boolean>(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
    const [syncing, setSyncing] = useState<boolean>(false);
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

    useEffect(() => {
        const fetchScore = async () => {
            try {
                const response = await apiClient.get('/transactions/score');
                if (typeof response.data.score === 'number') {
                    setScore(response.data.score);
                    setScoreState('ok');
                    if (response.data.metrics && typeof response.data.metrics.savingsRate === 'number') {
                        setSavingsRate(response.data.metrics.savingsRate);
                    }
                } else {
                    setScoreState('none');
                    setNoDataReason(response.data.noDataReason ?? null);
                }
            } catch {
                console.error('Failed to fetch score');
                setScoreState('error');
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
    }, []);

    const syncBank = async () => {
        try {
            setSyncing(true);
            await apiClient.post('/transactions/sync');
            await fetchTransactions();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const msg = error.response?.data?.message || error.response?.data?.error || error.response?.data?.details;
                notify.error(msg ? `Sync failed: ${msg}` : 'Sync failed. Please try again.');
            } else {
                notify.error('Sync failed. Please try again.');
            }
        } finally {
            setSyncing(false);
        }
    };

    // Same scale as the Financial Health page
    const hasScore = scoreState === 'ok';
    const healthStatus = hasScore
        ? getHealthStatus(score)
        : {
            label: scoreState === 'error' ? 'Unavailable' : 'No score yet',
            risk: '—',
            riskClass: 'none',
            color: '#94a3b8',
            description: scoreState === 'error' ? 'Could not load your score. Please refresh the page.' : noScoreMessage(noDataReason),
        };

    const formatDate = (dateString: string) => {
        return formatAppDate(dateString);
    };

    const formatAmount = (amount: number, type: string) => {
        const formatted = formatMoney(Math.abs(amount), 2);
        return type === 'expense' ? `-${formatted}` : `+${formatted}`;
    };

    // SVG ring values
    const RADIUS = 54;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const scoreColor = healthStatus.color;
    const dashOffset = CIRCUMFERENCE - (displayScore / 100) * CIRCUMFERENCE;

    return (
        <div className="notifications-page" style={{ width: '100%' }}>

            <div className="notifications-content">
                <div className="dashboard-grid">
                {layout === 'minimal' && <BalanceSummary />}

                {/* ── Financial Health Score Card ── */}
                {layout !== 'minimal' && (
                <div className="card health-score-card" style={{ padding: '1.75rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <div className="score-card-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', margin: 0 }}>
                        <div>
                            <div className="ds-card-title">Financial Health</div>
                            <div className="ds-card-subtitle">Based on the last 30 days</div>
                        </div>
                    </div>

                    <div className="score-display" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', margin: '0.5rem 0 0 0' }}>
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
                                    {loadingScore ? '…' : hasScore ? displayScore : '—'}
                                </span>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="score-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                            <span className={`status-text status-${healthStatus.riskClass}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="status-dot" aria-hidden="true">●</span>
                                {healthStatus.label}
                            </span>
                            <p className="status-description" style={{ marginTop: '0.25rem', margin: 0 }}>
                                {healthStatus.description}
                            </p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div 
                        className="score-stats-grid" 
                        style={{ marginTop: 'auto', cursor: 'pointer', transition: 'transform 0.2s', ...({ '&:hover': { transform: 'scale(1.02)' } } as any) }}
                        onClick={() => navigate('/financial-health')}
                        title="View detailed financial health"
                    >
                        <div className="score-stat-item">
                            <span className="score-stat-value" style={{ color: scoreColor }}>
                                {loadingScore || !hasScore ? '—' : score}
                            </span>
                            <span className="score-stat-label">Score</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value" style={{ color: savingsRate !== null && savingsRate >= 0 ? '#10b981' : '#f43f5e' }}>
                                {loadingScore || !hasScore ? '—' : savingsRate !== null ? `${Math.round(savingsRate * 100)}%` : '0%'}
                            </span>
                            <span className="score-stat-label">Savings</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value">{loadingScore ? '—' : healthStatus.risk}</span>
                            <span className="score-stat-label">Risk</span>
                        </div>
                    </div>
                </div>

                )}
                {/* ── Spending Trends Card ── */}
                {layout !== 'minimal' && <SpendingTrends />}

                {/* ── Recent Transactions Card ── */}
                {layout === 'detailed' && (
                <div className="card transactions-card" style={{ padding: '1.75rem' }}>
                    <div className="transactions-header">
                        <div>
                            <h3 style={{ marginBottom: 2 }}>Recent Transactions</h3>
                            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                                Latest {transactions.length} activities
                            </p>
                        </div>
                        <div className="transactions-header-actions">
                            <button
                                className="btn-sync"
                                onClick={syncBank}
                                disabled={syncing}
                                title="Sync latest bank transactions"
                                aria-label="Sync bank transactions"
                            >
                                <span aria-hidden="true" style={{ display: 'flex' }}><IconRefreshCw size={16} /></span>
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
                                                <span className="category-badge">
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

                )}
                {/* ── Recurring Subscriptions Card ── */}
                {layout === 'detailed' && (
                <div 
                    className="card subscriptions-card" 
                    style={{ 
                        padding: '1.75rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        ...({ '&:hover': { transform: 'scale(1.02)' } } as any)
                    }}
                    onClick={() => navigate('/recurring')}
                    title="View cash flow and subscriptions"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div className="ds-card-icon" style={{
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.2)'
                        }}><IconRepeat size={24} /></div>
                        <div>
                            <div className="ds-card-title">Subscriptions</div>
                            <div className="ds-card-subtitle">Recurring charges detected</div>
                        </div>
                        <button
                            type="button"
                            className="ds-btn ds-btn-ghost ds-btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setAiOpen(true);
                            }}
                            style={{ marginLeft: 'auto', fontSize: 12 }}
                            aria-label="Open AI Assistant"
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconBrain size={14} /> AI Coach</span>
                        </button>
                    </div>

                    <div className="subscriptions-content">
                        <div className="subscriptions-icon" style={{ display: 'none' }}></div>
                        <div className="subscriptions-info">
                            <h3>Recurring Subscriptions</h3>
                            <p>Detected from your transaction history.</p>
                        </div>
                        <div className="subscriptions-status">
                            <p>None found</p>
                        </div>
                    </div>
                </div>
                )}

            </div>
            </div>

            {/* AI Assistant Modal */}
            <AIAssistant open={aiOpen} onOpenChange={setAiOpen} />
        </div>
    );
};
