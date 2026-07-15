import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

type AnomalyType = 'duplicate' | 'spike' | 'unusual-merchant' | 'unusual-time' | 'geo-mismatch';
type AnomalyStatus = 'open' | 'reviewed-safe' | 'reviewed-fraud' | 'dismissed';

interface AnomalyAlert {
    _id: string;
    type: AnomalyType;
    icon: string;
    title: string;
    description: string;
    transactionId: string;
    amount: number;
    merchant: string;
    date: string;
    time: string;
    category: string;
    riskScore: number;
    status: AnomalyStatus;
    detectedReason: string;
}

const mockAnomalies: AnomalyAlert[] = [
    {
        _id: '1',
        type: 'duplicate',
        icon: '🔁',
        title: 'Possible Duplicate Charge',
        description: 'Two identical charges of LKR 4,800 from Lanka Electricity Board were detected within 2 minutes. Likely a double-processing error.',
        transactionId: 'TXN-2026-88412',
        amount: 4800,
        merchant: 'Lanka Electricity Board',
        date: '2026-06-27',
        time: '14:32',
        category: 'Utilities',
        riskScore: 92,
        status: 'open',
        detectedReason: 'Same merchant, same amount, 2-min window — Isolation Forest flagged as 98th percentile anomaly'
    },
    {
        _id: '2',
        type: 'spike',
        icon: '📈',
        title: 'Unusual Spending Spike — Entertainment',
        description: 'LKR 42,800 spent on Entertainment this month, which is 285% above your 3-month average of LKR 15,000.',
        transactionId: 'TXN-2026-75831',
        amount: 42800,
        merchant: 'Multiple Merchants',
        date: '2026-06-26',
        time: '—',
        category: 'Entertainment',
        riskScore: 78,
        status: 'open',
        detectedReason: 'Monthly aggregate 2.85x above rolling 3-month mean — statistical outlier at >95th percentile'
    },
    {
        _id: '3',
        type: 'unusual-merchant',
        icon: '🏪',
        title: 'First-Time Merchant — Large Amount',
        description: 'A LKR 28,500 transaction at "Digital Express Pvt Ltd" — a merchant you have never transacted with. Unverified merchant.',
        transactionId: 'TXN-2026-91034',
        amount: 28500,
        merchant: 'Digital Express Pvt Ltd',
        date: '2026-06-25',
        time: '23:15',
        category: 'Shopping',
        riskScore: 85,
        status: 'open',
        detectedReason: 'Merchant ID not in user transaction history; amount exceeds 2x average single-transaction amount'
    },
    {
        _id: '4',
        type: 'unusual-time',
        icon: '🌙',
        title: 'Late-Night High-Value Transaction',
        description: 'LKR 12,000 at 02:45 AM — your typical spending window is 08:00 AM to 10:00 PM. This falls outside your normal pattern.',
        transactionId: 'TXN-2026-63201',
        amount: 12000,
        merchant: 'Keells Super',
        date: '2026-06-22',
        time: '02:45',
        category: 'Groceries',
        riskScore: 61,
        status: 'reviewed-safe',
        detectedReason: 'Transaction time at 02:45 AM is outside user\'s established activity window (08:00–22:00)'
    },
    {
        _id: '5',
        type: 'spike',
        icon: '💸',
        title: 'Atypical Cash Withdrawal',
        description: 'LKR 75,000 ATM withdrawal in a single transaction. Your typical withdrawal is LKR 5,000–10,000.',
        transactionId: 'TXN-2026-54892',
        amount: 75000,
        merchant: 'ATM — Nugegoda Branch',
        date: '2026-06-18',
        time: '11:20',
        category: 'Cash Withdrawal',
        riskScore: 70,
        status: 'dismissed',
        detectedReason: 'Withdrawal amount 7.5x above user\'s median ATM withdrawal amount'
    }
];

const riskColor = (score: number) => {
    if (score >= 85) return '#ef4444';
    if (score >= 65) return '#f59e0b';
    return '#6366f1';
};

const riskLabel = (score: number) => {
    if (score >= 85) return 'High Risk';
    if (score >= 65) return 'Medium Risk';
    return 'Low Risk';
};

const typeLabels: Record<AnomalyType, string> = {
    duplicate: 'Duplicate Charge',
    spike: 'Spending Spike',
    'unusual-merchant': 'Unknown Merchant',
    'unusual-time': 'Unusual Time',
    'geo-mismatch': 'Location Mismatch'
};

export const AnomalyDetectionPage = () => {
    const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'reviewed-safe' | 'reviewed-fraud' | 'dismissed'>('all');
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiClient.get('/transactions/anomalies');
                setAnomalies(res.data.anomalies || mockAnomalies);
            } catch {
                setAnomalies(mockAnomalies);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const updateStatus = (id: string, status: AnomalyStatus) => {
        setAnomalies(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    };

    const filtered = filter === 'all' ? anomalies : anomalies.filter(a => a.status === filter);
    const openCount = anomalies.filter(a => a.status === 'open').length;
    const highRisk = anomalies.filter(a => a.riskScore >= 85 && a.status === 'open').length;

    if (loading) return <div className="loading-spinner">Scanning for anomalies...</div>;

    return (
        <div className="page-container anomaly-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Anomaly Detection</h1>
                    <p className="page-subtitle">AI-flagged unusual spending patterns and suspicious transactions</p>
                </div>
                {openCount > 0 && (
                    <div className="rec-alert-banner danger">
                         {openCount} open alert{openCount > 1 ? 's' : ''} need{openCount === 1 ? 's' : ''} your review
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="rec-summary-grid">
                <div className="rec-stat-card">
                    <div className="rec-stat-icon"></div>
                    <div>
                        <div className="rec-stat-value">{anomalies.length}</div>
                        <div className="rec-stat-label">Total Flagged</div>
                    </div>
                </div>
                <div className="rec-stat-card pending" style={{ '--accent-color': '#ef4444' } as React.CSSProperties}>
                    <div className="rec-stat-icon"></div>
                    <div>
                        <div className="rec-stat-value">{highRisk}</div>
                        <div className="rec-stat-label">High Risk Open</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon"></div>
                    <div>
                        <div className="rec-stat-value">{openCount}</div>
                        <div className="rec-stat-label">Awaiting Review</div>
                    </div>
                </div>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-icon">✅</div>
                    <div>
                        <div className="rec-stat-value">{anomalies.filter(a => a.status === 'reviewed-safe').length}</div>
                        <div className="rec-stat-label">Marked Safe</div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="rec-filter-row">
                {(['all', 'open', 'reviewed-safe', 'reviewed-fraud', 'dismissed'] as const).map(f => (
                    <button
                        key={f}
                        className={`rec-filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f === 'reviewed-safe' ? 'Safe' : f === 'reviewed-fraud' ? 'Fraud' : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className="rec-filter-count">{(f === 'all' ? anomalies : anomalies.filter(a => a.status === f)).length}</span>
                    </button>
                ))}
            </div>

            {/* Anomaly Cards */}
            <div className="anomaly-list">
                {filtered.length === 0 && (
                    <div className="rec-empty">No alerts in this category.</div>
                )}
                {filtered.map(anomaly => {
                    const isOpen = expanded === anomaly._id;
                    return (
                        <div key={anomaly._id} className={`anomaly-card ${anomaly.status}`}>
                            <div className="anomaly-card-header" onClick={() => setExpanded(isOpen ? null : anomaly._id)}>
                                <div className="anomaly-left">
                                    <span className="anomaly-icon">{anomaly.icon}</span>
                                    <div>
                                        <div className="anomaly-title">{anomaly.title}</div>
                                        <div className="anomaly-meta">
                                            <span>{typeLabels[anomaly.type]}</span>
                                            <span>{anomaly.merchant}</span>
                                            <span>{anomaly.date} {anomaly.time !== '—' ? `at ${anomaly.time}` : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="anomaly-right">
                                    <div className="anomaly-amount">LKR {anomaly.amount.toLocaleString()}</div>
                                    <div
                                        className="anomaly-risk-badge"
                                        style={{ color: riskColor(anomaly.riskScore), borderColor: riskColor(anomaly.riskScore) }}
                                    >
                                        {riskLabel(anomaly.riskScore)} ({anomaly.riskScore})
                                    </div>
                                    <span className="anomaly-expand">{isOpen ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {isOpen && (
                                <div className="anomaly-card-body">
                                    <p className="anomaly-desc">{anomaly.description}</p>
                                    <div className="anomaly-detail-row">
                                        <span className="anomaly-detail-label">AI Reason</span>
                                        <span className="anomaly-detail-text">{anomaly.detectedReason}</span>
                                    </div>
                                    <div className="anomaly-detail-row">
                                        <span className="anomaly-detail-label">Transaction ID</span>
                                        <span className="anomaly-detail-text mono">{anomaly.transactionId}</span>
                                    </div>
                                    <div className="anomaly-detail-row">
                                        <span className="anomaly-detail-label">Category</span>
                                        <span className="anomaly-detail-text">{anomaly.category}</span>
                                    </div>

                                    {anomaly.status === 'open' && (
                                        <div className="anomaly-actions">
                                            <button className="rec-action-btn accept" onClick={() => updateStatus(anomaly._id, 'reviewed-safe')}>
                                                This is Safe
                                            </button>
                                            <button className="rec-action-btn decline" onClick={() => updateStatus(anomaly._id, 'reviewed-fraud')}>
                                                Report as Fraud
                                            </button>
                                            <button className="rec-action-btn snooze" onClick={() => updateStatus(anomaly._id, 'dismissed')}>
                                                Dismiss
                                            </button>
                                        </div>
                                    )}
                                    {anomaly.status !== 'open' && (
                                        <div className="anomaly-actions">
                                            <span className={`status-pill ${anomaly.status}`}>
                                                {anomaly.status === 'reviewed-safe' ? 'Marked Safe' :
                                                    anomaly.status === 'reviewed-fraud' ? 'Reported as Fraud' : 'Dismissed'}
                                            </span>
                                            <button className="rec-action-btn restore small" onClick={() => updateStatus(anomaly._id, 'open')}>
                                                Reopen
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
