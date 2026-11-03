import { DateInput } from '../components/DateInput';
import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog } from '../utils/systemMessages';
import { getLocalDateString } from '../utils/date';
import { useAdminLang, readLang } from '../i18n/adminText';
import { FD_T } from '../i18n/fixedDepositsText';
import { fillText } from '../i18n/dashboardText';

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
    const t = FD_T[readLang()];
    const daysLeft = getDaysUntilMaturity(dateStr);
    if (daysLeft <= 0) return { label: t.matureToday, tone: 'fin-good' };
    if (daysLeft <= 30) return { label: fillText(t.daysLeft, { n: daysLeft }), tone: 'fin-warn' };
    if (daysLeft <= 90) return { label: fillText(t.daysLeft, { n: daysLeft }), tone: '' };
    return { label: fillText(t.monthsLeft, { n: getMonthsUntil(dateStr) }), tone: '' };
};

export const FixedDepositsPage = () => {
    const t = FD_T[useAdminLang()];
    const unitName = (u: string) => (u === 'years' ? t.years : t.months);
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
            setError(t.loadError);
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
                bank: newFD.bank || t.defaultBank,
                autoRenewal: newFD.autoRenewal,
                startDate: newFD.startDate
            });
            setNewFD({ principalAmount: '', interestRate: '', tenure: '', tenureUnit: 'months', type: 'Standard', bank: '', autoRenewal: false, startDate: getLocalDateString() });
            setShowNewFDForm(false);
            notify.success(t.openedNote);
            await fetchFDs();
        } catch (err) {
            console.error('Failed to create FD:', err);
            notify.error(getApiErrorMessage(err, t.createFailed));
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdrawEarly = async (fd: FixedDeposit) => {
        const confirmed = await confirmDialog({
            title: t.withdrawTitle,
            message: fillText(t.withdrawMessage, { account: fd.accountNumber }),
            confirmText: t.withdrawConfirm,
            danger: true,
        });
        if (!confirmed) return;
        try {
            await apiClient.put(`/fixed-deposits/${fd._id}`, { status: 'prematurely-closed' });
            notify.success(t.withdrawnNote);
            await fetchFDs();
        } catch (err) {
            console.error('Failed to update FD:', err);
            notify.error(getApiErrorMessage(err, t.withdrawFailed));
        }
    };

    const handleRenew = async (fd: FixedDeposit) => {
        const confirmed = await confirmDialog({
            title: t.renewTitle,
            message: fillText(t.renewMessage, { tenure: fd.tenure, unit: unitName(fd.tenureUnit), rate: fd.interestRate, amount: formatMoney(fd.maturityAmount) }),
            confirmText: t.renewConfirm,
        });
        if (!confirmed) return;
        try {
            await apiClient.post(`/fixed-deposits/${fd._id}/renew`);
            notify.success(t.renewedNote);
            await fetchFDs();
        } catch (err) {
            console.error('Failed to renew FD:', err);
            notify.error(getApiErrorMessage(err, t.renewFailed));
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: t.deleteTitle,
            message: t.deleteMessage,
            confirmText: t.deleteConfirm,
            danger: true,
        });
        if (!confirmed) return;
        try {
            await apiClient.delete(`/fixed-deposits/${id}`);
            setFDs(prev => prev.filter(f => f._id !== id));
            notify.success(t.deletedNote);
        } catch (err) {
            console.error('Failed to delete FD:', err);
            notify.error(t.deleteFailed);
        }
    };

    if (loading) return <div className="loading-spinner">{t.loading}</div>;

    return (
        <div className="page-container fin-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button className="btn-primary" onClick={() => setShowNewFDForm(!showNewFDForm)}>
                    {t.openNew}
                </button>
            </div>

            {error && <div className="rc-banner error">{error}</div>}

            {/* Summary */}
            <div className="rc-stats">
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.activeFds}</span>
                    <span className="rc-stat-value">{activeFDs.length}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.totalPrincipal}</span>
                    <span className="rc-stat-value">{formatMoney(totalPrincipal)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.maturityValue}</span>
                    <span className="rc-stat-value">{formatMoney(totalMaturityValue)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.maturing90}</span>
                    <span className="rc-stat-value">{maturitySoon}</span>
                </div>
            </div>

            {/* New FD Form */}
            {showNewFDForm && (
                <div className="card form-card gl-form">
                    <h3 className="gl-form-title">{t.openNewTitle}</h3>
                    <form onSubmit={handleNewFDSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.bankName}</label>
                                <input
                                    type="text"
                                    placeholder={t.bankPlaceholder}
                                    value={newFD.bank}
                                    onChange={e => setNewFD({ ...newFD, bank: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{fillText(t.principalAmount, { cur: currencyCode() })}</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 100000"
                                    value={newFD.principalAmount}
                                    onChange={e => setNewFD({ ...newFD, principalAmount: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.interestRate}</label>
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
                                <label>{t.tenure}</label>
                                <div className="fin-tenure">
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
                                        <option value="months">{t.months}</option>
                                        <option value="years">{t.years}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.startDate}</label>
                                <DateInput
                                    value={newFD.startDate}
                                    max={getLocalDateString()}
                                    onChange={e => setNewFD({ ...newFD, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t.fdType}</label>
                                <select value={newFD.type} onChange={e => setNewFD({ ...newFD, type: e.target.value as FixedDeposit['type'] })}>
                                    <option value="Standard">{t.typeStandard}</option>
                                    <option value="Goal-Linked">{t.typeGoal}</option>
                                    <option value="Tax Saver">{t.typeTax}</option>
                                </select>
                            </div>
                        </div>
                        <label className="fin-check">
                            <input
                                type="checkbox"
                                checked={newFD.autoRenewal}
                                onChange={e => setNewFD({ ...newFD, autoRenewal: e.target.checked })}
                            />
                            {t.autoRenewalCheck}
                        </label>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowNewFDForm(false)}>{t.cancel}</button>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? t.opening : t.openFd}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty State */}
            {fds.length === 0 && !showNewFDForm && (
                <div className="empty-state">
                    <h3>{t.noFds}</h3>
                    <p>{t.noFdsSub}</p>
                    <button className="btn-primary" onClick={() => setShowNewFDForm(true)}>{t.openNew}</button>
                </div>
            )}

            {/* FD Cards */}
            <div className="fin-grid">
                {fds.map(fd => {
                    const matStatus = fd.status === 'active'
                        ? getMaturityStatus(fd.maturityDate)
                        : fd.status === 'matured'
                            ? { label: fillText(t.maturedOn, { date: formatDate(fd.maturityDate) }), tone: '' }
                            : { label: t.withdrawnEarly, tone: 'fin-bad' };
                    const progress = fd.status === 'active'
                        ? Math.min(100, Math.max(0, ((new Date().getTime() - new Date(fd.startDate).getTime()) /
                            (new Date(fd.maturityDate).getTime() - new Date(fd.startDate).getTime())) * 100))
                        : 100;
                    const statusPill = fd.status === 'active' ? 'in-progress' : fd.status === 'matured' ? 'completed' : 'paused';

                    return (
                        <article key={fd._id} className="gl-card">
                            <div className="gl-head">
                                <div className="gl-head-main">
                                    <div className="gl-head-text">
                                        <h3>{fd.accountNumber}</h3>
                                        <span className="gl-sub">{fd.bank} · {fd.type}</span>
                                    </div>
                                </div>
                                <span className={`gl-pill ${statusPill}`}>
                                    {fd.status === 'active' ? t.stActive : fd.status === 'matured' ? t.stMatured : t.stClosed}
                                </span>
                            </div>

                            <div className="gl-kv">
                                <div><span>{t.principal}</span><span>{formatMoney(fd.principalAmount)}</span></div>
                                <div><span>{t.atMaturity}</span><span>{formatMoney(fd.maturityAmount)}</span></div>
                                <div><span>{t.interest}</span><span>{formatMoney(fd.interestEarned)}</span></div>
                                <div><span>{t.rate}</span><span>{fd.interestRate}% p.a.</span></div>
                                <div><span>{t.tenureLabel}</span><span>{fd.tenure} {unitName(fd.tenureUnit)}</span></div>
                                <div><span>{t.autoRenewal}</span><span>{fd.autoRenewal ? t.on : t.off}</span></div>
                                <div><span>{t.maturity}</span><span className={matStatus.tone}>{matStatus.label}</span></div>
                            </div>

                            {fd.status === 'active' && (
                                <div className="gl-progress">
                                    <div className="gl-bar">
                                        <span style={{ width: `${progress}%` }} />
                                    </div>
                                    <div className="gl-row">
                                        <span>{formatDate(fd.startDate)}</span>
                                        <span>{fillText(t.elapsed, { n: Math.round(progress) })}</span>
                                        <span>{formatDate(fd.maturityDate)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="gl-actions fd-actions fd-card-actions">
                                {fd.status === 'active' && (
                                    <>
                                        <button className="btn-secondary btn-sm" onClick={() => handleWithdrawEarly(fd)}>
                                            {t.withdrawEarly}
                                        </button>
                                        <button className="btn-secondary btn-sm" onClick={() => handleDelete(fd._id)}>
                                            {t.delete}
                                        </button>
                                    </>
                                )}
                                {fd.status === 'matured' && (
                                    <>
                                        <button className="btn-primary btn-sm" onClick={() => handleRenew(fd)}>
                                            {t.renewFd}
                                        </button>
                                        <button className="btn-secondary btn-sm" onClick={() => handleDelete(fd._id)}>
                                            {t.delete}
                                        </button>
                                    </>
                                )}
                                {fd.status === 'prematurely-closed' && (
                                    <button className="btn-secondary btn-sm" onClick={() => handleDelete(fd._id)}>
                                        {t.remove}
                                    </button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};
