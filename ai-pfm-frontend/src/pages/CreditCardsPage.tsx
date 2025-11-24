import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface CreditCard {
    _id?: string;
    cardName: string;
    provider: string;
    creditLimit: number;
    currentBalance: number;
    availableLimit: number;
    minPaymentDue: number;
    dueDate: string;
    statementDate: string;
}

export const CreditCardsPage = () => {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchCreditCards();
    }, []);

    const fetchCreditCards = async () => {
        try {
            const response = await apiClient.get('/credit-cards');
            setCards(response.data.cards || []);
        } catch (error) {
            console.error('Error fetching credit cards:', error);
            // Fallback to empty array on error
            setCards([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getUtilizationPercentage = (current: number, limit: number) => {
        return (current / limit) * 100;
    };

    const getUtilizationColor = (percentage: number) => {
        if (percentage < 30) return '#10b981';
        if (percentage < 70) return '#f59e0b';
        return '#ef4444';
    };

    const getTotalCreditLimit = () => {
        return cards.reduce((total, card) => total + card.creditLimit, 0);
    };

    const getTotalBalance = () => {
        return cards.reduce((total, card) => total + card.currentBalance, 0);
    };

    const getTotalMinPayment = () => {
        return cards.reduce((total, card) => total + card.minPaymentDue, 0);
    };

    const getDaysUntilDue = (dueDate: string) => {
        const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const getCardColor = (provider: string) => {
        const colors = {
            'Commercial Bank': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'Sampath Bank': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'HNB': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'BOC': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        };
        return colors[provider as keyof typeof colors] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };

    if (loading) return <div className="loading">Loading your credit cards...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>💳 Credit Cards</h1>
                    <p className="page-subtitle">Manage your credit cards and track spending</p>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    + Add Card
                </button>
            </div>

            {/* Credit Overview */}
            <div className="credit-overview-grid">
                <div className="card overview-card">
                    <h3>Total Credit Limit</h3>
                    <div className="amount-large">{formatCurrency(getTotalCreditLimit())}</div>
                    <p className="text-muted">{cards.length} active cards</p>
                </div>
                <div className="card overview-card">
                    <h3>Total Balance</h3>
                    <div className="amount-large">{formatCurrency(getTotalBalance())}</div>
                    <div className="utilization-info">
                        {getTotalCreditLimit() > 0 && (
                            <span className="utilization-text">
                                {((getTotalBalance() / getTotalCreditLimit()) * 100).toFixed(1)}% utilization
                            </span>
                        )}
                    </div>
                </div>
                <div className="card overview-card">
                    <h3>Min Payment Due</h3>
                    <div className="amount-large">{formatCurrency(getTotalMinPayment())}</div>
                    <p className="text-muted">This month</p>
                </div>
            </div>

            {/* Credit Cards Grid */}
            <div className="cards-grid">
                {cards.map((card) => {
                    const utilization = getUtilizationPercentage(card.currentBalance, card.creditLimit);
                    const daysUntilDue = getDaysUntilDue(card.dueDate);
                    
                    return (
                        <div key={card._id} className="card credit-card-item">
                            <div 
                                className="credit-card-visual"
                                style={{
                                    background: getCardColor(card.provider)
                                }}
                            >
                                <div className="card-header">
                                    <span className="card-provider">{card.provider}</span>
                                    <span className="card-type">💳</span>
                                </div>
                                <div className="card-name">{card.cardName}</div>
                                <div className="card-number">•••• •••• •••• {Math.floor(Math.random() * 9000) + 1000}</div>
                                <div className="card-limits">
                                    <span>Available: {formatCurrency(card.availableLimit)}</span>
                                </div>
                            </div>
                            
                            <div className="card-details">
                                <div className="utilization-section">
                                    <div className="utilization-header">
                                        <span>Credit Utilization</span>
                                        <span className="utilization-percent">{utilization.toFixed(1)}%</span>
                                    </div>
                                    <div className="utilization-bar">
                                        <div 
                                            className="utilization-fill"
                                            style={{ 
                                                width: `${utilization}%`,
                                                backgroundColor: getUtilizationColor(utilization)
                                            }}
                                        ></div>
                                    </div>
                                    <div className="utilization-amounts">
                                        <span>{formatCurrency(card.currentBalance)}</span>
                                        <span>{formatCurrency(card.creditLimit)}</span>
                                    </div>
                                </div>
                                
                                <div className="payment-info">
                                    <div className="payment-row">
                                        <span className="label">Minimum Payment:</span>
                                        <span className="value">{formatCurrency(card.minPaymentDue)}</span>
                                    </div>
                                    <div className="payment-row">
                                        <span className="label">Due Date:</span>
                                        <span className={`value ${daysUntilDue <= 5 ? 'text-red-600' : ''}`}>
                                            {new Date(card.dueDate).toLocaleDateString()}
                                            {daysUntilDue <= 5 && (
                                                <span className="urgent"> ({daysUntilDue} days)</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="card-actions">
                                    <button className="btn-secondary btn-sm">View Transactions</button>
                                    <button className="btn-primary btn-sm">Make Payment</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Tips */}
            <div className="card tips-card">
                <h3>💡 Credit Card Tips</h3>
                <div className="tips-grid">
                    <div className="tip-item">
                        <span className="tip-icon">🎯</span>
                        <div className="tip-content">
                            <h4>Keep utilization below 30%</h4>
                            <p>Lower credit utilization improves your credit score</p>
                        </div>
                    </div>
                    <div className="tip-item">
                        <span className="tip-icon">⏰</span>
                        <div className="tip-content">
                            <h4>Pay on time, every time</h4>
                            <p>Set up auto-pay to avoid late fees and protect your credit</p>
                        </div>
                    </div>
                    <div className="tip-item">
                        <span className="tip-icon">💰</span>
                        <div className="tip-content">
                            <h4>Pay more than minimum</h4>
                            <p>Reduce interest charges by paying above the minimum</p>
                        </div>
                    </div>
                </div>
            </div>

            {cards.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <h3>No Credit Cards</h3>
                    <p>Add your credit cards to track spending and manage payments</p>
                    <button className="btn-primary" onClick={() => setShowAddForm(true)}>
                        Add Your First Card
                    </button>
                </div>
            )}
        </div>
    );
};