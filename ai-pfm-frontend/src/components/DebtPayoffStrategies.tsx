import { type FC } from 'react';

interface Strategy {
    name: string;
    method: 'snowball' | 'avalanche';
    description: string;
    totalInterestSaved: number;
    timeToPayoff: number;
    schedule: Array<{ loanId: string; loanType: string; paymentAmount: number }>;
}

interface DebtPayoffStrategiesProps {
    strategies: Strategy[];
    onSelectStrategy?: (method: string) => void;
}

const DebtPayoffStrategies: FC<DebtPayoffStrategiesProps> = ({ strategies, onSelectStrategy }) => {
    if (strategies.length === 0) {
        return (
            <div className="debt-payoff-strategies">
                <h2>Debt Payoff Strategies</h2>
                <p className="empty-state">No active loans to compare strategies</p>
            </div>
        );
    }

    return (
        <div className="debt-payoff-strategies">
            <h2>Debt Payoff Strategies</h2>
            <p className="subtitle">Compare different strategies to pay off your loans faster</p>

            <div className="strategies-grid">
                {strategies.map((strategy, idx) => (
                    <div key={idx} className="strategy-card">
                        <div className="strategy-header">
                            <h3>{strategy.name}</h3>
                            <span className="method-badge">{strategy.method === 'snowball' ? '❄️' : '⚡'}</span>
                        </div>

                        <p className="description">{strategy.description}</p>

                        <div className="strategy-details">
                            <div className="detail-item">
                                <span className="label">Time to Clear Debt</span>
                                <span className="value">{strategy.timeToPayoff} months</span>
                            </div>
                            <div className="detail-item highlight">
                                <span className="label">Interest Saved</span>
                                <span className="value">Rs {strategy.totalInterestSaved?.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="payment-order">
                            <h4>Payment Order:</h4>
                            <ol>
                                {strategy.schedule.map((item, idx) => (
                                    <li key={idx}>
                                        {item.loanType} - Rs {item.paymentAmount?.toFixed(2)}/month
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <button
                            onClick={() => onSelectStrategy?.(strategy.method)}
                            className="btn-primary"
                        >
                            Choose {strategy.name}
                        </button>
                    </div>
                ))}
            </div>

            <div className="strategy-info">
                <div className="info-box">
                    <h4>Snowball Method ❄️</h4>
                    <p>Pay off smallest debts first. Gives quick psychological wins and maintains motivation.</p>
                </div>
                <div className="info-box">
                    <h4>Avalanche Method ⚡</h4>
                    <p>Pay off highest interest rates first. Saves the most money in interest over time.</p>
                </div>
            </div>
        </div>
    );
};

export default DebtPayoffStrategies;
