import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

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
                    <span className="bar-value">LKR {d.value.toLocaleString()}</span>
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

export const SpendingTrends = () => {
    const [chartData, setChartData] = useState<{ category: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await apiClient.get('/budgets/smart');
                const budgets = response.data.budgets || [];
                setChartData(budgets.map((b: any) => ({ category: b.category, value: b.spentAmount })));
            } catch (error) {
                console.error('Failed to fetch budgets for trends:', error);
                // Mock data fallback if API fails
                setChartData([
                    { category: 'Food & Dining', value: 28500 },
                    { category: 'Entertainment', value: 42800 },
                    { category: 'Transportation', value: 9800 },
                    { category: 'Shopping', value: 16500 },
                    { category: 'Utilities', value: 7200 }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchBudgets();
    }, []);

    if (loading) return null;

    return (
        <div className="card" style={{ padding: '1.75rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 className="section-title">Spending Trends</h3>
            <div className="charts-grid">
                <BarChart data={chartData} />
                <PieChart data={chartData} />
            </div>
        </div>
    );
};
