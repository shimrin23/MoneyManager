import { useState, type FC } from 'react';
import { useLoans } from '../hooks/useLoans';
import './LoanCalculator.css';

interface LoanCalculatorProps {
    onLoanCreated?: () => void;
}

const LoanCalculator: FC<LoanCalculatorProps> = ({ onLoanCreated }) => {
    const { calculateEMI, getSchedule, createLoan } = useLoans();

    const [formData, setFormData] = useState({
        type: 'Personal',
        provider: '',
        principal: '',
        interestRate: '',
        tenure: '',
        startDate: new Date().toISOString().split('T')[0],
        customNotes: ''
    });

    const [result, setResult] = useState<any>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Calculate, 2: Schedule, 3: Create

    const handleCalculate = async () => {
        const newErrors: string[] = [];
        if (!formData.principal || Number(formData.principal) <= 0) newErrors.push('Enter valid principal amount');
        if (formData.interestRate === '' || Number(formData.interestRate) < 0) newErrors.push('Enter valid interest rate');
        if (!formData.tenure || Number(formData.tenure) <= 0) newErrors.push('Enter valid tenure (months)');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors([]);
        setLoading(true);

        try {
            const emiResult = await calculateEMI(
                Number(formData.principal),
                Number(formData.interestRate),
                Number(formData.tenure)
            );

            const scheduleResult = await getSchedule(
                Number(formData.principal),
                Number(formData.interestRate),
                Number(formData.tenure),
                new Date(formData.startDate)
            );

            setResult(emiResult);
            setSchedule(scheduleResult);
            setStep(2);
        } catch (err: any) {
            setErrors([err.message]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLoan = async () => {
        setLoading(true);
        try {
            await createLoan({
                type: formData.type,
                provider: formData.provider,
                principal: Number(formData.principal),
                interestRate: Number(formData.interestRate),
                tenure: Number(formData.tenure),
                startDate: formData.startDate,
                customNotes: formData.customNotes
            });

            setFormData({
                type: 'Personal',
                provider: '',
                principal: '',
                interestRate: '',
                tenure: '',
                startDate: new Date().toISOString().split('T')[0],
                customNotes: ''
            });
            setResult(null);
            setSchedule([]);
            setStep(1);
            onLoanCreated?.();
        } catch (err: any) {
            setErrors([err.message]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="loan-calculator">
            <h2>EMI Calculator</h2>

            {errors.length > 0 && (
                <div className="error-box">
                    {errors.map((error, idx) => <p key={idx}>• {error}</p>)}
                </div>
            )}

            {step === 1 && (
                <div className="calculator-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Loan Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                <option>Personal</option>
                                <option>Home</option>
                                <option>Vehicle</option>
                                <option>Education</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Provider/Bank</label>
                            <input
                                type="text"
                                placeholder="e.g., ICICI Bank"
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Principal Amount (Rs)</label>
                            <input
                                type="number"
                                placeholder="100000"
                                value={formData.principal}
                                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Interest Rate (% p.a.)</label>
                            <input
                                type="number"
                                placeholder="8.5"
                                step="0.1"
                                value={formData.interestRate}
                                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tenure (Months)</label>
                            <input
                                type="number"
                                placeholder="60"
                                value={formData.tenure}
                                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Notes (Optional)</label>
                        <textarea
                            placeholder="Any notes about this loan..."
                            value={formData.customNotes}
                            onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <button onClick={handleCalculate} disabled={loading} className="btn-primary">
                        {loading ? 'Calculating...' : 'Calculate EMI'}
                    </button>
                </div>
            )}

            {step === 2 && result && (
                <div className="calculator-result">
                    <div className="result-cards">
                        <div className="card">
                            <p className="label">Monthly EMI</p>
                            <p className="value">Rs {result.monthlyEMI?.toFixed(2)}</p>
                        </div>
                        <div className="card">
                            <p className="label">Total Interest</p>
                            <p className="value">Rs {result.totalInterest?.toFixed(2)}</p>
                        </div>
                        <div className="card">
                            <p className="label">Total Payable</p>
                            <p className="value">Rs {result.totalPayable?.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="schedule-preview">
                        <h3>First 6 Months Preview</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Principal</th>
                                    <th>Interest</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.slice(0, 6).map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.month}</td>
                                        <td>Rs {item.principalPayment?.toFixed(2)}</td>
                                        <td>Rs {item.interestPayment?.toFixed(2)}</td>
                                        <td>Rs {item.remainingBalance?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setStep(3)} className="btn-secondary">
                            View Full Schedule
                        </button>
                    </div>

                    <div className="action-buttons">
                        <button onClick={() => setStep(1)} className="btn-secondary">
                            Back
                        </button>
                        <button onClick={handleCreateLoan} disabled={loading} className="btn-primary">
                            {loading ? 'Creating...' : 'Create Loan'}
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="full-schedule">
                    <h3>Complete Repayment Schedule</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Due Date</th>
                                    <th>Principal</th>
                                    <th>Interest</th>
                                    <th>EMI</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.month}</td>
                                        <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                                        <td>Rs {item.principalPayment?.toFixed(2)}</td>
                                        <td>Rs {item.interestPayment?.toFixed(2)}</td>
                                        <td>Rs {(item.principalPayment + item.interestPayment)?.toFixed(2)}</td>
                                        <td>Rs {item.remainingBalance?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => setStep(2)} className="btn-secondary">
                            Back
                        </button>
                        <button onClick={handleCreateLoan} disabled={loading} className="btn-primary">
                            {loading ? 'Creating...' : 'Create Loan'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanCalculator;
