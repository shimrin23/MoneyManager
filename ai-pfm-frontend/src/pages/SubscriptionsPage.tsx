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

export const SubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
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

    const handleCancelSubscription = async (id: string) => {
        try {
            await apiClient.delete(`/subscriptions/${id}`);
            // Refresh the subscription list
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            alert('Failed to cancel subscription. Please try again.');
        }
    };

    const handleFindAlternative = (subscription: Subscription) => {
        alert(`Finding cheaper alternatives to ${subscription.name}...`);
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

    if (loading) {
        return <div className="loading-spinner">Loading subscriptions...</div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>🔄 Subscriptions & Recurring</h1>
                    <p className="page-subtitle">Manage your recurring payments and subscriptions</p>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    + Add Subscription
                </button>
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

            {/* Subscriptions List */}
            <div className="subscriptions-list">
                {activeSubs.map((subscription) => (
                    <div key={subscription._id} className={`subscription-card ${subscription.isZombie ? 'zombie' : ''}`}>
                        <div className="subscription-info">
                            <div className="subscription-header">
                                <h4>{subscription.name}</h4>
                                {subscription.isZombie && <span className="zombie-badge">🧟 Zombie</span>}
                            </div>
                            <div className="subscription-details">
                                <p className="provider">{subscription.provider}</p>
                                <p className="category">{subscription.category}</p>
                                {subscription.lastUsed && (
                                    <p className="last-used">Last used: {new Date(subscription.lastUsed).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="subscription-cost">
                            <div className="amount">LKR {subscription.amount.toLocaleString()}</div>
                            <div className="frequency">/{subscription.frequency}</div>
                            <div className="next-payment">Next: {new Date(subscription.nextPayment).toLocaleDateString()}</div>
                        </div>
                        
                        <div className="subscription-actions">
                            <button 
                                className="action-btn secondary"
                                onClick={() => handleFindAlternative(subscription)}
                            >
                                🔍 Find Cheaper
                            </button>
                            <button 
                                className="action-btn danger"
                                onClick={() => handleCancelSubscription(subscription._id!)}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {activeSubs.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🔄</div>
                    <h3>No Subscriptions Found</h3>
                    <p>We'll automatically detect recurring payments from your transactions</p>
                </div>
            )}
        </div>
    );
};