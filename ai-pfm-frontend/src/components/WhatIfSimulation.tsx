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
        <div className="what-if-simulation">
            <h2>What-If Simulation</h2>
            <p className="subtitle">Explore different scenarios to optimize your loan repayment</p>

            {error && <div className="error-box">{error}</div>}

            <div className="simulation-tabs">
                <button
                    className={`tab ${activeTab === 'emi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('emi')}
                >
                    Increase EMI
                </button>
                <button
                    className={`tab ${activeTab === 'lump' ? 'active' : ''}`}
                    onClick={() => setActiveTab('lump')}
                >
                    Lump Sum
                </button>
                <button
                    className={`tab ${activeTab === 'refinance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('refinance')}
                >
                    Refinance
                </button>
            </div>

            <div className="simulation-content">
                {activeTab === 'emi' && (
                    <div className="simulation-form">
                        <h3>Increase Monthly EMI</h3>
                        <p className="description">See how increasing your EMI can help you pay off the loan faster and save interest.</p>

                        <div className="form-group">
                            <label>New Monthly EMI: Rs {increasedEMI.toFixed(2)}</label>
                            <input
                                type="range"
                                min={currentEMI}
                                max={currentEMI * 3}
                                value={increasedEMI}
                                onChange={(e) => setIncreasedEMI(Number(e.target.value))}
                                step={100}
                            />
                            <p className="help-text">Current EMI: Rs {currentEMI.toFixed(2)}</p>
                        </div>

                        <button onClick={handleSimulateEMI} disabled={loading} className="btn-primary">
                            {loading ? 'Simulating...' : 'Simulate'}
                        </button>
                    </div>
                )}

                {activeTab === 'lump' && (
                    <div className="simulation-form">
                        <h3>Lump Sum Payment</h3>
                        <p className="description">Make an extra payment to reduce your loan balance and interest.</p>

                        <div className="form-group">
                            <label>Lump Sum Amount</label>
                            <input
                                type="number"
                                value={lumpSumAmount}
                                onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                                min={0}
                                max={remainingBalance}
                            />
                            <p className="help-text">Max available: Rs {remainingBalance.toFixed(2)}</p>
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
                            <p className="help-text">Total tenure: {tenure} months</p>
                        </div>

                        <button onClick={handleSimulateLumpSum} disabled={loading} className="btn-primary">
                            {loading ? 'Simulating...' : 'Simulate'}
                        </button>
                    </div>
                )}

                {activeTab === 'refinance' && (
                    <div className="simulation-form">
                        <h3>Refinance Loan</h3>
                        <p className="description">See potential savings if you refinance at a lower interest rate.</p>

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
                            <p className="help-text">Current rate: {interestRate}% p.a.</p>
                        </div>

                        <button onClick={handleSimulateRefinance} disabled={loading} className="btn-primary">
                            {loading ? 'Simulating...' : 'Simulate'}
                        </button>
                    </div>
                )}
            </div>

            {simulationResults.length > 0 && (
                <div className="simulation-results">
                    <h3>Simulation Results</h3>
                    {simulationResults.map((result, idx) => (
                        <div key={idx} className="result-card">
                            <h4>{result.scenarioName}</h4>

                            <div className="results-grid">
                                <div className="result-item">
                                    <span className="label">Monthly EMI</span>
                                    <span className="value">Rs {result.monthlyEMI.toFixed(2)}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Total Interest</span>
                                    <span className="value">Rs {result.totalInterest.toFixed(2)}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Time to Payoff</span>
                                    <span className="value">{result.timeToPayoff} months</span>
                                </div>
                            </div>

                            {result.savings && (
                                <div className="savings-box">
                                    <h5>Potential Savings</h5>
                                    <p className="saving">Interest Saved: <strong>Rs {result.savings.interestSaved.toFixed(2)}</strong></p>
                                    {result.savings.timeSaved > 0 && (
                                        <p className="saving">Time Saved: <strong>{result.savings.timeSaved} months</strong></p>
                                    )}
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
