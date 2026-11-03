import { formatDate, formatMoney } from '../utils/appFormat';
import { type FC } from 'react';
import { useAdminLang } from '../i18n/adminText';
import { LOAN_PANELS_T } from '../i18n/loanPanelsText';
import { fillText } from '../i18n/dashboardText';

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
    const t = LOAN_PANELS_T[useAdminLang()];
    const activeLoan = loans.filter(l => l.status === 'Active');

    if (activeLoan.length === 0) {
        return (
            <div className="empty-state">
                <h3>{t.noActive}</h3>
                <p>{t.addFirst}</p>
            </div>
        );
    }

    return (
        <div className="fin-section">
            <h3 className="su-panel-title">{t.activeLoans}</h3>
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
                                        <h3>{fillText(t.loanSuffix, { type: loan.type })}</h3>
                                        <span className="gl-sub">{loan.provider}</span>
                                    </div>
                                </div>
                                <span className="gl-pill in-progress">{t.statusActive}</span>
                            </div>

                            <div className="gl-kv">
                                <div><span>{t.monthlyEmi}</span><span>{formatMoney(loan.monthlyInstallment, 2)}</span></div>
                                <div><span>{t.remainingAmount}</span><span>{formatMoney(loan.remainingAmount, 2)}</span></div>
                                <div><span>{t.interestRate}</span><span>{fillText(t.rateValue, { rate: loan.interestRate })}</span></div>
                                <div><span>{t.nextDue}</span><span>{formatDate(loan.nextDueDate)}</span></div>
                            </div>

                            <div className="gl-progress">
                                <div
                                    className="gl-bar"
                                    role="progressbar"
                                    aria-valuenow={Math.round(paidPercent)}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={fillText(t.progressLabel, { pct: paidPercent.toFixed(1) })}
                                >
                                    <span style={{ width: `${paidPercent}%` }} />
                                </div>
                                <div className="gl-row">
                                    <span>{fillText(t.paidLabel, { pct: paidPercent.toFixed(1) })}</span>
                                </div>
                            </div>

                            <div className="gl-actions loan-card-actions">
                                <button onClick={() => onMakePayment?.(loan._id)} className="btn-primary btn-sm">
                                    {t.payEmi}
                                </button>
                                <button onClick={() => onViewSchedule?.(loan._id)} className="btn-secondary btn-sm">
                                    {t.viewSchedule}
                                </button>
                                <button onClick={() => onRecalculate?.(loan._id)} className="btn-secondary btn-sm">
                                    {t.recalculate}
                                </button>
                                <button onClick={() => onEdit?.(loan._id)} className="btn-secondary btn-sm">
                                    {t.edit}
                                </button>
                                <button onClick={() => onDelete?.(loan._id)} className="btn-secondary btn-sm">
                                    {t.delete}
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
