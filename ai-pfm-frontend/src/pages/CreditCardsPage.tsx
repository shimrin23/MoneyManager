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
    const [newCard, setNewCard] = useState<CreditCard>({
        cardName: '',
        provider: '',
        creditLimit: 0,
        currentBalance: 0,
        availableLimit: 0,
        minPaymentDue: 0,
        dueDate: '',
        statementDate: ''
    });

    useEffect(() => {
        fetchCreditCards();
    }, []);

    const handleCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/credit-cards', newCard);
            setCards([...cards, response.data.card]);
            setNewCard({
                cardName: '',
                provider: '',
                creditLimit: 0,
                currentBalance: 0,
                availableLimit: 0,
                minPaymentDue: 0,
                dueDate: '',
                statementDate: ''
            });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error creating credit card:', error);
            alert('Failed to create credit card. Please try again.');
        }
    };

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

            {showAddForm && (
                <div className="card form-card">
                    <h3>Add New Credit Card</h3>
                    <form onSubmit={handleCreateCard} className="credit-card-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Card Name</label>
                                <input
                                    type="text"
                                    value={newCard.cardName}
                                    onChange={(e) => setNewCard({...newCard, cardName: e.target.value})}
                                    placeholder="e.g., Visa Platinum"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Provider</label>
                                <select
                                    value={newCard.provider}
                                    onChange={(e) => setNewCard({...newCard, provider: e.target.value})}
                                    required
                                >
                                    <option value="">Select Provider</option>
                                    <option value="Commercial Bank">Commercial Bank</option>
                                    <option value="Sampath Bank">Sampath Bank</option>
                                    <option value="HNB">Hatton National Bank</option>
                                    <option value="BOC">Bank of Ceylon</option>
                                    <option value="DFCC">DFCC Bank</option>
                                    <option value="Nations Trust">Nations Trust Bank</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Credit Limit (LKR)</label>
                                <input
                                    type="number"
                                    value={newCard.creditLimit}
                                    onChange={(e) => setNewCard({...newCard, creditLimit: Number(e.target.value)})}
                                    placeholder="500000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Current Balance (LKR)</label>
                                <input
                                    type="number"
                                    value={newCard.currentBalance}
                                    onChange={(e) => setNewCard({...newCard, currentBalance: Number(e.target.value)})}
                                    placeholder="75000"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Minimum Payment Due (LKR)</label>
                                <input
                                    type="number"
                                    value={newCard.minPaymentDue}
                                    onChange={(e) => setNewCard({...newCard, minPaymentDue: Number(e.target.value)})}
                                    placeholder="7500"
                                />
                            </div>
                            <div className="form-group">
                                <label>Payment Due Date</label>
                                <input
                                    type="date"
                                    value={newCard.dueDate}
                                    onChange={(e) => setNewCard({...newCard, dueDate: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Statement Date</label>
                                <input
                                    type="date"
                                    value={newCard.statementDate}
                                    onChange={(e) => setNewCard({...newCard, statementDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Add Card
                            </button>
                        </div>
                    </form>
                </div>
            )}

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

            {/* Action Recommendations */}
            <div className="card actions-card">
                <h3>🚀 Smart Actions</h3>
                <div className="actions-grid">
                    <div className="action-item">
                        <div className="action-content">
                            <span className="action-icon">🎯</span>
                            <div className="action-text">
                                <h4>High Utilization Detected</h4>
                                <p>You're at 78% utilization. Reduce to improve credit score.</p>
                            </div>
                        </div>
                        <button className="action-btn primary">
                            💳 Pay LKR 15,000 Now
                        </button>
                    </div>
                    <div className="action-item">
                        <div className="action-content">
                            <span className="action-icon">⏰</span>
                            <div className="action-text">
                                <h4>Payment Due Soon</h4>
                                <p>Avoid late fees with automatic payments.</p>
                            </div>
                        </div>
                        <button className="action-btn secondary">
                            🔄 Set Auto-Pay
                        </button>
                    </div>
                    <div className="action-item">
                        <div className="action-content">
                            <span className="action-icon">💰</span>
                            <div className="action-text">
                                <h4>Interest Charges Growing</h4>
                                <p>Pay extra to save LKR 2,400 in interest this month.</p>
                            </div>
                        </div>
                        <button className="action-btn success">
                            📈 Pay LKR 5,000 Extra
                        </button>
                    </div>
                    <div className="action-item">
                        <div className="action-content">
                            <span className="action-icon">🔔</span>
                            <div className="action-text">
                                <h4>Spending Alert</h4>
                                <p>Set limits to prevent overspending on categories.</p>
                            </div>
                        </div>
                        <button className="action-btn warning">
                            ⚠️ Set Spending Alerts
                        </button>
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