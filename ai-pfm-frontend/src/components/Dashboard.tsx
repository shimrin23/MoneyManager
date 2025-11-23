import { useState } from 'react';
import { apiClient } from '../api/client';

export const Dashboard = () => {
    const [insight, setInsight] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const fetchAIAnalysis = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/transactions/analysis');
            setInsight(response.data.ai_insight);
        } catch (error) {
            console.error(error);
            setInsight("Failed to connect to the AI Agent. Check backend!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card ai-dashboard">
            <h2>🤖 AI Financial Advisor</h2>
            <button onClick={fetchAIAnalysis} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze My Finances"}
            </button>
            {insight && (
                <div className="ai-response-box">
                    <h3>💡 Insight:</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{insight}</p>
                </div>
            )}
        </div>
    );
};
