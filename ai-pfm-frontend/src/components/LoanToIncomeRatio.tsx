import { formatMoney } from '../utils/appFormat';
import { type FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoans } from '../hooks/useLoans';

interface LoanToIncomeRatioProps {
    onRefresh?: () => void;
}

interface RatioData {
    totalMonthlyEMI: number;
    monthlyIncome: number;
    incomeMissing?: boolean;
    ratio: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
}

// Same three status colours as the rest of the app: green / amber / red
const getRiskTone = (level: string): 'good' | 'warn' | 'bad' => {
    switch (level) {
        case 'low':
            return 'good';
        case 'medium':
            return 'warn';
        default:
            return 'bad';
    }
};

const getRiskLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
};

const riskScale = [
    { level: 'low', range: '0-20%' },
    { level: 'medium', range: '20-35%' },
    { level: 'high', range: '35-50%' },
    { level: 'critical', range: '50%+' }
];

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
        return <div className="su-muted">Loading...</div>;
    }

    if (error || !data) {
        return <div className="rc-banner error">{error || 'Failed to load data'}</div>;
    }

    // No income in Profile: a ratio would be made up, so ask for the income instead
    if (data.incomeMissing) {
        return (
            <div className="su-panel">
                <h3 className="rc-panel-title" style={{ marginBottom: '12px' }}>Loan-to-Income Ratio</h3>
                <p className="su-muted fin-lead">
                    Your total monthly EMI is <strong>{formatMoney(data.totalMonthlyEMI)}</strong>.
                    To see how much of your income goes to loans, add your monthly income in your Profile.
                </p>
                <Link to="/profile" className="btn-primary btn-sm">
                    Add monthly income
                </Link>
            </div>
        );
    }

    const tone = getRiskTone(data.riskLevel);

    return (
        <div>
            <div className="su-panel">
                <div className="rc-panel-head">
                    <h3 className="rc-panel-title">Loan-to-Income Ratio</h3>
                    <button onClick={() => { loadRatio(); onRefresh?.(); }} className="btn-secondary btn-sm">
                        Refresh
                    </button>
                </div>

                <div className="fin-center">
                    <div className={`fin-gauge-value fin-${tone}`}>{data.ratio.toFixed(2)}%</div>
                    <p className="su-muted" style={{ margin: '4px 0 16px' }}>Current Debt-to-Income Ratio</p>
                </div>
                <div className="gl-bar">
                    <span className={tone} style={{ width: `${Math.min(data.ratio, 100)}%` }} />
                </div>
                <div className="fin-gauge-scale">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>

            <div className="rc-stats rc-stats-3">
                <div className="rc-stat">
                    <span className="rc-stat-label">Total Monthly EMI</span>
                    <span className="rc-stat-value">{formatMoney(data.totalMonthlyEMI)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">Monthly Income</span>
                    <span className="rc-stat-value">{formatMoney(data.monthlyIncome)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">Risk Level</span>
                    <span className={`rc-stat-value fin-${tone}`}>{getRiskLabel(data.riskLevel)}</span>
                </div>
            </div>

            <div className="gl-insight" style={{ marginBottom: '22px' }}>
                <div>
                    <h4>AI Recommendation</h4>
                    <p>{data.recommendation}</p>
                </div>
            </div>

            <div className="su-panel">
                <h3 className="su-panel-title">Risk Scale Guide</h3>
                <div className="fin-risk-scale">
                    {riskScale.map(item => (
                        <div key={item.level} className="fin-risk-item">
                            <div>
                                <span>{getRiskLabel(item.level)}</span>
                                <span>{item.range}</span>
                            </div>
                            <div className="gl-bar">
                                <span className={getRiskTone(item.level)} style={{ width: '100%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoanToIncomeRatio;
