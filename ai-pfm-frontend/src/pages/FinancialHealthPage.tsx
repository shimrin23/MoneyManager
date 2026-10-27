import { formatMoney } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { AIAssistant } from '../components/AIAssistant';
import { getHealthStatus, noScoreMessage } from '../utils/healthScore';
import { IconActivity, IconTrendingUp, IconCreditCard, IconLandmark, IconTarget, IconBarChart, IconLightbulb } from '../components/Icons';

interface HealthMetrics {
    hasData: boolean;
    noDataReason: string | null;
    score: number | null;
    liquidityRatio: number;
    debtToIncomeRatio: number;
    savingsRate: number;
    creditUtilization: number;
    emergencyFund: number;
    emergencyFundMonths: number;
    netWorth: number;
    discretionaryRatio: number;
    recommendations: string[];
}

interface PeerBenchmark {
    category: string;
    userValue: number;
    peerAverage: number;
    percentile: number;
    higherIsBetter: boolean;
    comparison: 'above' | 'below' | 'average';
}

interface PeerInfo {
    peerCount: number;
    reason?: 'no-data' | 'not-enough-peers';
    minPeers?: number;
}

interface HealthResponse {
    hasData?: boolean;
    noDataReason?: string | null;
    score?: number | null;
    metrics?: Partial<Record<string, number>>;
    recommendations?: string[];
}

const normalizeHealthMetrics = (payload: HealthResponse): HealthMetrics => {
    const m = payload?.metrics ?? {};
    return {
        hasData: payload?.hasData !== false && typeof payload?.score === 'number',
        noDataReason: payload?.noDataReason ?? null,
        score: typeof payload?.score === 'number' ? payload.score : null,
        liquidityRatio: Number(m.liquidityRatio ?? 0),
        debtToIncomeRatio: Number(m.debtToIncomeRatio ?? 0),
        savingsRate: Number(m.savingsRate ?? 0),
        creditUtilization: Number(m.creditUtilization ?? 0),
        emergencyFund: Number(m.emergencyFund ?? 0),
        emergencyFundMonths: Number(m.emergencyFundMonths ?? 0),
        netWorth: Number(m.netWorth ?? 0),
        discretionaryRatio: Number(m.discretionaryRatio ?? 0),
        recommendations: Array.isArray(payload?.recommendations) ? payload.recommendations : []
    };
};

const renderBenchmarkValue = (category: string, value: number) => {
    if (category === 'Net Worth') return `${formatMoney(value)}`;
    if (category === 'Emergency Fund Health') return `${value} months`;
    if (category === 'Financial Health Score') return `${value}`;
    return `${value}%`;
};

// "Better" depends on the metric: a higher savings rate is good, a higher debt ratio is not
const benchmarkVerdict = (b: PeerBenchmark): 'better' | 'worse' | 'same' => {
    if (b.comparison === 'average') return 'same';
    const higher = b.comparison === 'above';
    return higher === b.higherIsBetter ? 'better' : 'worse';
};

const keyFinding = (benchmarks: PeerBenchmark[]) => {
    const better = benchmarks.filter(b => benchmarkVerdict(b) === 'better').map(b => b.category);
    const worse = benchmarks.filter(b => benchmarkVerdict(b) === 'worse').map(b => b.category);
    if (worse.length === 0) return 'You are at or above the average of other users on every measure. Keep it up.';
    if (better.length === 0) return `You are behind the average on every measure. Start with ${worse[0]}.`;
    return `You are ahead of other users on ${better.join(', ')}. Focus next on ${worse.join(', ')}.`;
};

const getBenchmarkIcon = (category: string) => {
    switch (category) {
        case 'Financial Health Score': return <IconActivity size={18} />;
        case 'Savings Rate': return <IconTrendingUp size={18} />;
        case 'Debt-to-Income Ratio': return <IconCreditCard size={18} />;
        case 'Liquidity Ratio': return <IconLandmark size={18} />;
        case 'Credit Utilization': return <IconCreditCard size={18} />;
        case 'Emergency Fund Health': return <IconTarget size={18} />;
        case 'Net Worth': return <IconLandmark size={18} />;
        case 'Discretionary Ratio': return <IconBarChart size={18} />;
        default: return <IconActivity size={18} />;
    }
};

export const FinancialHealthPage = () => {
    const [aiOpen, setAiOpen] = useState(false);
    const [health, setHealth] = useState<HealthMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [peerBenchmarks, setPeerBenchmarks] = useState<PeerBenchmark[]>([]);
    const [peerInfo, setPeerInfo] = useState<PeerInfo>({ peerCount: 0 });

    useEffect(() => {
        refreshHealthData();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refreshHealthData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        const intervalId = window.setInterval(() => {
            refreshHealthData(false);
        }, 30000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.clearInterval(intervalId);
        };
    }, []);

    const refreshHealthData = async (showRefreshingState = true) => {
        if (showRefreshingState) {
            setRefreshing(true);
        }

        try {
            const [scoreResponse, benchmarkResponse] = await Promise.all([
                apiClient.get('/transactions/score'),
                apiClient.get('/transactions/peer-benchmarks')
            ]);

            setHealth(normalizeHealthMetrics(scoreResponse.data));
            setPeerBenchmarks(benchmarkResponse.data?.benchmarks || []);
            setPeerInfo({
                peerCount: benchmarkResponse.data?.peerCount ?? 0,
                reason: benchmarkResponse.data?.reason,
                minPeers: benchmarkResponse.data?.minPeers
            });
            setLoadError(null);
        } catch (error) {
            // Keep showing the last real numbers (if any) and say that the refresh failed
            console.error('Error fetching health score:', error);
            setLoadError(getApiErrorMessage(error, 'Could not load your financial health right now.'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) return <div className="loading">Analyzing your financial health...</div>;

    // Nothing loaded at all: show the error instead of a made-up score of 0
    if (!health) {
        return (
            <div className="page-container financial-health-page">
                <div className="ds-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0 }}>Financial health is unavailable</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>{loadError || 'Could not load your financial health right now.'}</p>
                    <button className="action-btn primary" onClick={() => refreshHealthData()} disabled={refreshing}>
                        {refreshing ? 'Retrying...' : 'Retry'}
                    </button>
                </div>
            </div>
        );
    }

    const hasScore = health.hasData && health.score !== null;
    const score = health.score ?? 0;
    const scoreStatus = hasScore
        ? getHealthStatus(score)
        : { label: 'No score yet', riskClass: 'none', color: '#94a3b8', description: noScoreMessage(health.noDataReason), risk: '-' };
    const scoreColor = scoreStatus.color;
    const RADIUS = 54;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const dashOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

    return (
        <div className="page-container financial-health-page">
            {refreshing && (
                <div className="page-header" style={{ marginBottom: '1rem' }}>
                    <p className="page-subtitle" style={{ color: '#0ea5e9' }}>Refreshing live health data...</p>
                </div>
            )}

            {loadError && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#ef4444' }}>
                    <span>{loadError} Showing your last loaded numbers.</span>
                    <button className="action-btn secondary small" onClick={() => refreshHealthData()}>Retry</button>
                </div>
            )}

            <div className="content-grid">
                {/* Health Score Card */}
                <div className="ds-card health-score-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Your Financial Health Score</h3>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Based on the last 30 days</p>
                        </div>
                        
                        <div className="score-ring-container" style={{ position: 'relative', width: '160px', height: '160px' }}>
                            <svg width="160" height="160" viewBox="0 0 128 128" style={{ display: 'block', margin: '0 auto', filter: `drop-shadow(0 4px 12px ${scoreColor}40)` }}>
                                <defs>
                                    <linearGradient id="scoreGradHealth" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={scoreColor} />
                                        <stop offset="100%" stopColor={scoreColor} stopOpacity={0.7} />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="64" cy="64" r={RADIUS}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.06)"
                                    strokeWidth="12"
                                    transform="rotate(-90 64 64)"
                                />
                                <circle
                                    cx="64" cy="64" r={RADIUS}
                                    fill="none"
                                    stroke={`url(#scoreGradHealth)`}
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={CIRCUMFERENCE}
                                    strokeDashoffset={dashOffset}
                                    transform="rotate(-90 64 64)"
                                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                                />
                            </svg>
                            <div className="score-ring-center" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span className="score-number" style={{ color: scoreColor, fontSize: '2.5rem', fontWeight: '800', lineHeight: '1', marginTop: '10px' }}>
                                    {hasScore ? score : '—'}
                                </span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Score</span>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="score-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                            <span className={`status-text status-${scoreStatus.riskClass}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="status-dot" aria-hidden="true" style={{ marginRight: '6px' }}>●</span>
                                {scoreStatus.label}
                            </span>
                            <p className="status-description" style={{ marginTop: '0.25rem', margin: 0, textAlign: 'center' }}>
                                {scoreStatus.description}
                            </p>
                            {hasScore && (
                                <p className="status-description" style={{ margin: 0, textAlign: 'center' }}>
                                    Risk: <strong>{scoreStatus.risk}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="ds-card metrics-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0' }}>Key Financial Metrics</h3>
                    <div className="score-stats-grid" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                        <div className="score-stat-item">
                            <span className="score-stat-value" style={{ color: health.savingsRate >= 0 ? '#10b981' : '#f43f5e' }}>
                                {(health.savingsRate * 100).toFixed(1)}%
                            </span>
                            <span className="score-stat-label">Savings Rate</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value">
                                {(health.debtToIncomeRatio * 100).toFixed(1)}%
                            </span>
                            <span className="score-stat-label">Debt Ratio</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value">
                                {(health.liquidityRatio * 100).toFixed(1)}%
                            </span>
                            <span className="score-stat-label">Liquidity Ratio</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value" style={{ color: health.creditUtilization > 0.3 ? '#f43f5e' : '#10b981' }}>
                                {(health.creditUtilization * 100).toFixed(1)}%
                            </span>
                            <span className="score-stat-label">Credit Util.</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value" style={{ color: health.emergencyFundMonths >= 3 ? '#10b981' : '#f43f5e' }}>
                                {health.emergencyFundMonths.toFixed(1)}m
                            </span>
                            <span className="score-stat-label" title={`Saved in emergency goals: ${formatMoney(health.emergencyFund)}, divided by the last 30 days of expenses`}>Emergency Fund</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value">
                                {formatMoney(health.netWorth)}
                            </span>
                            <span className="score-stat-label">Net Worth</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value">
                                {(health.discretionaryRatio * 100).toFixed(1)}%
                            </span>
                            <span className="score-stat-label">Discretionary Ratio</span>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {health.recommendations && health.recommendations.length > 0 && (
                    <div className="ds-card recommendations-card full-width" style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Personalized Recommendations</h3>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Actionable steps to improve your score</p>
                        </div>
                        <ul className="recommendations-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {health.recommendations.map((rec, index) => (
                                <li key={index} className="recommendation-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', background: 'var(--color-surface-1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                    <div className="rec-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', flexShrink: 0 }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <span style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.5', paddingTop: '2px' }}>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Peer Benchmarking */}
                <div className="ds-card peer-benchmarks-card full-width" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>How You Compare to Peers</h3>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                            {peerBenchmarks.length > 0
                                ? `Compared with ${peerInfo.peerCount} other MoneyManager users who have a score`
                                : peerInfo.reason === 'not-enough-peers'
                                    ? `The comparison appears once at least ${peerInfo.minPeers ?? 3} other users have a score (${peerInfo.peerCount} so far).`
                                    : 'Get your own score first to compare with other users.'}
                        </p>
                    </div>
                    {peerBenchmarks.length > 0 && (
                    <div className="goals-grid gl-grid">
                        {peerBenchmarks.map((benchmark, index) => {
                            const verdict = benchmarkVerdict(benchmark);
                            const pillClass = verdict === 'better' ? 'completed' : verdict === 'worse' ? 'paused' : 'in-progress';
                            const pillText = verdict === 'better' ? 'Better than avg' : verdict === 'worse' ? 'Below avg' : 'Average';
                            const standingColor = verdict === 'better' ? '#10b981' : verdict === 'worse' ? '#ef4444' : '#3b82f6';
                            const standingText = verdict === 'better' ? 'Above peer average' : verdict === 'worse' ? 'Below peer average' : 'On par with peers';

                            return (
                                <article key={index} className="gl-card">
                                    <div className="gl-head">
                                        <div className="gl-head-main">
                                            <span className="gl-icon">{getBenchmarkIcon(benchmark.category)}</span>
                                            <div className="gl-head-text">
                                                <h3>{benchmark.category}</h3>
                                                <span className="gl-sub">{benchmark.higherIsBetter ? 'Higher is better' : 'Lower is better'}</span>
                                            </div>
                                        </div>
                                        <span className={`gl-pill ${pillClass}`}>
                                            {pillText}
                                        </span>
                                    </div>

                                    <div className="gl-progress">
                                        <div className="gl-amounts">
                                            <span className="gl-current">{renderBenchmarkValue(benchmark.category, benchmark.userValue)}</span>
                                            <span className="gl-target">Peer Avg: {renderBenchmarkValue(benchmark.category, benchmark.peerAverage)}</span>
                                        </div>
                                        <div className="gl-bar">
                                            <span style={{ width: `${Math.min(100, Math.max(0, benchmark.percentile))}%`, backgroundColor: '#10b981' }} />
                                        </div>
                                        <div className="gl-row">
                                            <span>Better than {benchmark.percentile}% of users</span>
                                            <span>{benchmark.percentile >= 50 ? 'Top half' : 'Growth area'}</span>
                                        </div>
                                    </div>

                                    <div className="gl-kv">
                                        <div>
                                            <span>Your Value:</span>
                                            <span>{renderBenchmarkValue(benchmark.category, benchmark.userValue)}</span>
                                        </div>
                                        <div>
                                            <span>Peer Average:</span>
                                            <span>{renderBenchmarkValue(benchmark.category, benchmark.peerAverage)}</span>
                                        </div>
                                        <div>
                                            <span>Standing:</span>
                                            <span style={{ color: standingColor }}>{standingText}</span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    )}
                    {peerBenchmarks.length > 0 && (
                    <div className="gl-ai" style={{ marginTop: '1.25rem' }}>
                        <span className="gl-ai-icon"><IconLightbulb size={16} /></span>
                        <div>
                            <strong style={{ display: 'block', fontSize: '13.5px', marginBottom: '2px', color: 'var(--text)' }}>Key Finding</strong>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{keyFinding(peerBenchmarks)}</p>
                        </div>
                    </div>
                    )}
                </div>
            </div>
            <AIAssistant open={aiOpen} onOpenChange={setAiOpen} />
        </div>
    );
};
