import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify } from '../utils/systemMessages';

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


const freqLabel: Record<string, string> = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
};

const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const RecurringTransactionsPage = () => {
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
                sourceAccount: 'Primary Account',
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
            notify.warning('Please fill in provider, name, amount, category and next due date.');
            return;
        }
        if (!(Number(newAmount) > 0)) {
            notify.warning('Amount must be greater than 0.');
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
            notify.success('Subscription added.');
            fetchSubscriptions();
        } catch (error) {
            console.error('Failed to add subscription', error);
            notify.error(getApiErrorMessage(error, 'Failed to add subscription. Please try again.'));
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
            if (status === 'dismissed') notify.success('Moved to Dismissed. You can restore it from there.');
            else if (status === 'unconfirmed') notify.success('Restored. Confirm it to track payments again.');
            else notify.success('Confirmed as recurring.');
        } catch (error) {
            console.error('Failed to update subscription status', error);
            notify.error(getApiErrorMessage(error, 'Failed to update subscription. Please try again.'));
        }
    };

    const handleRunScan = async () => {
        setIsScanning(true);
        try {
            const res = await apiClient.post('/subscriptions/detect');
            const found = res.data?.detectedCount || 0;
            notify.info(found > 0 ? `Found ${found} new recurring payment${found > 1 ? 's' : ''}.` : 'No new recurring payments found.');
            await fetchSubscriptions(); // Refresh list to show newly detected items
        } catch (error) {
            console.error('Failed to run AI scan', error);
            notify.error(getApiErrorMessage(error, 'AI scan failed. Please try again.'));
        } finally {
            setIsScanning(false);
        }
    };

    const handlePay = async (id: string) => {
        try {
            const res = await apiClient.post(`/subscriptions/${id}/pay`);
            const next = res.data?.nextPayment ? formatDate(res.data.nextPayment) : null;
            notify.success(next ? `Payment logged. Next payment due ${next}.` : 'Payment logged.');
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to log payment', error);
            notify.error(getApiErrorMessage(error, 'Failed to log payment. Please try again.'));
        } finally {
            setConfirmAction(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // Delete only appears on dismissed items, so remove it for good
            await apiClient.delete(`/subscriptions/${id}`, { params: { permanent: true } });
            setItems(prev => prev.filter(i => i._id !== id));
            notify.success('Subscription deleted.');
        } catch (error) {
            console.error('Failed to delete subscription', error);
            notify.error(getApiErrorMessage(error, 'Failed to delete subscription. Please try again.'));
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

    if (loading) return <div className="loading-spinner">Detecting recurring transactions...</div>;

    return (
        <>
        <div className="page-container recurring-page">
            {/* Add Subscription Form */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="section-title" style={{ marginBottom: 0 }}>Add Subscription</h3>
                    <button onClick={handleRunScan} className="action-btn secondary" disabled={isScanning} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--primary-light)', color: 'var(--primary-color)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <span>🧠</span> {isScanning ? 'Scanning...' : 'Run AI Scan'}
                    </button>
                </div>
                <form onSubmit={handleAddSubscription} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Provider</label>
                        <input type="text" className="form-input" placeholder="e.g. Netflix" value={newProvider} onChange={(e) => setNewProvider(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name (Desc)</label>
                        <input type="text" className="form-input" placeholder="e.g. Premium Plan" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Amount ({currencyCode()})</label>
                        <input type="number" className="form-input" placeholder="0" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                        <input type="text" className="form-input" placeholder="Entertainment" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Frequency</label>
                        <select className="form-input" value={newFrequency} onChange={(e) => setNewFrequency(e.target.value as 'monthly' | 'yearly')}>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Next Due</label>
                        <input type="date" className="form-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    </div>
                    <button type="submit" className="action-btn primary" disabled={isAdding} style={{ height: '42px', padding: '0 24px' }}>
                        {isAdding ? 'Adding...' : 'Add'}
                    </button>
                </form>
            </div>
            {unconfirmedCount > 0 && (
                <div className="rec-alert-banner" style={{ marginBottom: '1.5rem' }}>
                    🔔 {unconfirmedCount} new pattern{unconfirmedCount > 1 ? 's' : ''} detected — review below
                </div>
            )}

            {/* Summary */}
            <div className="rec-summary-grid">
                <div className="rec-stat-card">
                    <div className="rec-stat-icon">🔄</div>
                    <div>
                        <div className="rec-stat-value">{items.filter(i => i.status !== 'dismissed').length}</div>
                        <div className="rec-stat-label">Active Recurring</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">❓</div>
                    <div>
                        <div className="rec-stat-value">{unconfirmedCount}</div>
                        <div className="rec-stat-label">Awaiting Review</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">📅</div>
                    <div>
                        <div className="rec-stat-value">{dueSoon}</div>
                        <div className="rec-stat-label">Due Within 7 Days</div>
                    </div>
                </div>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-icon">💸</div>
                    <div>
                        <div className="rec-stat-value">{formatMoney(totalMonthly)}</div>
                        <div className="rec-stat-label">Monthly Total</div>
                    </div>
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
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className="rec-filter-count">{(f === 'all' ? items : items.filter(i => i.status === f)).length}</span>
                    </button>
                ))}
            </div>

            {/* Recurring Items */}
            <div className="recurring-list">
                {filtered.map(item => {
                    const daysUntil = getDaysUntil(item.nextDueDate);
                    const isUrgent = daysUntil <= 7 && daysUntil >= 0;
                    return (
                        <div key={item._id} className={`recurring-card ${item.status}`}>
                            <div className="recurring-card-left">
                                <div className="recurring-icon">{item.icon}</div>
                                <div className="recurring-info">
                                    <div className="recurring-name">{item.merchantName}</div>
                                    {item.normalizedName && item.normalizedName !== item.merchantName && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {item.normalizedName}
                                        </div>
                                    )}
                                    <div className="recurring-meta">
                                        <span className="recurring-category">{item.category}</span>
                                        <span className="recurring-freq">{freqLabel[item.frequency]}</span>
                                        <span className="recurring-account">{item.sourceAccount}</span>
                                    </div>
                                    <div className="recurring-dates">
                                        <span>Last charged: {item.lastCharged}</span>
                                        <span className={`next-due ${isUrgent || daysUntil < 0 ? 'urgent' : ''}`}>
                                            Next: {item.nextDueDate} ({daysUntil > 0 ? `${daysUntil}d` : daysUntil === 0 ? 'Today' : `Overdue ${Math.abs(daysUntil)}d`})
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="recurring-card-right">
                                <div className="recurring-amount">{formatMoney(item.amount)}</div>
                                <div className="recurring-yearly">{formatMoney(item.totalPaidThisYear)} this year</div>
                                {item.status === 'unconfirmed' && (
                                    <div className="recurring-actions">
                                        <button className="rec-action-btn accept small" onClick={() => updateStatus(item._id, 'confirmed')}>
                                            Confirm
                                        </button>
                                        <button className="rec-action-btn decline small" onClick={() => updateStatus(item._id, 'dismissed')}>
                                            Not Recurring
                                        </button>
                                    </div>
                                )}
                                {item.status === 'confirmed' && (() => {
                                    const days = getDaysUntil(item.nextDueDate);
                                    const alreadyPaid = days > 0;
                                    return (
                                        <div className="recurring-actions">
                                            {alreadyPaid ? (
                                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4ade80', background: 'rgba(74,222,128,0.12)', borderRadius: '8px', padding: '5px 10px', letterSpacing: '0.02em' }}>
                                                    Paid — due in {days}d
                                                </span>
                                            ) : (
                                                <button className="rec-action-btn accept small" onClick={() => setConfirmAction({ id: item._id, type: 'pay', date: item.nextDueDate, amount: item.amount, name: item.merchantName })}>
                                                    Pay
                                                </button>
                                            )}
                                            <button className="rec-action-btn restore small" onClick={() => updateStatus(item._id, 'dismissed')}>
                                                Dismiss
                                            </button>
                                        </div>
                                    );
                                })()}
                                {item.status === 'dismissed' && (
                                    <div className="recurring-actions">
                                        <button className="rec-action-btn restore small" onClick={() => updateStatus(item._id, 'unconfirmed')}>
                                            Restore
                                        </button>
                                        <button className="rec-action-btn decline small" onClick={() => setConfirmAction({ id: item._id, type: 'delete', name: item.merchantName })}>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {confirmAction && (
            <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                    <div className="modal-header">
                        <h2 className="modal-title">
                            {confirmAction.type === 'pay' ? 'Confirm Payment' : 'Delete Subscription'}
                        </h2>
                        <button className="modal-close" onClick={() => setConfirmAction(null)}>×</button>
                    </div>

                    {confirmAction.type === 'pay' ? (
                        <>
                            <div style={{ padding: '1.25rem 0', color: 'var(--color-text)' }}>
                                <p style={{ marginBottom: '8px' }}>You are about to log a payment for:</p>
                                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{confirmAction.name}</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0' }}>{formatMoney((confirmAction.amount || 0))}</p>
                                <p style={{ color: 'var(--color-text-muted, #aaa)', fontSize: '0.875rem' }}>
                                    Payment date: <strong>{confirmAction.date}</strong>
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmAction(null)}>Cancel</button>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={() => handlePay(confirmAction!.id)}>Confirm Pay</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ padding: '1rem 0 2rem 0', color: 'var(--color-text)' }}>
                                Are you sure you want to delete <strong>{confirmAction.name}</strong>? This action cannot be undone.
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmAction(null)}>Cancel</button>
                                <button className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} onClick={() => handleDelete(confirmAction!.id)}>
                                    Delete
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
