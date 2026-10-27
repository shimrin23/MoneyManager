import { formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, type FC } from 'react';
import { useLoans } from '../hooks/useLoans';

interface WhatIfSimulationProps {
    loanId: string;
    currentEMI: number;
    remainingBalance: number;
    tenure: number;
    interestRate: number;
}

interface SimulationResult {
    scenarioName: string;
    monthlyEMI: number;
    totalInterest: number;
    totalPayable: number;
    timeToPayoff: number;
    savings: {
        interestSaved: number;
        timeSaved: number;
    };
}

const WhatIfSimulation: FC<WhatIfSimulationProps> = ({
    loanId,
    currentEMI,
    remainingBalance,
    tenure,
    interestRate
}) => {
    const { simulateIncreasedEMI, simulateLumpSum, simulateRefinance } = useLoans();
    const [activeTab, setActiveTab] = useState<'emi' | 'lump' | 'refinance'>('emi');
    const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // EMI Simulation
    const [increasedEMI, setIncreasedEMI] = useState(currentEMI + 1000);

    const handleSimulateEMI = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await simulateIncreasedEMI(loanId, increasedEMI);
            setSimulationResults([result]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Lump Sum Simulation
    const [lumpSumAmount, setLumpSumAmount] = useState(remainingBalance * 0.1);
    const [monthToApply, setMonthToApply] = useState(6);

    const handleSimulateLumpSum = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await simulateLumpSum(loanId, lumpSumAmount, monthToApply);
            setSimulationResults([result]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Refinance Simulation
    const [newRate, setNewRate] = useState(interestRate - 0.5);

    const handleSimulateRefinance = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await simulateRefinance(loanId, newRate);
            setSimulationResults([result]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <p className="su-muted fin-lead">Explore different scenarios to optimize your loan repayment</p>

            {error && <div className="rc-banner error">{error}</div>}

            <div className="rec-filter-row">
                <button
                    className={`rec-filter-btn ${activeTab === 'emi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('emi')}
                >
                    Increase EMI
                </button>
                <button
                    className={`rec-filter-btn ${activeTab === 'lump' ? 'active' : ''}`}
                    onClick={() => setActiveTab('lump')}
                >
                    Lump Sum
                </button>
                <button
                    className={`rec-filter-btn ${activeTab === 'refinance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('refinance')}
                >
                    Refinance
                </button>
            </div>

            <div className="card form-card gl-form">
                {activeTab === 'emi' && (
                    <>
                        <h3 className="gl-form-title">Increase Monthly EMI</h3>
                        <p className="su-muted fin-lead">See how increasing your EMI can help you pay off the loan faster and save interest.</p>

                        <div className="form-group">
                            <label>New Monthly EMI: {formatMoney(increasedEMI, 2)}</label>
                            <input
                                type="range"
                                min={currentEMI}
                                max={currentEMI * 3}
                                value={increasedEMI}
                                onChange={(e) => setIncreasedEMI(Number(e.target.value))}
                                step={100}
                            />
                            <span className="fin-note">Current EMI: {formatMoney(currentEMI, 2)}</span>
                        </div>

                        <div className="form-actions">
                            <button onClick={handleSimulateEMI} disabled={loading} className="btn-primary">
                                {loading ? 'Simulating...' : 'Simulate'}
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'lump' && (
                    <>
                        <h3 className="gl-form-title">Lump Sum Payment</h3>
                        <p className="su-muted fin-lead">Make an extra payment to reduce your loan balance and interest.</p>

                        <div className="form-group">
                            <label>Lump Sum Amount ({currencyCode()})</label>
                            <input
                                type="number"
                                value={fromLkr(lumpSumAmount)}
                                onChange={(e) => setLumpSumAmount(toLkr(Number(e.target.value)))}
                                min={0}
                                max={remainingBalance}
                            />
                            <span className="fin-note">Max available: {formatMoney(remainingBalance, 2)}</span>
                        </div>

                        <div className="form-group">
                            <label>Apply in Month: {monthToApply}</label>
                            <input
                                type="range"
                                min={1}
                                max={tenure}
                                value={monthToApply}
                                onChange={(e) => setMonthToApply(Number(e.target.value))}
                            />
                            <span className="fin-note">Total tenure: {tenure} months</span>
                        </div>

                        <div className="form-actions">
                            <button onClick={handleSimulateLumpSum} disabled={loading} className="btn-primary">
                                {loading ? 'Simulating...' : 'Simulate'}
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'refinance' && (
                    <>
                        <h3 className="gl-form-title">Refinance Loan</h3>
                        <p className="su-muted fin-lead">See potential savings if you refinance at a lower interest rate.</p>

                        <div className="form-group">
                            <label>New Interest Rate: {newRate.toFixed(2)}% p.a.</label>
                            <input
                                type="range"
                                min={0}
                                max={interestRate}
                                step={0.1}
                                value={newRate}
                                onChange={(e) => setNewRate(Number(e.target.value))}
                            />
                            <span className="fin-note">Current rate: {interestRate}% p.a.</span>
                        </div>

                        <div className="form-actions">
                            <button onClick={handleSimulateRefinance} disabled={loading} className="btn-primary">
                                {loading ? 'Simulating...' : 'Simulate'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {simulationResults.length > 0 && (
                <div className="su-panel">
                    <h3 className="su-panel-title">Simulation Results</h3>
                    {simulationResults.map((result, idx) => (
                        <div key={idx}>
                            <h4 className="fin-sub-title">{result.scenarioName}</h4>

                            <div className="rc-stats rc-stats-3">
                                <div className="rc-stat">
                                    <span className="rc-stat-label">Monthly EMI</span>
                                    <span className="rc-stat-value">{formatMoney(result.monthlyEMI, 2)}</span>
                                </div>
                                <div className="rc-stat">
                                    <span className="rc-stat-label">Total Interest</span>
                                    <span className="rc-stat-value">{formatMoney(result.totalInterest, 2)}</span>
                                </div>
                                <div className="rc-stat">
                                    <span className="rc-stat-label">Time to Payoff</span>
                                    <span className="rc-stat-value">{result.timeToPayoff} months</span>
                                </div>
                            </div>

                            {result.savings && (
                                <div className="su-impact">
                                    <strong>Potential Savings</strong>
                                    <ul>
                                        <li>Interest Saved: <strong>{formatMoney(result.savings.interestSaved, 2)}</strong></li>
                                        {result.savings.timeSaved > 0 && (
                                            <li>Time Saved: <strong>{result.savings.timeSaved} months</strong></li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WhatIfSimulation;
