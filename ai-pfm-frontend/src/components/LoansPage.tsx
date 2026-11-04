import { DateInput } from './DateInput';
import { formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useEffect, useState, type FC, type FormEvent } from 'react';
import { confirmDialog, notify, promptDialog } from '../utils/systemMessages';
import { useLoans } from '../hooks/useLoans';
import LoanCalculator from './LoanCalculator';
import ActiveLoanCards from './ActiveLoanCards';
import RepaymentSchedule from './RepaymentSchedule';
import DebtPayoffStrategies from './DebtPayoffStrategies';
import LoanAlerts from './LoanAlerts';
import AiLoanInsights from './AiLoanInsights';
import LoanToIncomeRatio from './LoanToIncomeRatio';
import WhatIfSimulation from './WhatIfSimulation';
import { useAdminLang } from '../i18n/adminText';
import { LOANS_T } from '../i18n/loansText';
import { fillText } from '../i18n/dashboardText';

type TabType = 'overview' | 'calculator' | 'schedule' | 'strategies' | 'simulation' | 'insights' | 'ratio';

const LoansPage: FC = () => {
    const t = LOANS_T[useAdminLang()];
    const { loans, loading, error, fetchLoans, updateLoan, deleteLoan, recordPayment, getDebtPayoffStrategies } = useLoans();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
    const [recalculateLoanId, setRecalculateLoanId] = useState<string | null>(null);
    const [strategies, setStrategies] = useState<Parameters<typeof DebtPayoffStrategies>[0]['strategies']>([]);
    const [strategiesLoading, setStrategiesLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        loanId: '',
        provider: '',
        interestRate: 0,
        tenure: 0,
        monthlyInstallment: 0,
        status: 'Active',
        nextDueDate: ''
    });

    const activeLoan = selectedLoan ? loans.find(l => l._id === selectedLoan) : null;
    const activeLoanIds = loans.filter(l => l.status === 'Active').map(l => l._id);
    const recalculateLoan = recalculateLoanId ? loans.find(l => l._id === recalculateLoanId) : null;

    // Load the real snowball / avalanche comparison whenever the Strategies tab is opened
    useEffect(() => {
        if (activeTab !== 'strategies') return;
        setStrategiesLoading(true);
        getDebtPayoffStrategies()
            .then((result) => setStrategies(result || []))
            .catch((err) => {
                setStrategies([]);
                notify.error(err.message || 'Failed to load payoff strategies.');
            })
            .finally(() => setStrategiesLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, loans]);

    const handleViewSchedule = (loanId: string) => {
        setSelectedLoan(loanId);
        setActiveTab('schedule');
    };

    const handleRecalculate = (loanId: string) => {
        setRecalculateLoanId(loanId);
        setActiveTab('calculator');
    };

    const handleMakePayment = async (loanId: string) => {
        const loan = loans.find(l => l._id === loanId);
        if (!loan) return;

        const remaining = Number(loan.remainingAmount);
        const suggested = Math.min(Number(loan.monthlyInstallment), remaining);
        const input = await promptDialog({
            title: t.payEmiTitle,
            message: `${loan.type} loan (${loan.provider}): ${formatMoney(remaining, 2)} remaining. Monthly EMI: ${formatMoney(Number(loan.monthlyInstallment), 2)}.`,
            label: fillText(t.paymentAmount, { cur: currencyCode() }),
            inputType: 'number',
            defaultValue: fromLkr(suggested).toFixed(2),
            confirmText: t.payButton,
            validate: (value) => {
                const amount = Number(value);
                if (!value.trim() || !Number.isFinite(amount) || amount <= 0) return t.amountInvalid;
                if (toLkr(amount) > remaining + 0.01) return fillText(t.paymentTooHigh, { amount: formatMoney(remaining, 2) });
                return null;
            },
        });
        if (input === null) return; // Cancelled

        try {
            const updated = await recordPayment(loanId, toLkr(Number(input)));
            await fetchLoans();
            if (updated?.status === 'Closed') notify.success(t.loanClosed);
            else notify.success(fillText(t.paymentRecorded, { amount: formatMoney(toLkr(Number(input)), 2) }));
        } catch (err) {
            notify.error(err instanceof Error ? err.message : t.paymentFailed);
        }
    };

    const handleAddLoan = () => {
        setRecalculateLoanId(null);
        setActiveTab('calculator');
    };

    const handleEditLoan = (loanId: string) => {
        const loan = loans.find(l => l._id === loanId);
        if (!loan) return;

        const nextDue = loan.nextDueDate ? new Date(loan.nextDueDate) : null;
        const nextDueDate = nextDue && !Number.isNaN(nextDue.getTime())
            ? nextDue.toISOString().slice(0, 10)
            : '';

        setEditForm({
            loanId: loan._id,
            provider: loan.provider,
            interestRate: Number(loan.interestRate || 0),
            tenure: Number(loan.tenure || 0),
            monthlyInstallment: Number(loan.monthlyInstallment || 0),
            status: loan.status || 'Active',
            nextDueDate
        });
        setEditError(null);
        setShowEditModal(true);
    };

    const handleEditChange = (field: string, value: string | number) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setEditError(null);

        try {
            // EMI is not sent: the server recalculates it from the rate and tenure
            await updateLoan(editForm.loanId, {
                provider: editForm.provider,
                interestRate: Number(editForm.interestRate),
                tenure: Number(editForm.tenure),
                status: editForm.status,
                nextDueDate: editForm.nextDueDate ? new Date(editForm.nextDueDate) : undefined
            });
            setShowEditModal(false);
            await fetchLoans();
            notify.success(t.loanUpdated);
        } catch (err: any) {
            setEditError(err.message || t.updateFailed);
        }
    };

    const handleDeleteLoan = async (loanId: string) => {
        const confirmed = await confirmDialog({
            title: t.deleteLoanTitle,
            message: t.deleteLoanMessage,
            confirmText: t.deleteConfirm,
            danger: true,
        });
        if (!confirmed) return;

        try {
            await deleteLoan(loanId);
            if (selectedLoan === loanId) setSelectedLoan(null);
            await fetchLoans();
            notify.success(t.loanDeleted);
        } catch (err) {
            notify.error(err instanceof Error ? err.message : t.deleteFailed);
        }
    };

    // Lets the Schedule and Simulation tabs pick a loan directly
    const loanSelector = (
        <div className="gl-form fin-selector">
            <div className="form-group">
                <label htmlFor="loan-selector">{t.loanLabel}</label>
                <select
                    id="loan-selector"
                    value={selectedLoan || ''}
                    onChange={(e) => setSelectedLoan(e.target.value || null)}
                >
                    <option value="">{t.selectLoan}</option>
                    {loans.map(l => (
                        <option key={l._id} value={l._id}>
                            {l.type} – {l.provider} ({formatMoney(Number(l.principal))}){l.status !== 'Active' ? ` · ${l.status}` : ''}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    if (loading) {
        return <div className="loading">{t.loading}</div>;
    }

    return (
        <div className="page-container fin-page loans-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <div className="fin-header-actions">
                    <button onClick={fetchLoans} className="btn-secondary" aria-label={t.refresh} title={t.refresh}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
                            <path d="M3 21v-5h5" />
                        </svg>
                        <span className="btn-label">{t.refresh}</span>
                    </button>
                    <button onClick={handleAddLoan} className="btn-primary">
                        {t.addLoan}
                    </button>
                </div>
            </div>

            {error && <div className="rc-banner error">{error}</div>}

            <div className="rec-filter-row">
                <button
                    className={`rec-filter-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    {t.tabOverview}
                </button>
                <button
                    className={`rec-filter-btn ${activeTab === 'calculator' ? 'active' : ''}`}
                    onClick={handleAddLoan}
                >
                    {t.tabCalculator}
                </button>
                {loans.length > 0 && (
                    <>
                        <button
                            className={`rec-filter-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                            onClick={() => setActiveTab('schedule')}
                        >
                            {t.tabSchedule}
                        </button>
                        <button
                            className={`rec-filter-btn ${activeTab === 'strategies' ? 'active' : ''}`}
                            onClick={() => setActiveTab('strategies')}
                        >
                            {t.tabStrategies}
                        </button>
                        <button
                            className={`rec-filter-btn ${activeTab === 'simulation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('simulation')}
                        >
                            {t.tabSimulation}
                        </button>
                        <button
                            className={`rec-filter-btn ${activeTab === 'insights' ? 'active' : ''}`}
                            onClick={() => setActiveTab('insights')}
                        >
                            {t.tabInsights}
                        </button>
                        <button
                            className={`rec-filter-btn ${activeTab === 'ratio' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ratio')}
                        >
                            {t.tabRatio}
                        </button>
                    </>
                )}
            </div>

            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="tab-pane">
                        <LoanAlerts loanIds={activeLoanIds} />
                        <ActiveLoanCards
                            loans={loans}
                            onViewSchedule={handleViewSchedule}
                            onRecalculate={handleRecalculate}
                            onMakePayment={handleMakePayment}
                            onEdit={handleEditLoan}
                            onDelete={handleDeleteLoan}
                        />
                    </div>
                )}

                {activeTab === 'calculator' && (
                    <div className="tab-pane">
                        <LoanCalculator
                            key={recalculateLoan?._id || 'new'}
                            initialValues={recalculateLoan ? {
                                type: recalculateLoan.type,
                                provider: recalculateLoan.provider,
                                principal: String(recalculateLoan.principal),
                                interestRate: String(recalculateLoan.interestRate),
                                tenure: String(recalculateLoan.tenure),
                                startDate: new Date(recalculateLoan.startDate).toISOString().split('T')[0],
                                customNotes: recalculateLoan.customNotes || ''
                            } : undefined}
                            previewOnly={!!recalculateLoan}
                            onLoanCreated={() => { fetchLoans(); setActiveTab('overview'); }}
                        />
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="tab-pane">
                        {loanSelector}
                        {activeLoan ? (
                            <RepaymentSchedule
                                schedule={activeLoan.paymentSchedule || []}
                                loanType={activeLoan.type}
                                monthlyEMI={activeLoan.monthlyInstallment}
                            />
                        ) : (
                            <div className="empty-state"><p>{t.selectLoanSchedule}</p></div>
                        )}
                    </div>
                )}

                {activeTab === 'strategies' && (
                    <div className="tab-pane">
                        {strategiesLoading
                            ? <div className="empty-state"><p>{t.comparingStrategies}</p></div>
                            : <DebtPayoffStrategies strategies={strategies} />}
                    </div>
                )}

                {activeTab === 'simulation' && (
                    <div className="tab-pane">
                        {loanSelector}
                        {activeLoan ? (
                            <WhatIfSimulation
                                key={activeLoan._id}
                                loanId={activeLoan._id}
                                currentEMI={activeLoan.monthlyInstallment}
                                remainingBalance={activeLoan.remainingAmount}
                                tenure={activeLoan.tenure}
                                interestRate={activeLoan.interestRate}
                            />
                        ) : (
                            <div className="empty-state"><p>{t.selectLoanSimulation}</p></div>
                        )}
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="tab-pane">
                        <AiLoanInsights onRefresh={fetchLoans} />
                    </div>
                )}

                {activeTab === 'ratio' && (
                    <div className="tab-pane">
                        <LoanToIncomeRatio onRefresh={fetchLoans} />
                    </div>
                )}
            </div>

            {showEditModal && (
                <div className="su-overlay" onClick={() => setShowEditModal(false)}>
                    <div
                        className="gl-form gl-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="loan-edit-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="gl-modal-head">
                            <h2 id="loan-edit-title">{t.editLoanTitle}</h2>
                            <button
                                type="button"
                                className="gl-modal-close"
                                onClick={() => setShowEditModal(false)}
                                aria-label={t.close}
                            >
                                ✕
                            </button>
                        </div>
                        {editError && <div className="rc-banner error">{editError}</div>}
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t.provider}</label>
                                    <input
                                        type="text"
                                        value={editForm.provider}
                                        onChange={(e) => handleEditChange('provider', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t.interestRate}</label>
                                    <input
                                        type="number"
                                        value={editForm.interestRate}
                                        onChange={(e) => handleEditChange('interestRate', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t.tenureMonths}</label>
                                    <input
                                        type="number"
                                        value={editForm.tenure}
                                        onChange={(e) => handleEditChange('tenure', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{fillText(t.monthlyEmi, { cur: currencyCode() })}</label>
                                    <input type="text" value={formatMoney(Number(editForm.monthlyInstallment), 2)} readOnly disabled />
                                    <span className="fin-note">
                                        {t.emiNote}
                                    </span>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t.status}</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => handleEditChange('status', e.target.value)}
                                    >
                                        <option value="Active">{t.stActive}</option>
                                        <option value="Closed">{t.stClosed}</option>
                                        <option value="Overdue">{t.stOverdue}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>{t.nextDueDate}</label>
                                    <DateInput
                                        value={editForm.nextDueDate}
                                        onChange={(e) => handleEditChange('nextDueDate', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                                    {t.cancel}
                                </button>
                                <button type="submit" className="btn-primary">
                                    {t.saveChanges}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoansPage;
