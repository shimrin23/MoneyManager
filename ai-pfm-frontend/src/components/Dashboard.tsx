import { formatDate as formatAppDate, formatMoney } from '../utils/appFormat';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { getAppPrefs } from '../utils/appFormat';
import { notify } from '../utils/systemMessages';
import axios from 'axios';
import { AIAssistant } from './AIAssistant';
import { SpendingTrends } from './SpendingTrends';
import { IconRefreshCw, IconBrain } from './Icons';
import { getHealthStatus, noScoreMessage } from '../utils/healthScore';
import { useAdminLang } from '../i18n/adminText';
import { DASHBOARD_T, fillText } from '../i18n/dashboardText';

// Date and month names follow the selected language
const DATE_LOCALE = { en: 'en-GB', si: 'si-LK', ta: 'ta-LK' } as const;

// Minimal layout: balance across all recorded transactions, and this month's income and expenses
const BalanceSummary = () => {
    const lang = useAdminLang();
    const t = DASHBOARD_T[lang];
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
            <div className="ds-card-title">{t.balanceTitle}</div>
            <div className="ds-card-subtitle">{t.balanceSub}</div>
            <div className="score-stats-grid" style={{ marginTop: '1rem' }}>
                <div className="score-stat-item">
                    <span className="score-stat-value">{totals ? money(totals.balance) : '—'}</span>
                    <span className="score-stat-label">{t.balance}</span>
                </div>
                <div className="score-stat-item">
                    <span className="score-stat-value" style={{ color: '#10b981' }}>{totals ? money(totals.income) : '—'}</span>
                    <span className="score-stat-label">{t.incomeThisMonth}</span>
                </div>
                <div className="score-stat-item">
                    <span className="score-stat-value" style={{ color: '#f43f5e' }}>{totals ? money(totals.expenses) : '—'}</span>
                    <span className="score-stat-label">{t.expensesThisMonth}</span>
                </div>
            </div>
        </div>
    );
};

// Greeting and this month's headline numbers (income, expenses, net saved, available credit)
const DashboardSummary = ({ showStats }: { showStats: boolean }) => {
    const lang = useAdminLang();
    const t = DASHBOARD_T[lang];
    const [firstName, setFirstName] = useState('');
    const [month, setMonth] = useState<{ income: number; expenses: number; expenseCount: number; incomeCategories: string[] } | null>(null);
    const [credit, setCredit] = useState<{ available: number; cards: number } | null>(null);

    useEffect(() => {
        apiClient.get('/auth/profile')
            .then(res => setFirstName(String(res.data?.user?.name || '').trim().split(' ')[0]))
            .catch(() => setFirstName(''));

        apiClient.get('/transactions')
            .then(res => {
                const list: any[] = res.data?.data ?? [];
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                let income = 0;
                let expenses = 0;
                let expenseCount = 0;
                const incomeCategories: string[] = [];
                list.forEach(t => {
                    if (new Date(t.date) < monthStart) return;
                    const amount = Number(t.amount) || 0;
                    if (t.type === 'income') {
                        income += amount;
                        if (t.category && !incomeCategories.includes(t.category)) incomeCategories.push(t.category);
                    } else {
                        expenses += amount;
                        expenseCount += 1;
                    }
                });
                setMonth({ income, expenses, expenseCount, incomeCategories });
            })
            .catch(() => setMonth(null));

        apiClient.get('/credit-cards')
            .then(res => {
                const cards: any[] = res.data?.cards ?? [];
                const available = cards.reduce((sum, c) => sum + ((Number(c.creditLimit) || 0) - (Number(c.currentBalance) || 0)), 0);
                setCredit({ available, cards: cards.length });
            })
            .catch(() => setCredit(null));
    }, []);

    const today = new Date();
    const locale = DATE_LOCALE[lang];
    const monthName = today.toLocaleDateString(locale, { month: 'long' });
    const dateLabel = today.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const shortDateLabel = today.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const net = month ? month.income - month.expenses : 0;
    const savingsRate = month && month.income > 0 ? Math.round((net / month.income) * 100) : null;
    const incomeSources = month?.incomeCategories ?? [];
    const incomeSub = incomeSources.length === 0
        ? t.noIncomeYet
        : incomeSources.length <= 2
            ? incomeSources.join(' and ')
            : `${incomeSources.slice(0, 2).join(', ')} and more`;

    return (
        <>
            <div className="db-hello">
                <p className="db-eyebrow">
                    <span className="db-eyebrow-full">{dateLabel}</span>
                    <span className="db-eyebrow-short">{shortDateLabel}</span>
                </p>
                <h2>{t.welcomeBack}{firstName ? <>,<span className="db-hello-name"> {firstName}</span></> : ''}</h2>
            </div>

            {showStats && (
                <div className="db-stats">
                    <div className="db-stat">
                        <span className="db-stat-l">{fillText(t.incomeLabel, { month: monthName })}</span>
                        <span className="db-stat-v" style={{ color: '#10b981' }}>{month ? formatMoney(month.income) : '—'}</span>
                        <span className="db-stat-s">{month ? incomeSub : ''}</span>
                    </div>
                    <div className="db-stat">
                        <span className="db-stat-l">{fillText(t.expensesLabel, { month: monthName })}</span>
                        <span className="db-stat-v">{month ? formatMoney(month.expenses) : '—'}</span>
                        <span className="db-stat-s">{month ? (month.expenseCount === 1 ? fillText(t.txCountOne, { n: 1 }) : fillText(t.txCount, { n: month.expenseCount })) : ''}</span>
                    </div>
                    <div className="db-stat">
                        <span className="db-stat-l">{t.netSaved}</span>
                        <span className="db-stat-v" style={{ color: net < 0 ? '#f43f5e' : undefined }}>{month ? formatMoney(net) : '—'}</span>
                        <span className="db-stat-s">{savingsRate !== null ? fillText(t.savingsRate, { n: savingsRate }) : ''}</span>
                    </div>
                    <div className="db-stat">
                        <span className="db-stat-l">{t.availableCredit}</span>
                        <span className="db-stat-v">{credit ? formatMoney(credit.available) : '—'}</span>
                        <span className="db-stat-s">{credit ? (credit.cards === 0 ? t.noCardsAdded : credit.cards === 1 ? fillText(t.cardCountOne, { n: 1 }) : fillText(t.cardCount, { n: credit.cards })) : ''}</span>
                    </div>
                </div>
            )}
        </>
    );
};

export const Dashboard = () => {
    const lang = useAdminLang();
    const t = DASHBOARD_T[lang];
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
                notify.error(msg ? fillText(t.syncFailed, { msg }) : t.syncFailedGeneric);
            } else {
                notify.error(t.syncFailedGeneric);
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
            label: scoreState === 'error' ? t.unavailable : t.noScoreYet,
            risk: '—',
            riskClass: 'none',
            color: '#94a3b8',
            description: scoreState === 'error' ? t.couldNotLoadScore : noScoreMessage(noDataReason),
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
        <div className="page-container db-page">
            {/* Minimal layout already shows its own balance summary below */}
            <DashboardSummary showStats={layout !== 'minimal'} />

            <div className="db-grid">
                {layout === 'minimal' && <BalanceSummary />}

                {/* ── Financial Health Score Card ── */}
                {layout !== 'minimal' && (
                <section className="db-card db-span4 db-health">
                    <header className="db-card-h">
                        <div>
                            <h3>{t.financialHealth}</h3>
                            <p>{t.basedOn30}</p>
                        </div>
                        <span className={`db-pill status-${healthStatus.riskClass}`} style={{ color: scoreColor }}>
                            {healthStatus.label}
                        </span>
                    </header>

                    <div className="db-health-body">
                        {/* SVG Animated Ring */}
                        <div className="db-ring">
                            <svg
                                width="150"
                                height="150"
                                viewBox="0 0 128 128"
                                role="img"
                                aria-label={`Financial health score: ${score} out of 100`}
                            >
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={scoreColor} />
                                        <stop offset="100%" stopColor={scoreColor} stopOpacity={0.7} />
                                    </linearGradient>
                                </defs>
                                <circle
                                    className="db-ring-track"
                                    cx="64" cy="64" r={RADIUS}
                                    fill="none"
                                    strokeWidth="12"
                                    transform="rotate(-90 64 64)"
                                />
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
                            <div className="db-ring-center">
                                <span className="db-ring-value" style={{ color: scoreColor }}>
                                    {loadingScore ? '…' : hasScore ? displayScore : '—'}
                                </span>
                            </div>
                        </div>

                        <p className="db-health-desc">{healthStatus.description}</p>
                    </div>

                    {/* Stats row */}
                    <button
                        type="button"
                        className="db-mini3"
                        onClick={() => navigate('/financial-health')}
                        title={t.viewDetailedHealth}
                    >
                        <span>
                            <b style={{ color: scoreColor }}>{loadingScore || !hasScore ? '—' : score}</b>
                            <small>{t.score}</small>
                        </span>
                        <span>
                            <b style={{ color: savingsRate !== null && savingsRate >= 0 ? '#10b981' : '#f43f5e' }}>
                                {loadingScore || !hasScore ? '—' : savingsRate !== null ? `${Math.round(savingsRate * 100)}%` : '0%'}
                            </b>
                            <small>{t.savings}</small>
                        </span>
                        <span>
                            <b>{loadingScore ? '—' : healthStatus.risk}</b>
                            <small>{t.risk}</small>
                        </span>
                    </button>
                </section>
                )}

                {/* ── Spending Trends Card ── */}
                {layout !== 'minimal' && (
                    <div className="db-span8 db-trends">
                        <SpendingTrends />
                    </div>
                )}

                {/* ── Recent Transactions Card ── */}
                {layout === 'detailed' && (
                <section className="db-card db-span8">
                    <header className="db-card-h">
                        <div>
                            <h3>{t.recentTransactions}</h3>
                            <p>{fillText(t.latestActivities, { n: transactions.length })}</p>
                        </div>
                        <button
                            className="btn-secondary db-btn-sm"
                            onClick={syncBank}
                            disabled={syncing}
                            title={t.syncTitle}
                            aria-label={t.syncAria}
                        >
                            <span aria-hidden="true" style={{ display: 'flex' }}><IconRefreshCw size={14} /></span>
                            <span>{syncing ? t.syncing : t.sync}</span>
                        </button>
                    </header>

                    <div className="db-list" aria-label="Recent transactions">
                        {loadingTransactions ? (
                            <p className="db-empty">{t.loadingTransactions}</p>
                        ) : transactions.length === 0 ? (
                            <p className="db-empty">{t.noTransactionsYet}</p>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx._id || tx.id} className="db-list-i">
                                    <div className="db-list-main">
                                        <div className="db-list-t">{tx.category || '—'}</div>
                                        <div className="db-list-s">
                                            {formatDate(tx.date)}{tx.description ? ` · ${tx.description}` : ''}
                                        </div>
                                    </div>
                                    <div className={`db-amt ${tx.type === 'expense' ? 'expense' : 'income'}`}>
                                        {formatAmount(tx.amount, tx.type)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                )}

                {/* ── Recurring Subscriptions Card ── */}
                {layout === 'detailed' && (
                <section
                    className="db-card db-span4 db-clickable"
                    onClick={() => navigate('/recurring')}
                    title={t.viewCashFlow}
                >
                    <header className="db-card-h">
                        <div>
                            <h3>{t.subscriptionsTitle}</h3>
                            <p>{t.recurringDetected}</p>
                        </div>
                        <button
                            type="button"
                            className="db-ghost-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setAiOpen(true);
                            }}
                            aria-label={t.openAiAria}
                        >
                            <IconBrain size={14} /> {t.openAiCoach}
                        </button>
                    </header>

                    <div className="db-list">
                        <div className="db-list-i">
                            <div className="db-list-main">
                                <div className="db-list-t">{t.recurringSubscriptions}</div>
                                <div className="db-list-s">{t.detectedFromHistory}</div>
                            </div>
                            <div className="db-amt db-muted">{t.noneFound}</div>
                        </div>
                    </div>
                </section>
                )}
            </div>

            {/* AI Assistant Modal */}
            <AIAssistant open={aiOpen} onOpenChange={setAiOpen} />
        </div>
    );
};
