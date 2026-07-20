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
            <div className="ai-insights card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>AI Loan Insights</h2>
                <p className="empty-state" style={{ color: 'var(--color-text-muted)' }}>No insights available yet</p>
            </div>
        );
    }

    return (
        <div className="ai-insights card">
            <div className="insights-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>AI Loan Insights</h2>
                <button onClick={() => { loadInsights(); onRefresh?.(); }} className="action-btn secondary small">
                    Refresh
                </button>
            </div>

            <div className="insights-list">
                {insights.map((insight, idx) => (
                    <div key={idx} className="insight-card" style={{ padding: '1rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                        <div style={{ color: 'var(--primary-color, #60a5fa)', marginTop: '2px' }}>✦</div>
                        <p className="insight-text" style={{ margin: 0, color: 'var(--color-text-2)', fontSize: '0.9rem', lineHeight: '1.5' }}>{insight}</p>
                    </div>
                ))}
            </div>

            <div className="insights-footer" style={{ marginTop: '1.5rem' }}>
                <p className="tip" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>These insights are powered by AI and based on your loan data. Check back regularly for updated recommendations.</p>
            </div>
        </div>
    );
};

export default AiLoanInsights;
