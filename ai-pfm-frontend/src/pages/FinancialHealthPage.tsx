import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

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

export const FinancialHealthPage = () => {
    const [health, setHealth] = useState<HealthMetrics>({
        score: 0,
        riskLevel: 'Medium',
        liquidityRatio: 0,
        debtToIncomeRatio: 0,
        savingsRate: 0,
        recommendations: []
    });
    const [loading, setLoading] = useState(true);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [peerBenchmarks, setPeerBenchmarks] = useState<PeerBenchmark[]>([]);

    useEffect(() => {
        fetchHealthScore();
        fetchAIAnalysis();
        fetchPeerBenchmarks();
    }, []);

    const fetchHealthScore = async () => {
        try {
            const response = await apiClient.get('/transactions/score');
            setHealth(response.data);
        } catch (error) {
            console.error('Error fetching health score:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAIAnalysis = async () => {
        try {
            const response = await apiClient.get('/transactions/analysis');
            setAiAnalysis(response.data.analysis);
        } catch (error) {
            console.error('Error fetching AI analysis:', error);
        }
    };

    const fetchPeerBenchmarks = async () => {
        try {
            const response = await apiClient.get('/financial-health/peer-benchmarks');
            setPeerBenchmarks(response.data.benchmarks || []);
        } catch (error) {
            console.error('Error fetching peer benchmarks:', error);
            // Mock data for demo
            const mockBenchmarks: PeerBenchmark[] = [
                {
                    category: 'Financial Health Score',
                    userValue: health.score,
                    peerAverage: 65,
                    percentile: 15,
                    comparison: 'below'
                },
                {
                    category: 'Savings Rate',
                    userValue: health.savingsRate,
                    peerAverage: 18,
                    percentile: 25,
                    comparison: 'below'
                },
                {
                    category: 'Debt-to-Income Ratio',
                    userValue: health.debtToIncomeRatio,
                    peerAverage: 35,
                    percentile: 85,
                    comparison: 'above'
                },
                {
                    category: 'Emergency Fund Months',
                    userValue: 0.5,
                    peerAverage: 3.2,
                    percentile: 5,
                    comparison: 'below'
                }
            ];
            setPeerBenchmarks(mockBenchmarks);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#10b981';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const getRiskBadge = (level: string) => {
        const colors = {
            Low: 'bg-green-100 text-green-800',
            Medium: 'bg-yellow-100 text-yellow-800',
            High: 'bg-red-100 text-red-800'
        };
        return colors[level as keyof typeof colors] || colors.Medium;
    };

    if (loading) return <div className="loading">Analyzing your financial health...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>💊 Financial Health</h1>
                <p className="page-subtitle">AI-powered insights into your financial wellness</p>
            </div>

            <div className="content-grid">
                {/* Health Score Card */}
                <div className="card health-score-card">
                    <h3>Your Financial Health Score</h3>
                    <div className="score-display">
                        <div 
                            className="score-circle"
                            style={{
                                background: `conic-gradient(${getScoreColor(health.score)} ${health.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                            }}
                        >
                            <span className="score-number">{health.score}</span>
                            <span className="score-label">/ 100</span>
                        </div>
                        <div className="risk-badge">
                            <span className={`badge ${getRiskBadge(health.riskLevel)}`}>
                                {health.riskLevel} Risk
                            </span>
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

                {/* AI Analysis */}
                <div className="card ai-analysis-card full-width">
                    <h3>🤖 AI Financial Coach Analysis</h3>
                    <div className="ai-content">
                        {aiAnalysis ? (
                            <div className="analysis-text">
                                {aiAnalysis.split('\n').map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>
                        ) : (
                            <p>Getting AI analysis of your financial patterns...</p>
                        )}
                    </div>
                    <button 
                        className="btn-secondary"
                        onClick={fetchAIAnalysis}
                    >
                        🔄 Refresh AI Analysis
                    </button>
                </div>

                {/* Recommendations */}
                {health.recommendations && health.recommendations.length > 0 && (
                    <div className="card recommendations-card full-width">
                        <h3>💡 Personalized Recommendations</h3>
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
                    <h3>📊 How You Compare to Peers</h3>
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
        </div>
    );
};