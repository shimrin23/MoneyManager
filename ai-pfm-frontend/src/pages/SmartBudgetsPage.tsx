import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface Budget {
    _id?: string;
    category: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    percentageUsed: number;
    aiRecommendation: string;
    isOverBudget: boolean;
    trends: {
        lastMonth: number;
        change: number;
    };
}

const BarChart = ({ data }: { data: { category: string; value: number }[] }) => {
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

const PieChart = ({ data }: { data: { category: string; value: number }[] }) => {
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

const pieColors = ['#6ee7b7', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#34d399'];

export const SmartBudgetsPage = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalAllocated, setTotalAllocated] = useState(0);
    const [overBudgetCount, setOverBudgetCount] = useState(0);

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await apiClient.get('/budgets/smart');
            setBudgets(response.data.budgets || []);
            setTotalIncome(response.data.income || 0);
            calculateTotals(response.data.budgets || []);
        } catch (error) {
            console.error('Failed to fetch budgets:', error);
            // Mock data for demo
            const mockBudgets: Budget[] = [
                {
                    _id: '1',
                    category: 'Food & Dining',
                    allocatedAmount: 25000,
                    spentAmount: 28500,
                    remainingAmount: -3500,
                    percentageUsed: 114,
                    aiRecommendation: 'Reduce restaurant visits by 2 times/week to get back on track',
                    isOverBudget: true,
                    trends: { lastMonth: 22000, change: 29.5 }
                },
                {
                    _id: '2',
                    category: 'Entertainment',
                    allocatedAmount: 15000,
                    spentAmount: 42800,
                    remainingAmount: -27800,
                    percentageUsed: 285,
                    aiRecommendation: 'CRITICAL: Entertainment spending is 185% over budget. Cancel non-essential subscriptions immediately',
                    isOverBudget: true,
                    trends: { lastMonth: 18000, change: 137.8 }
                },
                {
                    _id: '3',
                    category: 'Transportation',
                    allocatedAmount: 12000,
                    spentAmount: 9800,
                    remainingAmount: 2200,
                    percentageUsed: 82,
                    aiRecommendation: 'Good control! Consider carpooling to save more',
                    isOverBudget: false,
                    trends: { lastMonth: 11500, change: -14.8 }
                },
                {
                    _id: '4',
                    category: 'Shopping',
                    allocatedAmount: 20000,
                    spentAmount: 16500,
                    remainingAmount: 3500,
                    percentageUsed: 83,
                    aiRecommendation: 'On track. Review purchases before month-end',
                    isOverBudget: false,
                    trends: { lastMonth: 24000, change: -31.3 }
                },
                {
                    _id: '5',
                    category: 'Utilities',
                    allocatedAmount: 8000,
                    spentAmount: 7200,
                    remainingAmount: 800,
                    percentageUsed: 90,
                    aiRecommendation: 'Consistent spending. Consider energy-saving tips',
                    isOverBudget: false,
                    trends: { lastMonth: 7800, change: -7.7 }
                }
            ];
            setBudgets(mockBudgets);
            setTotalIncome(150000);
            calculateTotals(mockBudgets);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (budgetData: Budget[]) => {
        const totalAlloc = budgetData.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
        const overBudget = budgetData.filter(budget => budget.isOverBudget).length;
        setTotalAllocated(totalAlloc);
        setOverBudgetCount(overBudget);
    };

    const handleOptimizeBudget = async (category: string) => {
        try {
            await apiClient.post('/budgets/optimize', { category });
            // Refresh budgets
            fetchBudgets();
        } catch (error) {
            console.error('Failed to optimize budget:', error);
            alert(`Optimizing ${category} budget...`);
        }
    };

    const handleSetAlert = (category: string) => {
        alert(`Setting spending alert for ${category}...`);
    };

    const chartData = budgets.map((b) => ({ category: b.category, value: b.spentAmount }));

    if (loading) {
        return <div className="loading-spinner">Loading smart budgets...</div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🧠 Smart Budgets</h1>
                <p className="page-subtitle">AI-generated budgets based on your income and spending patterns</p>
            </div>

            {/* Spending Trends Charts */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3>📊 Spending Trends</h3>
                <div className="charts-grid">
                    <BarChart data={chartData} />
                    <PieChart data={chartData} />
                </div>
            </div>

            {/* Budget Summary */}
            <div className="budget-summary">
                <div className="summary-card">
                    <div className="summary-icon">💰</div>
                    <div className="summary-content">
                        <h3>LKR {totalIncome.toLocaleString()}</h3>
                        <p>Monthly Income</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📊</div>
                    <div className="summary-content">
                        <h3>LKR {totalAllocated.toLocaleString()}</h3>
                        <p>Total Budgeted</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⚖️</div>
                    <div className="summary-content">
                        <h3>{Math.round((totalAllocated / totalIncome) * 100)}%</h3>
                        <p>Income Allocated</p>
                    </div>
                </div>
                <div className="summary-card warning">
                    <div className="summary-icon">⚠️</div>
                    <div className="summary-content">
                        <h3>{overBudgetCount}</h3>
                        <p>Over Budget Categories</p>
                    </div>
                </div>
            </div>

            {/* AI Budget Insights */}
            <div className="card ai-insights">
                <h3>🤖 AI Budget Insights</h3>
                <div className="insights-grid">
                    <div className="insight-item critical">
                        <span className="insight-icon">🚨</span>
                        <div className="insight-content">
                            <h4>Critical: Entertainment Overspend</h4>
                            <p>You're spending 185% more than recommended on entertainment. This is your biggest budget leak.</p>
                        </div>
                        <button className="action-btn danger" onClick={() => handleOptimizeBudget('Entertainment')}>
                            🎯 Fix Now
                        </button>
                    </div>
                    <div className="insight-item success">
                        <span className="insight-icon">✅</span>
                        <div className="insight-content">
                            <h4>Good: Transportation Control</h4>
                            <p>You've reduced transportation costs by 15% this month. Keep it up!</p>
                        </div>
                        <button className="action-btn secondary">
                            📈 View Details
                        </button>
                    </div>
                </div>
            </div>

            {/* Budget Categories */}
            <div className="budgets-list">
                {budgets.map((budget) => (
                    <div key={budget._id} className={`budget-card ${budget.isOverBudget ? 'over-budget' : ''}`}>
                        <div className="budget-header">
                            <h4>{budget.category}</h4>
                            <div className="budget-status">
                                {budget.isOverBudget ? (
                                    <span className="status-badge danger">Over Budget</span>
                                ) : budget.percentageUsed > 80 ? (
                                    <span className="status-badge warning">Almost Full</span>
                                ) : (
                                    <span className="status-badge success">On Track</span>
                                )}
                            </div>
                        </div>

                        <div className="budget-progress">
                            <div className="progress-bar">
                                <div
                                    className={`progress-fill ${budget.isOverBudget ? 'over' : ''}`}
                                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                                ></div>
                                {budget.percentageUsed > 100 && (
                                    <div
                                        className="progress-overflow"
                                        style={{ width: `${budget.percentageUsed - 100}%` }}
                                    ></div>
                                )}
                            </div>
                            <div className="progress-text">
                                <span className="spent">LKR {budget.spentAmount.toLocaleString()}</span>
                                <span className="total">/ LKR {budget.allocatedAmount.toLocaleString()}</span>
                                <span className={`percentage ${budget.isOverBudget ? 'over' : ''}`}>
                                    {budget.percentageUsed}%
                                </span>
                            </div>
                        </div>

                        <div className="budget-details">
                            <div className="remaining">
                                <span className={budget.remainingAmount >= 0 ? 'positive' : 'negative'}>
                                    {budget.remainingAmount >= 0 ? 'Remaining' : 'Over by'}:
                                    LKR {Math.abs(budget.remainingAmount).toLocaleString()}
                                </span>
                            </div>
                            <div className="trends">
                                <span className={`trend ${budget.trends.change > 0 ? 'up' : 'down'}`}>
                                    {budget.trends.change > 0 ? '📈' : '📉'}
                                    {Math.abs(budget.trends.change).toFixed(1)}% vs last month
                                </span>
                            </div>
                        </div>

                        <div className="ai-recommendation">
                            <p>💡 <strong>AI Recommendation:</strong> {budget.aiRecommendation}</p>
                        </div>

                        <div className="budget-actions">
                            <button
                                className="action-btn primary"
                                onClick={() => handleOptimizeBudget(budget.category)}
                            >
                                🎯 Optimize
                            </button>
                            <button
                                className="action-btn secondary"
                                onClick={() => handleSetAlert(budget.category)}
                            >
                                🔔 Set Alert
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};