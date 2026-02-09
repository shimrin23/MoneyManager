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
        <div className="loan-to-income-ratio">
            <div className="ratio-header">
                <h2>Loan-to-Income Ratio</h2>
                <button onClick={() => { loadRatio(); onRefresh?.(); }} className="btn-small btn-secondary">
                    Refresh
                </button>
            </div>

            <div className="ratio-container">
                <div className="ratio-gauge">
                    <div className="gauge-value" style={{ color: getRiskColor(data.riskLevel) }}>
                        {data.ratio.toFixed(2)}%
                    </div>
                    <div className="gauge-label">Monthly EMI vs Income</div>
                    <div className="gauge-bar">
                        <div
                            className="gauge-fill"
                            style={{
                                width: `${Math.min(data.ratio, 100)}%`,
                                backgroundColor: getRiskColor(data.riskLevel)
                            }}
                        ></div>
                    </div>
                    <div className="gauge-markers">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>

                <div className="ratio-details">
                    <div className="detail-card">
                        <p className="label">Total Monthly EMI</p>
                        <p className="value">Rs {data.totalMonthlyEMI?.toFixed(2)}</p>
                    </div>
                    <div className="detail-card">
                        <p className="label">Monthly Income</p>
                        <p className="value">Rs {data.monthlyIncome?.toFixed(2)}</p>
                    </div>
                    <div className="detail-card">
                        <p className="label">Risk Level</p>
                        <p className="value" style={{ color: getRiskColor(data.riskLevel) }}>
                            {getRiskLabel(data.riskLevel)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="ratio-recommendation">
                <h3>Recommendation</h3>
                <p>{data.recommendation}</p>
            </div>

            <div className="ratio-scale">
                <h3>Risk Scale</h3>
                <div className="scale-items">
                    <div className="scale-item">
                        <span className="scale-label">Low</span>
                        <span className="scale-range">0-20%</span>
                        <div className="scale-bar" style={{ backgroundColor: getRiskColor('low') }}></div>
                    </div>
                    <div className="scale-item">
                        <span className="scale-label">Medium</span>
                        <span className="scale-range">20-35%</span>
                        <div className="scale-bar" style={{ backgroundColor: getRiskColor('medium') }}></div>
                    </div>
                    <div className="scale-item">
                        <span className="scale-label">High</span>
                        <span className="scale-range">35-50%</span>
                        <div className="scale-bar" style={{ backgroundColor: getRiskColor('high') }}></div>
                    </div>
                    <div className="scale-item">
                        <span className="scale-label">Critical</span>
                        <span className="scale-range">50%+</span>
                        <div className="scale-bar" style={{ backgroundColor: getRiskColor('critical') }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanToIncomeRatio;
