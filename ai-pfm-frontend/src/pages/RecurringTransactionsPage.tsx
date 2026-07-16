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

const mockRecurring: RecurringTransaction[] = [
    {
        _id: '1',
        merchantName: 'Lanka Electricity Board',
        normalizedName: 'Utilities',
        category: 'Utilities',
        icon: '⚡',
        amount: 4800,
        frequency: 'monthly',
        nextDueDate: '2026-07-15',
        lastCharged: '2026-06-15',
        sourceAccount: 'Savings ****4521',
        status: 'unconfirmed',
        detectedAt: '2026-06-28',
        totalPaidThisYear: 52800
    },
    {
        _id: '2',
        merchantName: 'Netflix',
        normalizedName: 'Netflix',
        category: 'Entertainment',
        icon: '🎬',
        amount: 1399,
        frequency: 'monthly',
        nextDueDate: '2026-07-03',
        lastCharged: '2026-06-03',
        sourceAccount: 'Credit Card ****7812',
        status: 'confirmed',
        detectedAt: '2026-05-15',
        totalPaidThisYear: 15389
    },
    {
        _id: '3',
        merchantName: 'Amazon Prime',
        normalizedName: 'Amazon Prime',
        category: 'Entertainment',
        icon: '📦',
        amount: 999,
        frequency: 'monthly',
        nextDueDate: '2026-07-08',
        lastCharged: '2026-06-08',
        sourceAccount: 'Credit Card ****7812',
        status: 'confirmed',
        detectedAt: '2026-05-15',
        totalPaidThisYear: 10989
    },
    {
        _id: '4',
        merchantName: 'Dialog Axiata',
        normalizedName: 'Telecom',
        category: 'Utilities',
        icon: '📱',
        amount: 2500,
        frequency: 'monthly',
        nextDueDate: '2026-07-01',
        lastCharged: '2026-06-01',
        sourceAccount: 'Savings ****4521',
        status: 'confirmed',
        detectedAt: '2026-04-01',
        totalPaidThisYear: 27500
    },
    {
        _id: '5',
        merchantName: 'Standard Chartered EMI',
        normalizedName: 'Loan EMI',
        category: 'Loan',
        icon: '🏦',
        amount: 18500,
        frequency: 'monthly',
        nextDueDate: '2026-07-10',
        lastCharged: '2026-06-10',
        sourceAccount: 'Savings ****4521',
        status: 'confirmed',
        detectedAt: '2026-01-10',
        totalPaidThisYear: 185000
    },
    {
        _id: '6',
        merchantName: 'Yoga Studio Colombo',
        normalizedName: 'Fitness',
        category: 'Health & Fitness',
        icon: '🧘',
        amount: 3500,
        frequency: 'monthly',
        nextDueDate: '2026-07-20',
        lastCharged: '2026-06-20',
        sourceAccount: 'Savings ****4521',
        status: 'unconfirmed',
        detectedAt: '2026-06-26',
        totalPaidThisYear: 38500
    },
    {
        _id: '7',
        merchantName: 'Spotify',
        normalizedName: 'Spotify',
        category: 'Entertainment',
        icon: '🎵',
        amount: 699,
        frequency: 'monthly',
        nextDueDate: '2026-07-12',
        lastCharged: '2026-06-12',
        sourceAccount: 'Credit Card ****7812',
        status: 'unconfirmed',
        detectedAt: '2026-06-28',
        totalPaidThisYear: 7689
    }
];

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

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiClient.get('/transactions/recurring');
                setItems(res.data.recurring || mockRecurring);
            } catch {
                setItems(mockRecurring);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const updateStatus = (id: string, status: RecurringStatus) => {
        setItems(prev => prev.map(i => i._id === id ? { ...i, status } : i));
    };

    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    const totalMonthly = items.filter(i => i.frequency === 'monthly' && i.status !== 'dismissed').reduce((s, i) => s + i.amount, 0);
    const unconfirmedCount = items.filter(i => i.status === 'unconfirmed').length;
    const dueSoon = items.filter(i => getDaysUntil(i.nextDueDate) <= 7 && i.status !== 'dismissed').length;

    if (loading) return <div className="loading-spinner">Detecting recurring transactions...</div>;

    return (
        <div className="page-container recurring-page">
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
                                        <span className={`next-due ${isUrgent ? 'urgent' : ''}`}>
                                            Next: {item.nextDueDate} ({daysUntil > 0 ? `${daysUntil}d` : 'Today'})
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
                                            ✅ Confirm
                                        </button>
                                        <button className="rec-action-btn decline small" onClick={() => updateStatus(item._id, 'dismissed')}>
                                            ✕ Not Recurring
                                        </button>
                                    </div>
                                )}
                                {item.status === 'confirmed' && (
                                    <div className="recurring-actions">
                                        <span className="status-pill confirmed">Confirmed</span>
                                        <button className="rec-action-btn restore small" onClick={() => updateStatus(item._id, 'dismissed')}>
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                                {item.status === 'dismissed' && (
                                    <div className="recurring-actions">
                                        <span className="status-pill dismissed">Dismissed</span>
                                        <button className="rec-action-btn restore small" onClick={() => updateStatus(item._id, 'unconfirmed')}>
                                            Restore
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
