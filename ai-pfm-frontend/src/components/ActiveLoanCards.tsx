import { formatDate, formatMoney } from '../utils/appFormat';
import { type FC } from 'react';

interface Loan {
    _id: string;
    type: string;
    provider: string;
    monthlyInstallment: number;
    totalAmount: number;
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
            <div className="empty-state">
                <h3>No Active Loans</h3>
                <p>Add your first loan to start tracking it.</p>
            </div>
        );
    }

    return (
        <div className="fin-section">
            <h3 className="su-panel-title">Active Loans</h3>
            <div className="fin-grid">
                {activeLoan.map((loan) => {
                    const paidPercent = loan.totalAmount > 0
                        ? Math.min(100, Math.max(0, ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100))
                        : 0;
                    return (
                        <article key={loan._id} className="gl-card">
                            <div className="gl-head">
                                <div className="gl-head-main">
                                    <div className="gl-head-text">
                                        <h3>{loan.type} Loan</h3>
                                        <span className="gl-sub">{loan.provider}</span>
                                    </div>
                                </div>
                                <span className="gl-pill in-progress">Active</span>
                            </div>

                            <div className="gl-kv">
                                <div><span>Monthly EMI</span><span>{formatMoney(loan.monthlyInstallment, 2)}</span></div>
                                <div><span>Remaining Amount</span><span>{formatMoney(loan.remainingAmount, 2)}</span></div>
                                <div><span>Interest Rate</span><span>{loan.interestRate}% p.a.</span></div>
                                <div><span>Next Due Date</span><span>{formatDate(loan.nextDueDate)}</span></div>
                            </div>

                            <div className="gl-progress">
                                <div
                                    className="gl-bar"
                                    role="progressbar"
                                    aria-valuenow={Math.round(paidPercent)}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={`${paidPercent.toFixed(1)}% of the loan paid`}
                                >
                                    <span style={{ width: `${paidPercent}%` }} />
                                </div>
                                <div className="gl-row">
                                    <span>{paidPercent.toFixed(1)}% paid</span>
                                </div>
                            </div>

                            <div className="gl-actions">
                                <button onClick={() => onMakePayment?.(loan._id)} className="btn-primary btn-sm">
                                    Pay EMI
                                </button>
                                <button onClick={() => onViewSchedule?.(loan._id)} className="btn-secondary btn-sm">
                                    View Schedule
                                </button>
                                <button onClick={() => onRecalculate?.(loan._id)} className="btn-secondary btn-sm">
                                    Recalculate
                                </button>
                                <button onClick={() => onEdit?.(loan._id)} className="btn-secondary btn-sm">
                                    Edit
                                </button>
                                <button onClick={() => onDelete?.(loan._id)} className="btn-secondary btn-sm">
                                    Delete
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default ActiveLoanCards;
