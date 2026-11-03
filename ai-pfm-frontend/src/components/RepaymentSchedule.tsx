import { formatDate, formatMoney } from '../utils/appFormat';
import { type FC, useState } from 'react';
import { useAdminLang } from '../i18n/adminText';
import { LOAN_TABS_T } from '../i18n/loanTabsText';
import { fillText } from '../i18n/dashboardText';

interface ScheduleItem {
    month: number;
    principalPayment: number;
    interestPayment: number;
    remainingBalance: number;
    dueDate: Date;
    paid: boolean;
}

interface RepaymentScheduleProps {
    schedule: ScheduleItem[];
    loanType: string;
    monthlyEMI: number;
}

const RepaymentSchedule: FC<RepaymentScheduleProps> = ({ schedule, loanType, monthlyEMI }) => {
    const t = LOAN_TABS_T[useAdminLang()];
    const [filter, setFilter] = useState('all'); // all, paid, pending

    const filteredSchedule = schedule.filter(item => {
        if (filter === 'paid') return item.paid;
        if (filter === 'pending') return !item.paid;
        return true;
    });

    const totalPaid = schedule.filter(s => s.paid).reduce((sum, s) => sum + (s.principalPayment + s.interestPayment), 0);
    const totalRemaining = filteredSchedule.reduce((sum, s) => sum + (s.principalPayment + s.interestPayment), 0);

    return (
        <div>
            <div className="rc-stats rc-stats-3">
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.schedEmi}</span>
                    <span className="rc-stat-value">{formatMoney(monthlyEMI, 2)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.schedPaid}</span>
                    <span className="rc-stat-value">{formatMoney(totalPaid, 2)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.schedRemaining}</span>
                    <span className="rc-stat-value">{formatMoney(totalRemaining, 2)}</span>
                </div>
            </div>

            <div className="su-panel">
                <div className="rc-panel-head">
                    <h3 className="rc-panel-title">{fillText(t.schedTitle, { type: loanType })}</h3>
                    <div className="rec-filter-row" style={{ marginBottom: 0 }}>
                        {(['all', 'paid', 'pending'] as const).map(f => (
                            <button
                                key={f}
                                className={`rec-filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {({ all: t.filterAll, paid: t.filterPaid, pending: t.filterPending })[f]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="su-table-wrap">
                    <table className="su-table">
                        <thead>
                            <tr>
                                <th>{t.colMonth}</th>
                                <th>{t.colDue}</th>
                                <th>{t.colPrincipal}</th>
                                <th>{t.colInterest}</th>
                                <th>{t.colEmi}</th>
                                <th>{t.colBalance}</th>
                                <th>{t.colStatus}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSchedule.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.month}</td>
                                    <td>{formatDate(item.dueDate)}</td>
                                    <td>{formatMoney(item.principalPayment, 2)}</td>
                                    <td>{formatMoney(item.interestPayment, 2)}</td>
                                    <td className="strong">{formatMoney((item.principalPayment + item.interestPayment), 2)}</td>
                                    <td>{formatMoney(item.remainingBalance, 2)}</td>
                                    <td>
                                        <span className={`su-pill ${item.paid ? 'good' : 'warn'}`}>
                                            {item.paid ? t.statusPaid : t.statusPending}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RepaymentSchedule;
