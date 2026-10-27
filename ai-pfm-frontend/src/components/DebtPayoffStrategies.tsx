import { formatMoney } from '../utils/appFormat';
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
            <div className="empty-state">
                <h3>Debt Payoff Strategies</h3>
                <p>No active loans to compare strategies</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="su-panel-title">Debt Payoff Strategies</h3>
            <p className="su-muted fin-lead">Compare different strategies to pay off your loans faster</p>

            <div className="fin-grid fin-section">
                {strategies.map((strategy, idx) => (
                    <article key={idx} className="gl-card">
                        <div className="gl-head">
                            <div className="gl-head-text">
                                <h3>{strategy.name}</h3>
                            </div>
                            <span className="gl-pill">{strategy.method === 'snowball' ? 'Snowball' : 'Avalanche'}</span>
                        </div>

                        <p className="su-muted">{strategy.description}</p>

                        <div className="gl-kv">
                            <div><span>Time to Clear Debt</span><span>{strategy.timeToPayoff} months</span></div>
                            <div><span>Interest Saved</span><span>{formatMoney(strategy.totalInterestSaved, 2)}</span></div>
                        </div>

                        <div>
                            <h4 className="fin-sub-title">Payment Order</h4>
                            <ol className="fin-list">
                                {strategy.schedule.map((item, i) => (
                                    <li key={i}>
                                        {item.loanType} - {formatMoney(item.paymentAmount, 2)}/month
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="gl-actions">
                            <button
                                onClick={() => onSelectStrategy?.(strategy.method)}
                                className="btn-primary btn-sm"
                            >
                                Choose {strategy.name}
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            <div className="fin-stack">
                <div className="gl-insight">
                    <div>
                        <h4>Snowball Method</h4>
                        <p>Pay off smallest debts first. Gives quick psychological wins and maintains motivation.</p>
                    </div>
                </div>
                <div className="gl-insight">
                    <div>
                        <h4>Avalanche Method</h4>
                        <p>Pay off highest interest rates first. Saves the most money in interest over time.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtPayoffStrategies;
