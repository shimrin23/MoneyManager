import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog } from '../utils/systemMessages';
import { getLocalDateString } from '../utils/date';

interface FixedDeposit {
    _id: string;
    accountNumber: string;
    principalAmount: number;
    interestRate: number;
    tenure: number;
    tenureUnit: 'months' | 'years';
    startDate: string;
    maturityDate: string;
    maturityAmount: number;
    interestEarned: number;
    type: 'Standard' | 'Goal-Linked' | 'Tax Saver';
    status: 'active' | 'matured' | 'prematurely-closed';
    autoRenewal: boolean;
    bank: string;
}

const getDaysUntilMaturity = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Whole calendar months from today to the date, so a 12-month FD shows "12mo left" (not 365 / 30 = 13)
const getMonthsUntil = (dateStr: string) => {
    const now = new Date();
    const target = new Date(dateStr);
    let months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    if (target.getDate() < now.getDate()) months--;
    return months;
};

const getMaturityStatus = (dateStr: string) => {
    const daysLeft = getDaysUntilMaturity(dateStr);
    if (daysLeft <= 0) return { label: 'Matures today', color: '#10b981' };
    if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: '#f59e0b' };
    if (daysLeft <= 90) return { label: `${daysLeft}d left`, color: '#6366f1' };
    return { label: `${getMonthsUntil(dateStr)}mo left`, color: '#64748b' };
};

export const FixedDepositsPage = () => {
    const [fds, setFDs] = useState<FixedDeposit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewFDForm, setShowNewFDForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newFD, setNewFD] = useState({
        principalAmount: '',
        interestRate: '',
        tenure: '',
        tenureUnit: 'months' as 'months' | 'years',
        type: 'Standard' as FixedDeposit['type'],
        bank: '',
        autoRenewal: false,
        // Today by default; an earlier date records an FD that was opened before
        startDate: getLocalDateString()
    });

    const fetchFDs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get('/fixed-deposits');
            setFDs(res.data.fixedDeposits || []);
        } catch (err) {
            console.error('Failed to fetch fixed deposits:', err);
            setError('Unable to load fixed deposits. Please try again.');
            setFDs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFDs();
    }, []);

    const activeFDs = fds.filter(f => f.status === 'active');
    const totalPrincipal = activeFDs.reduce((s, f) => s + f.principalAmount, 0);
    const totalMaturityValue = activeFDs.reduce((s, f) => s + f.maturityAmount, 0);
    const maturitySoon = activeFDs.filter(f => getDaysUntilMaturity(f.maturityDate) <= 90).length;

    const handleNewFDSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/fixed-deposits', {
                principalAmount: toLkr(Number(newFD.principalAmount)),
                interestRate: Number(newFD.interestRate),
                tenure: Number(newFD.tenure),
                tenureUnit: newFD.tenureUnit,
                type: newFD.type,
                bank: newFD.bank || 'Your Bank',
                autoRenewal: newFD.autoRenewal,
                startDate: newFD.startDate
            });
            setNewFD({ principalAmount: '', interestRate: '', tenure: '', tenureUnit: 'months', type: 'Standard', bank: '', autoRenewal: false, startDate: getLocalDateString() });
            setShowNewFDForm(false);
            notify.success('Fixed deposit opened.');
            await fetchFDs();
        } catch (err) {
            console.error('Failed to create FD:', err);
            notify.error(getApiErrorMessage(err, 'Failed to create fixed deposit. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdrawEarly = async (fd: FixedDeposit) => {
        const confirmed = await confirmDialog({
            title: 'Withdraw early?',
            message: `Close ${fd.accountNumber} before its maturity date? This can't be undone, and banks usually pay less interest on early withdrawal.`,
            confirmText: 'Withdraw Early',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await apiClient.put(`/fixed-deposits/${fd._id}`, { status: 'prematurely-closed' });
            notify.success('Fixed deposit withdrawn early.');
            await fetchFDs();
        } catch (err) {
            console.error('Failed to update FD:', err);
            notify.error(getApiErrorMessage(err, 'Failed to withdraw fixed deposit. Please try again.'));
        }
    };

    const handleRenew = async (fd: FixedDeposit) => {
        const confirmed = await confirmDialog({
            title: 'Renew fixed deposit?',
            message: `Start a new ${fd.tenure} ${fd.tenureUnit} term from today at ${fd.interestRate}% with ${formatMoney(fd.maturityAmount)} (principal plus interest).`,
            confirmText: 'Renew',
        });
        if (!confirmed) return;
        try {
            await apiClient.post(`/fixed-deposits/${fd._id}/renew`);
            notify.success('Fixed deposit renewed.');
            await fetchFDs();
        } catch (err) {
            console.error('Failed to renew FD:', err);
            notify.error(getApiErrorMessage(err, 'Failed to renew fixed deposit. Please try again.'));
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: 'Delete fixed deposit?',
            message: 'Are you sure you want to delete this fixed deposit?',
            confirmText: 'Delete',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await apiClient.delete(`/fixed-deposits/${id}`);
            setFDs(prev => prev.filter(f => f._id !== id));
            notify.success('Fixed deposit deleted.');
        } catch (err) {
            console.error('Failed to delete FD:', err);
            notify.error('Failed to delete fixed deposit. Please try again.');
        }
    };

    if (loading) return <div className="loading-spinner">Loading fixed deposits...</div>;

    return (
        <div className="page-container fd-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button className="action-btn primary" onClick={() => setShowNewFDForm(!showNewFDForm)}>
                    + Open New FD
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
                    <div className="rec-stat-icon">🏛️</div>
                    <div>
                        <div className="rec-stat-value">{activeFDs.length}</div>
                        <div className="rec-stat-label">Active FDs</div>
                    </div>
                </div>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-icon">💵</div>
                    <div>
                        <div className="rec-stat-value">{formatMoney(totalPrincipal)}</div>
                        <div className="rec-stat-label">Total Principal</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">📈</div>
                    <div>
                        <div className="rec-stat-value">{formatMoney(totalMaturityValue)}</div>
                        <div className="rec-stat-label">Maturity Value</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">⏰</div>
                    <div>
                        <div className="rec-stat-value">{maturitySoon}</div>
                        <div className="rec-stat-label">Maturing in 90 Days</div>
                    </div>
                </div>
            </div>

            {/* New FD Form */}
            {showNewFDForm && (
                <div className="card fd-form-card">
                    <h3 className="section-title">Open New Fixed Deposit</h3>
                    <form onSubmit={handleNewFDSubmit} className="fd-form">
                        <div className="fd-form-grid">
                            <div className="form-group">
                                <label>Bank Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Commercial Bank"
                                    value={newFD.bank}
                                    onChange={e => setNewFD({ ...newFD, bank: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Principal Amount ({currencyCode()})</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 100000"
                                    value={newFD.principalAmount}
                                    onChange={e => setNewFD({ ...newFD, principalAmount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="100"
                                    placeholder="e.g. 12.5"
                                    value={newFD.interestRate}
                                    onChange={e => setNewFD({ ...newFD, interestRate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tenure</label>
                                <div className="fd-tenure-row">
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="e.g. 12"
                                        value={newFD.tenure}
                                        onChange={e => setNewFD({ ...newFD, tenure: e.target.value })}
                                        required
                                    />
                                    <select
                                        value={newFD.tenureUnit}
                                        onChange={e => setNewFD({ ...newFD, tenureUnit: e.target.value as 'months' | 'years' })}
                                    >
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={newFD.startDate}
                                    max={getLocalDateString()}
                                    onChange={e => setNewFD({ ...newFD, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>FD Type</label>
                                <select value={newFD.type} onChange={e => setNewFD({ ...newFD, type: e.target.value as FixedDeposit['type'] })}>
                                    <option value="Standard">Standard</option>
                                    <option value="Goal-Linked">Goal-Linked</option>
                                    <option value="Tax Saver">Tax Saver</option>
                                </select>
                            </div>
                        </div>
                        <div className="fd-form-check">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={newFD.autoRenewal}
                                    onChange={e => setNewFD({ ...newFD, autoRenewal: e.target.checked })}
                                />
                                Enable Auto-Renewal at maturity
                            </label>
                        </div>
                        <div className="fd-form-actions">
                            <button type="submit" className="action-btn primary" disabled={submitting}>
                                {submitting ? 'Opening...' : 'Open FD'}
                            </button>
                            <button type="button" className="action-btn secondary" onClick={() => setShowNewFDForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty State */}
            {fds.length === 0 && !showNewFDForm && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>No Fixed Deposits Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Open your first fixed deposit to start earning guaranteed returns.
                    </p>
                    <button className="action-btn primary" onClick={() => setShowNewFDForm(true)}>+ Open New FD</button>
                </div>
            )}

            {/* FD Cards */}
            <div className="fd-list">
                {fds.map(fd => {
                    const matStatus = fd.status === 'active'
                        ? getMaturityStatus(fd.maturityDate)
                        : fd.status === 'matured'
                            ? { label: `Matured on ${formatDate(fd.maturityDate)}`, color: '#6366f1' }
                            : { label: 'Withdrawn early', color: '#ef4444' };
                    const progress = fd.status === 'active'
                        ? Math.min(100, Math.max(0, ((new Date().getTime() - new Date(fd.startDate).getTime()) /
                            (new Date(fd.maturityDate).getTime() - new Date(fd.startDate).getTime())) * 100))
                        : 100;

                    return (
                        <div key={fd._id} className={`fd-card ${fd.status}`}>
                            <div className="fd-card-header">
                                <div className="fd-card-title-row">
                                    <div>
                                        <div className="fd-account">{fd.accountNumber}</div>
                                        <div className="fd-bank">{fd.bank}</div>
                                    </div>
                                    <div className="fd-badges">
                                        <span className="fd-type-badge">{fd.type}</span>
                                        <span className="fd-status-badge" style={{ color: fd.status === 'active' ? '#10b981' : fd.status === 'matured' ? '#6366f1' : '#ef4444' }}>
                                            {fd.status === 'active' ? 'Active' : fd.status === 'matured' ? 'Matured' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="fd-card-body">
                                <div className="fd-amounts-row">
                                    <div className="fd-amount-item">
                                        <div className="fd-amount-label">Principal</div>
                                        <div className="fd-amount-value">{formatMoney(fd.principalAmount)}</div>
                                    </div>
                                    <div className="fd-amount-item highlight">
                                        <div className="fd-amount-label">At Maturity</div>
                                        <div className="fd-amount-value">{formatMoney(fd.maturityAmount)}</div>
                                    </div>
                                    <div className="fd-amount-item green">
                                        <div className="fd-amount-label">Interest</div>
                                        <div className="fd-amount-value">{formatMoney(fd.interestEarned)}</div>
                                    </div>
                                </div>

                                <div className="fd-details-row">
                                    <span>{fd.interestRate}% p.a.</span>
                                    <span>{fd.tenure} {fd.tenureUnit}</span>
                                    <span>{fd.autoRenewal ? 'Auto-Renew On' : 'No Auto-Renew'}</span>
                                    <span style={{ color: matStatus.color }}>{matStatus.label}</span>
                                </div>

                                {fd.status === 'active' && (
                                    <div className="fd-progress-wrap">
                                        <div className="fd-progress-labels">
                                            <span>{formatDate(fd.startDate)}</span>
                                            <span>{Math.round(progress)}% elapsed</span>
                                            <span>{formatDate(fd.maturityDate)}</span>
                                        </div>
                                        <div className="fd-progress-bar">
                                            <div className="fd-progress-fill" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="fd-card-actions">
                                {fd.status === 'active' && (
                                    <>
                                        <button className="action-btn danger small" onClick={() => handleWithdrawEarly(fd)}>
                                            Withdraw Early
                                        </button>
                                        <button className="action-btn secondary small" onClick={() => handleDelete(fd._id)}>
                                            Delete
                                        </button>
                                    </>
                                )}
                                {fd.status === 'matured' && (
                                    <>
                                        <button className="action-btn primary small" onClick={() => handleRenew(fd)}>
                                            Renew FD
                                        </button>
                                        <button className="action-btn secondary small" onClick={() => handleDelete(fd._id)}>
                                            Delete
                                        </button>
                                    </>
                                )}
                                {fd.status === 'prematurely-closed' && (
                                    <button className="action-btn secondary small" onClick={() => handleDelete(fd._id)}>
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
