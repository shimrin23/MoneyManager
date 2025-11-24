import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

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
            setInsight(response.data.ai_insight);
        } catch (error) {
            console.error(error);
            setInsight("Failed to contact the AI Financial Advisor.");
        } finally {
            setLoadingAI(false);
        }
    };

    // Helper to determine color based on score
    const getScoreColor = (s: number) => {
        if (s >= 70) return 'var(--success)'; // Green
        if (s >= 40) return '#facc15';       // Yellow
        return 'var(--danger)';              // Red
    };

    return (
        <div className="dashboard-grid">
            {/* CARD 1: Financial Health Score */}
            <div className="card score-card">
                <h2>Financial Health</h2>
                <div className="score-container">
                    <div 
                        className="score-circle"
                        style={{
                            background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, #334155 0deg)`
                        }}
                    >
                        <div className="score-inner">
                            {loadingScore ? "..." : score}
                            <span>/ 100</span>
                        </div>
                    </div>
                </div>
                <p className="score-label">
                    {score >= 70 ? "Excellent 🎉" : score >= 40 ? "Needs Work ⚠️" : "Critical 🚨"}
                </p>
            </div>

            {/* CARD 2: AI Advisor */}
            <div className="card ai-card">
                <h2>🤖 AI Financial Coach</h2>
                <p>Get personalized advice based on your health score & spending.</p>
                
                <button onClick={fetchAIAnalysis} disabled={loadingAI}>
                    {loadingAI ? "Analyzing..." : "Ask the Coach"}
                </button>

                {insight && (
                    <div className="ai-response-box">
                        <h3>💡 Coach's Insight:</h3>
                        <p style={{ whiteSpace: 'pre-line' }}>{insight}</p>
                    </div>
                )}
            </div>
        </div>
    );
};