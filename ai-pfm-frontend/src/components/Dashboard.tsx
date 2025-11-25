import { useState, useEffect } from 'react';
import { apiClient } from '../api/client.ts';

export const Dashboard = () => {
    const [insight, setInsight] = useState<string>('');
    const [loadingAI, setLoadingAI] = useState<boolean>(false);
    
    // New State for Score
    const [score, setScore] = useState<number>(0);
    const [loadingScore, setLoadingScore] = useState<boolean>(true);

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

    // 2. Fetch AI Insight
    const fetchAIAnalysis = async () => {
        setLoadingAI(true);
        try {
            const response = await apiClient.get('/transactions/analysis');
            setInsight(response.data.analysis);
        } catch (error) {
            console.error(error);
            setInsight("Failed to contact the AI Financial Advisor.");
        } finally {
            setLoadingAI(false);
        }
    };

    // 3. Clear AI Insight
    const clearInsight = () => {
        setInsight('');
    };

    // Helper to determine color based on score
    const getScoreColor = (s: number) => {
        if (s >= 70) return 'var(--success)'; // Green
        if (s >= 40) return '#facc15';       // Yellow
        return 'var(--danger)';              // Red
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>📊 Dashboard</h1>
                <p className="page-subtitle">Your financial overview at a glance</p>
            </div>

            <div className="content-grid">
                {/* Financial Health Score Card */}
                <div className="card health-score-card">
                    <h3>💚 Financial Health Score</h3>
                    <div className="score-display">
                        <div 
                            className="score-circle"
                            style={{
                                background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                            }}
                        >
                            <span className="score-number">{loadingScore ? "..." : score}</span>
                            <span className="score-label">/ 100</span>
                        </div>
                        <div className="score-status">
                            <span className="status-text">
                                {score >= 70 ? "Excellent 🎉" : score >= 40 ? "Needs Work ⚠️" : "Critical 🚨"}
                            </span>
                            <p className="status-description">
                                {score >= 70 ? "Great financial habits!" : 
                                 score >= 40 ? "Room for improvement" : "Immediate attention needed"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Financial Coach Card */}
                <div className="card ai-analysis-card">
                    <h3>🤖 AI Financial Coach</h3>
                    <p className="coach-description">Get personalized insights based on your spending patterns and financial goals</p>
                    
                    <div className="ai-content">
                        {insight ? (
                            <div className="analysis-text">
                                <div className="analysis-header">
                                    <h4>💡 Coach's Insight:</h4>
                                    <button className="modal-close" onClick={clearInsight}>×</button>
                                </div>
                                <p>{insight}</p>
                            </div>
                        ) : (
                            <p>Click below to get AI-powered financial insights</p>
                        )}
                    </div>
                    
                    <button 
                        className="btn-secondary"
                        onClick={fetchAIAnalysis} 
                        disabled={loadingAI}
                    >
                        {loadingAI ? "🤔 Analyzing..." : "💡 Ask the Coach"}
                    </button>
                </div>
            </div>
        </div>
    );
};