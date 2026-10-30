import { DateInput } from '../components/DateInput';
import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog } from '../utils/systemMessages';

interface Subscription {
    _id?: string;
    name: string;
    provider: string;
    amount: number;
    frequency: 'monthly' | 'yearly';
    nextPayment: string;
    category: string;
    isActive: boolean;
    lastUsed?: string;
    isZombie: boolean;
    cancelReason?: string;
    cancelledAt?: string;
}

const CANCEL_REASON_LABELS: Record<string, string> = {
    'too-expensive': 'Too expensive',
    'not-used': 'Not using it',
    'found-alternative': 'Found a cheaper alternative',
    'temporary-pause': 'Temporary pause',
    'other': 'Other',
    'zombie-bulk-cancel': 'Cancelled as unused',
};

interface CheaperAlternative {
    name: string;
    price: number;
    savings: number;
    provider: string;
}

interface SubscriptionTrend {
    month: string;
    amount: number;
}

export const SubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [showAlternativesModal, setShowAlternativesModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [trends, setTrends] = useState<SubscriptionTrend[]>([]);
    // Monthly income from the user's Profile; null until it is known (0 or unset means not entered)
    const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
    const [insightsStatus, setInsightsStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
    const [newSubscription, setNewSubscription] = useState<Subscription>({
        name: '',
        provider: '',
        amount: 0,
        frequency: 'monthly',
        nextPayment: '',
        category: '',
        isActive: true,
        isZombie: false
    });
    const [insightsMap, setInsightsMap] = useState<Record<string, { insight: string; alternatives: CheaperAlternative[] }>>({});

    useEffect(() => {
        fetchSubscriptions();
        fetchAIInsights();
        fetchTrends();
        // Fetch monthly income from the user's profile
        fetchMonthlyIncome();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            // Includes cancelled ones so they can be listed and restored
            const response = await apiClient.get('/subscriptions', { params: { includeInactive: true } });
            const data = response.data;
            
            setSubscriptions(data.subscriptions || []);
            setTotalMonthlyCost(data.summary?.totalMonthlyCost || 0);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
            setSubscriptions([]);
            setTotalMonthlyCost(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyIncome = async () => {
        try {
            const response = await apiClient.get('/auth/profile');
            const income = Number(response.data?.user?.monthlyIncome);
            setMonthlyIncome(income > 0 ? income : null);
        } catch (error) {
            console.error('Failed to fetch monthly income:', error);
            setMonthlyIncome(null);
        }
    };

    const fetchAIInsights = async () => {
        setInsightsStatus('loading');
        try {
            const response = await apiClient.get('/subscriptions/ai-insights');
            if (response.data && response.data.insights) {
                setInsightsMap(response.data.insights);
            }
            setInsightsStatus('ready');
        } catch (error) {
            console.error('Failed to fetch AI insights:', error);
            setInsightsStatus('failed');
        }
    };

    // Real subscription spending per month, from logged payments and matching expenses
    const fetchTrends = async () => {
        try {
            const response = await apiClient.get('/subscriptions/trends');
            setTrends(response.data?.trends || []);
        } catch (error) {
            console.error('Failed to fetch subscription trends:', error);
            setTrends([]);
        }
    };

    // Feature 1: Health Score Calculation (only when the user has entered their income)
    const getHealthScore = () => {
        if (!monthlyIncome) return null;
        const percentOfIncome = (totalMonthlyCost / monthlyIncome) * 100;
        if (percentOfIncome < 5) return { score: 'Healthy', icon: '', percentage: percentOfIncome };
        if (percentOfIncome < 10) return { score: 'Needs Review', icon: '', percentage: percentOfIncome };
        return { score: 'Overloaded', icon: '', percentage: percentOfIncome };
    };

    // Feature 2: Usage Status Determination
    const getUsageStatus = (subscription: Subscription) => {
        if (subscription.isZombie) return { status: 'Zombie', icon: '', label: 'No activity detected' };
        
        if (subscription.lastUsed) {
            const lastUsedDate = new Date(subscription.lastUsed);
            const now = new Date();
            const daysAgo = Math.floor((now.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysAgo < 7) return { status: 'Actively Used', icon: '', label: `Last used: ${daysAgo} days ago` };
            if (daysAgo < 60) return { status: 'Rarely Used', icon: '', label: `Last used: ${Math.floor(daysAgo / 7)} weeks ago` };
            return { status: 'Zombie', icon: '', label: `Last used: ${Math.floor(daysAgo / 30)} months ago` };
        }
        return { status: 'Unknown', icon: '', label: 'No usage data' };
    };



    // Whole days from today to the next payment date (negative = overdue), compared by calendar date
    const getDaysUntilPayment = (nextPayment: string) => {
        const [y, m, d] = nextPayment.slice(0, 10).split('-').map(Number);
        const due = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getDueStatus = (subscription: Subscription) => {
        const days = getDaysUntilPayment(subscription.nextPayment);
        if (days < 0) return { overdue: true, label: `Overdue by ${-days} day${days === -1 ? '' : 's'}`, color: '#ef4444' };
        if (days === 0) return { overdue: false, label: 'Due today', color: '#f59e0b' };
        if (days <= 7) return { overdue: false, label: `Due in ${days} day${days === 1 ? '' : 's'}`, color: '#f59e0b' };
        return { overdue: false, label: `Due in ${days} days`, color: 'var(--text-muted)' };
    };

    // Feature 5: Renewal Risk Detection
    const getRenewalRisk = (subscription: Subscription) => {
        const nextPaymentDate = new Date(subscription.nextPayment);
        const today = new Date();
        const daysUntilRenewal = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilRenewal <= 3 && daysUntilRenewal > 0) {
            const usageStatus = getUsageStatus(subscription);
            if (usageStatus.status === 'Rarely Used' || usageStatus.status === 'Zombie') {
                return { risk: true, message: `Renews in ${daysUntilRenewal} days - Rarely used` };
            }
        }
        return { risk: false };
    };

    const handleCancelSubscription = async (id: string) => {
        setSelectedSubscription(subscriptions.find(s => s._id === id) || null);
        setShowCancelModal(true);
    };

    const confirmCancelSubscription = async () => {
        if (!selectedSubscription?._id) return;

        try {
            // The cancellation reason (Feature 8) is saved with the cancellation
            await apiClient.delete(`/subscriptions/${selectedSubscription._id}`, {
                data: { reason: cancelReason || undefined }
            });

            notify.success(`${selectedSubscription.name} cancelled. You can restore it from Cancelled Subscriptions.`);
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedSubscription(null);
            await fetchSubscriptions();
            fetchTrends();
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            notify.error(getApiErrorMessage(error, 'Failed to cancel subscription. Please try again.'));
        }
    };

    const handleRestoreSubscription = async (subscription: Subscription) => {
        try {
            await apiClient.put(`/subscriptions/${subscription._id}`, { isActive: true, isZombie: false });
            notify.success(`${subscription.name} restored.`);
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to restore subscription:', error);
            notify.error(getApiErrorMessage(error, 'Failed to restore subscription. Please try again.'));
        }
    };

    const handleCancelAllZombies = async () => {
        const confirmed = await confirmDialog({
            title: `Cancel ${zombieSubs.length} zombie subscription${zombieSubs.length > 1 ? 's' : ''}?`,
            message: `This cancels ${zombieSubs.map(s => s.name).join(', ')} and saves ${formatMoney(savings)}/month. You can restore them later from Cancelled Subscriptions.`,
            confirmText: 'Cancel All',
            cancelText: 'Keep Them',
            danger: true,
        });
        if (!confirmed) return;
        try {
            const zombieIds = zombieSubs.map(sub => sub._id!);
            const response = await apiClient.post('/subscriptions/bulk-cancel', { subscriptionIds: zombieIds });
            notify.success(`Cancelled ${response.data?.cancelledCount ?? zombieIds.length} subscription(s).`);
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to cancel zombie subscriptions:', error);
            notify.error(getApiErrorMessage(error, 'Failed to cancel subscriptions. Please try again.'));
        }
    };

    const handleFindAlternative = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setShowAlternativesModal(true);
    };

    const closeAlternativesModal = () => {
        setShowAlternativesModal(false);
        setSelectedSubscription(null);
    };

    // Esc closes the alternatives popup
    useEffect(() => {
        if (!showAlternativesModal) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAlternativesModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showAlternativesModal]);

    const handleCreateSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validation
            if (!newSubscription.name.trim() || !newSubscription.provider.trim() || !newSubscription.category || !newSubscription.nextPayment) {
                notify.warning('Please fill in all required fields.');
                return;
            }
            if (!(newSubscription.amount > 0)) {
                notify.warning('Amount must be greater than 0.');
                return;
            }

            await apiClient.post('/subscriptions', { ...newSubscription, amount: toLkr(newSubscription.amount) });
            
            // Reset form
            setNewSubscription({
                name: '',
                provider: '',
                amount: 0,
                frequency: 'monthly',
                nextPayment: '',
                category: '',
                isActive: true,
                isZombie: false
            });
            setShowAddForm(false);
            notify.success('Subscription added.');

            // Refresh subscription list
            await fetchSubscriptions();
            fetchAIInsights();
        } catch (error) {
            console.error('Failed to create subscription:', error);
            notify.error(getApiErrorMessage(error, 'Failed to create subscription. Please try again.'));
        }
    };

    const activeSubs = subscriptions.filter(sub => sub.isActive);
    const cancelledSubs = subscriptions.filter(sub => !sub.isActive);
    const zombieSubs = subscriptions.filter(sub => sub.isZombie && sub.isActive);
    const savings = zombieSubs.reduce((sum, sub) => sum + (sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount), 0);
    const healthScore = getHealthScore();
    
    // Feature 7: Consolidation Suggestions
    const consolidationSuggestions = () => {
        const categoryGroups = activeSubs.reduce((acc: { [key: string]: Subscription[] }, sub) => {
            if (!acc[sub.category]) acc[sub.category] = [];
            acc[sub.category].push(sub);
            return acc;
        }, {});

        return Object.entries(categoryGroups)
            .filter(([, subs]) => subs.length > 1)
            .map(([category, subs]) => ({
                category,
                count: subs.length,
                totalCost: subs.reduce((sum, s) => sum + (s.frequency === 'yearly' ? s.amount / 12 : s.amount), 0),
                potentialSavings: subs.reduce((sum, s) => sum + (s.frequency === 'yearly' ? s.amount / 12 : s.amount), 0) * 0.3
            }));
    };

    if (loading) {
        return <div className="loading-spinner">Loading subscriptions...</div>;
    }

    return (
        <div className="page-container su-page">
            <div className="su-top">
                <button
                    className="btn-primary su-add-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    + Add Subscription
                </button>
            </div>

            {/* Feature 1: Subscription Health Score */}
            <section className="su-health">
                {healthScore ? (
                    <div className="su-health-row">
                        <div>
                            <h3>Subscription Health Score</h3>
                            <p>
                                {healthScore.icon} <strong>{healthScore.score}</strong> — Your subscriptions are {(healthScore.percentage).toFixed(1)}% of monthly income
                            </p>
                        </div>
                        <div className="su-health-badge">
                            <div className="su-health-value">{(healthScore.percentage).toFixed(1)}%</div>
                            <div className="su-health-label">of Income</div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3>Subscription Health Score</h3>
                        <p>
                            You spend {formatMoney(totalMonthlyCost)}/month on subscriptions. To see what share of your income that is,{' '}
                            <Link to="/profile" className="su-health-link">add your monthly income in Profile</Link>.
                        </p>
                    </div>
                )}
            </section>

            {/* Add Subscription Form */}
            {showAddForm && (
                <div className="card form-card gl-form">
                    <h3 className="gl-form-title">Add New Subscription</h3>
                    <form onSubmit={handleCreateSubscription} className="subscription-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Service Name</label>
                                <input
                                    type="text"
                                    value={newSubscription.name}
                                    onChange={(e) => setNewSubscription({...newSubscription, name: e.target.value})}
                                    placeholder="e.g., Netflix Premium"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Provider</label>
                                <input
                                    type="text"
                                    value={newSubscription.provider}
                                    onChange={(e) => setNewSubscription({...newSubscription, provider: e.target.value})}
                                    placeholder="e.g., Netflix"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Amount ({currencyCode()})</label>
                                <input
                                    type="number"
                                    value={newSubscription.amount || ''}
                                    onChange={(e) => setNewSubscription({...newSubscription, amount: Number(e.target.value)})}
                                    placeholder="1500"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Frequency</label>
                                <select
                                    value={newSubscription.frequency}
                                    onChange={(e) => setNewSubscription({...newSubscription, frequency: e.target.value as 'monthly' | 'yearly'})}
                                    required
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={newSubscription.category}
                                    onChange={(e) => setNewSubscription({...newSubscription, category: e.target.value})}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Software">Software</option>
                                    <option value="Health">Health & Fitness</option>
                                    <option value="Education">Education</option>
                                    <option value="News">News & Media</option>
                                    <option value="Gaming">Gaming</option>
                                    <option value="Music">Music</option>
                                    <option value="Cloud Storage">Cloud Storage</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Next Payment Date</label>
                                <DateInput
                                    value={newSubscription.nextPayment}
                                    onChange={(e) => setNewSubscription({...newSubscription, nextPayment: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Add Subscription
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Summary Cards */}
            <div className="rc-stats">
                <div className="rc-stat">
                    <span className="rc-stat-label">Monthly Total</span>
                    <span className="rc-stat-value">{formatMoney(totalMonthlyCost)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">Active Subscriptions</span>
                    <span className="rc-stat-value">{activeSubs.length}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">Zombie Subscriptions</span>
                    <span className="rc-stat-value">{zombieSubs.length}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">Potential Monthly Savings</span>
                    <span className="rc-stat-value">{formatMoney(savings)}</span>
                </div>
            </div>

            {/* Feature 6: Subscription Trend Analytics */}
            <section className="su-panel">
                <h3 className="su-panel-title">6-Month Spending Trend</h3>
                {trends.some(t => t.amount > 0) ? (
                    <div className="su-trend">
                        {trends.map((trend, idx) => {
                            const maxAmount = Math.max(...trends.map(t => t.amount));
                            return (
                                <div key={idx} className="su-trend-col" title={`${formatMoney(trend.amount)}`}>
                                    <div className="su-trend-value">
                                        {trend.amount > 0 ? `${(trend.amount / 1000).toFixed(1)}K` : '0'}
                                    </div>
                                    <div className="su-trend-bar" style={{ height: `${Math.max(2, (trend.amount / maxAmount) * 100)}px` }}></div>
                                    <div className="su-trend-month">{trend.month}</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="su-muted">
                        No subscription payments recorded in the last 6 months yet. Payments you log with Pay on the Recurring page,
                        and expenses from these providers, will show here.
                    </p>
                )}
            </section>

            {/* Feature 7: Consolidation Suggestions */}
            {consolidationSuggestions().length > 0 && (
                <div className="su-note warn">
                    <h4>AI Consolidation Opportunity</h4>
                    {consolidationSuggestions().map((suggestion, idx) => (
                        <p key={idx}>
                            <strong>{suggestion.category}:</strong> You have {suggestion.count} subscriptions costing {formatMoney(suggestion.totalCost)}/month.
                            Consolidating could save <strong>{formatMoney(suggestion.potentialSavings)}/month</strong>.
                        </p>
                    ))}
                </div>
            )}

            {/* Zombie Subscriptions Alert */}
            {zombieSubs.length > 0 && (
                <div className="su-note bad su-zombie">
                    <div>
                        <h4>Zombie Subscriptions Detected!</h4>
                        <p>You have {zombieSubs.length} subscriptions you haven't used in 3+ months. Cancel them to save {formatMoney(savings)}/month.</p>
                    </div>
                    <button className="su-btn danger" onClick={handleCancelAllZombies}>
                        Cancel All Zombies
                    </button>
                </div>
            )}

            {/* Subscriptions List - Feature 10: Enhanced Card Layout */}
            <div className="su-grid">
                {activeSubs.map((subscription) => {
                    const usageStatus = getUsageStatus(subscription);
                    const insightData = subscription._id ? insightsMap[subscription._id] : null;
                    const insight = insightData?.insight
                        || (insightsStatus === 'loading' ? 'Loading AI insight...' : 'AI insight is not available right now. Please try again later.');
                    const renewalRisk = getRenewalRisk(subscription);
                    const dueStatus = getDueStatus(subscription);
                    const monthlyAmount = subscription.frequency === 'yearly' ? subscription.amount / 12 : subscription.amount;
                    const usageTone = usageStatus.status === 'Actively Used' ? 'good' : usageStatus.status === 'Rarely Used' ? 'warn' : 'bad';

                    return (
                        <article key={subscription._id} className={`su-card ${renewalRisk.risk || dueStatus.overdue ? 'alert' : ''}`}>
                            {/* Renewal Risk Warning - Feature 5 */}
                            {renewalRisk.risk && (
                                <div className="su-banner">{renewalRisk.message}</div>
                            )}

                            {/* Payment date has passed */}
                            {dueStatus.overdue && (
                                <div className="su-banner">
                                    Payment overdue: was due {new Date(subscription.nextPayment).toLocaleDateString('en-LK')} ({dueStatus.label.toLowerCase()}).
                                    Log the payment on the Recurring page, or cancel if you no longer use it.
                                </div>
                            )}

                            {/* Header - Subscription Name & Status */}
                            <div className="su-card-head">
                                <div className="su-card-title">
                                    <h4>{subscription.name}</h4>
                                    <span>{subscription.provider}</span>
                                </div>
                                <span className={`su-pill ${usageTone}`}>
                                    {usageStatus.icon} {usageStatus.status}
                                </span>
                            </div>

                            {/* Usage Info - Feature 2 */}
                            <p className="su-usage">{usageStatus.label}</p>

                            {/* Cost & Category Row */}
                            <div className="su-facts">
                                <div>
                                    <div className="su-fact-label">Cost</div>
                                    <div className="su-fact-value big">{formatMoney(monthlyAmount)}</div>
                                    <div className="su-fact-sub">/month</div>
                                </div>
                                <div>
                                    <div className="su-fact-label">Category</div>
                                    <div className="su-fact-value">{subscription.category}</div>
                                </div>
                                <div>
                                    <div className="su-fact-label">Next Renewal</div>
                                    <div className="su-fact-value" style={{ color: dueStatus.overdue ? '#ef4444' : undefined }}>{formatDate(subscription.nextPayment)}</div>
                                    <div className="su-fact-sub" style={{ color: dueStatus.color }}>{dueStatus.label}</div>
                                </div>
                            </div>

                            {/* AI Insight Card - Feature 3 */}
                            <div className="su-insight">
                                <strong>AI Insight:</strong> {insight}
                            </div>

                            {/* Impact Summary - Feature 9 */}
                            <div className="su-impact">
                                <strong>If you cancel:</strong>
                                <ul>
                                    <li>Save {formatMoney(monthlyAmount)}/month</li>
                                    {monthlyIncome && <li>Frees up {((monthlyAmount / monthlyIncome) * 100).toFixed(1)}% of your monthly income</li>}
                                    <li>Annual savings: {formatMoney((monthlyAmount * 12))}</li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="su-actions">
                                <button className="btn-primary btn-sm" onClick={() => handleFindAlternative(subscription)}>
                                    View Alternatives
                                </button>
                                <button className="btn-secondary btn-sm" onClick={() => notify.info('Downgrade is coming soon.')}>
                                    Downgrade
                                </button>
                                <button className="btn-secondary btn-sm" onClick={() => handleCancelSubscription(subscription._id!)}>
                                    Cancel
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {activeSubs.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon" style={{ display: 'none' }}></div>
                    <h3>No Subscriptions Found</h3>
                    <p>We'll automatically detect recurring payments from your transactions</p>
                </div>
            )}

            {/* Cancelled / dismissed subscriptions can be brought back */}
            {cancelledSubs.length > 0 && (
                <section className="su-panel su-cancelled">
                    <h3 className="su-panel-title">
                        Cancelled Subscriptions ({cancelledSubs.length})
                    </h3>
                    {cancelledSubs.map(sub => (
                        <div key={sub._id} className="su-cancelled-row">
                            <div>
                                <div className="su-cancelled-name">{sub.name}</div>
                                <div className="su-cancelled-meta">
                                    {sub.provider} · {formatMoney(sub.amount)}/{sub.frequency === 'yearly' ? 'year' : 'month'}
                                    {sub.cancelledAt && ` · Cancelled ${formatDate(sub.cancelledAt)}`}
                                    {sub.cancelReason && ` · ${CANCEL_REASON_LABELS[sub.cancelReason] || sub.cancelReason}`}
                                </div>
                            </div>
                            <button className="btn-secondary su-restore-btn" onClick={() => handleRestoreSubscription(sub)}>
                                Restore
                            </button>
                        </div>
                    ))}
                </section>
            )}

            {/* Modal: Cheaper Alternatives - Feature 4 */}
            {showAlternativesModal && selectedSubscription && (
                <div className="su-overlay" onClick={closeAlternativesModal}>
                    <div
                        className="gl-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="alternatives-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="gl-modal-head">
                            <h2 id="alternatives-title">Cheaper Alternatives for {selectedSubscription.name}</h2>
                            <button type="button" className="gl-modal-close" onClick={closeAlternativesModal} aria-label="Close" title="Close">
                                ×
                            </button>
                        </div>

                        {(() => {
                            const insightData = selectedSubscription._id ? insightsMap[selectedSubscription._id] : null;
                            const alternatives = insightData ? (insightData.alternatives || []) : [];

                            return (
                                <div>
                                    {alternatives.length > 0 ? (
                                        <div>
                                            <div className="su-table-wrap">
                                                <table className="su-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Alternative</th>
                                                            <th className="center">Price</th>
                                                            <th className="right">Savings</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {alternatives.map((alt, idx) => (
                                                            <tr key={idx}>
                                                                <td>
                                                                    <div className="su-alt-name">{alt.name}</div>
                                                                    <div className="su-alt-provider">{alt.provider}</div>
                                                                </td>
                                                                <td className="center strong">
                                                                    {formatMoney(alt.price)}
                                                                </td>
                                                                <td className="right strong su-saving">
                                                                    {alt.savings > 0 ? `+${formatMoney(alt.savings)}` : 'N/A'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="gl-modal-actions su-modal-actions">
                                                <button className="btn-secondary" onClick={closeAlternativesModal}>
                                                    Close
                                                </button>
                                                <button className="btn-primary" onClick={() => notify.info('Switch plan is coming soon.')}>
                                                    Switch Plan
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="su-modal-text">
                                                {insightsStatus === 'failed'
                                                    ? 'Cheaper alternatives could not be loaded right now. Please try again later.'
                                                    : 'No cheaper alternatives available at this time.'}
                                            </p>
                                            <div className="gl-modal-actions su-modal-actions">
                                                <button type="button" className="btn-secondary" onClick={closeAlternativesModal}>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Modal: Cancel Subscription - Features 8 & 9 */}
            {showCancelModal && selectedSubscription && (
                <div className="su-overlay">
                    <div className="gl-modal gl-form" role="dialog" aria-modal="true" aria-labelledby="cancel-sub-title">
                        <div className="gl-modal-head">
                            <h2 id="cancel-sub-title">Cancel {selectedSubscription.name}?</h2>
                            <button
                                type="button"
                                className="gl-modal-close"
                                aria-label="Close"
                                title="Close"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedSubscription(null);
                                    setCancelReason('');
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Feature 9: Impact Summary */}
                        <div className="su-impact su-impact-modal">
                            <strong>Cancelling this will:</strong>
                            <ul>
                                <li>Save {formatMoney((selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount))}/month</li>
                                {monthlyIncome && <li>Free up {(((selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount) / monthlyIncome) * 100).toFixed(1)}% of your monthly income</li>}
                                <li>Annual savings: {formatMoney(((selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount) * 12))}</li>
                            </ul>
                        </div>

                        {/* Feature 8: Cancel Reason Tracking */}
                        <div className="form-group">
                            <label htmlFor="cancel-reason">Why are you cancelling? (optional)</label>
                            <select
                                id="cancel-reason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            >
                                <option value="">Select a reason...</option>
                                <option value="too-expensive">Too expensive</option>
                                <option value="not-used">Not using it</option>
                                <option value="found-alternative">Found a cheaper alternative</option>
                                <option value="temporary-pause">Temporary pause</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="gl-modal-actions su-modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedSubscription(null);
                                    setCancelReason('');
                                }}
                            >
                                Keep Subscription
                            </button>
                            <button className="gl-delete-btn" onClick={confirmCancelSubscription}>
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
