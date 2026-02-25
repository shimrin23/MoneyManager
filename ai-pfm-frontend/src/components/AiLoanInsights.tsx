import { type FC, useEffect, useState } from 'react';
import { useLoans } from '../hooks/useLoans';

interface AiLoanInsightsProps {
    onRefresh?: () => void;
}

const AiLoanInsights: FC<AiLoanInsightsProps> = ({ onRefresh }) => {
    const { getAIInsights } = useLoans();
    const [insights, setInsights] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAIInsights();
            setInsights(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="ai-insights loading">Loading insights...</div>;
    }

    if (error) {
        return <div className="ai-insights error">{error}</div>;
    }

    if (insights.length === 0) {
        return (
            <div className="ai-insights">
                <h2>AI Loan Insights</h2>
                <p className="empty-state">No insights available yet</p>
            </div>
        );
    }

    return (
        <div className="ai-insights">
            <div className="insights-header">
                <h2>💡 AI Loan Insights</h2>
                <button onClick={() => { loadInsights(); onRefresh?.(); }} className="btn-small btn-secondary">
                    Refresh
                </button>
            </div>

            <div className="insights-list">
                {insights.map((insight, idx) => (
                    <div key={idx} className="insight-card">
                        <div className="insight-icon">💡</div>
                        <p className="insight-text">{insight}</p>
                    </div>
                ))}
            </div>

            <div className="insights-footer">
                <p className="tip">These insights are powered by AI and based on your loan data. Check back regularly for updated recommendations.</p>
            </div>
        </div>
    );
};

export default AiLoanInsights;
