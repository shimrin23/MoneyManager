import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface CashFlowData {
    date: string;
    balance: number;
    predicted: boolean;
}

export const CashFlowForecast = () => {
    const [forecastData, setForecastData] = useState<CashFlowData[]>([]);
    const [loading, setLoading] = useState(true);
    const [daysToZero, setDaysToZero] = useState<number | null>(null);

    useEffect(() => {
        const fetchForecastData = async () => {
            try {
                const response = await apiClient.get('/transactions/forecast');
                const apiForecast = Array.isArray(response.data?.forecast) ? response.data.forecast : [];
                setForecastData(apiForecast.map((day: any) => ({
                    date: day.date,
                    balance: Number(day.balance ?? day.predictedBalance ?? 0),
                    predicted: Boolean(day.predicted ?? true)
                })));
                setDaysToZero(Number.isFinite(response.data?.daysToZero) ? response.data.daysToZero : null);
            } catch (error) {
                console.error('Failed to fetch forecast data:', error);
                // Mock data for demo
                generateMockForecast();
            } finally {
                setLoading(false);
            }
        };

        fetchForecastData();
    }, []);

    const generateMockForecast = () => {
        const today = new Date();
        const data: CashFlowData[] = [];
        let balance = 125000; // Starting balance
        const dailySpend = 4500; // Average daily spending

        // Historical data (7 days)
        for (let i = -7; i <= 0; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            data.push({
                date: date.toISOString().split('T')[0],
                balance: balance + (i * dailySpend * 0.8), // Slight variation
                predicted: false
            });
        }

        // Forecast data (30 days)
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            balance -= dailySpend;
            data.push({
                date: date.toISOString().split('T')[0],
                balance: Math.max(0, balance),
                predicted: true
            });
        }

        setForecastData(data);
        setDaysToZero(Math.ceil(125000 / dailySpend)); // Days until zero
    };

    const maxBalance = Math.max(...forecastData.map(d => d.balance));
    const minBalance = Math.min(...forecastData.map(d => d.balance));

    const getPointPosition = (index: number, balance: number) => {
        const denominator = Math.max(maxBalance - minBalance, 1);
        const x = forecastData.length > 1 ? (index / (forecastData.length - 1)) * 100 : 50;
        const y = 100 - ((balance - minBalance) / denominator) * 80;
        return { x, y };
    };

    const createPathData = (predicted: boolean) => {
        const relevantData = forecastData.filter(d => d.predicted === predicted);
        if (relevantData.length === 0) return '';

        let path = '';
        relevantData.forEach((point, index) => {
            const actualIndex = forecastData.indexOf(point);
            const { x, y } = getPointPosition(actualIndex, point.balance);
            path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        });
        return path;
    };

    if (loading) {
        return (
            <div className="card forecast-card">
                <div className="loading-spinner">Loading forecast...</div>
            </div>
        );
    }

    return (
        <div className="card forecast-card">
            <div className="forecast-header">
                <h3>💹 Cash Flow Forecast</h3>
                {daysToZero && daysToZero > 0 && (
                    <div className={`forecast-alert ${daysToZero <= 14 ? 'critical' : 'warning'}`}>
                        ⚠️ Balance hits zero in {daysToZero} days
                    </div>
                )}
            </div>

            <div className="forecast-chart">
                <svg viewBox="0 0 100 100" className="forecast-svg">
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />

                    {/* Zero line */}
                    <line
                        x1="0"
                        y1={100 - ((-minBalance) / Math.max(maxBalance - minBalance, 1)) * 80}
                        x2="100"
                        y2={100 - ((-minBalance) / Math.max(maxBalance - minBalance, 1)) * 80}
                        stroke="#ef4444"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                    />

                    {/* Historical line */}
                    <path
                        d={createPathData(false)}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                    />

                    {/* Predicted line */}
                    <path
                        d={createPathData(true)}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                    />

                    {/* Data points */}
                    {forecastData.map((point, index) => {
                        const { x, y } = getPointPosition(index, point.balance);
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="1"
                                fill={point.predicted ? "#f59e0b" : "#10b981"}
                            />
                        );
                    })}
                </svg>
            </div>

            <div className="forecast-legend">
                <div className="legend-item">
                    <div className="legend-color historical"></div>
                    <span>Historical</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color predicted"></div>
                    <span>Predicted</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color zero-line"></div>
                    <span>Zero Balance</span>
                </div>
            </div>
        </div>
    );
};