// Enhanced Financial Health Dashboard Component
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client.ts';

interface HealthScoreBreakdown {
    liquidity: number;
    savings: number;
    debt: number;
    fees: number;
    stability: number;
}

interface Recommendation {
    id: string;
    type: string;
    title: string;
    description: string;
    projectedImpact: {
        financialSaving?: number;
        timeToGoal?: number;
        riskReduction?: number;
    };
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: string;
}

interface CashFlowForecast {
    date: string;
    predictedBalance: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendedActions: string[];
}

export const EnhancedDashboard = () => {
    const [healthScore, setHealthScore] = useState<number>(0);
    const [scoreBreakdown, setScoreBreakdown] = useState<HealthScoreBreakdown | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [cashFlowForecast, setCashFlowForecast] = useState<CashFlowForecast[]>([]);
    const [budgetAnalysis, setBudgetAnalysis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [healthRes, recommendationsRes, forecastRes, budgetRes] = await Promise.all([
                apiClient.get('/transactions/advanced-health-score'),
                apiClient.get('/recommendations'),
                apiClient.get('/analytics/cash-flow-forecast'),
                apiClient.get('/analytics/budget-analysis')
            ]);

            setHealthScore(healthRes.data.score);
            setScoreBreakdown(healthRes.data.breakdown);
            setRecommendations(recommendationsRes.data);
            setCashFlowForecast(forecastRes.data);
            setBudgetAnalysis(budgetRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const acceptRecommendation = async (recommendationId: string) => {
        try {
            await apiClient.post(`/recommendations/${recommendationId}/accept`);
            // Refresh recommendations
            const res = await apiClient.get('/recommendations');
            setRecommendations(res.data);
        } catch (error) {
            console.error('Failed to accept recommendation:', error);
        }
    };

    const executeRecommendation = async (recommendationId: string) => {
        try {
            const result = await apiClient.post(`/recommendations/${recommendationId}/execute`);
            if (result.data.success) {
                alert('Recommendation executed successfully!');
                fetchDashboardData(); // Refresh all data
            }
        } catch (error) {
            console.error('Failed to execute recommendation:', error);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading your financial insights...</div>;
    }

    return (
        <div className="enhanced-dashboard">
            {/* Financial Health Score with Breakdown */}
            <div className="dashboard-grid">
                <div className="card health-score-card">
                    <h3>Financial Health Score</h3>
                    <div className="score-display">
                        <div className="score-circle" style={{ 
                            background: `conic-gradient(var(--success) ${healthScore}%, #e2e8f0 ${healthScore}%)` 
                        }}>
                            <span className="score-number">{healthScore}</span>
                        </div>
                    </div>
                    
                    {scoreBreakdown && (
                        <div className="score-breakdown">
                            <h4>Score Breakdown</h4>
                            {Object.entries(scoreBreakdown).map(([category, score]) => (
                                <div key={category} className="breakdown-item">
                                    <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ 
                                                width: `${score}%`,
                                                backgroundColor: score > 70 ? 'var(--success)' : score > 40 ? '#facc15' : 'var(--danger)'
                                            }}
                                        ></div>
                                    </div>
                                    <span className="score-value">{score}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cash Flow Forecast */}
                <div className="card cash-flow-card">
                    <h3>30-Day Cash Flow Forecast</h3>
                    <div className="forecast-chart">
                        {cashFlowForecast.slice(0, 7).map((day, index) => (
                            <div key={day.date} className="forecast-day">
                                <div 
                                    className={`balance-bar ${day.riskLevel.toLowerCase()}`}
                                    style={{ 
                                        height: `${Math.max(20, Math.min(100, day.predictedBalance / 1000))}px` 
                                    }}
                                ></div>
                                <span className="day-label">Day {index + 1}</span>
                                <span className="balance-amount">
                                    LKR {day.predictedBalance.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    {cashFlowForecast.some(day => day.riskLevel === 'HIGH') && (
                        <div className="cash-flow-alert">
                            <h4>⚠️ Cash Flow Alert</h4>
                            <p>Low balance predicted in coming days.</p>
                            <ul>
                                {cashFlowForecast
                                    .find(day => day.riskLevel === 'HIGH')
                                    ?.recommendedActions.map((action, index) => (
                                    <li key={index}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="recommendations-section">
                <h3>🤖 Personalized Recommendations</h3>
                <div className="recommendations-grid">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className={`recommendation-card priority-${rec.priority.toLowerCase()}`}>
                            <div className="rec-header">
                                <h4>{rec.title}</h4>
                                <span className={`priority-badge ${rec.priority.toLowerCase()}`}>
                                    {rec.priority}
                                </span>
                            </div>
                            
                            <p className="rec-description">{rec.description}</p>
                            
                            <div className="projected-impact">
                                <h5>Projected Impact:</h5>
                                {rec.projectedImpact.financialSaving && (
                                    <div className="impact-item">
                                        💰 Save LKR {rec.projectedImpact.financialSaving.toLocaleString()}
                                    </div>
                                )}
                                {rec.projectedImpact.timeToGoal && (
                                    <div className="impact-item">
                                        ⏰ Reach goal in {rec.projectedImpact.timeToGoal} months
                                    </div>
                                )}
                                {rec.projectedImpact.riskReduction && (
                                    <div className="impact-item">
                                        📉 Reduce risk by {rec.projectedImpact.riskReduction}%
                                    </div>
                                )}
                            </div>
                            
                            <div className="rec-actions">
                                {rec.status === 'PENDING' && (
                                    <>
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => acceptRecommendation(rec.id)}
                                        >
                                            Accept
                                        </button>
                                        <button className="btn-outline">Decline</button>
                                    </>
                                )}
                                
                                {rec.status === 'ACCEPTED' && (
                                    <button 
                                        className="btn-primary"
                                        onClick={() => executeRecommendation(rec.id)}
                                    >
                                        Execute Now
                                    </button>
                                )}
                                
                                {rec.status === 'EXECUTED' && (
                                    <span className="status-executed">✅ Executed</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Budget Analysis */}
            <div className="budget-section">
                <h3>📊 Smart Budget Analysis</h3>
                <div className="budget-grid">
                    {budgetAnalysis.map((category, index) => (
                        <div key={index} className="budget-category-card">
                            <div className="category-header">
                                <h4>{category.category}</h4>
                                <span className={`budget-status ${category.status}`}>
                                    {category.status}
                                </span>
                            </div>
                            
                            <div className="budget-amounts">
                                <div className="amount-row">
                                    <span>Spent:</span>
                                    <span>LKR {category.spent.toLocaleString()}</span>
                                </div>
                                <div className="amount-row">
                                    <span>Budget:</span>
                                    <span>LKR {category.budget.toLocaleString()}</span>
                                </div>
                                <div className="amount-row">
                                    <span>Peer Avg:</span>
                                    <span>LKR {category.peerAverage.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="budget-progress">
                                <div 
                                    className="budget-bar"
                                    style={{ width: `${Math.min(100, (category.spent / category.budget) * 100)}%` }}
                                ></div>
                            </div>
                            
                            {category.suggestion && (
                                <div className="budget-suggestion">
                                    💡 {category.suggestion}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};