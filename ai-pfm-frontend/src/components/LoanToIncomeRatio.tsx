import { type FC, useEffect, useState } from 'react';
import { useLoans } from '../hooks/useLoans';

interface LoanToIncomeRatioProps {
    onRefresh?: () => void;
}

interface RatioData {
    totalMonthlyEMI: number;
    monthlyIncome: number;
    ratio: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
}

const LoanToIncomeRatio: FC<LoanToIncomeRatioProps> = ({ onRefresh }) => {
    const { getLoanToIncomeRatio } = useLoans();
    const [data, setData] = useState<RatioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRatio();
    }, []);

    const loadRatio = async () => {
        setLoading(true);
        setError(null);
        try {
            const ratioData = await getLoanToIncomeRatio();
            setData(ratioData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loan-to-income-ratio loading">Loading...</div>;
    }

    if (error || !data) {
        return <div className="loan-to-income-ratio error">{error || 'Failed to load data'}</div>;
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low':
                return '#10b981';
            case 'medium':
                return '#f59e0b';
            case 'high':
                return '#ef4444';
            case 'critical':
                return '#7f1d1d';
            default:
                return '#6b7280';
        }
    };

    const getRiskLabel = (level: string) => {
        return level.charAt(0).toUpperCase() + level.slice(1);
    };

    return (
        <div className="loan-to-income-ratio card">
            <div className="ratio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>Loan-to-Income Ratio</h2>
                <button onClick={() => { loadRatio(); onRefresh?.(); }} className="action-btn secondary small">
                    Refresh
                </button>
            </div>

            <div className="ratio-container" style={{ marginBottom: '2rem' }}>
                <div className="ratio-gauge" style={{ background: 'var(--color-surface-2)', padding: '2.5rem 2rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                    <div className="gauge-value" style={{ color: getRiskColor(data.riskLevel), fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                        {data.ratio.toFixed(2)}%
                    </div>
                    <div className="gauge-label" style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1rem', fontWeight: 500 }}>Current Debt-to-Income Ratio</div>
                    <div className="gauge-bar" style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <div
                            className="gauge-fill"
                            style={{
                                height: '100%',
                                width: `${Math.min(data.ratio, 100)}%`,
                                backgroundColor: getRiskColor(data.riskLevel),
                                borderRadius: '4px',
                                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        ></div>
                    </div>
                    <div className="gauge-markers" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>

                <div className="ratio-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="detail-card" style={{ background: 'var(--color-surface-2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <p className="label" style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Monthly EMI</p>
                        <p className="value" style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>LKR {data.totalMonthlyEMI?.toLocaleString()}</p>
                    </div>
                    <div className="detail-card" style={{ background: 'var(--color-surface-2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <p className="label" style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Monthly Income</p>
                        <p className="value" style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>LKR {data.monthlyIncome?.toLocaleString()}</p>
                    </div>
                    <div className="detail-card" style={{ background: 'var(--color-surface-2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <p className="label" style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Risk Level</p>
                        <p className="value" style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: getRiskColor(data.riskLevel), letterSpacing: '-0.02em' }}>
                            {getRiskLabel(data.riskLevel)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="ratio-recommendation" style={{ background: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96, 165, 250, 0.25)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2.5rem' }}>
                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>💡</span> AI Recommendation
                </h3>
                <p style={{ margin: 0, color: 'var(--color-text-2)', lineHeight: 1.6, fontSize: '0.95rem' }}>{data.recommendation}</p>
            </div>

            <div className="ratio-scale">
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1.25rem', fontWeight: 600 }}>Risk Scale Guide</h3>
                <div className="scale-items" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                    <div className="scale-item" style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span className="scale-label" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>Low</span>
                            <span className="scale-range" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>0-20%</span>
                        </div>
                        <div className="scale-bar" style={{ height: '4px', borderRadius: '2px', backgroundColor: getRiskColor('low') }}></div>
                    </div>
                    <div className="scale-item" style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span className="scale-label" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>Medium</span>
                            <span className="scale-range" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>20-35%</span>
                        </div>
                        <div className="scale-bar" style={{ height: '4px', borderRadius: '2px', backgroundColor: getRiskColor('medium') }}></div>
                    </div>
                    <div className="scale-item" style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span className="scale-label" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>High</span>
                            <span className="scale-range" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>35-50%</span>
                        </div>
                        <div className="scale-bar" style={{ height: '4px', borderRadius: '2px', backgroundColor: getRiskColor('high') }}></div>
                    </div>
                    <div className="scale-item" style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span className="scale-label" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>Critical</span>
                            <span className="scale-range" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>50%+</span>
                        </div>
                        <div className="scale-bar" style={{ height: '4px', borderRadius: '2px', backgroundColor: getRiskColor('critical') }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanToIncomeRatio;
