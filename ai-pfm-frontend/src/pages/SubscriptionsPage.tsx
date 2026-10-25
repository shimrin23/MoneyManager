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
            message: `This cancels ${zombieSubs.map(s => s.name).join(', ')} and saves LKR ${savings.toLocaleString()}/month. You can restore them later from Cancelled Subscriptions.`,
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

            await apiClient.post('/subscriptions', newSubscription);
            
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
        <div className="page-container">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button 
                    className="btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    + Add Subscription
                </button>
            </div>

            {/* Feature 1: Subscription Health Score */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                {healthScore ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Subscription Health Score</h3>
                            <p style={{ margin: '0', opacity: 0.9 }}>
                                {healthScore.icon} <strong>{healthScore.score}</strong> — Your subscriptions are {(healthScore.percentage).toFixed(1)}% of monthly income
                            </p>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            padding: '16px 24px',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{(healthScore.percentage).toFixed(1)}%</div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>of Income</div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Subscription Health Score</h3>
                        <p style={{ margin: '0', opacity: 0.9 }}>
                            You spend LKR {totalMonthlyCost.toLocaleString()}/month on subscriptions. To see what share of your income that is,{' '}
                            <Link to="/profile" style={{ color: 'white', fontWeight: 600, textDecoration: 'underline' }}>add your monthly income in Profile</Link>.
                        </p>
                    </div>
                )}
            </div>

            {/* Add Subscription Form */}
            {showAddForm && (
                <div className="card form-card">
                    <h3>Add New Subscription</h3>
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
                                <label>Amount (LKR)</label>
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
                                <input
                                    type="date"
                                    value={newSubscription.nextPayment}
                                    onChange={(e) => setNewSubscription({...newSubscription, nextPayment: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
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

            {/* Summary Cards: same 4-across layout as the other finance pages (2-across on small screens) */}
            <div className="rec-summary-grid">
                <div className="rec-stat-card">
                    <div className="rec-stat-icon">💰</div>
                    <div>
                        <div className="rec-stat-value">LKR {totalMonthlyCost.toLocaleString()}</div>
                        <div className="rec-stat-label">Monthly Total</div>
                    </div>
                </div>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-icon">📱</div>
                    <div>
                        <div className="rec-stat-value">{activeSubs.length}</div>
                        <div className="rec-stat-label">Active Subscriptions</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">🧟</div>
                    <div>
                        <div className="rec-stat-value">{zombieSubs.length}</div>
                        <div className="rec-stat-label">Zombie Subscriptions</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">💸</div>
                    <div>
                        <div className="rec-stat-value">LKR {savings.toLocaleString()}</div>
                        <div className="rec-stat-label">Potential Monthly Savings</div>
                    </div>
                </div>
            </div>

            {/* Feature 6: Subscription Trend Analytics */}
            <div style={{
                background: 'var(--card-hover)',
                border: '2px solid var(--border)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginTop: '0', marginBottom: '16px', color: 'var(--text)' }}>6-Month Spending Trend</h3>
                {trends.some(t => t.amount > 0) ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px' }}>
                        {trends.map((trend, idx) => {
                            const maxAmount = Math.max(...trends.map(t => t.amount));
                            return (
                                <div key={idx} style={{ textAlign: 'center' }} title={`LKR ${trend.amount.toLocaleString()}`}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        {trend.amount > 0 ? `${(trend.amount / 1000).toFixed(1)}K` : '0'}
                                    </div>
                                    <div style={{
                                        height: `${Math.max(2, (trend.amount / maxAmount) * 100)}px`,
                                        background: 'linear-gradient(to top, #667eea, #764ba2)',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        minWidth: '30px'
                                    }}></div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{trend.month}</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                        No subscription payments recorded in the last 6 months yet. Payments you log with Pay on the Recurring page,
                        and expenses from these providers, will show here.
                    </p>
                )}
            </div>

            {/* Feature 7: Consolidation Suggestions */}
            {consolidationSuggestions().length > 0 && (
                <div style={{
                    background: '#fef3c7',
                    border: '2px solid #fcd34d',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#92400e' }}>AI Consolidation Opportunity</h4>
                    {consolidationSuggestions().map((suggestion, idx) => (
                        <div key={idx} style={{ marginBottom: '8px', color: '#92400e' }}>
                            <strong>{suggestion.category}:</strong> You have {suggestion.count} subscriptions costing LKR {suggestion.totalCost.toLocaleString()}/month.
                            Consolidating could save <strong>LKR {suggestion.potentialSavings.toLocaleString()}/month</strong>.
                        </div>
                    ))}
                </div>
            )}

            {/* Zombie Subscriptions Alert */}
            {zombieSubs.length > 0 && (
                <div className="zombie-alert">
                    <div className="alert-content">
                        <span className="alert-icon" style={{ display: 'none' }}></span>
                        <div>
                            <h4>Zombie Subscriptions Detected!</h4>
                            <p>You have {zombieSubs.length} subscriptions you haven't used in 3+ months. Cancel them to save LKR {savings.toLocaleString()}/month.</p>
                        </div>
                    </div>
                    <button className="alert-action" onClick={handleCancelAllZombies}>
                        Cancel All Zombies
                    </button>
                </div>
            )}



            {/* Subscriptions List - Feature 10: Enhanced Card Layout */}
            <div className="subscriptions-list">
                {activeSubs.map((subscription) => {
                    const usageStatus = getUsageStatus(subscription);
                    const insightData = subscription._id ? insightsMap[subscription._id] : null;
                    const insight = insightData?.insight
                        || (insightsStatus === 'loading' ? 'Loading AI insight...' : 'AI insight is not available right now. Please try again later.');
                    const renewalRisk = getRenewalRisk(subscription);
                    const monthlyAmount = subscription.frequency === 'yearly' ? subscription.amount / 12 : subscription.amount;
                    
                    return (
                        <div key={subscription._id} style={{
                            background: 'var(--card)',
                            border: renewalRisk.risk ? '2px solid #ef4444' : '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            {/* Renewal Risk Warning - Feature 5 */}
                            {renewalRisk.risk && (
                                <div style={{
                                    background: '#fee2e2',
                                    border: '1px solid #fecaca',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    color: '#991b1b',
                                    fontSize: '14px'
                                }}>
                                    {renewalRisk.message}
                                </div>
                            )}

                            {/* Header - Subscription Name & Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{subscription.name}</h4>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)' }}>{subscription.provider}</p>
                                </div>
                                <div style={{
                                    background: usageStatus.status === 'Actively Used' ? '#dcfce7' : usageStatus.status === 'Rarely Used' ? '#fef3c7' : '#fee2e2',
                                    color: usageStatus.status === 'Actively Used' ? '#166534' : usageStatus.status === 'Rarely Used' ? '#92400e' : '#991b1b',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}>
                                    {usageStatus.icon} {usageStatus.status}
                                </div>
                            </div>

                            {/* Usage Info - Feature 2 */}
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                {usageStatus.label}
                            </p>

                            {/* Cost & Category Row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '16px',
                                background: 'var(--card-hover)',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                border: '1px solid var(--border)'
                            }}>
                                <div>
                                    <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '4px', fontWeight: '600' }}>Cost</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>LKR {monthlyAmount.toLocaleString()}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>/month</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '4px', fontWeight: '600' }}>Category</div>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>{subscription.category}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '4px', fontWeight: '600' }}>Next Renewal</div>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>{new Date(subscription.nextPayment).toLocaleDateString('en-LK')}</div>
                                </div>
                            </div>

                            {/* AI Insight Card - Feature 3 */}
                            <div style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                color: '#1e40af',
                                fontSize: '13px'
                            }}>
                                <strong>AI Insight:</strong> {insight}
                            </div>

                            {/* Impact Summary - Feature 9 */}
                            <div style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                fontSize: '13px',
                                color: '#166534'
                            }}>
                                <strong>If you cancel:</strong><br />
                                • Save LKR {monthlyAmount.toLocaleString()}/month<br />
                                {monthlyIncome && <>• Frees up {((monthlyAmount / monthlyIncome) * 100).toFixed(1)}% of your monthly income<br /></>}
                                • Annual savings: LKR {(monthlyAmount * 12).toLocaleString()}
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap'
                            }}>
                                <button 
                                    style={{
                                        flex: '1',
                                        minWidth: '120px',
                                        padding: '10px 12px',
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }}
                                    onClick={() => handleFindAlternative(subscription)}
                                >
                                    View Alternatives
                                </button>
                                <button 
                                    style={{
                                        flex: '1',
                                        minWidth: '120px',
                                        padding: '10px 12px',
                                        background: '#f97316',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }}
                                    onClick={() => notify.info('Downgrade is coming soon.')}
                                >
                                    Downgrade
                                </button>
                                <button 
                                    style={{
                                        flex: '1',
                                        minWidth: '120px',
                                        padding: '10px 12px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }}
                                    onClick={() => handleCancelSubscription(subscription._id!)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
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
                <div style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginTop: '20px'
                }}>
                    <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '16px' }}>
                        Cancelled Subscriptions ({cancelledSubs.length})
                    </h3>
                    {cancelledSubs.map(sub => (
                        <div key={sub._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 0',
                            borderTop: '1px solid var(--border)'
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{sub.name}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    {sub.provider} · LKR {sub.amount.toLocaleString()}/{sub.frequency === 'yearly' ? 'year' : 'month'}
                                    {sub.cancelledAt && ` · Cancelled ${new Date(sub.cancelledAt).toLocaleDateString()}`}
                                    {sub.cancelReason && ` · ${CANCEL_REASON_LABELS[sub.cancelReason] || sub.cancelReason}`}
                                </div>
                            </div>
                            <button
                                className="btn-secondary"
                                style={{ padding: '6px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                                onClick={() => handleRestoreSubscription(sub)}
                            >
                                Restore
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal: Cheaper Alternatives - Feature 4 */}
            {showAlternativesModal && selectedSubscription && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--card)',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginTop: '0' }}>Cheaper Alternatives for {selectedSubscription.name}</h3>
                        
                        {(() => {
                            const insightData = selectedSubscription._id ? insightsMap[selectedSubscription._id] : null;
                            const alternatives = insightData ? (insightData.alternatives || []) : [];
                            
                            return (
                                <div>
                                    {alternatives.length > 0 ? (
                                        <div>
                                            <div className="table-container" style={{ overflowX: 'auto', width: '100%', marginBottom: '16px' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                            <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600' }}>Alternative</th>
                                                            <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600' }}>Price</th>
                                                            <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600' }}>Savings</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {alternatives.map((alt, idx) => (
                                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                                <td style={{ padding: '12px 8px' }}>
                                                                    <div style={{ fontWeight: '500' }}>{alt.name}</div>
                                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{alt.provider}</div>
                                                                </td>
                                                                <td style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '600' }}>
                                                                    LKR {alt.price.toLocaleString()}
                                                                </td>
                                                                <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: '600', color: '#059669' }}>
                                                                    {alt.savings > 0 ? `+Rs. ${alt.savings.toLocaleString()}` : 'N/A'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                            
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        background: '#3b82f6',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500'
                                                    }}
                                                    onClick={() => notify.info('Switch plan is coming soon.')}
                                                >
                                                    Switch Plan
                                                </button>
                                                <button
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        background: 'var(--card-hover)',
                                                        color: 'var(--text)',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500'
                                                    }}
                                                    onClick={() => setShowAlternativesModal(false)}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>No cheaper alternatives available at this time.</p>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Modal: Cancel Subscription - Features 8 & 9 */}
            {showCancelModal && selectedSubscription && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--card)',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h3 style={{ marginTop: '0' }}>Cancel {selectedSubscription.name}?</h3>
                        
                        {/* Feature 9: Impact Summary */}
                        <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '13px',
                            color: '#166534'
                        }}>
                            <strong>Cancelling this will:</strong><br />
                            • Save LKR {(selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount).toLocaleString()}/month<br />
                            {monthlyIncome && <>• Free up {(((selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount) / monthlyIncome) * 100).toFixed(1)}% of your monthly income<br /></>}
                            • Annual savings: LKR {((selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount) * 12).toLocaleString()}
                        </div>

                        {/* Feature 8: Cancel Reason Tracking */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Why are you cancelling? (optional)</label>
                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">Select a reason...</option>
                                <option value="too-expensive">Too expensive</option>
                                <option value="not-used">Not using it</option>
                                <option value="found-alternative">Found a cheaper alternative</option>
                                <option value="temporary-pause">Temporary pause</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                                onClick={confirmCancelSubscription}
                            >
                                Confirm Cancel
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'var(--card-hover)',
                                    color: 'var(--text)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedSubscription(null);
                                    setCancelReason('');
                                }}
                            >
                                Keep Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
