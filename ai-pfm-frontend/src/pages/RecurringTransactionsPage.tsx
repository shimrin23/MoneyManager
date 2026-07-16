import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

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
    const [isAdding, setIsAdding] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'pay' | 'delete'; date?: string } | null>(null);

    const fetchSubscriptions = async () => {
        try {
            const res = await apiClient.get('/subscriptions');
            const mappedData = res.data.subscriptions.map((sub: any) => ({
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
        if (!newName || !newProvider || !newAmount || !newCategory || !newDate) return;
        setIsAdding(true);
        try {
            await apiClient.post('/subscriptions', {
                name: newName,
                provider: newProvider,
                amount: Number(newAmount),
                category: newCategory,
                nextPayment: newDate,
                frequency: 'monthly'
            });
            setNewName('');
            setNewProvider('');
            setNewAmount('');
            setNewCategory('');
            setNewDate('');
            fetchSubscriptions();
        } catch (error) {
            console.error('Failed to add subscription', error);
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
        } catch (error) {
            console.error('Failed to update subscription status', error);
        }
    };

    const handleRunScan = async () => {
        setIsScanning(true);
        try {
            await apiClient.post('/subscriptions/detect');
            await fetchSubscriptions(); // Refresh list to show newly detected items
        } catch (error) {
            console.error('Failed to run AI scan', error);
        } finally {
            setIsScanning(false);
        }
    };

    const handlePay = async (id: string) => {
        try {
            await apiClient.post(`/subscriptions/${id}/pay`);
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to log payment', error);
        } finally {
            setConfirmAction(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiClient.delete(`/subscriptions/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
        } catch (error) {
            console.error('Failed to delete subscription', error);
        } finally {
            setConfirmAction(null);
        }
    };

    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    const totalMonthly = items.filter(i => i.frequency === 'monthly' && i.status !== 'dismissed').reduce((s, i) => s + i.amount, 0);
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
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Amount (LKR)</label>
                        <input type="number" className="form-input" placeholder="0" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                        <input type="text" className="form-input" placeholder="Entertainment" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
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
                        <div className="rec-stat-value">LKR {totalMonthly.toLocaleString()}</div>
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
                                <div className="recurring-amount">LKR {item.amount.toLocaleString()}</div>
                                <div className="recurring-yearly">LKR {item.totalPaidThisYear.toLocaleString()} this year</div>
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
                                                <button className="rec-action-btn accept small" onClick={() => setConfirmAction({ id: item._id, type: 'pay', date: item.nextDueDate, amount: item.amount, name: item.merchantName } as any)}>
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
                                        <button className="rec-action-btn decline small" onClick={() => setConfirmAction({ id: item._id, type: 'delete', name: item.merchantName } as any)}>
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
                                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{(confirmAction as any).name}</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0' }}>LKR {((confirmAction as any).amount || 0).toLocaleString()}</p>
                                <p style={{ color: 'var(--color-text-muted, #aaa)', fontSize: '0.875rem' }}>
                                    Payment date: <strong>{(confirmAction as any).date}</strong>
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
                                Are you sure you want to delete <strong>{(confirmAction as any).name}</strong>? This action cannot be undone.
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
