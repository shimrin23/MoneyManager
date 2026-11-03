import { DateInput } from '../components/DateInput';
import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify } from '../utils/systemMessages';
import { useAdminLang } from '../i18n/adminText';
import { REC_T } from '../i18n/recurringText';
import { fillText } from '../i18n/dashboardText';

type RecurringStatus = 'unconfirmed' | 'confirmed' | 'dismissed';

interface RecurringTransaction {
    _id: string;
    merchantName: string;
    normalizedName: string;
    category: string;
    icon: string;
    amount: number;
    frequency: 'weekly' | 'monthly' | 'yearly';
    nextDueDate: string;
    lastCharged: string;
    sourceAccount: string;
    status: RecurringStatus;
    detectedAt: string;
    totalPaidThisYear: number;
}

// Subscription as returned by GET /api/subscriptions
interface SubscriptionResponse {
    _id: string;
    name: string;
    provider: string;
    category: string;
    amount: number;
    frequency: 'monthly' | 'yearly';
    nextPayment: string;
    lastUsed?: string;
    isActive: boolean;
    isZombie: boolean;
    createdAt: string;
}

interface ConfirmAction {
    id: string;
    type: 'pay' | 'delete';
    name: string;
    date?: string;
    amount?: number;
}


const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const RecurringTransactionsPage = () => {
    const t = REC_T[useAdminLang()];
    const freqLabel: Record<string, string> = { weekly: t.freqWeekly, monthly: t.freqMonthly, yearly: t.freqYearly };
    const [items, setItems] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unconfirmed' | 'confirmed' | 'dismissed'>('all');

    const [newName, setNewName] = useState('');
    const [newProvider, setNewProvider] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newFrequency, setNewFrequency] = useState<'monthly' | 'yearly'>('monthly');
    const [isAdding, setIsAdding] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

    const fetchSubscriptions = async () => {
        try {
            // includeInactive brings back dismissed items so the Dismissed tab can show and restore them
            const res = await apiClient.get('/subscriptions', { params: { includeInactive: true } });
            const mappedData = res.data.subscriptions.map((sub: SubscriptionResponse) => ({
                _id: sub._id,
                merchantName: sub.name,
                normalizedName: sub.provider,
                category: sub.category,
                icon: '💳',
                amount: sub.amount,
                frequency: sub.frequency,
                nextDueDate: new Date(sub.nextPayment).toISOString().split('T')[0],
                lastCharged: sub.lastUsed ? new Date(sub.lastUsed).toISOString().split('T')[0] : 'N/A',
                sourceAccount: t.primaryAccount,
                status: sub.isActive ? (sub.isZombie ? 'unconfirmed' : 'confirmed') : 'dismissed',
                detectedAt: new Date(sub.createdAt).toISOString().split('T')[0],
                totalPaidThisYear: sub.amount * (sub.frequency === 'monthly' ? 12 : 1)
            }));
            setItems(mappedData);
        } catch (error) {
            console.error('Failed to fetch subscriptions', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleAddSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newProvider.trim() || !newAmount || !newCategory.trim() || !newDate) {
            notify.warning(t.warnFields);
            return;
        }
        if (!(Number(newAmount) > 0)) {
            notify.warning(t.warnAmount);
            return;
        }
        setIsAdding(true);
        try {
            await apiClient.post('/subscriptions', {
                name: newName,
                provider: newProvider,
                amount: toLkr(Number(newAmount)),
                category: newCategory,
                nextPayment: newDate,
                frequency: newFrequency
            });
            setNewName('');
            setNewProvider('');
            setNewAmount('');
            setNewCategory('');
            setNewDate('');
            setNewFrequency('monthly');
            notify.success(t.addedNote);
            fetchSubscriptions();
        } catch (error) {
            console.error('Failed to add subscription', error);
            notify.error(getApiErrorMessage(error, t.failAdd));
        } finally {
            setIsAdding(false);
        }
    };

    const updateStatus = async (id: string, status: RecurringStatus) => {
        try {
            const isActive = status !== 'dismissed';
            const isZombie = status === 'unconfirmed';
            await apiClient.put(`/subscriptions/${id}`, { isActive, isZombie });
            setItems(prev => prev.map(i => i._id === id ? { ...i, status } : i));
            if (status === 'dismissed') notify.success(t.movedDismissed);
            else if (status === 'unconfirmed') notify.success(t.restoredNote);
            else notify.success(t.confirmedNote);
        } catch (error) {
            console.error('Failed to update subscription status', error);
            notify.error(getApiErrorMessage(error, t.failStatus));
        }
    };

    const handleRunScan = async () => {
        setIsScanning(true);
        try {
            const res = await apiClient.post('/subscriptions/detect');
            const found = res.data?.detectedCount || 0;
            notify.info(found > 0 ? fillText(found > 1 ? t.foundMany : t.foundOne, { n: found }) : t.noNew);
            await fetchSubscriptions(); // Refresh list to show newly detected items
        } catch (error) {
            console.error('Failed to run AI scan', error);
            notify.error(getApiErrorMessage(error, t.failScan));
        } finally {
            setIsScanning(false);
        }
    };

    const handlePay = async (id: string) => {
        try {
            const res = await apiClient.post(`/subscriptions/${id}/pay`);
            const next = res.data?.nextPayment ? formatDate(res.data.nextPayment) : null;
            notify.success(next ? fillText(t.paidNext, { date: next }) : t.paidNote);
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to log payment', error);
            notify.error(getApiErrorMessage(error, t.failPay));
        } finally {
            setConfirmAction(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // Delete only appears on dismissed items, so remove it for good
            await apiClient.delete(`/subscriptions/${id}`, { params: { permanent: true } });
            setItems(prev => prev.filter(i => i._id !== id));
            notify.success(t.deletedNote);
        } catch (error) {
            console.error('Failed to delete subscription', error);
            notify.error(getApiErrorMessage(error, t.failDelete));
        } finally {
            setConfirmAction(null);
        }
    };

    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    // Yearly subscriptions count as 1/12 of their price per month
    const totalMonthly = items
        .filter(i => i.status !== 'dismissed')
        .reduce((s, i) => s + (i.frequency === 'yearly' ? i.amount / 12 : i.amount), 0);
    const unconfirmedCount = items.filter(i => i.status === 'unconfirmed').length;
    const dueSoon = items.filter(i => getDaysUntil(i.nextDueDate) <= 7 && i.status !== 'dismissed').length;

    if (loading) return <div className="loading-spinner">{t.loading}</div>;

    return (
        <>
        <div className="page-container recurring-page">
            {/* Add Subscription Form */}
            <section className="rc-panel">
                <div className="rc-panel-head">
                    <h3 className="rc-panel-title">{t.addTitle}</h3>
                    <button onClick={handleRunScan} className="rc-scan-btn" disabled={isScanning}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
                        </svg>
                        {isScanning ? t.scanning : t.runScan}
                    </button>
                </div>
                <form onSubmit={handleAddSubscription} className="rc-form">
                    <div className="rc-field">
                        <label htmlFor="rcProvider">{t.providerLabel}</label>
                        <input id="rcProvider" type="text" className="rc-input" placeholder={t.providerPh} value={newProvider} onChange={(e) => setNewProvider(e.target.value)} />
                    </div>
                    <div className="rc-field">
                        <label htmlFor="rcName">{t.nameLabel}</label>
                        <input id="rcName" type="text" className="rc-input" placeholder={t.namePh} value={newName} onChange={(e) => setNewName(e.target.value)} />
                    </div>
                    <div className="rc-field">
                        <label htmlFor="rcAmount">{fillText(t.amountLabel, { cur: currencyCode() })}</label>
                        <input id="rcAmount" type="number" className="rc-input" placeholder="0" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                    </div>
                    <div className="rc-field">
                        <label htmlFor="rcCategory">{t.categoryLabel}</label>
                        <input id="rcCategory" type="text" className="rc-input" placeholder={t.categoryPh} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                    </div>
                    <div className="rc-field">
                        <label htmlFor="rcFrequency">{t.frequencyLabel}</label>
                        <select id="rcFrequency" className="rc-input rc-select" value={newFrequency} onChange={(e) => setNewFrequency(e.target.value as 'monthly' | 'yearly')}>
                            <option value="monthly">{t.freqMonthly}</option>
                            <option value="yearly">{t.freqYearly}</option>
                        </select>
                    </div>
                    <div className="rc-field">
                        <label htmlFor="rcDate">{t.nextDue}</label>
                        <DateInput id="rcDate" className="rc-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    </div>
                    <div className="rc-form-actions">
                        <button type="submit" className="action-btn primary rc-add-btn" disabled={isAdding}>
                            {isAdding ? t.adding : t.add}
                        </button>
                    </div>
                </form>
            </section>

            {unconfirmedCount > 0 && (
                <div className="rc-banner" role="status">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                    </svg>
                    {fillText(t.newPatterns, { n: unconfirmedCount })}
                </div>
            )}

            {/* Summary */}
            <div className="rc-stats">
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.activeRecurring}</span>
                    <span className="rc-stat-value">{items.filter(i => i.status !== 'dismissed').length}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.awaitingReview}</span>
                    <span className="rc-stat-value">{unconfirmedCount}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.dueWithin7}</span>
                    <span className="rc-stat-value">{dueSoon}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.monthlyTotal}</span>
                    <span className="rc-stat-value">{formatMoney(totalMonthly)}</span>
                </div>
            </div>

            {/* Filter */}
            <div className="rec-filter-row">
                {(['all', 'unconfirmed', 'confirmed', 'dismissed'] as const).map(f => (
                    <button
                        key={f}
                        className={`rec-filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {({ all: t.filterAll, unconfirmed: t.filterUnconfirmed, confirmed: t.filterConfirmed, dismissed: t.filterDismissed })[f]}
                        <span className="rec-filter-count">{(f === 'all' ? items : items.filter(i => i.status === f)).length}</span>
                    </button>
                ))}
            </div>

            {/* Recurring Items */}
            <div className="rc-list">
                {filtered.map(item => {
                    const daysUntil = getDaysUntil(item.nextDueDate);
                    const isUrgent = daysUntil <= 7 && daysUntil >= 0;
                    return (
                        <article key={item._id} className={`rc-item ${item.status}`}>
                            <div className="rc-item-main">
                                <div className="rc-item-title">
                                    <span className="rc-item-name">{item.merchantName}</span>
                                    {item.normalizedName && item.normalizedName !== item.merchantName && (
                                        <span className="rc-item-provider">{item.normalizedName}</span>
                                    )}
                                </div>
                                <div className="rc-tags">
                                    <span className="rc-tag">{item.category}</span>
                                    <span className="rc-tag">{freqLabel[item.frequency]}</span>
                                    <span className="rc-tag">{item.sourceAccount}</span>
                                </div>
                                <div className="rc-dates">
                                    <span>{fillText(t.lastCharged, { date: item.lastCharged })}</span>
                                    <span className={`rc-next ${isUrgent || daysUntil < 0 ? 'urgent' : ''}`}>
                                        {fillText(t.nextOn, { date: item.nextDueDate })} ({daysUntil > 0 ? `${daysUntil}${t.daysShort}` : daysUntil === 0 ? t.today : fillText(t.overdueDays, { n: Math.abs(daysUntil) })})
                                    </span>
                                </div>
                            </div>
                            <div className="rc-item-side">
                                <div className="rc-amount">{formatMoney(item.amount)}</div>
                                <div className="rc-yearly">{fillText(t.thisYear, { amount: formatMoney(item.totalPaidThisYear) })}</div>
                                {item.status === 'unconfirmed' && (
                                    <div className="rc-actions">
                                        <button className="rec-action-btn accept small" onClick={() => updateStatus(item._id, 'confirmed')}>
                                            {t.confirm}
                                        </button>
                                        <button className="rec-action-btn decline small" onClick={() => updateStatus(item._id, 'dismissed')}>
                                            {t.notRecurring}
                                        </button>
                                    </div>
                                )}
                                {item.status === 'confirmed' && (() => {
                                    const days = getDaysUntil(item.nextDueDate);
                                    const alreadyPaid = days > 0;
                                    return (
                                        <div className="rc-actions">
                                            {alreadyPaid ? (
                                                <span className="rc-paid">
                                                    {fillText(t.paidDue, { n: days })}
                                                </span>
                                            ) : (
                                                <button className="rec-action-btn accept small" onClick={() => setConfirmAction({ id: item._id, type: 'pay', date: item.nextDueDate, amount: item.amount, name: item.merchantName })}>
                                                    {t.pay}
                                                </button>
                                            )}
                                            <button className="rec-action-btn restore small" onClick={() => updateStatus(item._id, 'dismissed')}>
                                                {t.dismiss}
                                            </button>
                                        </div>
                                    );
                                })()}
                                {item.status === 'dismissed' && (
                                    <div className="rc-actions">
                                        <button className="rec-action-btn restore small" onClick={() => updateStatus(item._id, 'unconfirmed')}>
                                            {t.restore}
                                        </button>
                                        <button className="rec-action-btn decline small" onClick={() => setConfirmAction({ id: item._id, type: 'delete', name: item.merchantName })}>
                                            {t.delete}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>

        {confirmAction && (
            <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
                <div className="modal-content txn-confirm" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">
                            {confirmAction.type === 'pay' ? t.confirmPayTitle : t.deleteSubTitle}
                        </h2>
                        <button className="modal-close" onClick={() => setConfirmAction(null)} aria-label={t.close}>×</button>
                    </div>

                    {confirmAction.type === 'pay' ? (
                        <>
                            <div className="rc-pay-summary">
                                <p className="txn-confirm-text rc-pay-intro">{t.payIntro}</p>
                                <div className="rc-pay-box">
                                    <span className="rc-pay-name">{confirmAction.name}</span>
                                    <span className="rc-pay-amount">{formatMoney((confirmAction.amount || 0))}</span>
                                </div>
                                <p className="rc-pay-date">
                                    {t.paymentDate} <strong>{confirmAction.date}</strong>
                                </p>
                            </div>
                            <div className="txn-confirm-actions">
                                <button className="btn-secondary" onClick={() => setConfirmAction(null)}>{t.cancel}</button>
                                <button className="btn-primary" onClick={() => handlePay(confirmAction!.id)}>{t.confirmPay}</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="txn-confirm-text">
                                {t.deleteConfirmText} <strong>{confirmAction.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="txn-confirm-actions">
                                <button className="btn-secondary" onClick={() => setConfirmAction(null)}>{t.cancel}</button>
                                <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} onClick={() => handleDelete(confirmAction!.id)}>
                                    {t.deleteConfirm}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
        </>
    );
};
