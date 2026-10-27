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

const severityClass: Record<Alert['severity'], string> = {
    high: 'bad',
    medium: 'warn',
    low: 'info'
};

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
        return <div className="su-muted fin-section">Loading alerts...</div>;
    }

    if (visibleAlerts.length === 0) {
        return (
            <div className="su-impact fin-section">
                All loans are in good standing.
            </div>
        );
    }

    return (
        <div className="fin-section">
            <h3 className="su-panel-title">Loan Alerts</h3>
            {visibleAlerts.map((alert, idx) => (
                <div key={idx} className={`su-note ${severityClass[alert.severity]} fin-alert`}>
                    <div className="fin-alert-body">
                        <p>{alert.message}</p>
                        <span className="fin-alert-type">{alert.type.replace(/-/g, ' ')}</span>
                    </div>
                    {alert.actionRequired && <span className="rc-tag">Action Required</span>}
                    <button onClick={() => handleDismiss(alert.loanId)} className="btn-secondary btn-sm">
                        Dismiss
                    </button>
                </div>
            ))}
        </div>
    );
};

export default LoanAlerts;
