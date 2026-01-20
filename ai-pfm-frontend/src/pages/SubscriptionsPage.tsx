import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

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
}

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
    const [monthlyIncome, setMonthlyIncome] = useState(100000); // Default estimate
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

    useEffect(() => {
        fetchSubscriptions();
        generateTrends();
        // Fetch monthly income from user stats
        fetchUserStats();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await apiClient.get('/subscriptions');
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

    const fetchUserStats = async () => {
        try {
            const response = await apiClient.get('/user/stats');
            setMonthlyIncome(response.data.monthlyIncome || 100000);
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        }
    };

    const generateTrends = () => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push({
                month: date.toLocaleString('en-LK', { month: 'short', year: '2-digit' }),
                amount: Math.floor(Math.random() * 3000) + 2000
            });
        }
        setTrends(months);
    };

    // Feature 1: Health Score Calculation
    const getHealthScore = () => {
        const percentOfIncome = (totalMonthlyCost / monthlyIncome) * 100;
        if (percentOfIncome < 5) return { score: 'Healthy', icon: '🟢', percentage: percentOfIncome };
        if (percentOfIncome < 10) return { score: 'Needs Review', icon: '🟡', percentage: percentOfIncome };
        return { score: 'Overloaded', icon: '🔴', percentage: percentOfIncome };
    };

    // Feature 2: Usage Status Determination
    const getUsageStatus = (subscription: Subscription) => {
        if (subscription.isZombie) return { status: 'Zombie', icon: '🔴', label: 'No activity detected' };
        
        if (subscription.lastUsed) {
            const lastUsedDate = new Date(subscription.lastUsed);
            const now = new Date();
            const daysAgo = Math.floor((now.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysAgo < 7) return { status: 'Actively Used', icon: '🟢', label: `Last used: ${daysAgo} days ago` };
            if (daysAgo < 60) return { status: 'Rarely Used', icon: '🟡', label: `Last used: ${Math.floor(daysAgo / 7)} weeks ago` };
            return { status: 'Zombie', icon: '🔴', label: `Last used: ${Math.floor(daysAgo / 30)} months ago` };
        }
        return { status: 'Unknown', icon: '⚪', label: 'No usage data' };
    };

    // Feature 3 & 4: AI Insights and Alternatives
    const getAIInsight = (subscription: Subscription): { insight: string; alternatives: CheaperAlternative[] } => {
        const alternatives: { [key: string]: CheaperAlternative[] } = {
            'Cloud Storage': [
                { name: 'OneDrive Basic', price: 350, savings: Math.max(0, subscription.amount - 350), provider: 'Microsoft' },
                { name: 'Google Drive', price: 400, savings: Math.max(0, subscription.amount - 400), provider: 'Google' }
            ],
            'Entertainment': [
                { name: 'Netflix Basic', price: 499, savings: Math.max(0, subscription.amount - 499), provider: 'Netflix' },
                { name: 'Local Streaming', price: 0, savings: subscription.amount, provider: 'Various' }
            ],
            'Music': [
                { name: 'Spotify Free', price: 0, savings: subscription.amount, provider: 'Spotify' },
                { name: 'Apple Music', price: 499, savings: Math.max(0, subscription.amount - 499), provider: 'Apple' }
            ],
            'Software': [
                { name: 'Open Source Alternative', price: 0, savings: subscription.amount, provider: 'Various' },
                { name: 'Discounted Plan', price: Math.floor(subscription.amount * 0.7), savings: Math.floor(subscription.amount * 0.3), provider: subscription.provider }
            ]
        };

        const categoryAlts = alternatives[subscription.category] || [];
        let insight = `📦 ${subscription.category} subscription`;
        
        if (categoryAlts.length > 0 && categoryAlts[0].savings > 0) {
            insight = `💡 ${categoryAlts[0].name} could save you LKR ${categoryAlts[0].savings.toLocaleString()}/month`;
        }

        return { insight, alternatives: categoryAlts };
    };

    // Feature 5: Renewal Risk Detection
    const getRenewalRisk = (subscription: Subscription) => {
        const nextPaymentDate = new Date(subscription.nextPayment);
        const today = new Date();
        const daysUntilRenewal = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilRenewal <= 3 && daysUntilRenewal > 0) {
            const usageStatus = getUsageStatus(subscription);
            if (usageStatus.status === 'Rarely Used' || usageStatus.status === 'Zombie') {
                return { risk: true, message: `⚠️ Renews in ${daysUntilRenewal} days - Rarely used` };
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
            await apiClient.delete(`/subscriptions/${selectedSubscription._id}`);
            
            // Log cancellation reason (Feature 8)
            await apiClient.post('/subscriptions/cancel-reason', {
                subscriptionId: selectedSubscription._id,
                reason: cancelReason,
                timestamp: new Date().toISOString()
            }).catch(() => {
                // Non-critical, continue even if this fails
            });

            setShowCancelModal(false);
            setCancelReason('');
            setSelectedSubscription(null);
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            alert('Failed to cancel subscription. Please try again.');
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
            if (!newSubscription.name || !newSubscription.provider || !newSubscription.amount || !newSubscription.nextPayment) {
                alert('Please fill in all required fields');
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
            
            // Refresh subscription list
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to create subscription:', error);
            alert('Failed to create subscription. Please try again.');
        }
    };

    const activeSubs = subscriptions.filter(sub => sub.isActive);
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
            .filter(([_, subs]) => subs.length > 1)
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
                <div>
                    <h1>🔄 Subscriptions & Recurring</h1>
                    <p className="page-subtitle">AI-Powered subscription management and savings</p>
                </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>💚 Subscription Health Score</h3>
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
                                    min="0"
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

            {/* Summary Cards */}
            <div className="subscriptions-summary">
                <div className="summary-card">
                    <div className="summary-icon">💰</div>
                    <div className="summary-content">
                        <h3>LKR {totalMonthlyCost.toLocaleString()}</h3>
                        <p>Monthly Total</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📱</div>
                    <div className="summary-content">
                        <h3>{activeSubs.length}</h3>
                        <p>Active Subscriptions</p>
                    </div>
                </div>
                <div className="summary-card zombie">
                    <div className="summary-icon">🧟</div>
                    <div className="summary-content">
                        <h3>{zombieSubs.length}</h3>
                        <p>Zombie Subscriptions</p>
                    </div>
                </div>
                <div className="summary-card savings">
                    <div className="summary-icon">💸</div>
                    <div className="summary-content">
                        <h3>LKR {savings.toLocaleString()}</h3>
                        <p>Potential Monthly Savings</p>
                    </div>
                </div>
            </div>

            {/* Feature 6: Subscription Trend Analytics */}
            <div style={{
                background: '#f3f4f6',
                border: '2px solid #d1d5db',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginTop: '0', marginBottom: '16px', color: '#1f2937' }}>📊 6-Month Spending Trend</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '120px' }}>
                    {trends.map((trend, idx) => (
                        <div key={idx} style={{ textAlign: 'center' }}>
                            <div style={{
                                height: `${(trend.amount / 5000) * 100}px`,
                                background: 'linear-gradient(to top, #667eea, #764ba2)',
                                borderRadius: '4px',
                                marginBottom: '8px',
                                minWidth: '30px'
                            }}></div>
                            <div style={{ fontSize: '11px', color: '#374151', fontWeight: '500' }}>{trend.month}</div>
                        </div>
                    ))}
                </div>
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
                    <h4 style={{ margin: '0 0 12px 0', color: '#92400e' }}>🤖 AI Consolidation Opportunity</h4>
                    {consolidationSuggestions().map((suggestion, idx) => (
                        <div key={idx} style={{ marginBottom: '8px', color: '#92400e' }}>
                            <strong>📦 {suggestion.category}:</strong> You have {suggestion.count} subscriptions costing LKR {suggestion.totalCost.toLocaleString()}/month.
                            Consolidating could save <strong>LKR {suggestion.potentialSavings.toLocaleString()}/month</strong>.
                        </div>
                    ))}
                </div>
            )}

            {/* Zombie Subscriptions Alert */}
            {zombieSubs.length > 0 && (
                <div className="zombie-alert">
                    <div className="alert-content">
                        <span className="alert-icon">🚨</span>
                        <div>
                            <h4>Zombie Subscriptions Detected!</h4>
                            <p>You have {zombieSubs.length} subscriptions you haven't used in 3+ months. Cancel them to save LKR {savings.toLocaleString()}/month.</p>
                        </div>
                    </div>
                    <button className="alert-action" onClick={async () => {
                        try {
                            const zombieIds = zombieSubs.map(sub => sub._id!);
                            await apiClient.post('/subscriptions/bulk-cancel', { subscriptionIds: zombieIds });
                            await fetchSubscriptions();
                        } catch (error) {
                            console.error('Failed to cancel zombie subscriptions:', error);
                            alert('Failed to cancel subscriptions. Please try again.');
                        }
                    }}>
                        💀 Cancel All Zombies
                    </button>
                </div>
            )}

            {/* Zombie Subscriptions Alert */}
            {zombieSubs.length > 0 && (
                <div className="zombie-alert">
                    <div className="alert-content">
                        <span className="alert-icon">🚨</span>
                        <div>
                            <h4>Zombie Subscriptions Detected!</h4>
                            <p>You have {zombieSubs.length} subscriptions you haven't used in 3+ months. Cancel them to save LKR {savings.toLocaleString()}/month.</p>
                        </div>
                    </div>
                    <button className="alert-action" onClick={async () => {
                        try {
                            const zombieIds = zombieSubs.map(sub => sub._id!);
                            await apiClient.post('/subscriptions/bulk-cancel', { subscriptionIds: zombieIds });
                            await fetchSubscriptions();
                        } catch (error) {
                            console.error('Failed to cancel zombie subscriptions:', error);
                            alert('Failed to cancel subscriptions. Please try again.');
                        }
                    }}>
                        💀 Cancel All Zombies
                    </button>
                </div>
            )}

            {/* Subscriptions List - Feature 10: Enhanced Card Layout */}
            <div className="subscriptions-list">
                {activeSubs.map((subscription) => {
                    const usageStatus = getUsageStatus(subscription);
                    const { insight, alternatives } = getAIInsight(subscription);
                    const renewalRisk = getRenewalRisk(subscription);
                    const monthlyAmount = subscription.frequency === 'yearly' ? subscription.amount / 12 : subscription.amount;
                    
                    return (
                        <div key={subscription._id} style={{
                            background: 'white',
                            border: renewalRisk.risk ? '2px solid #ef4444' : '1px solid #e5e7eb',
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
                                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#374151' }}>{subscription.provider}</p>
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
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#374151' }}>
                                {usageStatus.label}
                            </p>

                            {/* Cost & Category Row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '16px',
                                background: '#e5e7eb',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                border: '1px solid #d1d5db'
                            }}>
                                <div>
                                    <div style={{ fontSize: '14px', color: '#1f2937', marginBottom: '4px', fontWeight: '600' }}>Cost</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>LKR {monthlyAmount.toLocaleString()}</div>
                                    <div style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>/month</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', color: '#1f2937', marginBottom: '4px', fontWeight: '600' }}>Category</div>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{subscription.category}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', color: '#1f2937', marginBottom: '4px', fontWeight: '600' }}>Next Renewal</div>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{new Date(subscription.nextPayment).toLocaleDateString('en-LK')}</div>
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
                                🤖 <strong>AI Insight:</strong> {insight}
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
                                <strong>💡 If you cancel:</strong><br />
                                • Save LKR {monthlyAmount.toLocaleString()}/month<br />
                                • Financial Health Score: +{Math.round((monthlyAmount / monthlyIncome) * 10)}<br />
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
                                    🔍 View Alternatives
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
                                    onClick={() => alert('Downgrade feature coming soon')}
                                >
                                    ⬇️ Downgrade
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
                                    ❌ Cancel
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeSubs.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🔄</div>
                    <h3>No Subscriptions Found</h3>
                    <p>We'll automatically detect recurring payments from your transactions</p>
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
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginTop: '0' }}>💰 Cheaper Alternatives for {selectedSubscription.name}</h3>
                        
                        {(() => {
                            const { alternatives } = getAIInsight(selectedSubscription);
                            return (
                                <div>
                                    {alternatives.length > 0 ? (
                                        <div>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600' }}>Alternative</th>
                                                        <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600' }}>Price</th>
                                                        <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600' }}>Savings</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {alternatives.map((alt, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                            <td style={{ padding: '12px 8px' }}>
                                                                <div style={{ fontWeight: '500' }}>{alt.name}</div>
                                                                <div style={{ fontSize: '12px', color: '#666' }}>{alt.provider}</div>
                                                            </td>
                                                            <td style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '600' }}>
                                                                LKR {alt.price.toLocaleString()}
                                                            </td>
                                                            <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: '600', color: '#059669' }}>
                                                                {alt.savings > 0 ? `+LKR ${alt.savings.toLocaleString()}` : 'N/A'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                            
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
                                                    onClick={() => alert('Switch plan feature coming soon')}
                                                >
                                                    🔁 Switch Plan
                                                </button>
                                                <button
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        background: '#e5e7eb',
                                                        color: '#1f2937',
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
                        background: 'white',
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
                            • Improve Financial Health Score by +{Math.round(((selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount) / monthlyIncome) * 10)}<br />
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
                                    border: '1px solid #e5e7eb',
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
                                    background: '#e5e7eb',
                                    color: '#1f2937',
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