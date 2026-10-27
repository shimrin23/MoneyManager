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
        return <div className="su-muted">Loading insights...</div>;
    }

    if (error) {
        return <div className="rc-banner error">{error}</div>;
    }

    return (
        <div className="su-panel">
            <div className="rc-panel-head">
                <h3 className="rc-panel-title">AI Loan Insights</h3>
                {insights.length > 0 && (
                    <button onClick={() => { loadInsights(); onRefresh?.(); }} className="btn-secondary btn-sm">
                        Refresh
                    </button>
                )}
            </div>

            {insights.length === 0 ? (
                <p className="su-muted">No insights available yet</p>
            ) : (
                <>
                    <div className="fin-stack">
                        {insights.map((insight, idx) => (
                            <div key={idx} className="gl-ai">
                                <p>{insight}</p>
                            </div>
                        ))}
                    </div>
                    <p className="fin-note fin-center" style={{ marginTop: '16px' }}>
                        These insights are powered by AI and based on your loan data. Check back regularly for updated recommendations.
                    </p>
                </>
            )}
        </div>
    );
};

export default AiLoanInsights;
