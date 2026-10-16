import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

type Confidence = 'low' | 'medium' | 'high';
type Trend = 'up' | 'down' | 'flat';

interface Range {
    projected: number;
    low: number;
    high: number;
}

interface CategoryForecast {
    category: string;
    projected: number;
    lastMonth: number;
    changePct: number | null;
    trend: Trend;
}

interface HistoryPoint {
    month: string;
    income: number;
    expenses: number;
}

interface Forecast {
    month: string;
    generatedAt: string;
    income: Range;
    expenses: Range & { fixed: number; variable: number };
    netSavings: Range;
    byCategory: CategoryForecast[];
    history: HistoryPoint[];
    confidence: Confidence;
    monthsOfData: number;
    notes: string[];
}

const formatAmount = (n: number) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 0 });

const formatMonth = (key: string, style: 'short' | 'long' = 'short') => {
    const [year, month] = key.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleString(undefined, {
        month: style,
        year: style === 'long' ? 'numeric' : undefined,
        timeZone: 'UTC'
    });
};

const TREND_ICON: Record<Trend, string> = { up: '▲', down: '▼', flat: '▬' };

const ForecastChart = ({ history, projected, month }: {
    history: HistoryPoint[];
    projected: HistoryPoint;
    month: string;
}) => {
    const points = [...history.map(h => ({ ...h, isForecast: false })), { ...projected, isForecast: true }];
    const width = 640;
    const height = 260;
    const pad = { top: 16, right: 12, bottom: 32, left: 12 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const max = Math.max(1, ...points.flatMap(p => [p.income, p.expenses]));
    const groupW = plotW / points.length;
    const barW = Math.min(26, groupW / 2.6);

    return (
        <svg
            className="forecast-chart"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Income and expenses for the last ${history.length} months and forecast for ${formatMonth(month, 'long')}`}
        >
            <line x1={pad.left} x2={width - pad.right} y1={pad.top + plotH} y2={pad.top + plotH} className="forecast-axis" />
            {points.map((p, i) => {
                const cx = pad.left + groupW * i + groupW / 2;
                const incomeH = (p.income / max) * plotH;
                const expenseH = (p.expenses / max) * plotH;
                const cls = p.isForecast ? ' forecast-bar-projected' : '';
                return (
                    <g key={p.month}>
                        <rect
                            x={cx - barW - 1}
                            y={pad.top + plotH - incomeH}
                            width={barW}
                            height={incomeH}
                            rx={3}
                            className={`forecast-bar forecast-bar-income${cls}`}
                        >
                            <title>{`${formatMonth(p.month)} income: ${formatAmount(p.income)}`}</title>
                        </rect>
                        <rect
                            x={cx + 1}
                            y={pad.top + plotH - expenseH}
                            width={barW}
                            height={expenseH}
                            rx={3}
                            className={`forecast-bar forecast-bar-expense${cls}`}
                        >
                            <title>{`${formatMonth(p.month)} expenses: ${formatAmount(p.expenses)}`}</title>
                        </rect>
                        <text
                            x={cx}
                            y={height - 10}
                            textAnchor="middle"
                            className={`forecast-axis-label${p.isForecast ? ' forecast-axis-label-projected' : ''}`}
                        >
                            {formatMonth(p.month)}{p.isForecast ? '*' : ''}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

export const ForecastPage = () => {
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/analytics/forecast');
            setForecast(response.data.forecast);
        } catch (err) {
            console.error('Error fetching forecast:', err);
            setError('We could not generate your forecast. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) return <div className="loading">Forecasting next month...</div>;

    if (error || !forecast) {
        return (
            <div className="page-container forecast-page">
                <div className="card forecast-empty">
                    <h3>Forecast unavailable</h3>
                    <p>{error ?? 'No forecast data was returned.'}</p>
                    <button className="btn-primary" onClick={load}>Retry</button>
                </div>
            </div>
        );
    }

    const monthLabel = formatMonth(forecast.month, 'long');
    const hasHistory = forecast.monthsOfData > 0;
    const netPositive = forecast.netSavings.projected >= 0;

    const summaryCards: Array<{ key: string; label: string; range: Range; tone: string }> = [
        { key: 'income', label: 'Projected Income', range: forecast.income, tone: 'positive' },
        { key: 'expenses', label: 'Projected Expenses', range: forecast.expenses, tone: 'neutral' },
        { key: 'net', label: 'Projected Net Savings', range: forecast.netSavings, tone: netPositive ? 'positive' : 'negative' }
    ];

    return (
        <div className="page-container forecast-page">
            <div className="page-header">
                <div>
                    <h1>Forecast</h1>
                    <p className="page-subtitle">What to expect in {monthLabel}, based on your recent history</p>
                </div>
                <span className={`forecast-confidence forecast-confidence-${forecast.confidence}`}>
                    {forecast.confidence.charAt(0).toUpperCase() + forecast.confidence.slice(1)} confidence
                </span>
            </div>

            <div className="forecast-summary">
                {summaryCards.map(card => (
                    <div key={card.key} className={`card forecast-summary-card ${card.tone}`}>
                        <span className="forecast-summary-label">{card.label}</span>
                        <span className="forecast-summary-value">{formatAmount(card.range.projected)}</span>
                        <span className="forecast-summary-range">
                            Likely range {formatAmount(card.range.low)} to {formatAmount(card.range.high)}
                        </span>
                    </div>
                ))}
            </div>

            {!hasHistory ? (
                <div className="card forecast-empty">
                    <h3>Not enough data yet</h3>
                    <p>Add or sync transactions to enable forecasting.</p>
                </div>
            ) : (
                <>
                    <div className="card forecast-chart-card">
                        <h3>Income vs. expenses</h3>
                        <div className="forecast-legend">
                            <span><i className="forecast-swatch forecast-bar-income" /> Income</span>
                            <span><i className="forecast-swatch forecast-bar-expense" /> Expenses</span>
                            <span className="forecast-legend-note">* {monthLabel} forecast</span>
                        </div>
                        <ForecastChart
                            history={forecast.history}
                            month={forecast.month}
                            projected={{
                                month: forecast.month,
                                income: forecast.income.projected,
                                expenses: forecast.expenses.projected
                            }}
                        />
                        <p className="forecast-chart-footnote">
                            Expenses include {formatAmount(forecast.expenses.fixed)} of known fixed costs
                            (subscriptions, loan installments, card minimums) and {formatAmount(forecast.expenses.variable)} of variable spending.
                        </p>
                    </div>

                    <div className="card forecast-categories-card">
                        <h3>By category</h3>
                        {forecast.byCategory.length === 0 ? (
                            <p className="forecast-muted">No expense categories to show.</p>
                        ) : (
                            <div className="forecast-table-wrap">
                                <table className="forecast-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th className="num">Last month</th>
                                            <th className="num">Forecast</th>
                                            <th className="num">Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forecast.byCategory.map(c => (
                                            <tr key={c.category}>
                                                <td>{c.category}</td>
                                                <td className="num">{formatAmount(c.lastMonth)}</td>
                                                <td className="num">{formatAmount(c.projected)}</td>
                                                <td className={`num forecast-trend forecast-trend-${c.trend}`}>
                                                    <span aria-hidden="true">{TREND_ICON[c.trend]}</span>{' '}
                                                    {c.changePct === null ? 'New' : `${c.changePct > 0 ? '+' : ''}${c.changePct.toFixed(0)}%`}
                                                    <span className="sr-only"> ({c.trend})</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {forecast.notes.length > 0 && (
                <div className="card forecast-notes-card">
                    <h3>Notes</h3>
                    <ul>
                        {forecast.notes.map((note, i) => <li key={i}>{note}</li>)}
                    </ul>
                    <p className="forecast-muted">
                        Based on {forecast.monthsOfData} month{forecast.monthsOfData === 1 ? '' : 's'} of history.
                        Forecasts are estimates, not guarantees.
                    </p>
                </div>
            )}
        </div>
    );
};
