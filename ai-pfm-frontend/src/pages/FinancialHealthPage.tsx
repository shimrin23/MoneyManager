import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { AIAssistant } from '../components/AIAssistant';

interface HealthMetrics {
    score: number;
    riskLevel: string;
    liquidityRatio: number;
    debtToIncomeRatio: number;
    savingsRate: number;
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
    recommendations: Array.isArray(payload?.recommendations) ? payload.recommendations : []
});

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
                    savingsRate: 0
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
        if (score >= 70) return 'var(--success)';
        if (score >= 40) return '#facc15';
        return 'var(--danger)';
    };

    const getScoreStatus = (score: number) => {
        if (score >= 70) {
            return { label: 'Excellent 🎉', description: 'Great financial habits!', badge: 'bg-green-100 text-green-800' };
        }

        if (score >= 40) {
            return { label: 'Needs Work ⚠️', description: 'Room for improvement', badge: 'bg-yellow-100 text-yellow-800' };
        }

        return { label: 'Critical 🚨', description: 'Immediate attention needed', badge: 'bg-red-100 text-red-800' };
    };

    const scoreStatus = getScoreStatus(health.score);

    if (loading) return <div className="loading">Analyzing your financial health...</div>;

    return (
        <div className="page-container financial-health-page">
            <div className="page-header">
                <h1>Financial Health</h1>
                <p className="page-subtitle">AI-powered insights into your financial wellness</p>
                {refreshing && <p className="page-subtitle">Refreshing live health data...</p>}
            </div>

            <div className="content-grid">
                {/* Health Score Card */}
                <div className="card health-score-card">
                    <h3>Your Financial Health Score</h3>
                    <div className="score-display">
                        <div
                            className="score-circle"
                            style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                borderColor: getScoreColor(health.score),
                                boxShadow: `0 0 0 3px color-mix(in srgb, ${getScoreColor(health.score)} 18%, transparent)`
                            }}
                        >
                            <span className="score-number">{health.score}%</span>
                        </div>
                        <div className="risk-badge">
                            <span className={`badge ${scoreStatus.badge}`}>
                                {scoreStatus.label}
                            </span>
                            <p className="status-description">{scoreStatus.description}</p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="card metrics-card">
                    <h3>Key Financial Metrics</h3>
                    <div className="metrics-grid">
                        <div className="metric">
                            <span className="metric-label">Savings Rate</span>
                            <span className="metric-value">{(health.savingsRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Debt Ratio</span>
                            <span className="metric-value">{(health.debtToIncomeRatio * 100).toFixed(1)}%</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Liquidity Ratio</span>
                            <span className="metric-value">{(health.liquidityRatio * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {health.recommendations && health.recommendations.length > 0 && (
                    <div className="card recommendations-card full-width">
                        <h3>Personalized Recommendations</h3>
                        <ul className="recommendations-list">
                            {health.recommendations.map((rec, index) => (
                                <li key={index} className="recommendation-item">
                                    <span className="rec-icon">✓</span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Peer Benchmarking */}
                <div className="card peer-benchmarks-card full-width">
                    <h3>How You Compare to Peers</h3>
                    <p className="benchmark-subtitle">Based on users with similar income levels</p>
                    <div className="benchmarks-grid">
                        {peerBenchmarks.map((benchmark, index) => (
                            <div key={index} className="benchmark-item">
                                <div className="benchmark-header">
                                    <h4>{benchmark.category}</h4>
                                    <span className={`comparison-badge ${benchmark.comparison}`}>
                                        {benchmark.comparison === 'above' ? '📈 Above Average' :
                                            benchmark.comparison === 'below' ? '📉 Below Average' : '📊 Average'}
                                    </span>
                                </div>
                                <div className="benchmark-values">
                                    <div className="user-value">
                                        <span className="label">You</span>
                                        <span className="value">{benchmark.userValue}
                                            {benchmark.category.includes('Ratio') ? '%' :
                                                benchmark.category.includes('Rate') ? '%' :
                                                    benchmark.category.includes('Score') ? '/100' : ''}
                                        </span>
                                    </div>
                                    <div className="peer-value">
                                        <span className="label">Peer Average</span>
                                        <span className="value">{benchmark.peerAverage}
                                            {benchmark.category.includes('Ratio') ? '%' :
                                                benchmark.category.includes('Rate') ? '%' :
                                                    benchmark.category.includes('Score') ? '/100' : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="percentile">
                                    <span>You're in the {benchmark.percentile}th percentile</span>
                                    <div className="percentile-bar">
                                        <div
                                            className="percentile-fill"
                                            style={{ width: `${benchmark.percentile}%` }}
                                        ></div>
                                        <div className="percentile-marker" style={{ left: `${benchmark.percentile}%` }}>
                                            📍
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="benchmark-insights">
                        <div className="insight-card critical">
                            <span className="insight-icon">⚡</span>
                            <div className="insight-content">
                                <h4>Key Finding</h4>
                                <p>Your financial health is significantly below peers. Focus on reducing entertainment spending and building emergency savings.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AIAssistant open={aiOpen} onOpenChange={setAiOpen} />
        </div>
    );
};
