import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog, promptDialog } from '../utils/systemMessages';

interface CardActivity {
    _id?: string;
    type: 'payment' | 'charge';
    amount: number;
    date: string;
    note?: string;
}

interface CreditCard {
    _id?: string;
    cardName: string;
    provider: string;
    lastFour?: string;
    creditLimit: number;
    currentBalance: number;
    availableLimit: number;
    minPaymentDue: number;
    dueDate: string;
    statementDate: string;
    activity?: CardActivity[];
}

// Form values are kept as text so empty fields stay empty (not "0")
interface CardForm {
    cardName: string;
    provider: string;
    lastFour: string;
    creditLimit: string;
    currentBalance: string;
    minPaymentDue: string;
    dueDate: string;
    statementDate: string;
}

const emptyForm: CardForm = {
    cardName: '',
    provider: '',
    lastFour: '',
    creditLimit: '',
    currentBalance: '',
    minPaymentDue: '',
    dueDate: '',
    statementDate: ''
};

const toDateInput = (value?: string) => (value ? new Date(value).toISOString().split('T')[0] : '');

// Same rules as the server, so mistakes are caught before sending
const validateForm = (form: CardForm): string | null => {
    const limit = Number(form.creditLimit);
    const balance = form.currentBalance === '' ? 0 : Number(form.currentBalance);
    const minDue = form.minPaymentDue === '' ? 0 : Number(form.minPaymentDue);

    if (!form.cardName.trim()) return 'Please enter the card name.';
    if (!form.provider) return 'Please select the provider.';
    if (form.lastFour && !/^\d{4}$/.test(form.lastFour)) return 'Last 4 digits must be exactly 4 numbers.';
    if (form.creditLimit === '' || !Number.isFinite(limit) || limit <= 0) return 'Credit limit must be more than 0.';
    if (!Number.isFinite(balance) || balance < 0) return 'Current balance cannot be negative.';
    if (balance > limit) return 'Current balance cannot be more than the credit limit.';
    if (!Number.isFinite(minDue) || minDue < 0) return 'Minimum payment cannot be negative.';
    if (minDue > balance) return 'Minimum payment cannot be more than the current balance.';
    if (!form.dueDate) return 'Please choose the payment due date.';
    return null;
};

export const CreditCardsPage = () => {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [form, setForm] = useState<CardForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [historyCard, setHistoryCard] = useState<CreditCard | null>(null);

    useEffect(() => {
        fetchCreditCards();
    }, []);

    const closeForm = () => {
        setShowAddForm(false);
        setEditingCardId(null);
        setForm(emptyForm);
    };

    const openAddForm = () => {
        setEditingCardId(null);
        setForm(emptyForm);
        setShowAddForm(true);
    };

    const openEditForm = (card: CreditCard) => {
        setEditingCardId(card._id || null);
        setForm({
            cardName: card.cardName,
            provider: card.provider,
            lastFour: card.lastFour || '',
            creditLimit: String(fromLkr(card.creditLimit)),
            currentBalance: String(fromLkr(card.currentBalance)),
            minPaymentDue: String(fromLkr(card.minPaymentDue)),
            dueDate: toDateInput(card.dueDate),
            statementDate: toDateInput(card.statementDate)
        });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Replace one card in the list (and in the open history popup) with the server's copy
    const replaceCard = (updated: CreditCard) => {
        const withAvailable = { ...updated, availableLimit: updated.creditLimit - updated.currentBalance };
        setCards(prev => prev.map(c => (c._id === updated._id ? withAvailable : c)));
        setHistoryCard(prev => (prev && prev._id === updated._id ? withAvailable : prev));
    };

    const handleSaveCard = async (e: React.FormEvent) => {
        e.preventDefault();
        const problem = validateForm(form);
        if (problem) {
            notify.warning(problem);
            return;
        }

        const payload = {
            cardName: form.cardName.trim(),
            provider: form.provider,
            lastFour: form.lastFour,
            creditLimit: toLkr(Number(form.creditLimit)),
            currentBalance: form.currentBalance === '' ? 0 : toLkr(Number(form.currentBalance)),
            minPaymentDue: form.minPaymentDue === '' ? 0 : toLkr(Number(form.minPaymentDue)),
            dueDate: form.dueDate,
            statementDate: form.statementDate || undefined
        };

        setSaving(true);
        try {
            if (editingCardId) {
                const response = await apiClient.put(`/credit-cards/${editingCardId}`, payload);
                replaceCard(response.data.card);
                notify.success(`${payload.cardName} updated.`);
            } else {
                const response = await apiClient.post('/credit-cards', payload);
                const card: CreditCard = response.data.card;
                // Newest first, matching the order the server returns
                setCards(prev => [{ ...card, availableLimit: card.creditLimit - card.currentBalance }, ...prev]);
                notify.success(`${payload.cardName} added.`);
            }
            closeForm();
        } catch (error) {
            console.error('Error saving credit card:', error);
            notify.error(getApiErrorMessage(error, 'Failed to save credit card. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCard = async (card: CreditCard) => {
        if (!card._id) return;
        const confirmed = await confirmDialog({
            title: 'Delete credit card?',
            message: `${card.cardName} (${card.provider}) and its payment history will be removed.`,
            confirmText: 'Delete',
            danger: true,
        });
        if (!confirmed) return;

        try {
            await apiClient.delete(`/credit-cards/${card._id}`);
            setCards(prev => prev.filter(c => c._id !== card._id));
            if (editingCardId === card._id) closeForm();
            notify.success(`${card.cardName} deleted.`);
        } catch (error) {
            console.error('Error deleting credit card:', error);
            notify.error(getApiErrorMessage(error, 'Failed to delete credit card. Please try again.'));
        }
    };

    const handleMakePayment = async (card: CreditCard) => {
        if (!card._id) return;
        if (card.currentBalance <= 0) {
            notify.info(`${card.cardName} has no balance to pay.`);
            return;
        }

        const input = await promptDialog({
            title: 'Make payment',
            message: `${card.cardName}: balance ${formatCurrency(card.currentBalance)}, minimum due ${formatCurrency(card.minPaymentDue)}.`,
            label: `Payment amount (${currencyCode()})`,
            inputType: 'number',
            defaultValue: String(fromLkr(card.minPaymentDue || card.currentBalance)),
            confirmText: 'Pay',
            validate: (value) => {
                const amount = Number(value);
                if (!value.trim() || !Number.isFinite(amount) || amount <= 0) return 'Please enter an amount greater than 0.';
                if (toLkr(amount) > card.currentBalance) return `Payment cannot be more than the balance (${formatCurrency(card.currentBalance)}).`;
                return null;
            },
        });
        if (input === null) return; // Cancelled

        try {
            const response = await apiClient.post(`/credit-cards/${card._id}/payment`, { amount: toLkr(Number(input)) });
            replaceCard(response.data.card);
            notify.success(`Payment of ${formatCurrency(toLkr(Number(input)))} recorded for ${card.cardName}.`);
        } catch (error) {
            console.error('Error making payment:', error);
            notify.error(getApiErrorMessage(error, 'Failed to record payment. Please try again.'));
        }
    };

    const handleAddCharge = async (card: CreditCard) => {
        if (!card._id) return;
        const available = card.creditLimit - card.currentBalance;

        const input = await promptDialog({
            title: 'Add charge',
            message: `${card.cardName}: available limit ${formatCurrency(available)}.`,
            label: `Charge amount (${currencyCode()})`,
            inputType: 'number',
            confirmText: 'Add charge',
            validate: (value) => {
                const amount = Number(value);
                if (!value.trim() || !Number.isFinite(amount) || amount <= 0) return 'Please enter an amount greater than 0.';
                if (toLkr(amount) > available) return `Charge cannot be more than the available limit (${formatCurrency(available)}).`;
                return null;
            },
        });
        if (input === null) return; // Cancelled

        try {
            const response = await apiClient.post(`/credit-cards/${card._id}/charge`, { amount: toLkr(Number(input)) });
            replaceCard(response.data.card);
            notify.success(`Charge of ${formatCurrency(toLkr(Number(input)))} added to ${card.cardName}.`);
        } catch (error) {
            console.error('Error adding charge:', error);
            notify.error(getApiErrorMessage(error, 'Failed to add charge. Please try again.'));
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
        return formatMoney(amount, 2);
    };

    const getUtilizationPercentage = (current: number, limit: number) => {
        return limit > 0 ? (current / limit) * 100 : 0;
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
                <div style={{ flex: 1 }}></div>
                <button
                    className="btn-primary"
                    onClick={() => (showAddForm ? closeForm() : openAddForm())}
                >
                    + Add Card
                </button>
            </div>

            {showAddForm && (
                <div className="card form-card">
                    <h3>{editingCardId ? 'Edit Credit Card' : 'Add New Credit Card'}</h3>
                    <form onSubmit={handleSaveCard} className="credit-card-form" noValidate>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Card Name</label>
                                <input
                                    type="text"
                                    value={form.cardName}
                                    onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                                    placeholder="e.g., Visa Platinum"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Provider</label>
                                <select
                                    value={form.provider}
                                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
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
                                <label>Credit Limit ({currencyCode()})</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.creditLimit}
                                    onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                                    placeholder="500000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Current Balance ({currencyCode()})</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.currentBalance}
                                    onChange={(e) => setForm({ ...form, currentBalance: e.target.value })}
                                    placeholder="75000"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Minimum Payment Due ({currencyCode()})</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.minPaymentDue}
                                    onChange={(e) => setForm({ ...form, minPaymentDue: e.target.value })}
                                    placeholder="7500"
                                />
                            </div>
                            <div className="form-group">
                                <label>Payment Due Date</label>
                                <input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Statement Date</label>
                                <input
                                    type="date"
                                    value={form.statementDate}
                                    onChange={(e) => setForm({ ...form, statementDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last 4 Digits (optional)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={form.lastFour}
                                    onChange={(e) => setForm({ ...form, lastFour: e.target.value.replace(/\D/g, '') })}
                                    placeholder="1234"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={closeForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : editingCardId ? 'Save Changes' : 'Add Card'}
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
                                <div className="card-number">•••• •••• •••• {card.lastFour || '••••'}</div>
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
                                                width: `${Math.min(utilization, 100)}%`,
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
                                            {formatDate(card.dueDate)}
                                            {daysUntilDue < 0 ? (
                                                <span className="urgent"> (overdue)</span>
                                            ) : daysUntilDue <= 5 && (
                                                <span className="urgent"> ({daysUntilDue} days)</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button className="btn-secondary btn-sm" onClick={() => setHistoryCard(card)}>View Transactions</button>
                                    <button className="btn-primary btn-sm" onClick={() => handleMakePayment(card)}>Make Payment</button>
                                </div>
                                <div className="card-actions" style={{ marginTop: '8px' }}>
                                    <button className="btn-secondary btn-sm" onClick={() => openEditForm(card)}>Edit</button>
                                    <button className="btn-secondary btn-sm" onClick={() => handleDeleteCard(card)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {cards.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <h3>No Credit Cards</h3>
                    <p>Add your credit cards to track spending and manage payments</p>
                    <button className="btn-primary" onClick={openAddForm}>
                        Add Your First Card
                    </button>
                </div>
            )}

            {/* Card transactions: payments and charges recorded in the app */}
            {historyCard && (
                <div className="modal-overlay" onClick={() => setHistoryCard(null)}>
                    <div
                        className="modal-content"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="card-history-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title" id="card-history-title">{historyCard.cardName} transactions</h2>
                            <button className="modal-close" onClick={() => setHistoryCard(null)} aria-label="Close">×</button>
                        </div>

                        <p style={{ marginTop: 0, color: 'var(--color-text-muted)' }}>
                            Balance {formatCurrency(historyCard.currentBalance)} · Available {formatCurrency(historyCard.creditLimit - historyCard.currentBalance)}
                        </p>

                        {(historyCard.activity || []).length === 0 ? (
                            <p className="empty-state" style={{ padding: '1.5rem 0' }}>
                                No payments or charges recorded yet.
                            </p>
                        ) : (
                            <table className="responsive-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...(historyCard.activity || [])]
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((item, idx) => (
                                            <tr key={item._id || idx}>
                                                <td data-label="Date">{formatDate(item.date)}</td>
                                                <td data-label="Type">{item.type === 'payment' ? 'Payment' : 'Charge'}{item.note ? ` – ${item.note}` : ''}</td>
                                                <td data-label="Amount" style={{ textAlign: 'right', color: item.type === 'payment' ? '#10b981' : '#ef4444' }}>
                                                    {item.type === 'payment' ? '−' : '+'}{formatCurrency(item.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}

                        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={() => handleAddCharge(historyCard)}>Add Charge</button>
                            <button className="btn-primary" onClick={() => handleMakePayment(historyCard)}>Make Payment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
