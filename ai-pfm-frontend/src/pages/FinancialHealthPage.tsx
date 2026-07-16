import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { AIAssistant } from '../components/AIAssistant';

interface HealthMetrics {
    score: number;
    riskLevel: string;
    liquidityRatio: number;
    debtToIncomeRatio: number;
    savingsRate: number;
    creditUtilization: number;
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
    comparison: 'above' | 'below' | 'average';
}

const normalizeHealthMetrics = (payload: any): HealthMetrics => ({
    score: Number(payload?.score ?? 0),
    riskLevel: payload?.riskLevel ?? 'Medium',
    liquidityRatio: Number(payload?.metrics?.liquidityRatio ?? payload?.liquidityRatio ?? 0),
    debtToIncomeRatio: Number(payload?.metrics?.debtToIncomeRatio ?? payload?.debtToIncomeRatio ?? 0),
    savingsRate: Number(payload?.metrics?.savingsRate ?? payload?.savingsRate ?? 0),
    creditUtilization: Number(payload?.metrics?.creditUtilization ?? payload?.creditUtilization ?? 0),
    emergencyFundMonths: Number(payload?.metrics?.emergencyFundMonths ?? payload?.emergencyFundMonths ?? 0),
    netWorth: Number(payload?.metrics?.netWorth ?? payload?.netWorth ?? 0),
    discretionaryRatio: Number(payload?.metrics?.discretionaryRatio ?? payload?.discretionaryRatio ?? 0),
    recommendations: Array.isArray(payload?.recommendations) ? payload.recommendations : []
});

const renderBenchmarkValue = (category: string, value: number) => {
    if (category === 'Net Worth') return `Rs. ${value.toLocaleString()}`;
    if (category === 'Emergency Fund Health') return `${value} months`;
    if (category === 'Financial Health Score') return `${value}`;
    return `${value}%`;
};

const buildPeerBenchmarks = (healthMetrics: HealthMetrics): PeerBenchmark[] => [
    {
        category: 'Financial Health Score',
        userValue: healthMetrics.score,
        peerAverage: 65,
        percentile: Math.max(5, Math.min(95, healthMetrics.score)),
        comparison: healthMetrics.score >= 65 ? 'above' : 'below'
    },
    {
        category: 'Savings Rate',
        userValue: Number((healthMetrics.savingsRate * 100).toFixed(1)),
        peerAverage: 18,
        percentile: healthMetrics.savingsRate >= 0.18 ? 70 : 25,
        comparison: healthMetrics.savingsRate >= 0.18 ? 'above' : 'below'
    },
    {
        category: 'Debt-to-Income Ratio',
        userValue: Number((healthMetrics.debtToIncomeRatio * 100).toFixed(1)),
        peerAverage: 35,
        percentile: healthMetrics.debtToIncomeRatio <= 0.35 ? 75 : 30,
        comparison: healthMetrics.debtToIncomeRatio <= 0.35 ? 'below' : 'above'
    },
    {
        category: 'Liquidity Ratio',
        userValue: Number((healthMetrics.liquidityRatio * 100).toFixed(1)),
        peerAverage: 30,
        percentile: healthMetrics.liquidityRatio >= 0.3 ? 70 : 20,
        comparison: healthMetrics.liquidityRatio >= 0.3 ? 'above' : 'below'
    }
];

export const FinancialHealthPage = () => {
    const [aiOpen, setAiOpen] = useState(false);
    const [health, setHealth] = useState<HealthMetrics>({
        score: 0,
        riskLevel: 'Medium',
        liquidityRatio: 0,
        debtToIncomeRatio: 0,
        savingsRate: 0,
        creditUtilization: 0,
        emergencyFundMonths: 0,
        netWorth: 0,
        discretionaryRatio: 0,
        recommendations: []
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [peerBenchmarks, setPeerBenchmarks] = useState<PeerBenchmark[]>([]);

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

            const normalized = normalizeHealthMetrics(scoreResponse.data);
            setHealth(normalized);

            const backendBenchmarks = benchmarkResponse.data?.benchmarks || [];
            setPeerBenchmarks(backendBenchmarks);
        } catch (error) {
            console.error('Error fetching health score:', error);
            const fallback = normalizeHealthMetrics({
                score: 0,
                riskLevel: 'Medium',
                metrics: {
                    liquidityRatio: 0,
                    debtToIncomeRatio: 0,
                    savingsRate: 0,
                    creditUtilization: 0,
                    emergencyFundMonths: 0,
                    netWorth: 0,
                    discretionaryRatio: 0
                },
                recommendations: []
            });
            setHealth(fallback);
            setPeerBenchmarks(buildPeerBenchmarks(fallback));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#10b981';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreStatus = (score: number) => {
        if (score >= 70) {
            return { label: 'Excellent', description: 'Outstanding financial health', risk: 'Low' };
        }
        if (score >= 40) {
            return { label: 'Good', description: 'Healthy financial profile', risk: 'Medium' };
        }
        return { label: 'Critical', description: 'Immediate attention needed', risk: 'High' };
    };

    const scoreStatus = getScoreStatus(health.score);
    const scoreColor = getScoreColor(health.score);
    const RADIUS = 54;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const dashOffset = CIRCUMFERENCE - (health.score / 100) * CIRCUMFERENCE;

    if (loading) return <div className="loading">Analyzing your financial health...</div>;

    return (
        <div className="page-container financial-health-page">
            {refreshing && (
                <div className="page-header" style={{ marginBottom: '1rem' }}>
                    <p className="page-subtitle" style={{ color: '#0ea5e9' }}>Refreshing live health data...</p>
                </div>
            )}

            <div className="content-grid">
                {/* Health Score Card */}
                <div className="ds-card health-score-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Your Financial Health Score</h3>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Overview of your financial stability</p>
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
                                    {health.score}
                                </span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Score</span>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="score-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                            <span className={`status-text status-${scoreStatus.risk.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="status-dot" aria-hidden="true" style={{ marginRight: '6px' }}>●</span>
                                {scoreStatus.label}
                            </span>
                            <p className="status-description" style={{ marginTop: '0.25rem', margin: 0, textAlign: 'center' }}>
                                {scoreStatus.description}
                            </p>
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
                            <span className="score-stat-label">Emergency Fund</span>
                        </div>
                        <div className="score-stat-item">
                            <span className="score-stat-value">
                                Rs. {health.netWorth.toLocaleString()}
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
                        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Based on users with similar income levels</p>
                    </div>
                    <div className="benchmarks-grid">
                        {peerBenchmarks.map((benchmark, index) => (
                            <div key={index} className="benchmark-item">
                                <div className="benchmark-header">
                                    <h4>{benchmark.category}</h4>
                                    <span className={`comparison-badge ${benchmark.comparison}`}>
                                        {benchmark.comparison === 'above' ? 'Above Average' :
                                            benchmark.comparison === 'below' ? 'Below Average' : 'Average'}
                                    </span>
                                </div>
                                <div className="benchmark-values">
                                    <div className="user-value">
                                        <span className="label">You</span>
                                        <span className="value">{renderBenchmarkValue(benchmark.category, benchmark.userValue)}</span>
                                    </div>
                                    <div className="peer-value">
                                        <span className="label">Peer Average</span>
                                        <span className="value">{renderBenchmarkValue(benchmark.category, benchmark.peerAverage)}</span>
                                    </div>
                                </div>
                                <div className="percentile">
                                    <span>You're in the {benchmark.percentile}th percentile</span>
                                    <div className="percentile-bar">
                                        <div
                                            className="percentile-fill"
                                            style={{ width: `${benchmark.percentile}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="benchmark-insights" style={{ marginTop: '1.5rem' }}>
                        <div className="insight-card" style={{ display: 'flex', gap: '1rem', padding: '1.25rem', background: 'var(--color-surface-1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div className="insight-content">
                                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text)' }}>Key Finding</h4>
                                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Your financial health is significantly below peers. Focus on reducing entertainment spending and building emergency savings.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AIAssistant open={aiOpen} onOpenChange={setAiOpen} />
        </div>
    );
};
