import { type FC, useEffect, useState } from 'react';
import { useLoans } from '../hooks/useLoans';

interface Alert {
    type: 'due-soon' | 'overdue' | 'high-emi-ratio';
    message: string;
    severity: 'low' | 'medium' | 'high';
    loanId: string;
    actionRequired: boolean;
}

interface LoanAlertsProps {
    loanIds?: string[];
    onDismiss?: (loanId: string) => void;
}

const LoanAlerts: FC<LoanAlertsProps> = ({ loanIds, onDismiss }) => {
    const { getLoanAlerts } = useLoans();
    const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(false);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (loanIds && loanIds.length > 0) {
            loadAlerts();
        }
    }, [loanIds]);

    const loadAlerts = async () => {
        if (!loanIds || loanIds.length === 0) return;
        setLoading(true);
        try {
            const alerts: Alert[] = [];
            for (const loanId of loanIds) {
                try {
                    const loanAlerts = await getLoanAlerts(loanId);
                    alerts.push(...loanAlerts);
                } catch (error) {
                    console.error(`Failed to load alerts for loan ${loanId}`);
                }
            }
            setAllAlerts(alerts);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = (loanId: string) => {
        setDismissedAlerts(new Set([...dismissedAlerts, loanId]));
        onDismiss?.(loanId);
    };

    const visibleAlerts = allAlerts.filter(alert => !dismissedAlerts.has(alert.loanId));

    if (loading) {
        return <div className="loan-alerts loading">Loading alerts...</div>;
    }

    if (visibleAlerts.length === 0) {
        return (
            <div className="loan-alerts">
                <div className="alert-success">
                    <span>✓</span>
                    <p>All loans are in good standing!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="loan-alerts">
            <h2>Loan Alerts</h2>
            <div className="alerts-container">
                {visibleAlerts.map((alert, idx) => (
                    <div key={idx} className={`alert alert-${alert.severity}`}>
                        <div className="alert-icon">
                            {alert.severity === 'high' && '⚠️'}
                            {alert.severity === 'medium' && '⚡'}
                            {alert.severity === 'low' && 'ℹ️'}
                        </div>
                        <div className="alert-content">
                            <p className="alert-message">{alert.message}</p>
                            <span className="alert-type">{alert.type.replace(/-/g, ' ')}</span>
                        </div>
                        {alert.actionRequired && (
                            <div className="alert-badge">Action Required</div>
                        )}
                        <button
                            onClick={() => handleDismiss(alert.loanId)}
                            className="alert-dismiss"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoanAlerts;
