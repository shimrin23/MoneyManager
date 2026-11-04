import { DateInput } from '../components/DateInput';
import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog, promptDialog } from '../utils/systemMessages';
import { useAdminLang, readLang } from '../i18n/adminText';
import { CC_T } from '../i18n/creditCardsText';
import { fillText } from '../i18n/dashboardText';

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
    const t = CC_T[readLang()];
    const limit = Number(form.creditLimit);
    const balance = form.currentBalance === '' ? 0 : Number(form.currentBalance);
    const minDue = form.minPaymentDue === '' ? 0 : Number(form.minPaymentDue);

    if (!form.cardName.trim()) return t.vName;
    if (!form.provider) return t.vProvider;
    if (form.lastFour && !/^\d{4}$/.test(form.lastFour)) return t.vLast4;
    if (form.creditLimit === '' || !Number.isFinite(limit) || limit <= 0) return t.vLimit;
    if (!Number.isFinite(balance) || balance < 0) return t.vBalanceNeg;
    if (balance > limit) return t.vBalanceHigh;
    if (!Number.isFinite(minDue) || minDue < 0) return t.vMinNeg;
    if (minDue > balance) return t.vMinHigh;
    if (!form.dueDate) return t.vDue;
    return null;
};

export const CreditCardsPage = () => {
    const t = CC_T[useAdminLang()];
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
                notify.success(fillText(t.updatedNote, { name: payload.cardName }));
            } else {
                const response = await apiClient.post('/credit-cards', payload);
                const card: CreditCard = response.data.card;
                // Newest first, matching the order the server returns
                setCards(prev => [{ ...card, availableLimit: card.creditLimit - card.currentBalance }, ...prev]);
                notify.success(fillText(t.addedNote, { name: payload.cardName }));
            }
            closeForm();
        } catch (error) {
            console.error('Error saving credit card:', error);
            notify.error(getApiErrorMessage(error, t.saveFailed));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCard = async (card: CreditCard) => {
        if (!card._id) return;
        const confirmed = await confirmDialog({
            title: t.deleteTitle,
            message: fillText(t.deleteMessage, { name: card.cardName, provider: card.provider }),
            confirmText: t.deleteConfirm,
            danger: true,
        });
        if (!confirmed) return;

        try {
            await apiClient.delete(`/credit-cards/${card._id}`);
            setCards(prev => prev.filter(c => c._id !== card._id));
            if (editingCardId === card._id) closeForm();
            notify.success(fillText(t.deletedNote, { name: card.cardName }));
        } catch (error) {
            console.error('Error deleting credit card:', error);
            notify.error(getApiErrorMessage(error, t.deleteFailed));
        }
    };

    const handleMakePayment = async (card: CreditCard) => {
        if (!card._id) return;
        if (card.currentBalance <= 0) {
            notify.info(fillText(t.noBalance, { name: card.cardName }));
            return;
        }

        const input = await promptDialog({
            title: t.paymentTitle,
            message: fillText(t.paymentMessage, { name: card.cardName, balance: formatCurrency(card.currentBalance), minDue: formatCurrency(card.minPaymentDue) }),
            label: fillText(t.paymentLabel, { cur: currencyCode() }),
            inputType: 'number',
            defaultValue: String(fromLkr(card.minPaymentDue || card.currentBalance)),
            confirmText: t.payConfirm,
            validate: (value) => {
                const amount = Number(value);
                if (!value.trim() || !Number.isFinite(amount) || amount <= 0) return t.amountInvalid;
                if (toLkr(amount) > card.currentBalance) return fillText(t.paymentTooHigh, { amount: formatCurrency(card.currentBalance) });
                return null;
            },
        });
        if (input === null) return; // Cancelled

        try {
            const response = await apiClient.post(`/credit-cards/${card._id}/payment`, { amount: toLkr(Number(input)) });
            replaceCard(response.data.card);
            notify.success(fillText(t.paymentRecorded, { amount: formatCurrency(toLkr(Number(input))), name: card.cardName }));
        } catch (error) {
            console.error('Error making payment:', error);
            notify.error(getApiErrorMessage(error, t.paymentFailed));
        }
    };

    const handleAddCharge = async (card: CreditCard) => {
        if (!card._id) return;
        const available = card.creditLimit - card.currentBalance;

        const input = await promptDialog({
            title: t.chargeTitle,
            message: fillText(t.chargeMessage, { name: card.cardName, available: formatCurrency(available) }),
            label: fillText(t.chargeLabel, { cur: currencyCode() }),
            inputType: 'number',
            confirmText: t.chargeConfirm,
            validate: (value) => {
                const amount = Number(value);
                if (!value.trim() || !Number.isFinite(amount) || amount <= 0) return t.amountInvalid;
                if (toLkr(amount) > available) return fillText(t.chargeTooHigh, { amount: formatCurrency(available) });
                return null;
            },
        });
        if (input === null) return; // Cancelled

        try {
            const response = await apiClient.post(`/credit-cards/${card._id}/charge`, { amount: toLkr(Number(input)) });
            replaceCard(response.data.card);
            notify.success(fillText(t.chargeAdded, { amount: formatCurrency(toLkr(Number(input))), name: card.cardName }));
        } catch (error) {
            console.error('Error adding charge:', error);
            notify.error(getApiErrorMessage(error, t.chargeFailed));
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

    // Each bank gets its own soft tint (colours live in FinancialPages.css as .cc-bank-*)
    const getBankClass = (provider: string) => {
        const banks: Record<string, string> = {
            'Commercial Bank': 'combank',
            'Sampath Bank': 'sampath',
            'HNB': 'hnb',
            'BOC': 'boc',
            'DFCC': 'dfcc',
            'Nations Trust': 'ntb'
        };
        return `cc-bank-${banks[provider] || 'default'}`;
    };

    if (loading) return <div className="loading">{t.loading}</div>;

    return (
        <div className="page-container cc-page">
            <div className="cc-page-header">
                <div>
                    <h2 className="cc-title">{t.yourCards}</h2>
                    <p className="cc-subtitle">
                        {cards.length} {cards.length === 1 ? t.cardOne : t.cardMany} {t.cardsLinked}
                    </p>
                </div>
                <button
                    className="btn-primary cc-add-btn"
                    onClick={() => (showAddForm ? closeForm() : openAddForm())}
                >
                    {t.addCard}
                </button>
            </div>

            {/* Credit Overview */}
            <div className="cc-stats-grid">
                <div className="card cc-stat">
                    <span className="cc-stat-label">{t.totalLimit}</span>
                    <span className="cc-stat-value">{formatCurrency(getTotalCreditLimit())}</span>
                    <span className="cc-stat-sub">{t.acrossAll}</span>
                </div>
                <div className="card cc-stat">
                    <span className="cc-stat-label">{t.totalBalance}</span>
                    <span className="cc-stat-value">{formatCurrency(getTotalBalance())}</span>
                    <span className="cc-stat-sub">
                        {getTotalCreditLimit() > 0
                            ? fillText(t.utilization, { n: ((getTotalBalance() / getTotalCreditLimit()) * 100).toFixed(1) })
                            : t.noLimitYet}
                    </span>
                </div>
                <div className="card cc-stat">
                    <span className="cc-stat-label">{t.minPaymentDue}</span>
                    <span className="cc-stat-value">{formatCurrency(getTotalMinPayment())}</span>
                    <span className="cc-stat-sub">{t.thisMonth}</span>
                </div>
            </div>

            {showAddForm && (
                <section className="card cc-form-card">
                    <header className="cc-form-head">
                        <h3>{editingCardId ? t.editCard : t.addNewCard}</h3>
                        <p>{t.trackSpending}</p>
                    </header>
                    <form onSubmit={handleSaveCard} className="cc-form" noValidate>
                        <div className="cc-field">
                            <label htmlFor="ccName">{t.cardName}</label>
                            <input
                                id="ccName"
                                className="cc-input"
                                type="text"
                                value={form.cardName}
                                onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                                placeholder={t.cardNamePlaceholder}
                                required
                            />
                        </div>
                        <div className="cc-field">
                            <label htmlFor="ccProvider">{t.provider}</label>
                            <select
                                id="ccProvider"
                                className="cc-input cc-select"
                                value={form.provider}
                                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                                required
                            >
                                <option value="">{t.selectProvider}</option>
                                <option value="Commercial Bank">{t.bankNames['Commercial Bank']}</option>
                                <option value="Sampath Bank">{t.bankNames['Sampath Bank']}</option>
                                <option value="HNB">{t.bankNames['HNB']}</option>
                                <option value="BOC">{t.bankNames['BOC']}</option>
                                <option value="DFCC">{t.bankNames['DFCC']}</option>
                                <option value="Nations Trust">{t.bankNames['Nations Trust']}</option>
                            </select>
                        </div>
                        <div className="cc-field">
                            <label htmlFor="ccLimit">{fillText(t.creditLimit, { cur: currencyCode() })}</label>
                            <input
                                id="ccLimit"
                                className="cc-input"
                                type="number"
                                min="1"
                                value={form.creditLimit}
                                onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                                placeholder="500000"
                                required
                            />
                        </div>
                        <div className="cc-field">
                            <label htmlFor="ccBalance">{fillText(t.currentBalance, { cur: currencyCode() })}</label>
                            <input
                                id="ccBalance"
                                className="cc-input"
                                type="number"
                                min="0"
                                value={form.currentBalance}
                                onChange={(e) => setForm({ ...form, currentBalance: e.target.value })}
                                placeholder="75000"
                            />
                        </div>
                        <div className="cc-field">
                            <label htmlFor="ccMin">{fillText(t.minPaymentLabel, { cur: currencyCode() })}</label>
                            <input
                                id="ccMin"
                                className="cc-input"
                                type="number"
                                min="0"
                                value={form.minPaymentDue}
                                onChange={(e) => setForm({ ...form, minPaymentDue: e.target.value })}
                                placeholder="7500"
                            />
                        </div>
                        <div className="cc-field">
                            <label htmlFor="ccDue">{t.paymentDueDate}</label>
                            <DateInput
                                id="ccDue"
                                className="cc-input"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="cc-field">
                            <label htmlFor="ccStmt">{t.statementDate}</label>
                            <DateInput
                                id="ccStmt"
                                className="cc-input"
                                value={form.statementDate}
                                onChange={(e) => setForm({ ...form, statementDate: e.target.value })}
                            />
                        </div>
                        <div className="cc-field">
                            <label htmlFor="ccLast4">{t.last4}</label>
                            <input
                                id="ccLast4"
                                className="cc-input"
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                value={form.lastFour}
                                onChange={(e) => setForm({ ...form, lastFour: e.target.value.replace(/\D/g, '') })}
                                placeholder="1234"
                            />
                        </div>
                        <div className="cc-form-actions">
                            <button type="button" className="btn-secondary" onClick={closeForm}>
                                {t.cancel}
                            </button>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? t.saving : editingCardId ? t.saveChanges : t.addCardBtn}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Credit Cards Grid */}
            <div className="cc-cards-grid">
                {cards.map((card) => {
                    const utilization = getUtilizationPercentage(card.currentBalance, card.creditLimit);
                    const daysUntilDue = getDaysUntilDue(card.dueDate);

                    return (
                        <div key={card._id} className="card cc-card">
                            <div className={`cc-visual ${getBankClass(card.provider)}`}>
                                <div className="cc-visual-top">
                                    <span className="cc-visual-provider">{card.provider}</span>
                                    <span className="cc-visual-name">{card.cardName}</span>
                                </div>
                                <div className="cc-visual-number">
                                    <span className="cc-chip" aria-hidden="true" />
                                    •••• •••• •••• {card.lastFour || '••••'}
                                </div>
                                <div className="cc-visual-label">{t.currentBalanceVisual}</div>
                                <div className="cc-visual-balance">{formatCurrency(card.currentBalance)}</div>
                            </div>

                            <div className="cc-util">
                                <div className="cc-row">
                                    <span className="cc-row-label">{t.creditUtilization}</span>
                                    <span className="cc-row-value">{utilization.toFixed(1)}%</span>
                                </div>
                                <div className="utilization-bar cc-util-bar">
                                    <div
                                        className="utilization-fill"
                                        style={{
                                            width: `${Math.min(utilization, 100)}%`,
                                            backgroundColor: getUtilizationColor(utilization)
                                        }}
                                    ></div>
                                </div>
                                <div className="cc-util-amounts">
                                    <span>{fillText(t.availablePrefix, { amount: formatCurrency(card.availableLimit) })}</span>
                                    <span>{fillText(t.limitPrefix, { amount: formatCurrency(card.creditLimit) })}</span>
                                </div>
                            </div>

                            <div className="cc-info">
                                <div className="cc-row">
                                    <span className="cc-row-label">{t.minimumPayment}</span>
                                    <span className="cc-row-value">{formatCurrency(card.minPaymentDue)}</span>
                                </div>
                                <div className="cc-row">
                                    <span className="cc-row-label">{t.dueDate}</span>
                                    <span className="cc-row-value cc-due">
                                        <span className={daysUntilDue <= 5 ? 'text-red-600' : ''}>{formatDate(card.dueDate)}</span>
                                        <span className={`cc-due-pill ${daysUntilDue <= 5 ? 'urgent' : ''}`}>
                                            {daysUntilDue < 0 ? t.overdue : `${daysUntilDue} ${daysUntilDue === 1 ? t.dayOne : t.dayMany}`}
                                        </span>
                                    </span>
                                </div>
                                <div className="cc-row">
                                    <span className="cc-row-label">{t.statementDate}</span>
                                    <span className="cc-row-value">{card.statementDate ? formatDate(card.statementDate) : '—'}</span>
                                </div>
                            </div>

                            <div className="cc-actions">
                                <button className="btn-secondary btn-sm" onClick={() => setHistoryCard(card)}>{t.viewTransactions}</button>
                                <button className="btn-primary btn-sm" onClick={() => handleMakePayment(card)}>{t.makePayment}</button>
                                <button className="btn-secondary btn-sm" onClick={() => openEditForm(card)}>{t.edit}</button>
                                <button className="btn-secondary btn-sm" onClick={() => handleDeleteCard(card)}>{t.delete}</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {cards.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <h3>{t.noCards}</h3>
                    <p>{t.noCardsSub}</p>
                    <button className="btn-primary" onClick={openAddForm}>
                        {t.addFirstCard}
                    </button>
                </div>
            )}

            {/* Card transactions: payments and charges recorded in the app */}
            {historyCard && (
                <div className="modal-overlay" onClick={() => setHistoryCard(null)}>
                    <div
                        className="modal-content cc-history"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="card-history-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title" id="card-history-title">{fillText(t.txTitle, { name: historyCard.cardName })}</h2>
                            <button className="modal-close" onClick={() => setHistoryCard(null)} aria-label={t.close}>×</button>
                        </div>

                        <p className="cc-history-summary">
                            {fillText(t.balancePrefix, { balance: formatCurrency(historyCard.currentBalance) })} · {fillText(t.availablePrefixShort, { amount: formatCurrency(historyCard.creditLimit - historyCard.currentBalance) })}
                        </p>

                        {(historyCard.activity || []).length === 0 ? (
                            <p className="cc-history-empty">
                                {t.noActivity}
                            </p>
                        ) : (
                            <table className="responsive-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>{t.colDate}</th>
                                        <th>{t.colType}</th>
                                        <th style={{ textAlign: 'right' }}>{t.colAmount}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...(historyCard.activity || [])]
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((item, idx) => (
                                            <tr key={item._id || idx}>
                                                <td data-label="Date">{formatDate(item.date)}</td>
                                                <td data-label={t.colType}>{item.type === 'payment' ? t.typePayment : t.typeCharge}{item.note ? ` – ${item.note}` : ''}</td>
                                                <td data-label="Amount" style={{ textAlign: 'right', color: item.type === 'payment' ? '#10b981' : '#ef4444' }}>
                                                    {item.type === 'payment' ? '−' : '+'}{formatCurrency(item.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}

                        <div className="cc-history-actions">
                            <button className="btn-secondary" onClick={() => handleAddCharge(historyCard)}>{t.addCharge}</button>
                            <button className="btn-primary" onClick={() => handleMakePayment(historyCard)}>{t.makePayment}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
