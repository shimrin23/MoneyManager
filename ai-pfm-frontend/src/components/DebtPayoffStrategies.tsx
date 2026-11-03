import { formatMoney } from '../utils/appFormat';
import { type FC } from 'react';
import { useAdminLang } from '../i18n/adminText';
import { LOAN_TABS_T } from '../i18n/loanTabsText';
import { fillText } from '../i18n/dashboardText';

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
    const t = LOAN_TABS_T[useAdminLang()];
    if (strategies.length === 0) {
        return (
            <div className="empty-state">
                <h3>{t.stratTitle}</h3>
                <p>{t.stratNone}</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="su-panel-title">{t.stratTitle}</h3>
            <p className="su-muted fin-lead">{t.stratLead}</p>

            <div className="fin-grid fin-section">
                {strategies.map((strategy, idx) => (
                    <article key={idx} className="gl-card">
                        <div className="gl-head">
                            <div className="gl-head-text">
                                <h3>{strategy.name}</h3>
                            </div>
                            <span className="gl-pill">{strategy.method === 'snowball' ? t.pillSnowball : t.pillAvalanche}</span>
                        </div>

                        <p className="su-muted">{strategy.description}</p>

                        <div className="gl-kv">
                            <div><span>{t.timeToClear}</span><span>{strategy.timeToPayoff} {t.monthsSuffix}</span></div>
                            <div><span>{t.interestSaved}</span><span>{formatMoney(strategy.totalInterestSaved, 2)}</span></div>
                        </div>

                        <div>
                            <h4 className="fin-sub-title">{t.paymentOrder}</h4>
                            <ol className="fin-list">
                                {strategy.schedule.map((item, i) => (
                                    <li key={i}>
                                        {fillText(t.paymentLine, { type: item.loanType, amount: formatMoney(item.paymentAmount, 2) })}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="gl-actions">
                            <button
                                onClick={() => onSelectStrategy?.(strategy.method)}
                                className="btn-primary btn-sm"
                            >
                                {fillText(t.chooseBtn, { name: strategy.name })}
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            <div className="fin-stack">
                <div className="gl-insight">
                    <div>
                        <h4>{t.snowTitle}</h4>
                        <p>{t.snowText}</p>
                    </div>
                </div>
                <div className="gl-insight">
                    <div>
                        <h4>{t.avalTitle}</h4>
                        <p>{t.avalText}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtPayoffStrategies;
