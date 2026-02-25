import { type FC, useState } from 'react';

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
    const [filter, setFilter] = useState('all'); // all, paid, pending

    const filteredSchedule = schedule.filter(item => {
        if (filter === 'paid') return item.paid;
        if (filter === 'pending') return !item.paid;
        return true;
    });

    const totalPaid = schedule.filter(s => s.paid).reduce((sum, s) => sum + (s.principalPayment + s.interestPayment), 0);
    const totalRemaining = filteredSchedule.reduce((sum, s) => sum + (s.principalPayment + s.interestPayment), 0);

    return (
        <div className="repayment-schedule">
            <div className="schedule-header">
                <h2>Repayment Schedule - {loanType} Loan</h2>
                <div className="filter-buttons">
                    <button
                        className={`btn-small ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn-small ${filter === 'paid' ? 'active' : ''}`}
                        onClick={() => setFilter('paid')}
                    >
                        Paid
                    </button>
                    <button
                        className={`btn-small ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                </div>
            </div>

            <div className="schedule-summary">
                <div className="summary-card">
                    <p className="label">Monthly EMI</p>
                    <p className="value">Rs {monthlyEMI?.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <p className="label">Total Paid</p>
                    <p className="value">Rs {totalPaid?.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <p className="label">Remaining</p>
                    <p className="value">Rs {totalRemaining?.toFixed(2)}</p>
                </div>
            </div>

            <div className="table-container">
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Due Date</th>
                            <th>Principal</th>
                            <th>Interest</th>
                            <th>EMI</th>
                            <th>Balance</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSchedule.map((item, idx) => (
                            <tr key={idx} className={item.paid ? 'paid' : 'pending'}>
                                <td className="month">{item.month}</td>
                                <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                                <td>Rs {item.principalPayment?.toFixed(2)}</td>
                                <td>Rs {item.interestPayment?.toFixed(2)}</td>
                                <td className="emi">Rs {(item.principalPayment + item.interestPayment)?.toFixed(2)}</td>
                                <td>Rs {item.remainingBalance?.toFixed(2)}</td>
                                <td>
                                    <span className={`status-badge ${item.paid ? 'paid' : 'pending'}`}>
                                        {item.paid ? '✓ Paid' : '◯ Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RepaymentSchedule;
