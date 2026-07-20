import { type FC } from 'react';

interface Loan {
    _id: string;
    type: string;
    provider: string;
    monthlyInstallment: number;
    remainingAmount: number;
    interestRate: number;
    nextDueDate: Date;
    status: string;
}

interface ActiveLoanCardsProps {
    loans: Loan[];
    onViewSchedule?: (loanId: string) => void;
    onRecalculate?: (loanId: string) => void;
    onMakePayment?: (loanId: string) => void;
    onEdit?: (loanId: string) => void;
    onDelete?: (loanId: string) => void;
}

const ActiveLoanCards: FC<ActiveLoanCardsProps> = ({
    loans,
    onViewSchedule,
    onRecalculate,
    onMakePayment,
    onEdit,
    onDelete
}) => {
    const activeLoan = loans.filter(l => l.status === 'Active');

    if (activeLoan.length === 0) {
        return (
            <div className="active-loans">
                <h2>Active Loans</h2>
                <p className="empty-state">No active loans. Add your first loan!</p>
            </div>
        );
    }

    return (
        <div className="active-loans">
            <h2>Active Loans</h2>
            <div className="loans-grid">
                {activeLoan.map((loan) => (
                    <div key={loan._id} className="loan-card">
                        <div className="card-header">
                            <div className="header-left">
                                <h3>{loan.type} Loan</h3>
                                <span className="provider">{loan.provider}</span>
                            </div>
                            <div className="header-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => onEdit?.(loan._id)}
                                    className="action-btn secondary small"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete?.(loan._id)}
                                    className="action-btn danger small"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="card-content">
                            <div className="info-row">
                                <span className="label">Monthly EMI:</span>
                                <span className="value">Rs {loan.monthlyInstallment?.toFixed(2)}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Remaining Amount:</span>
                                <span className="value">Rs {loan.remainingAmount?.toFixed(2)}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Interest Rate:</span>
                                <span className="value">{loan.interestRate}% p.a.</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Next Due Date:</span>
                                <span className="value">{new Date(loan.nextDueDate).toLocaleDateString()}</span>
                            </div>

                            <div className="progress-bar">
                                <div className="progress-fill"></div>
                            </div>
                        </div>

                        <div className="card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                            <button
                                onClick={() => onViewSchedule?.(loan._id)}
                                className="action-btn secondary small"
                                style={{ flex: 1 }}
                            >
                                View Schedule
                            </button>
                            <button
                                onClick={() => onRecalculate?.(loan._id)}
                                className="action-btn secondary small"
                                style={{ flex: 1 }}
                            >
                                Recalculate
                            </button>
                            <button
                                onClick={() => onMakePayment?.(loan._id)}
                                className="action-btn primary small"
                                style={{ flex: 1 }}
                            >
                                Pay EMI
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveLoanCards;
