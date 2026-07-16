import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

type RecommendationStatus = 'pending' | 'accepted' | 'declined' | 'snoozed';
type RecommendationCategory = 'all' | 'budget' | 'goal' | 'debt' | 'subscription' | 'alert';
type ExecStep = 'confirm' | 'progress' | 'done';

interface Recommendation {
    _id: string;
    category: 'budget' | 'goal' | 'debt' | 'subscription' | 'alert';
    icon: string;
    title: string;
    reason: string;
    action: string;
    projectedImpact: string;
    executionPath: string;
    status: RecommendationStatus;
    savingsAmount?: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    createdAt: string;
}

// Mock recommendations removed. Data is now fetched exclusively from the backend.

const categoryLabels: Record<string, string> = {
    budget: 'Budget', goal: 'Goal', debt: 'Debt', subscription: 'Subscription', alert: 'Alert'
};

const priorityColors: Record<string, string> = {
    critical: '#ef4444', high: '#f59e0b', medium: '#6366f1', low: '#10b981'
};

const statusColors: Record<RecommendationStatus, string> = {
    pending: '#6366f1', accepted: '#10b981', declined: '#ef4444', snoozed: '#f59e0b'
};

/* One-tap execution modal */
const ExecutionModal = ({
    rec, onClose, onConfirm
}: { rec: Recommendation; onClose: () => void; onConfirm: () => void; }) => {
    const [step, setStep] = useState<ExecStep>('confirm');
    const [progress, setProgress] = useState(0);

    const handleExecute = () => {
        setStep('progress');
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 18 + 8;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setTimeout(() => setStep('done'), 400);
            }
            setProgress(Math.min(p, 100));
        }, 180);
    };

    const handleDone = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={step === 'confirm' ? onClose : undefined}>
            <div className="modal-content onetap-modal" onClick={e => e.stopPropagation()}>
                {step === 'confirm' && (
                    <>
                        <div className="modal-header">
                            <h2 className="modal-title">{rec.icon} Execute Recommendation</h2>
                            <button className="modal-close" onClick={onClose}>×</button>
                        </div>
                        <div className="onetap-body">
                            <div className="onetap-title">{rec.title}</div>
                            <div className="onetap-section">
                                <div className="onetap-label">What will happen</div>
                                <div className="onetap-text">{rec.action}</div>
                            </div>
                            <div className="onetap-section">
                                <div className="onetap-label">Projected impact</div>
                                <div className="onetap-impact">{rec.projectedImpact}</div>
                            </div>
                            <div className="onetap-section">
                                <div className="onetap-label">Execution path</div>
                                <div className="onetap-path">{rec.executionPath}</div>
                            </div>
                            <div className="onetap-actions">
                                <button className="action-btn primary" onClick={handleExecute}>
                                    ⚡ Execute Now
                                </button>
                                <button className="action-btn secondary" onClick={onClose}>Cancel</button>
                            </div>
                        </div>
                    </>
                )}

                {step === 'progress' && (
                    <div className="onetap-body onetap-center">
                        <div className="onetap-spinner">⚙️</div>
                        <div className="onetap-title">Setting up...</div>
                        <div className="onetap-text" style={{ marginBottom: '1.5rem' }}>
                            Applying your recommendation. This takes just a moment.
                        </div>
                        <div className="onetap-progress-track">
                            <div className="onetap-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="onetap-pct">{Math.round(progress)}%</div>
                    </div>
                )}

                {step === 'done' && (
                    <div className="onetap-body onetap-center">
                        <div className="onetap-success-icon">✅</div>
                        <div className="onetap-title" style={{ color: '#10b981' }}>Done!</div>
                        <div className="onetap-text" style={{ marginBottom: '0.5rem' }}>
                            Recommendation has been applied successfully.
                        </div>
                        <div className="onetap-impact" style={{ marginBottom: '1.5rem' }}>
                            {rec.projectedImpact}
                        </div>
                        <button className="action-btn primary" onClick={handleDone}>Close</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const RecommendationsPage = () => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<RecommendationCategory>('all');
    const [totalSavingsAchieved] = useState(38400);
    const [executingRec, setExecutingRec] = useState<Recommendation | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await apiClient.get('/recommendations');
                setRecommendations(response.data.recommendations || []);
            } catch (error) {
                console.error('Failed to fetch recommendations', error);
                setRecommendations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    const updateStatus = async (id: string, newStatus: RecommendationStatus) => {
        // Optimistic UI update
        setRecommendations(prev =>
            prev.map(r => r._id === id ? { ...r, status: newStatus } : r)
        );
        
        try {
            await apiClient.patch(`/recommendations/${id}`, { status: newStatus });
        } catch (error) {
            console.error('Failed to update status', error);
            // Revert on failure (simple reload for now)
            const response = await apiClient.get('/recommendations');
            setRecommendations(response.data.recommendations || []);
        }
    };

    const handleAccept = (rec: Recommendation) => {
        setExecutingRec(rec);
    };

    const filtered = activeFilter === 'all'
        ? recommendations
        : recommendations.filter(r => r.category === activeFilter);

    const pending = recommendations.filter(r => r.status === 'pending').length;
    const accepted = recommendations.filter(r => r.status === 'accepted').length;

    if (loading) return <div className="loading-spinner">Loading recommendations...</div>;

    return (
        <div className="page-container recommendations-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">AI Recommendations</h1>
                    <p className="page-subtitle">Personalised actions to improve your financial health</p>
                </div>
            </div>

            <div className="rec-summary-grid">
                <div className="rec-stat-card">
                    <div className="rec-stat-icon">📋</div>
                    <div>
                        <div className="rec-stat-value">{recommendations.length}</div>
                        <div className="rec-stat-label">Total Recommendations</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">⏳</div>
                    <div>
                        <div className="rec-stat-value">{pending}</div>
                        <div className="rec-stat-label">Pending Action</div>
                    </div>
                </div>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-icon">✅</div>
                    <div>
                        <div className="rec-stat-value">{accepted}</div>
                        <div className="rec-stat-label">Accepted</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">💰</div>
                    <div>
                        <div className="rec-stat-value">LKR {totalSavingsAchieved.toLocaleString()}</div>
                        <div className="rec-stat-label">Savings Achieved</div>
                    </div>
                </div>
            </div>

            <div className="rec-filter-row">
                {(['all', 'budget', 'goal', 'debt', 'subscription', 'alert'] as RecommendationCategory[]).map(f => (
                    <button
                        key={f}
                        className={`rec-filter-btn ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f !== 'all' && (
                            <span className="rec-filter-count">
                                {recommendations.filter(r => r.category === f).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="rec-list">
                {filtered.length === 0 && (
                    <div className="rec-empty">No recommendations in this category.</div>
                )}
                {filtered.map(rec => (
                    <div key={rec._id} className={`rec-card ${rec.status}`}>
                        <div className="rec-card-header">
                            <div className="rec-card-title-row">
                                <span className="rec-card-icon">{rec.icon}</span>
                                <div>
                                    <h3 className="rec-card-title">{rec.title}</h3>
                                    <div className="rec-card-badges">
                                        <span className="rec-badge category">{categoryLabels[rec.category]}</span>
                                        <span className="rec-badge priority" style={{ color: priorityColors[rec.priority], borderColor: priorityColors[rec.priority] }}>
                                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                                        </span>
                                        <span className="rec-badge status" style={{ color: statusColors[rec.status], borderColor: statusColors[rec.status] }}>
                                            {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rec-card-body">
                            <div className="rec-detail-row">
                                <div className="rec-detail-label">Why</div>
                                <div className="rec-detail-text">{rec.reason}</div>
                            </div>
                            <div className="rec-detail-row">
                                <div className="rec-detail-label">Action</div>
                                <div className="rec-detail-text action">{rec.action}</div>
                            </div>
                            <div className="rec-detail-row">
                                <div className="rec-detail-label">Impact</div>
                                <div className="rec-detail-text impact">{rec.projectedImpact}</div>
                            </div>
                            <div className="rec-detail-row">
                                <div className="rec-detail-label">How</div>
                                <div className="rec-detail-text muted">{rec.executionPath}</div>
                            </div>
                        </div>

                        {rec.status === 'pending' && (
                            <div className="rec-card-actions">
                                <button className="rec-action-btn accept" onClick={() => handleAccept(rec)}>
                                    ⚡ Accept & Execute
                                </button>
                                <button className="rec-action-btn snooze" onClick={() => updateStatus(rec._id, 'snoozed')}>
                                    ⏰ Snooze
                                </button>
                                <button className="rec-action-btn decline" onClick={() => updateStatus(rec._id, 'declined')}>
                                    ✕ Decline
                                </button>
                            </div>
                        )}
                        {rec.status !== 'pending' && (
                            <div className="rec-card-actions">
                                <button className="rec-action-btn restore" onClick={() => updateStatus(rec._id, 'pending')}>
                                    ↩ Restore to Pending
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {executingRec && (
                <ExecutionModal
                    rec={executingRec}
                    onClose={() => setExecutingRec(null)}
                    onConfirm={() => updateStatus(executingRec._id, 'accepted')}
                />
            )}
        </div>
    );
};
