import { formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, type FC } from 'react';
import { useLoans } from '../hooks/useLoans';
import { useAdminLang } from '../i18n/adminText';
import { LOAN_RS_T } from '../i18n/loanRatioSimText';
import { fillText } from '../i18n/dashboardText';

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
    const t = LOAN_RS_T[useAdminLang()];
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
            <p className="su-muted fin-lead">{t.simLead}</p>

            {error && <div className="rc-banner error">{error}</div>}

            <div className="rec-filter-row">
                <button
                    className={`rec-filter-btn ${activeTab === 'emi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('emi')}
                >
                    {t.tabEmi}
                </button>
                <button
                    className={`rec-filter-btn ${activeTab === 'lump' ? 'active' : ''}`}
                    onClick={() => setActiveTab('lump')}
                >
                    {t.tabLump}
                </button>
                <button
                    className={`rec-filter-btn ${activeTab === 'refinance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('refinance')}
                >
                    {t.tabRefi}
                </button>
            </div>

            <div className="card form-card gl-form">
                {activeTab === 'emi' && (
                    <>
                        <h3 className="gl-form-title">{t.emiTitle}</h3>
                        <p className="su-muted fin-lead">{t.emiLead}</p>

                        <div className="form-group">
                            <label>{fillText(t.newEmi, { amount: formatMoney(increasedEMI, 2) })}</label>
                            <input
                                type="range"
                                min={currentEMI}
                                max={currentEMI * 3}
                                value={increasedEMI}
                                onChange={(e) => setIncreasedEMI(Number(e.target.value))}
                                step={100}
                            />
                            <span className="fin-note">{fillText(t.currentEmi, { amount: formatMoney(currentEMI, 2) })}</span>
                        </div>

                        <div className="form-actions">
                            <button onClick={handleSimulateEMI} disabled={loading} className="btn-primary">
                                {loading ? t.simulating : t.simulate}
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'lump' && (
                    <>
                        <h3 className="gl-form-title">{t.lumpTitle}</h3>
                        <p className="su-muted fin-lead">{t.lumpLead}</p>

                        <div className="form-group">
                            <label>{fillText(t.lumpAmount, { cur: currencyCode() })}</label>
                            <input
                                type="number"
                                value={fromLkr(lumpSumAmount)}
                                onChange={(e) => setLumpSumAmount(toLkr(Number(e.target.value)))}
                                min={0}
                                max={remainingBalance}
                            />
                            <span className="fin-note">{fillText(t.maxAvail, { amount: formatMoney(remainingBalance, 2) })}</span>
                        </div>

                        <div className="form-group">
                            <label>{fillText(t.applyMonth, { n: monthToApply })}</label>
                            <input
                                type="range"
                                min={1}
                                max={tenure}
                                value={monthToApply}
                                onChange={(e) => setMonthToApply(Number(e.target.value))}
                            />
                            <span className="fin-note">{fillText(t.totalTenure, { n: tenure })}</span>
                        </div>

                        <div className="form-actions">
                            <button onClick={handleSimulateLumpSum} disabled={loading} className="btn-primary">
                                {loading ? t.simulating : t.simulate}
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'refinance' && (
                    <>
                        <h3 className="gl-form-title">{t.refiTitle}</h3>
                        <p className="su-muted fin-lead">{t.refiLead}</p>

                        <div className="form-group">
                            <label>{fillText(t.newRate, { rate: newRate.toFixed(2) })}</label>
                            <input
                                type="range"
                                min={0}
                                max={interestRate}
                                step={0.1}
                                value={newRate}
                                onChange={(e) => setNewRate(Number(e.target.value))}
                            />
                            <span className="fin-note">{fillText(t.currentRate, { rate: interestRate })}</span>
                        </div>

                        <div className="form-actions">
                            <button onClick={handleSimulateRefinance} disabled={loading} className="btn-primary">
                                {loading ? t.simulating : t.simulate}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {simulationResults.length > 0 && (
                <div className="su-panel">
                    <h3 className="su-panel-title">{t.resultsTitle}</h3>
                    {simulationResults.map((result, idx) => (
                        <div key={idx}>
                            <h4 className="fin-sub-title">{result.scenarioName}</h4>

                            <div className="rc-stats rc-stats-3">
                                <div className="rc-stat">
                                    <span className="rc-stat-label">{t.monthlyEmi}</span>
                                    <span className="rc-stat-value">{formatMoney(result.monthlyEMI, 2)}</span>
                                </div>
                                <div className="rc-stat">
                                    <span className="rc-stat-label">{t.totalInterest}</span>
                                    <span className="rc-stat-value">{formatMoney(result.totalInterest, 2)}</span>
                                </div>
                                <div className="rc-stat">
                                    <span className="rc-stat-label">{t.timeToPayoff}</span>
                                    <span className="rc-stat-value">{result.timeToPayoff} {t.monthsSuffix}</span>
                                </div>
                            </div>

                            {result.savings && (
                                <div className="su-impact">
                                    <strong>{t.potentialSavings}</strong>
                                    <ul>
                                        <li>{t.interestSavedLabel} <strong>{formatMoney(result.savings.interestSaved, 2)}</strong></li>
                                        {result.savings.timeSaved > 0 && (
                                            <li>{t.timeSavedLabel} <strong>{fillText(t.timeSaved, { n: result.savings.timeSaved })}</strong></li>
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
