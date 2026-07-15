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

const mockAnomalies: AnomalyAlert[] = [];

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
                    <div className="rec-stat-icon"></div>
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
