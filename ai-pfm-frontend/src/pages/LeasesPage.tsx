import { DateInput } from '../components/DateInput';
import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog, promptDialog } from '../utils/systemMessages';
import { useAdminLang } from '../i18n/adminText';
import { LEASES_T } from '../i18n/leasesText';
import { fillText } from '../i18n/dashboardText';

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

export const LeasesPage = () => {
    const t = LEASES_T[useAdminLang()];
    const assetTypeLabel: Record<string, string> = {
        vehicle: t.typeVehicle, equipment: t.typeEquipment, property: t.typeProperty, other: t.typeOther
    };
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
            setError(t.loadFailed);
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
                title: t.mismatchTitle,
                message: fillText(t.mismatchMsg, {
                    tenure, monthly: formatMoney(monthly), total: formatMoney(totalPayments), principal: formatMoney(principal)
                }),
                confirmText: t.saveAnyway,
                cancelText: t.goBack,
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
            notify.success(t.addedNote);
            await fetchLeases();
        } catch (err) {
            console.error('Failed to create lease:', err);
            notify.error(getApiErrorMessage(err, t.failCreate));
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkCompleted = async (lease: Lease) => {
        const confirmed = await confirmDialog({
            title: t.markCompletedTitle,
            message: fillText(t.markCompletedMsg, {
                asset: lease.assetName, outstanding: formatMoney(Math.round(lease.outstandingBalance)), months: lease.remainingMonths
            }),
            confirmText: t.markCompletedBtn,
        });
        if (!confirmed) return;
        try {
            await apiClient.put(`/leases/${lease._id}`, { status: 'completed' });
            notify.success(t.completedNote);
            await fetchLeases();
        } catch (err) {
            console.error('Failed to update lease:', err);
            notify.error(getApiErrorMessage(err, t.failUpdate));
        }
    };

    const handleRecordPayment = async (lease: Lease) => {
        const value = await promptDialog({
            title: t.recordTitle,
            message: fillText(t.recordMsg, { asset: lease.assetName }),
            label: fillText(t.amountLabel, { cur: currencyCode() }),
            inputType: 'number',
            defaultValue: String(fromLkr(lease.monthlyPayment)),
            confirmText: t.recordBtn,
            validate: (v) => (Number(v) > 0 ? null : t.amountInvalid),
        });
        if (value === null) return;
        try {
            const res = await apiClient.post(`/leases/${lease._id}/payments`, { amount: toLkr(Number(value)) });
            const updated: Lease = res.data.lease;
            notify.success(updated.status === 'completed'
                ? t.finalNote
                : fillText(t.paymentNote, { n: updated.remainingMonths }));
            await fetchLeases();
        } catch (err) {
            console.error('Failed to record lease payment:', err);
            notify.error(getApiErrorMessage(err, t.failPayment));
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: t.deleteTitle,
            message: t.deleteMsg,
            confirmText: t.deleteBtn,
            danger: true,
        });
        if (!confirmed) return;
        try {
            await apiClient.delete(`/leases/${id}`);
            setLeases(prev => prev.filter(l => l._id !== id));
            notify.success(t.deletedNote);
        } catch (err) {
            console.error('Failed to delete lease:', err);
            notify.error(t.failDelete);
        }
    };

    const filtered = filter === 'all' ? leases : leases.filter(l => l.status === filter);
    const active = leases.filter(l => l.status === 'active');
    const totalMonthly = active.reduce((s, l) => s + l.monthlyPayment, 0);
    const totalOutstanding = active.reduce((s, l) => s + l.outstandingBalance, 0);

    if (loading) return <div className="loading-spinner">{t.loading}</div>;

    return (
        <div className="page-container fin-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button className="btn-primary" onClick={() => setShowNewForm(!showNewForm)}>
                    {t.addBtn}
                </button>
            </div>

            {error && <div className="rc-banner error">{error}</div>}

            {/* Summary */}
            <div className="rc-stats">
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.statActive}</span>
                    <span className="rc-stat-value">{active.length}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.statMonthly}</span>
                    <span className="rc-stat-value">{formatMoney(totalMonthly)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.statOutstanding}</span>
                    <span className="rc-stat-value">{formatMoney(totalOutstanding)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.statCompleted}</span>
                    <span className="rc-stat-value">{leases.filter(l => l.status === 'completed').length}</span>
                </div>
            </div>

            {/* New Lease Form */}
            {showNewForm && (
                <div className="card form-card gl-form">
                    <h3 className="gl-form-title">{t.formTitle}</h3>
                    <form onSubmit={handleNewLeaseSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.assetName}</label>
                                <input type="text" placeholder={t.phAsset} value={newLease.assetName} onChange={e => setNewLease({ ...newLease, assetName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>{t.lessor}</label>
                                <input type="text" placeholder={t.phLessor} value={newLease.lessor} onChange={e => setNewLease({ ...newLease, lessor: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.assetType}</label>
                                <select value={newLease.assetType} onChange={e => setNewLease({ ...newLease, assetType: e.target.value as Lease['assetType'] })}>
                                    <option value="vehicle">{t.typeVehicle}</option>
                                    <option value="equipment">{t.typeEquipment}</option>
                                    <option value="property">{t.typeProperty}</option>
                                    <option value="other">{t.typeOther}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{fillText(t.principalLabel, { cur: currencyCode() })}</label>
                                <input type="number" min="1" placeholder={t.phPrincipal} value={newLease.principalAmount} onChange={e => setNewLease({ ...newLease, principalAmount: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{fillText(t.monthlyLabel, { cur: currencyCode() })}</label>
                                <input type="number" min="1" placeholder={t.phMonthly} value={newLease.monthlyPayment} onChange={e => setNewLease({ ...newLease, monthlyPayment: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>{t.interestLabel}</label>
                                <input type="number" step="0.01" min="0" max="100" placeholder={t.phInterest} value={newLease.interestRate} onChange={e => setNewLease({ ...newLease, interestRate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.tenureLabel}</label>
                                <input type="number" min="1" max="600" step="1" placeholder={t.phTenure} value={newLease.tenureMonths} onChange={e => setNewLease({ ...newLease, tenureMonths: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>{t.startDate}</label>
                                <DateInput value={newLease.startDate} onChange={e => setNewLease({ ...newLease, startDate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowNewForm(false)}>{t.cancel}</button>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? t.saving : t.save}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty State */}
            {leases.length === 0 && !showNewForm && (
                <div className="empty-state">
                    <h3>{t.emptyTitle}</h3>
                    <p>{t.emptyText}</p>
                    <button className="btn-primary" onClick={() => setShowNewForm(true)}>{t.addBtn}</button>
                </div>
            )}

            {/* Filter */}
            {leases.length > 0 && (
                <div className="rec-filter-row fin-filters">
                    {(['all', 'active', 'completed'] as const).map(f => (
                        <button key={f} className={`rec-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {({ all: t.filterAll, active: t.filterActive, completed: t.filterCompleted })[f]}
                            <span className="rec-filter-count">{(f === 'all' ? leases : leases.filter(l => l.status === f)).length}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Lease Cards */}
            <div className="fin-grid">
                {filtered.map(lease => {
                    const progress = lease.tenureMonths > 0 ? ((lease.tenureMonths - lease.remainingMonths) / lease.tenureMonths) * 100 : 100;
                    const daysUntil = getDaysUntil(lease.nextPaymentDate);
                    const statusPill = lease.status === 'active' ? 'in-progress' : lease.status === 'completed' ? 'completed' : 'paused';
                    const nextTone = daysUntil === null ? '' : daysUntil < 0 ? 'fin-bad' : daysUntil <= 7 ? 'fin-warn' : '';
                    return (
                        <article key={lease._id} className="gl-card">
                            <div className="gl-head">
                                <div className="gl-head-main">
                                    <div className="gl-head-text">
                                        <h3>{lease.assetName}</h3>
                                        <span className="gl-sub">{lease.lessor} · {assetTypeLabel[lease.assetType]}</span>
                                    </div>
                                </div>
                                <span className={`gl-pill ${statusPill}`}>
                                    {lease.status === 'active' ? t.pillActive : lease.status === 'completed' ? t.pillCompleted : t.pillDefaulted}
                                </span>
                            </div>

                            <div className="gl-kv">
                                <div><span>{t.kvMonthly}</span><span>{formatMoney(lease.monthlyPayment)}</span></div>
                                <div><span>{t.kvOutstanding}</span><span>{formatMoney(Math.round(lease.outstandingBalance))}</span></div>
                                <div><span>{t.kvRemaining}</span><span>{fillText(t.kvMonths, { n: lease.remainingMonths })}</span></div>
                                <div><span>{t.kvRate}</span><span>{fillText(t.kvRateValue, { rate: lease.interestRate })}</span></div>
                                <div><span>{t.kvTenure}</span><span>{fillText(t.kvMonths, { n: lease.tenureMonths })}</span></div>
                                {lease.status === 'active' && daysUntil !== null && lease.nextPaymentDate && (
                                    <div>
                                        <span>{t.kvNext}</span>
                                        <span className={nextTone}>
                                            {daysUntil < 0
                                                ? fillText(t.overdueDue, { n: -daysUntil, date: formatDate(lease.nextPaymentDate) })
                                                : fillText(t.inDays, { n: daysUntil, date: formatDate(lease.nextPaymentDate) })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="gl-progress">
                                <div className="gl-bar">
                                    <span className={lease.status === 'completed' ? 'good' : ''} style={{ width: `${progress}%` }} />
                                </div>
                                <div className="gl-row">
                                    <span>{formatDate(lease.startDate)}</span>
                                    <span>{fillText(t.paidOff, { n: Math.round(progress) })}</span>
                                    <span>{formatDate(lease.endDate)}</span>
                                </div>
                            </div>

                            <div className="gl-actions">
                                {lease.status === 'active' && (
                                    <>
                                        <button className="btn-primary btn-sm" onClick={() => handleRecordPayment(lease)}>{t.recordPayment}</button>
                                        <button className="btn-secondary btn-sm" onClick={() => handleMarkCompleted(lease)}>{t.markCompleted}</button>
                                        <button className="btn-secondary btn-sm" onClick={() => handleDelete(lease._id)}>{t.delete}</button>
                                    </>
                                )}
                                {lease.status !== 'active' && (
                                    <button className="btn-secondary btn-sm" onClick={() => handleDelete(lease._id)}>{t.delete}</button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};
