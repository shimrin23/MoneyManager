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

type TabType = 'overview' | 'calculator' | 'schedule' | 'strategies' | 'simulation' | 'insights' | 'ratio';

const LoansPage: FC = () => {
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
            title: 'Pay EMI',
            message: `${loan.type} loan (${loan.provider}): ${formatMoney(remaining, 2)} remaining. Monthly EMI: ${formatMoney(Number(loan.monthlyInstallment), 2)}.`,
            label: `Payment amount (${currencyCode()})`,
            inputType: 'number',
            defaultValue: fromLkr(suggested).toFixed(2),
            confirmText: 'Pay',
            validate: (value) => {
                const amount = Number(value);
                if (!value.trim() || !Number.isFinite(amount) || amount <= 0) return 'Please enter an amount greater than 0.';
                if (toLkr(amount) > remaining + 0.01) return `Payment cannot be more than the remaining ${formatMoney(remaining, 2)}.`;
                return null;
            },
        });
        if (input === null) return; // Cancelled

        try {
            const updated = await recordPayment(loanId, toLkr(Number(input)));
            await fetchLoans();
            if (updated?.status === 'Closed') notify.success(`Loan fully paid and closed. Well done!`);
            else notify.success(`Payment of ${formatMoney(toLkr(Number(input)), 2)} recorded.`);
        } catch (err) {
            notify.error(err instanceof Error ? err.message : 'Failed to record payment.');
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
            notify.success('Loan updated.');
        } catch (err: any) {
            setEditError(err.message || 'Failed to update loan');
        }
    };

    const handleDeleteLoan = async (loanId: string) => {
        const confirmed = await confirmDialog({
            title: 'Delete loan?',
            message: 'This loan will be removed. This cannot be undone.',
            confirmText: 'Delete',
            danger: true,
        });
        if (!confirmed) return;

        try {
            await deleteLoan(loanId);
            if (selectedLoan === loanId) setSelectedLoan(null);
            await fetchLoans();
            notify.success('Loan deleted.');
        } catch (err) {
            notify.error(err instanceof Error ? err.message : 'Failed to delete loan.');
        }
    };

    // Lets the Schedule and Simulation tabs pick a loan directly
    const loanSelector = (
        <div className="gl-form fin-selector">
            <div className="form-group">
                <label htmlFor="loan-selector">Loan</label>
                <select
                    id="loan-selector"
                    value={selectedLoan || ''}
                    onChange={(e) => setSelectedLoan(e.target.value || null)}
                >
                    <option value="">Select a loan…</option>
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
        return <div className="loading">Loading loans...</div>;
    }

    return (
        <div className="page-container fin-page loans-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <div className="fin-header-actions">
                    <button onClick={fetchLoans} className="btn-secondary">
                        Refresh
                    </button>
                    <button onClick={handleAddLoan} className="btn-primary">
                        Add Loan
                    </button>
                </div>
            </div>

            {error && <div className="rc-banner error">{error}</div>}

            <div className="rec-filter-row">
                <button
                    className={`rec-filter-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`rec-filter-btn ${activeTab === 'calculator' ? 'active' : ''}`}
                    onClick={handleAddLoan}
                >
                    Calculator
                </button>
                {loans.length > 0 && (
                    <>
                        <button
                            className={`rec-filter-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                            onClick={() => setActiveTab('schedule')}
                        >
                            Schedule
                        </button>
                        <button
                            className={`rec-filter-btn ${activeTab === 'strategies' ? 'active' : ''}`}
                            onClick={() => setActiveTab('strategies')}
                        >
                            Strategies
                        </button>
                        <button
                            className={`rec-filter-btn ${activeTab === 'simulation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('simulation')}
                        >
                            Simulation
                        </button>
                        <button
                            className={`rec-filter-btn ${activeTab === 'insights' ? 'active' : ''}`}
                            onClick={() => setActiveTab('insights')}
                        >
                            Insights
                        </button>
                        <button
                            className={`rec-filter-btn ${activeTab === 'ratio' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ratio')}
                        >
                            Debt-to-Income
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
                            <div className="empty-state"><p>Select a loan to view its schedule</p></div>
                        )}
                    </div>
                )}

                {activeTab === 'strategies' && (
                    <div className="tab-pane">
                        {strategiesLoading
                            ? <div className="empty-state"><p>Comparing payoff strategies…</p></div>
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
                            <div className="empty-state"><p>Select a loan to run simulations</p></div>
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
                            <h2 id="loan-edit-title">Edit Loan</h2>
                            <button
                                type="button"
                                className="gl-modal-close"
                                onClick={() => setShowEditModal(false)}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        {editError && <div className="rc-banner error">{editError}</div>}
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Provider</label>
                                    <input
                                        type="text"
                                        value={editForm.provider}
                                        onChange={(e) => handleEditChange('provider', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Interest Rate (%)</label>
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
                                    <label>Tenure (Months)</label>
                                    <input
                                        type="number"
                                        value={editForm.tenure}
                                        onChange={(e) => handleEditChange('tenure', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Monthly EMI ({currencyCode()})</label>
                                    <input type="text" value={formatMoney(Number(editForm.monthlyInstallment), 2)} readOnly disabled />
                                    <span className="fin-note">
                                        Recalculated automatically when you change the rate or tenure.
                                    </span>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => handleEditChange('status', e.target.value)}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Next Due Date</label>
                                    <DateInput
                                        value={editForm.nextDueDate}
                                        onChange={(e) => handleEditChange('nextDueDate', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Changes
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
