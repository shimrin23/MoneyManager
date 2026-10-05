import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const DEFAULT_TRENDS = [
    { category: 'Food & Dining', value: 28500 },
    { category: 'Shopping', value: 16500 },
    { category: 'Transport', value: 9800 },
    { category: 'Entertainment', value: 12000 },
    { category: 'Utilities', value: 7500 },
];

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
            className="card" 
            style={{ 
                padding: '1.75rem', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                ...({ '&:hover': { transform: 'scale(1.01)' } } as any)
            }}
            onClick={() => navigate('/smart-budgets')}
            title="View smart budgets"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="section-title" style={{ margin: 0 }}>Spending Trends</h3>
                {isDemo && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                        Sample Preview
                    </span>
                )}
            </div>
            <div className="charts-grid">
                <BarChart data={chartData} />
                <PieChart data={chartData} />
            </div>
        </div>
    );
};
