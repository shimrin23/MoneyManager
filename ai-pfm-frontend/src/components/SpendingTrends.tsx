import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { formatMoney } from '../utils/appFormat';

export const BarChart = ({ data }: { data: { category: string; value: number }[] }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bar-chart">
            {data.map((d) => (
                <div key={d.category} className="bar-row">
                    <span className="bar-label">{d.category}</span>
                    <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(d.value / max) * 100}%` }} />
                    </div>
                    <span className="bar-value">{formatMoney(d.value)}</span>
                </div>
            ))}
        </div>
    );
};

const pieColors = ['#6ee7b7', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#34d399'];

export const PieChart = ({ data }: { data: { category: string; value: number }[] }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    let cumulative = 0;
    const segments = data.map((d) => {
        const start = cumulative;
        cumulative += d.value / total * 100;
        const end = cumulative;
        return { category: d.category, start, end };
    });

    const gradient = segments
        .map((seg, idx) => `${pieColors[idx % pieColors.length]} ${seg.start}% ${seg.end}%`)
        .join(', ');

    return (
        <div className="pie-chart">
            <div className="pie" style={{ background: `conic-gradient(${gradient})` }} />
            <div className="pie-legend">
                {segments.map((s, idx) => (
                    <div key={s.category} className="legend-row">
                        <span className="legend-swatch" style={{ background: pieColors[idx % pieColors.length] }} />
                        <span>{s.category}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DEFAULT_TRENDS = [
    { category: 'Food & Dining', value: 28500 },
    { category: 'Shopping', value: 16500 },
    { category: 'Transport', value: 9800 },
    { category: 'Entertainment', value: 12000 },
    { category: 'Utilities', value: 7500 },
];

// Line chart of spending by category (the Bar and Pie charts are above)
export const LineChart = ({ data }: { data: { category: string; value: number }[] }) => {
    const width = 400;
    const height = 200;
    const pad = 28;
    const max = Math.max(...data.map(d => d.value), 1);
    const step = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0;
    const points = data.map((d, i) => ({
        ...d,
        x: pad + i * step,
        y: height - pad - (d.value / max) * (height - pad * 2)
    }));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    return (
        <div className="line-chart" style={{ width: '100%' }}>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Spending by category, line chart">
                <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="currentColor" strokeOpacity={0.2} />
                <path d={path} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" />
                {points.map(p => (
                    <g key={p.category}>
                        <circle cx={p.x} cy={p.y} r={4} fill="#6366f1">
                            <title>{`${p.category}: ${formatMoney(p.value)}`}</title>
                        </circle>
                        <text x={p.x} y={height - 8} textAnchor="middle" fontSize="9" fill="currentColor">{p.category}</text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export const SpendingTrends = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState<{ category: string; value: number }[]>(DEFAULT_TRENDS);
    const [isDemo, setIsDemo] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await apiClient.get('/transactions');
                const transactions = response.data?.data || [];
                
                // Group expenses by category
                const expensesByCategory: Record<string, number> = {};
                transactions.forEach((t: any) => {
                    if (t.type === 'expense') {
                        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + (Number(t.amount) || 0);
                    }
                });

                const chartDataFormatted = Object.entries(expensesByCategory).map(([category, value]) => ({
                    category,
                    value
                })).sort((a, b) => b.value - a.value);

                if (chartDataFormatted.length > 0) {
                    setChartData(chartDataFormatted);
                    setIsDemo(false);
                } else {
                    setChartData(DEFAULT_TRENDS);
                    setIsDemo(true);
                }
            } catch (error) {
                console.error('Failed to fetch transactions for trends:', error);
                setChartData(DEFAULT_TRENDS);
                setIsDemo(true);
            } finally {
                setLoading(false);
            }
        };
        fetchBudgets();
    }, []);

    if (loading) {
        return (
            <div className="card" style={{ padding: '1.75rem', height: '100%' }}>
                <h3 className="section-title">Spending Trends</h3>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Loading charts…
                </div>
            </div>
        );
    }

    return (
        <div
            className="card sp-card"
            style={{ padding: '1.75rem', height: '100%' }}
            onClick={() => navigate('/smart-budgets')}
            title="View smart budgets"
        >
            <div className="sp-head">
                <h3 className="section-title">Spending Trends</h3>
                {isDemo && <span className="sp-badge">Sample Preview</span>}
            </div>
            {/* Amounts per category on the left, share of spending on the right */}
            <div className="sp-body">
                <BarChart data={chartData} />
                <PieChart data={chartData} />
            </div>
        </div>
    );
};
