import { formatMoney } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify } from '../utils/systemMessages';

type RecommendationStatus = 'pending' | 'accepted' | 'declined' | 'snoozed';
type RecommendationCategory = 'all' | 'budget' | 'goal' | 'debt' | 'subscription' | 'alert';
type ExecStep = 'confirm' | 'progress' | 'done' | 'error';

// What the server did when a recommendation was executed
interface ExecutionResult {
    message: string;
    link: string;
}

const LINK_LABELS: Record<string, string> = {
    '/goals': 'Open Goals',
    '/smart-budgets': 'Open Smart Budgets',
    '/loans': 'Open Loans',
    '/credit-cards': 'Open Cards',
};

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
    rec, onClose, onExecuted
}: { rec: Recommendation; onClose: () => void; onExecuted: (updated: Recommendation) => void; }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState<ExecStep>('confirm');
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [error, setError] = useState('');

    const handleExecute = async () => {
        setStep('progress');
        try {
            const response = await apiClient.post(`/recommendations/${rec._id}/execute`);
            setResult({ message: response.data.message, link: response.data.link });
            onExecuted(response.data.recommendation);
            setStep('done');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Could not apply this recommendation. Please try again.'));
            setStep('error');
        }
    };

    const goToLink = () => {
        if (result?.link) navigate(result.link);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={step !== 'progress' ? onClose : undefined}>
            <div className="modal-content onetap-modal" onClick={e => e.stopPropagation()}>
                {step === 'confirm' && (
                    <>
                        <div className="modal-header">
                            <h2 className="modal-title">Execute Recommendation</h2>
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
                                    Execute Now
                                </button>
                                <button className="action-btn secondary" onClick={onClose}>Cancel</button>
                            </div>
                        </div>
                    </>
                )}

                {step === 'progress' && (
                    <div className="onetap-body onetap-center">
                        <div className="onetap-title">Applying...</div>
                        <div className="onetap-text">Applying your recommendation.</div>
                    </div>
                )}

                {step === 'done' && result && (
                    <div className="onetap-body onetap-center">
                        <div className="onetap-title" style={{ color: '#10b981' }}>Done</div>
                        <div className="onetap-text" style={{ marginBottom: '1.5rem' }}>
                            {result.message}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="action-btn primary" onClick={goToLink}>
                                {LINK_LABELS[result.link] || 'Open'}
                            </button>
                            <button className="action-btn secondary" onClick={onClose}>Close</button>
                        </div>
                    </div>
                )}

                {step === 'error' && (
                    <div className="onetap-body onetap-center">
                        <div className="onetap-title" style={{ color: '#ef4444' }}>Not applied</div>
                        <div className="onetap-text" style={{ marginBottom: '1.5rem' }}>{error}</div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button className="action-btn primary" onClick={handleExecute}>Try Again</button>
                            <button className="action-btn secondary" onClick={onClose}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Numbers and tips for one budget category, from GET /budgets/tips
interface CategoryTips {
    category: string;
    allocated: number | null;
    spent: number;
    percentageUsed: number | null;
    topPlaces: { name: string; amount: number; count: number }[];
    insights: string[];
    tips: string[];
}

/* Shown when "Optimize" is clicked on a Smart Budget: tips for that one category */
const CategoryTipsPanel = ({ category, onClose }: { category: string; onClose: () => void }) => {
    const navigate = useNavigate();
    const [tips, setTips] = useState<CategoryTips | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient.get('/budgets/tips', { params: { category } })
            .then(response => setTips(response.data))
            .catch(err => setError(getApiErrorMessage(err, `Could not load tips for ${category}.`)));
    }, [category]);

    return (
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text)' }}>Optimize {category}</h3>
                    {tips && tips.allocated !== null && (
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {formatMoney(tips.spent)} of {formatMoney(tips.allocated)} spent this month ({tips.percentageUsed}%)
                        </p>
                    )}
                </div>
                <button className="modal-close" onClick={onClose} aria-label="Close tips" title="Close">×</button>
            </div>

            {!tips && !error && <p style={{ margin: 0, color: 'var(--text-muted)' }}>Loading tips...</p>}
            {error && <p style={{ margin: 0, color: '#ef4444' }}>{error}</p>}

            {tips && (
                <>
                    <ul style={{ margin: '0 0 1rem', paddingLeft: '1.25rem', color: 'var(--text)', lineHeight: 1.6 }}>
                        {tips.insights.map((line, i) => <li key={i}>{line}</li>)}
                    </ul>

                    {tips.topPlaces.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div className="rec-detail-label" style={{ marginBottom: '0.35rem' }}>Where it went this month</div>
                            {tips.topPlaces.map(place => (
                                <div key={place.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.3rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.9rem' }}>
                                    <span>{place.name} <span style={{ color: 'var(--text-muted)' }}>({place.count}×)</span></span>
                                    <strong>{formatMoney(place.amount)}</strong>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="rec-detail-label" style={{ marginBottom: '0.35rem' }}>How to spend less</div>
                    <ul style={{ margin: '0 0 1rem', paddingLeft: '1.25rem', color: 'var(--text)', lineHeight: 1.6 }}>
                        {tips.tips.map((line, i) => <li key={i}>{line}</li>)}
                    </ul>

                    <button className="action-btn secondary small" onClick={() => navigate('/smart-budgets')}>
                        Back to Smart Budgets
                    </button>
                </>
            )}
        </div>
    );
};

export const RecommendationsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Set when the user arrives from a budget's "Optimize" button
    const optimizeCategory = (location.state as { optimizeCategory?: string } | null)?.optimizeCategory;
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<RecommendationCategory>('all');
    const [hasData, setHasData] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [executingRec, setExecutingRec] = useState<Recommendation | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await apiClient.get('/recommendations');
                setRecommendations(response.data.recommendations || []);
                setHasData(response.data.hasData !== false);
            } catch (error) {
                console.error('Failed to fetch recommendations', error);
                setLoadError(getApiErrorMessage(error, 'Could not load recommendations. Please refresh the page.'));
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
            notify.success(newStatus === 'snoozed' ? 'Snoozed for 7 days.' : newStatus === 'declined' ? 'Recommendation declined.' : 'Moved back to pending.');
        } catch (error) {
            console.error('Failed to update status', error);
            notify.error(getApiErrorMessage(error, 'Could not update the recommendation.'));
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
    // Extra monthly savings from the recommendations the user accepted (only ones with a worked-out amount)
    const plannedSavings = recommendations
        .filter(r => r.status === 'accepted')
        .reduce((sum, r) => sum + (r.savingsAmount || 0), 0);

    if (loading) return <div className="loading-spinner">Loading recommendations...</div>;

    return (
        <div className="page-container recommendations-page">
            {optimizeCategory && (
                <CategoryTipsPanel
                    category={optimizeCategory}
                    onClose={() => navigate('/recommendations', { replace: true, state: null })}
                />
            )}

            <div className="rec-summary-grid">
                <div className="rec-stat-card">
                    <div className="rec-stat-value">{recommendations.length}</div>
                    <div className="rec-stat-label">Total Recommendations</div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-value">{pending}</div>
                    <div className="rec-stat-label">Pending Action</div>
                </div>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-value">{accepted}</div>
                    <div className="rec-stat-label">Accepted</div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-value">{formatMoney(plannedSavings)}</div>
                    <div className="rec-stat-label">Planned Monthly Savings</div>
                </div>
            </div>

            <div className="rec-filter-row">
                {(['all', 'budget', 'goal', 'debt', 'subscription', 'alert'] as RecommendationCategory[]).map(f => (
                    <button
                        key={f}
                        className={`rec-filter-btn ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f === 'all' ? 'All' : categoryLabels[f]}
                        {f !== 'all' && (
                            <span className="rec-filter-count">
                                {recommendations.filter(r => r.category === f).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="rec-list">
                {loadError && (
                    <div className="rec-empty" style={{ color: '#ef4444' }}>{loadError}</div>
                )}
                {!loadError && recommendations.length === 0 && (
                    <div className="rec-empty">
                        {hasData
                            ? 'No recommendations right now. Your finances look on track.'
                            : 'Add your income and expenses for the last 30 days to get personalised recommendations.'}
                    </div>
                )}
                {!loadError && recommendations.length > 0 && filtered.length === 0 && (
                    <div className="rec-empty">No recommendations in this category.</div>
                )}
                {filtered.map(rec => (
                    <div key={rec._id} className={`rec-card ${rec.status}`}>
                        <div className="rec-card-header">
                            <div className="rec-card-title-row">
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                        <h3 className="rec-card-title" style={{ margin: 0 }}>{rec.title}</h3>
                                        <div className="rec-card-badges">
                                            <span 
                                                className={`rec-priority-highlight priority-${rec.priority}`}
                                                style={{ 
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    letterSpacing: '0.03em',
                                                    textTransform: 'uppercase',
                                                    color: priorityColors[rec.priority] || '#ef4444',
                                                    background: rec.priority === 'critical' ? 'rgba(239, 68, 68, 0.15)' :
                                                                rec.priority === 'high' ? 'rgba(245, 158, 11, 0.15)' :
                                                                rec.priority === 'medium' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                    border: `1px solid ${priorityColors[rec.priority] || '#ef4444'}40`
                                                }}
                                            >
                                                <span 
                                                    style={{ 
                                                        width: '7px', 
                                                        height: '7px', 
                                                        borderRadius: '50%', 
                                                        background: priorityColors[rec.priority] || '#ef4444',
                                                        boxShadow: rec.priority === 'critical' ? '0 0 6px rgba(239, 68, 68, 0.6)' : 'none'
                                                    }} 
                                                />
                                                {rec.priority} Priority
                                            </span>
                                            {rec.status !== 'pending' && (
                                                <span 
                                                    style={{ 
                                                        fontSize: '0.72rem', 
                                                        padding: '3px 8px', 
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: statusColors[rec.status],
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    {rec.status}
                                                </span>
                                            )}
                                        </div>
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
                                <button className="btn-primary btn-sm" onClick={() => handleAccept(rec)}>
                                    Accept & Execute
                                </button>
                                <button className="btn-secondary btn-sm" onClick={() => updateStatus(rec._id, 'snoozed')}>
                                    Snooze
                                </button>
                                <button className="btn-secondary btn-sm" onClick={() => updateStatus(rec._id, 'declined')}>
                                    Decline
                                </button>
                            </div>
                        )}
                        {rec.status !== 'pending' && (
                            <div className="rec-card-actions">
                                <button className="btn-secondary btn-sm" onClick={() => updateStatus(rec._id, 'pending')}>
                                    Restore to Pending
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
                    onExecuted={(updated) => setRecommendations(prev => prev.map(r => r._id === updated._id ? updated : r))}
                />
            )}
        </div>
    );
};
