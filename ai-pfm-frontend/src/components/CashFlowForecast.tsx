import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface CashFlowData {
    date: string;
    balance: number;
    predicted: boolean;
}

type TimeRange = '1W' | '1M' | '3M';

export const CashFlowForecast = () => {
    const [forecastData, setForecastData] = useState<CashFlowData[]>([]);
    const [loading, setLoading] = useState(true);
    const [daysToZero, setDaysToZero] = useState<number | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');
    const [allData, setAllData] = useState<CashFlowData[]>([]);

    useEffect(() => {
        const fetchForecastData = async () => {
            try {
                const response = await apiClient.get('/transactions/forecast');
                const apiForecast = Array.isArray(response.data?.forecast) ? response.data.forecast : [];
                const mapped = apiForecast.map((day: any) => ({
                    date: day.date,
                    balance: Number(day.balance ?? day.predictedBalance ?? 0),
                    predicted: Boolean(day.predicted ?? true)
                }));
                setAllData(mapped);
                setDaysToZero(Number.isFinite(response.data?.daysToZero) ? response.data.daysToZero : null);
            } catch (err) {
                console.error("Error fetching forecast data:", err);
                setAllData([]);
                setDaysToZero(null);
            } finally {
                setLoading(false);
            }
        };
        fetchForecastData();
    }, []);



    // Filter data by time range
    useEffect(() => {
        if (!allData.length) return;
        const days = timeRange === '1W' ? 14 : timeRange === '1M' ? 38 : allData.length;
        setForecastData(allData.slice(0, days));
    }, [allData, timeRange]);

    const maxBalance = Math.max(...forecastData.map(d => d.balance), 1);
    const minBalance = Math.min(...forecastData.map(d => d.balance), 0);
    const range = Math.max(maxBalance - minBalance, 1);

    const getPoint = (index: number, balance: number) => {
        const x = forecastData.length > 1 ? (index / (forecastData.length - 1)) * 96 + 2 : 50;
        const y = 88 - ((balance - minBalance) / range) * 76;
        return { x, y };
    };

    const buildPath = (predicted: boolean) => {
        const pts = forecastData.filter(d => d.predicted === predicted);
        if (!pts.length) return '';
        // Find smooth curve via catmull-rom approximation
        let path = '';
        pts.forEach((point, i) => {
            const idx = forecastData.indexOf(point);
            const { x, y } = getPoint(idx, point.balance);
            if (i === 0) {
                path += `M ${x} ${y}`;
            } else {
                const prevIdx = forecastData.indexOf(pts[i - 1]);
                const prev = getPoint(prevIdx, pts[i - 1].balance);
                const cpX = (prev.x + x) / 2;
                path += ` C ${cpX} ${prev.y} ${cpX} ${y} ${x} ${y}`;
            }
        });
        return path;
    };

    const buildArea = (predicted: boolean) => {
        const pts = forecastData.filter(d => d.predicted === predicted);
        if (pts.length < 2) return '';
        const first = getPoint(forecastData.indexOf(pts[0]), pts[0].balance);
        const last = getPoint(forecastData.indexOf(pts[pts.length - 1]), pts[pts.length - 1].balance);
        const line = buildPath(predicted);
        return `${line} L ${last.x} 88 L ${first.x} 88 Z`;
    };

    const zeroY = 88 - ((0 - minBalance) / range) * 76;
    const currentBalance = forecastData.find(d => !d.predicted)?.balance;

    if (loading) {
        return (
            <div className="card forecast-card" style={{ padding: '1.75rem' }}>
                <div className="loading-spinner">Loading forecast…</div>
            </div>
        );
    }

    return (
        <div className="card forecast-card" style={{ padding: '1.75rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="ds-card-icon" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#06b6d4' }}>
                        📈
                    </div>
                    <div>
                        <div className="ds-card-title">Cash Flow Forecast</div>
                        {currentBalance !== undefined && (
                            <div className="ds-card-subtitle">
                                Current balance: <strong style={{ color: 'var(--color-text)' }}>
                                    Rs. {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(currentBalance)}
                                </strong>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {daysToZero && daysToZero > 0 && (
                        <div className={`forecast-alert ${daysToZero <= 14 ? 'critical' : 'warning'}`}>
                            ⚠️ Balance hits zero in <strong style={{ marginLeft: 4 }}>{daysToZero}d</strong>
                        </div>
                    )}
                    {/* Time range selector */}
                    <div className="forecast-time-selector">
                        {(['1W', '1M', '3M'] as TimeRange[]).map(r => (
                            <button
                                key={r}
                                className={`time-btn ${timeRange === r ? 'active' : ''}`}
                                onClick={() => setTimeRange(r)}
                                aria-pressed={timeRange === r}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="forecast-chart">
                <svg viewBox="0 0 100 90" className="forecast-svg" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                        <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                        </linearGradient>
                        <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[20, 40, 60, 80].map(y => (
                        <line key={y} x1="2" y1={y} x2="98" y2={y}
                            stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                    ))}

                    {/* Zero line */}
                    {zeroY >= 10 && zeroY <= 88 && (
                        <line x1="2" y1={zeroY} x2="98" y2={zeroY}
                            stroke="#ef4444" strokeWidth="0.6" strokeDasharray="3,2" opacity={0.6} />
                    )}

                    {/* Area fills */}
                    <path d={buildArea(false)} fill="url(#histGrad)" opacity={0.8} />
                    <path d={buildArea(true)} fill="url(#predGrad)" opacity={0.8} />

                    {/* Lines */}
                    <path d={buildPath(false)} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    <path d={buildPath(true)} fill="none" stroke="#f59e0b" strokeWidth="2"
                        strokeDasharray="4,3" strokeLinecap="round" />

                    {/* Current-day dot */}
                    {forecastData.length > 0 && (() => {
                        const todayIdx = forecastData.reduce((best, d, i) => !d.predicted ? i : best, 0);
                        if (todayIdx < 0) return null;
                        const { x, y } = getPoint(todayIdx, forecastData[todayIdx].balance);
                        return <circle cx={x} cy={y} r="2" fill="#10b981" stroke="white" strokeWidth="0.8" />;
                    })()}
                </svg>
            </div>

            {/* Legend */}
            <div className="forecast-legend">
                <div className="legend-item">
                    <div className="legend-color historical" style={{ width: 20, height: 3, background: '#10b981', borderRadius: 2 }} />
                    <span>Historical</span>
                </div>
                <div className="legend-item">
                    <div style={{ width: 20, height: 3, borderTop: '2px dashed #f59e0b' }} />
                    <span>Predicted</span>
                </div>
                <div className="legend-item">
                    <div style={{ width: 20, height: 2, background: '#ef4444', opacity: 0.6 }} />
                    <span>Zero Balance</span>
                </div>
            </div>
        </div>
    );
};