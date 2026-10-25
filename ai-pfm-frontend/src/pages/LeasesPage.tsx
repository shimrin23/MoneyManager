import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog, promptDialog } from '../utils/systemMessages';

interface Lease {
    _id: string;
    assetName: string;
    assetType: 'vehicle' | 'equipment' | 'property' | 'other';
    lessor: string;
    principalAmount: number;
    monthlyPayment: number;
    interestRate: number;
    tenureMonths: number;
    remainingMonths: number;
    outstandingBalance: number;
    startDate: string;
    endDate: string;
    nextPaymentDate: string | null;
    payments?: { amount: number; date: string }[];
    status: 'active' | 'completed' | 'defaulted';
    icon: string;
}

const getDaysUntil = (dateStr: string | null) => {
    if (!dateStr || dateStr === '-') return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const assetTypeLabel: Record<string, string> = {
    vehicle: 'Vehicle', equipment: 'Equipment', property: 'Property', other: 'Other'
};

export const LeasesPage = () => {
    const [leases, setLeases] = useState<Lease[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    
    // New Form State
    const [showNewForm, setShowNewForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newLease, setNewLease] = useState({
        assetName: '',
        assetType: 'vehicle' as Lease['assetType'],
        lessor: '',
        principalAmount: '',
        monthlyPayment: '',
        interestRate: '',
        tenureMonths: '',
        startDate: '',
        icon: '🚗'
    });

    const fetchLeases = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get('/leases');
            setLeases(res.data.leases || []);
        } catch (err) {
            console.error('Failed to fetch leases:', err);
            setError('Unable to load leases. Please try again.');
            setLeases([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeases();
    }, []);

    const handleNewLeaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // All the monthly payments together should at least cover the amount borrowed
        const principal = Number(newLease.principalAmount);
        const monthly = Number(newLease.monthlyPayment);
        const tenure = Number(newLease.tenureMonths);
        const totalPayments = monthly * tenure;
        if (totalPayments < principal) {
            const proceed = await confirmDialog({
                title: "Payments don't cover the principal",
                message: `${tenure} payments of ${formatMoney(monthly)} add up to ${formatMoney(totalPayments)}, `
                    + `which is less than the principal of ${formatMoney(principal)}. `
                    + 'Check the monthly payment and tenure. Save anyway?',
                confirmText: 'Save Anyway',
                cancelText: 'Go Back',
                danger: true,
            });
            if (!proceed) return;
        }

        setSubmitting(true);
        try {
            await apiClient.post('/leases', {
                ...newLease,
                principalAmount: toLkr(Number(newLease.principalAmount)),
                monthlyPayment: toLkr(Number(newLease.monthlyPayment)),
                interestRate: Number(newLease.interestRate),
                tenureMonths: Number(newLease.tenureMonths)
            });
            setShowNewForm(false);
            setNewLease({
                assetName: '', assetType: 'vehicle', lessor: '', principalAmount: '',
                monthlyPayment: '', interestRate: '', tenureMonths: '', startDate: '', icon: '🚗'
            });
            notify.success('Lease added.');
            await fetchLeases();
        } catch (err) {
            console.error('Failed to create lease:', err);
            notify.error(getApiErrorMessage(err, 'Failed to create lease. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkCompleted = async (lease: Lease) => {
        const confirmed = await confirmDialog({
            title: 'Mark lease as completed?',
            message: `This sets ${lease.assetName} as fully paid (${formatMoney(Math.round(lease.outstandingBalance))} outstanding, ${lease.remainingMonths} months left) and can't be undone.`,
            confirmText: 'Mark Completed',
        });
        if (!confirmed) return;
        try {
            await apiClient.put(`/leases/${lease._id}`, { status: 'completed' });
            notify.success('Lease marked as completed.');
            await fetchLeases();
        } catch (err) {
            console.error('Failed to update lease:', err);
            notify.error(getApiErrorMessage(err, 'Failed to update lease. Please try again.'));
        }
    };

    const handleRecordPayment = async (lease: Lease) => {
        const value = await promptDialog({
            title: 'Record lease payment',
            message: `Record one monthly payment for ${lease.assetName}.`,
            label: `Amount paid (${currencyCode()})`,
            inputType: 'number',
            defaultValue: String(fromLkr(lease.monthlyPayment)),
            confirmText: 'Record Payment',
            validate: (v) => (Number(v) > 0 ? null : 'Enter an amount greater than 0'),
        });
        if (value === null) return;
        try {
            const res = await apiClient.post(`/leases/${lease._id}/payments`, { amount: toLkr(Number(value)) });
            const updated: Lease = res.data.lease;
            notify.success(updated.status === 'completed'
                ? 'Final payment recorded. Lease completed.'
                : `Payment recorded. ${updated.remainingMonths} months remaining.`);
            await fetchLeases();
        } catch (err) {
            console.error('Failed to record lease payment:', err);
            notify.error(getApiErrorMessage(err, 'Failed to record payment. Please try again.'));
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: 'Delete lease?',
            message: 'Are you sure you want to delete this lease?',
            confirmText: 'Delete',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await apiClient.delete(`/leases/${id}`);
            setLeases(prev => prev.filter(l => l._id !== id));
            notify.success('Lease deleted.');
        } catch (err) {
            console.error('Failed to delete lease:', err);
            notify.error('Failed to delete lease. Please try again.');
        }
    };

    const filtered = filter === 'all' ? leases : leases.filter(l => l.status === filter);
    const active = leases.filter(l => l.status === 'active');
    const totalMonthly = active.reduce((s, l) => s + l.monthlyPayment, 0);
    const totalOutstanding = active.reduce((s, l) => s + l.outstandingBalance, 0);

    if (loading) return <div className="loading-spinner">Loading leases...</div>;

    return (
        <div className="page-container leases-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button className="action-btn primary" onClick={() => setShowNewForm(!showNewForm)}>
                    + Add New Lease
                </button>
            </div>

            {error && (
                <div className="rec-alert-banner" style={{ marginBottom: '1.5rem', background: 'rgba(239,68,68,0.15)', borderColor: '#ef4444' }}>
                    {error}
                </div>
            )}

            {/* Summary */}
            <div className="rec-summary-grid">
                <div className="rec-stat-card">
                    <div className="rec-stat-icon">📄</div>
                    <div>
                        <div className="rec-stat-value">{active.length}</div>
                        <div className="rec-stat-label">Active Leases</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">💸</div>
                    <div>
                        <div className="rec-stat-value">{formatMoney(totalMonthly)}</div>
                        <div className="rec-stat-label">Monthly Payment</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">⚖️</div>
                    <div>
                        <div className="rec-stat-value">{formatMoney(totalOutstanding)}</div>
                        <div className="rec-stat-label">Total Outstanding</div>
                    </div>
                </div>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-icon">✅</div>
                    <div>
                        <div className="rec-stat-value">{leases.filter(l => l.status === 'completed').length}</div>
                        <div className="rec-stat-label">Completed</div>
                    </div>
                </div>
            </div>

            {/* New Lease Form */}
            {showNewForm && (
                <div className="card fd-form-card">
                    <h3 className="section-title">Add New Lease</h3>
                    <form onSubmit={handleNewLeaseSubmit} className="fd-form">
                        <div className="fd-form-grid">
                            <div className="form-group">
                                <label>Asset Name</label>
                                <input type="text" placeholder="e.g. Toyota Aqua 2022" value={newLease.assetName} onChange={e => setNewLease({ ...newLease, assetName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Lessor / Finance Company</label>
                                <input type="text" placeholder="e.g. Commercial Leasing" value={newLease.lessor} onChange={e => setNewLease({ ...newLease, lessor: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Asset Type</label>
                                <select value={newLease.assetType} onChange={e => setNewLease({ ...newLease, assetType: e.target.value as Lease['assetType'] })}>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="property">Property</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Principal Amount ({currencyCode()})</label>
                                <input type="number" min="1" placeholder="e.g. 4500000" value={newLease.principalAmount} onChange={e => setNewLease({ ...newLease, principalAmount: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Monthly Payment ({currencyCode()})</label>
                                <input type="number" min="1" placeholder="e.g. 95000" value={newLease.monthlyPayment} onChange={e => setNewLease({ ...newLease, monthlyPayment: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Interest Rate (% p.a.)</label>
                                <input type="number" step="0.01" min="0" max="100" placeholder="e.g. 14.5" value={newLease.interestRate} onChange={e => setNewLease({ ...newLease, interestRate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Tenure (Months)</label>
                                <input type="number" min="1" max="600" step="1" placeholder="e.g. 60" value={newLease.tenureMonths} onChange={e => setNewLease({ ...newLease, tenureMonths: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input type="date" value={newLease.startDate} onChange={e => setNewLease({ ...newLease, startDate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="fd-form-actions">
                            <button type="submit" className="action-btn primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Lease'}
                            </button>
                            <button type="button" className="action-btn secondary" onClick={() => setShowNewForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty State */}
            {leases.length === 0 && !showNewForm && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', margin: '0 auto 1rem', width: '80px', height: '80px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>No Leases Added</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                        Keep track of your vehicle and equipment leases, outstanding balances, and monthly payments.
                    </p>
                    <button className="action-btn primary" onClick={() => setShowNewForm(true)}>+ Add New Lease</button>
                </div>
            )}

            {/* Filter */}
            {leases.length > 0 && (
                <div className="rec-filter-row">
                    {(['all', 'active', 'completed'] as const).map(f => (
                        <button key={f} className={`rec-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="rec-filter-count">{(f === 'all' ? leases : leases.filter(l => l.status === f)).length}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Lease Cards */}
            <div className="fd-list">
                {filtered.map(lease => {
                    const progress = lease.tenureMonths > 0 ? ((lease.tenureMonths - lease.remainingMonths) / lease.tenureMonths) * 100 : 100;
                    const daysUntil = getDaysUntil(lease.nextPaymentDate);
                    return (
                        <div key={lease._id} className={`fd-card ${lease.status}`}>
                            <div className="fd-card-header">
                                <div className="fd-card-title-row">
                                    <div>
                                        <div className="fd-account">{lease.assetName}</div>
                                        <div className="fd-bank">{lease.lessor}</div>
                                    </div>
                                    <div className="fd-badges">
                                        <span className="fd-type-badge">{assetTypeLabel[lease.assetType]}</span>
                                        <span className="fd-status-badge" style={{ color: lease.status === 'active' ? '#10b981' : lease.status === 'completed' ? '#6366f1' : '#ef4444' }}>
                                            {lease.status === 'active' ? 'Active' : lease.status === 'completed' ? 'Completed' : 'Defaulted'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="fd-card-body">
                                <div className="fd-amounts-row">
                                    <div className="fd-amount-item">
                                        <div className="fd-amount-label">Monthly Payment</div>
                                        <div className="fd-amount-value">{formatMoney(lease.monthlyPayment)}</div>
                                    </div>
                                    <div className="fd-amount-item highlight">
                                        <div className="fd-amount-label">Outstanding</div>
                                        <div className="fd-amount-value">{formatMoney(Math.round(lease.outstandingBalance))}</div>
                                    </div>
                                    <div className="fd-amount-item">
                                        <div className="fd-amount-label">Remaining</div>
                                        <div className="fd-amount-value">{lease.remainingMonths} months</div>
                                    </div>
                                </div>

                                <div className="fd-details-row">
                                    <span>📊 {lease.interestRate}% p.a.</span>
                                    <span>📅 {lease.tenureMonths} months tenure</span>
                                    {lease.status === 'active' && daysUntil !== null && lease.nextPaymentDate && (
                                        daysUntil < 0 ? (
                                            <span style={{ color: '#ef4444', fontWeight: 600 }}>
                                                ⏱ Payment overdue by {-daysUntil}d (due {formatDate(lease.nextPaymentDate)})
                                            </span>
                                        ) : (
                                            <span style={{ color: daysUntil <= 7 ? '#f59e0b' : 'var(--text-muted)' }}>
                                                ⏱ Next payment in {daysUntil}d ({formatDate(lease.nextPaymentDate)})
                                            </span>
                                        )
                                    )}
                                </div>

                                <div className="fd-progress-wrap">
                                    <div className="fd-progress-labels">
                                        <span>{formatDate(lease.startDate)}</span>
                                        <span>{Math.round(progress)}% paid off</span>
                                        <span>{formatDate(lease.endDate)}</span>
                                    </div>
                                    <div className="fd-progress-bar">
                                        <div className="fd-progress-fill" style={{ width: `${progress}%`, background: lease.status === 'completed' ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="fd-card-actions">
                                {lease.status === 'active' && (
                                    <>
                                        <button className="action-btn primary small" onClick={() => handleRecordPayment(lease)}>Record Payment</button>
                                        <button className="action-btn secondary small" onClick={() => handleMarkCompleted(lease)}>Mark Completed</button>
                                        <button className="action-btn danger small" onClick={() => handleDelete(lease._id)}>Delete</button>
                                    </>
                                )}
                                {lease.status !== 'active' && (
                                    <button className="action-btn secondary small" onClick={() => handleDelete(lease._id)}>Delete</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
