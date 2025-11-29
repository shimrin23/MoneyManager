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

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await apiClient.get('/subscriptions');
            setSubscriptions(response.data.subscriptions || []);
            calculateMonthlyCost(response.data.subscriptions || []);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
            // Mock data for demo
            const mockSubs = [
                {
                    _id: '1',
                    name: 'Netflix Premium',
                    provider: 'Netflix',
                    amount: 1500,
                    frequency: 'monthly' as const,
                    nextPayment: '2025-12-15',
                    category: 'Entertainment',
                    isActive: true,
                    lastUsed: '2025-11-20',
                    isZombie: false
                },
                {
                    _id: '2',
                    name: 'Spotify Family',
                    provider: 'Spotify',
                    amount: 800,
                    frequency: 'monthly' as const,
                    nextPayment: '2025-12-10',
                    category: 'Entertainment',
                    isActive: true,
                    lastUsed: '2025-11-25',
                    isZombie: false
                },
                {
                    _id: '3',
                    name: 'Gym Membership',
                    provider: 'FitLife Gym',
                    amount: 4500,
                    frequency: 'monthly' as const,
                    nextPayment: '2025-12-05',
                    category: 'Health',
                    isActive: true,
                    lastUsed: '2025-08-15', // 3+ months ago = zombie
                    isZombie: true
                },
                {
                    _id: '4',
                    name: 'Adobe Creative Cloud',
                    provider: 'Adobe',
                    amount: 3200,
                    frequency: 'monthly' as const,
                    nextPayment: '2025-12-20',
                    category: 'Software',
                    isActive: true,
                    lastUsed: '2025-07-10', // 3+ months ago = zombie
                    isZombie: true
                }
            ];
            setSubscriptions(mockSubs);
            calculateMonthlyCost(mockSubs);
        } finally {
            setLoading(false);
        }
    };

    const calculateMonthlyCost = (subs: Subscription[]) => {
        const total = subs.reduce((sum, sub) => {
            const monthlyCost = sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount;
            return sum + monthlyCost;
        }, 0);
        setTotalMonthlyCost(total);
    };

    const handleCancelSubscription = async (id: string) => {
        try {
            await apiClient.delete(`/subscriptions/${id}`);
            const updatedSubs = subscriptions.filter(sub => sub._id !== id);
            setSubscriptions(updatedSubs);
            calculateMonthlyCost(updatedSubs);
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            // For demo, just remove from UI
            const updatedSubs = subscriptions.filter(sub => sub._id !== id);
            setSubscriptions(updatedSubs);
            calculateMonthlyCost(updatedSubs);
        }
    };

    const handleFindAlternative = (subscription: Subscription) => {
        alert(`Finding cheaper alternatives to ${subscription.name}...`);
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
                <h1>🔄 Subscriptions & Recurring</h1>
                <p className="page-subtitle">Manage your recurring payments and subscriptions</p>
            </div>

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
                    <button className="alert-action" onClick={() => {
                        zombieSubs.forEach(sub => handleCancelSubscription(sub._id!));
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