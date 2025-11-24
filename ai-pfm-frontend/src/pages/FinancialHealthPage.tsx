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

    useEffect(() => {
        fetchHealthScore();
        fetchAIAnalysis();
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
            </div>
        </div>
    );
};