import { useState, type FC, type FormEvent } from 'react';
import { useLoans } from '../hooks/useLoans';
import LoanCalculator from './LoanCalculator';
import ActiveLoanCards from './ActiveLoanCards';
import RepaymentSchedule from './RepaymentSchedule';
import DebtPayoffStrategies from './DebtPayoffStrategies';
import LoanAlerts from './LoanAlerts';
import AiLoanInsights from './AiLoanInsights';
import LoanToIncomeRatio from './LoanToIncomeRatio';
import WhatIfSimulation from './WhatIfSimulation';
import './LoansPage.css';

type TabType = 'overview' | 'calculator' | 'schedule' | 'strategies' | 'simulation' | 'insights' | 'ratio';

const LoansPage: FC = () => {
    const { loans, loading, error, fetchLoans, updateLoan, deleteLoan } = useLoans();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
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

    const handleViewSchedule = (loanId: string) => {
        setSelectedLoan(loanId);
        setActiveTab('schedule');
    };

    const handleRecalculate = (loanId: string) => {
        setSelectedLoan(loanId);
        setActiveTab('calculator');
    };

    const handleMakePayment = (loanId: string) => {
        // This would open a payment modal
        setSelectedLoan(loanId);
    };

    const handleAddLoan = () => {
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
            await updateLoan(editForm.loanId, {
                provider: editForm.provider,
                interestRate: Number(editForm.interestRate),
                tenure: Number(editForm.tenure),
                monthlyInstallment: Number(editForm.monthlyInstallment),
                status: editForm.status,
                nextDueDate: editForm.nextDueDate ? new Date(editForm.nextDueDate) : undefined
            });
            setShowEditModal(false);
            fetchLoans();
        } catch (err: any) {
            setEditError(err.message || 'Failed to update loan');
        }
    };

    const handleDeleteLoan = async (loanId: string) => {
        const confirmed = window.confirm('Delete this loan? This cannot be undone.');
        if (!confirmed) return;

        try {
            await deleteLoan(loanId);
            fetchLoans();
        } catch (err: any) {
            setEditError(err.message || 'Failed to delete loan');
        }
    };

    if (loading) {
        return <div className="loans-page loading">Loading loans...</div>;
    }

    return (
        <div className="loans-page">
            <div className="page-header">
                <h1>Loan Management</h1>
                <div className="header-actions">
                    <button onClick={handleAddLoan} className="btn-small btn-primary">
                        Add Loan
                    </button>
                    <button onClick={fetchLoans} className="btn-small btn-secondary">
                        Refresh
                    </button>
                </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="tabs-navigation">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calculator')}
                >
                    Calculator
                </button>
                {loans.length > 0 && (
                    <>
                        <button
                            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                            onClick={() => setActiveTab('schedule')}
                        >
                            Schedule
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'strategies' ? 'active' : ''}`}
                            onClick={() => setActiveTab('strategies')}
                        >
                            Strategies
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('simulation')}
                        >
                            Simulation
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                            onClick={() => setActiveTab('insights')}
                        >
                            Insights
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'ratio' ? 'active' : ''}`}
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
                        <div className="overview-grid">
                            <div className="overview-section">
                                <LoanAlerts loanIds={activeLoanIds} />
                            </div>
                            <div className="overview-section">
                                <ActiveLoanCards
                                    loans={loans}
                                    onViewSchedule={handleViewSchedule}
                                    onRecalculate={handleRecalculate}
                                    onMakePayment={handleMakePayment}
                                    onEdit={handleEditLoan}
                                    onDelete={handleDeleteLoan}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'calculator' && (
                    <div className="tab-pane">
                        <LoanCalculator onLoanCreated={() => { fetchLoans(); setActiveTab('overview'); }} />
                    </div>
                )}

                {activeTab === 'schedule' && activeLoan && (
                    <div className="tab-pane">
                        <RepaymentSchedule
                            schedule={activeLoan.paymentSchedule || []}
                            loanType={activeLoan.type}
                            monthlyEMI={activeLoan.monthlyInstallment}
                        />
                    </div>
                )}

                {activeTab === 'schedule' && !activeLoan && (
                    <div className="tab-pane">
                        <p className="empty-state">Select a loan to view its schedule</p>
                    </div>
                )}

                {activeTab === 'strategies' && (
                    <div className="tab-pane">
                        <DebtPayoffStrategies strategies={[]} />
                    </div>
                )}

                {activeTab === 'simulation' && activeLoan && (
                    <div className="tab-pane">
                        <WhatIfSimulation
                            loanId={activeLoan._id}
                            currentEMI={activeLoan.monthlyInstallment}
                            remainingBalance={activeLoan.remainingAmount}
                            tenure={activeLoan.tenure}
                            interestRate={activeLoan.interestRate}
                        />
                    </div>
                )}

                {activeTab === 'simulation' && !activeLoan && (
                    <div className="tab-pane">
                        <p className="empty-state">Select a loan to run simulations</p>
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
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Loan</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                ×
                            </button>
                        </div>
                        {editError && <div className="error-box">{editError}</div>}
                        <form className="calculator-form" onSubmit={handleEditSubmit}>
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
                                    <label>Monthly EMI (Rs)</label>
                                    <input
                                        type="number"
                                        value={editForm.monthlyInstallment}
                                        onChange={(e) => handleEditChange('monthlyInstallment', e.target.value)}
                                        required
                                    />
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
                                    <input
                                        type="date"
                                        value={editForm.nextDueDate}
                                        onChange={(e) => handleEditChange('nextDueDate', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="action-buttons">
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
