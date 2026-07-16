import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { IconDollarSign, IconBarChart, IconActivity, IconAlertTriangle, IconCheckCircle, IconTarget, IconBell, IconTrendingUp, IconTrendingDown, IconLightbulb } from '../components/Icons';

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
import { SpendingTrends } from '../components/SpendingTrends';

export const SmartBudgetsPage = () => {
    const navigate = useNavigate();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [activeTab, setActiveTab] = useState<'tracker' | 'planner'>('tracker');
    const [loading, setLoading] = useState(true);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalAllocated, setTotalAllocated] = useState(0);
    const [overBudgetCount, setOverBudgetCount] = useState(0);

    // Edit Modal State
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [editAmount, setEditAmount] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // Add New Category State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryAmount, setNewCategoryAmount] = useState('');
    const [isAdding, setIsAdding] = useState(false);

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
            setBudgets([]);
            setTotalIncome(0);
            calculateTotals([]);
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

    const handleOptimizeBudget = (category: string) => {
        navigate('/recommendations');
    };

    const handleSetAlert = (category: string) => {
        navigate('/notifications');
    };

    const handleEditClick = (budget: Budget) => {
        setEditingBudget(budget);
        setEditAmount(budget.allocatedAmount.toString());
    };

    const handleSaveBudget = async () => {
        if (!editingBudget || !editingBudget._id) return;
        const amount = parseInt(editAmount);
        if (isNaN(amount) || amount < 0) return;

        setIsSaving(true);
        try {
            await apiClient.put(`/budgets/${editingBudget._id}`, { allocatedAmount: amount });
            setEditingBudget(null);
            fetchBudgets(); // Refresh data to update progress bars
        } catch (error) {
            console.error('Failed to update budget:', error);
            alert('Failed to update budget. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(newCategoryAmount);
        if (!newCategoryName.trim() || isNaN(amount) || amount < 0) return;

        setIsAdding(true);
        try {
            await apiClient.post('/budgets', { category: newCategoryName.trim(), allocatedAmount: amount });
            setNewCategoryName('');
            setNewCategoryAmount('');
            fetchBudgets(); // Refresh to show new category
        } catch (error: any) {
            console.error('Failed to add category:', error);
            alert(error.response?.data?.error || 'Failed to add category. Please try again.');
        } finally {
            setIsAdding(false);
        }
    };

    const chartData = budgets.map((b) => ({ category: b.category, value: b.spentAmount }));

    if (loading) {
        return <div className="loading-spinner">Loading smart budgets...</div>;
    }

    return (
        <div className="page-container smart-budgets-page">

            {/* Tabs Header */}
            <div className="rec-filters" style={{ marginBottom: '32px' }}>
                <button 
                    className={`rec-filter-btn ${activeTab === 'tracker' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tracker')}
                >
                    Budget Tracker
                </button>
                <button 
                    className={`rec-filter-btn ${activeTab === 'planner' ? 'active' : ''}`}
                    onClick={() => setActiveTab('planner')}
                >
                    Budget Planner
                </button>
            </div>

            {activeTab === 'tracker' && (
                <>
                    {/* Spending Trends Charts */}
            <SpendingTrends />

            {/* Budget Summary */}
            <div className="budget-summary">
                <div className="summary-card">
                    <div className="summary-icon"><IconDollarSign size={24} /></div>
                    <div className="summary-content">
                        <h3 className="metric-value">LKR {totalIncome.toLocaleString()}</h3>
                        <p className="metric-label">Monthly Income</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon"><IconBarChart size={24} /></div>
                    <div className="summary-content">
                        <h3 className="metric-value">LKR {totalAllocated.toLocaleString()}</h3>
                        <p className="metric-label">Total Budgeted</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon"><IconActivity size={24} /></div>
                    <div className="summary-content">
                        <h3 className="metric-value">{Math.round((totalAllocated / totalIncome) * 100)}%</h3>
                        <p className="metric-label">Income Allocated</p>
                    </div>
                </div>
                <div className="summary-card warning">
                    <div className="summary-icon"><IconAlertTriangle size={24} /></div>
                    <div className="summary-content">
                        <h3 className="metric-value">{overBudgetCount}</h3>
                        <p className="metric-label">Over Budget Categories</p>
                    </div>
                </div>
            </div>

            {/* AI Budget Insights */}
            <div className="card ai-insights">
                <h3 className="section-title">AI Budget Insights</h3>
                <div className="insights-grid">
                    {budgets.filter(b => b.isOverBudget).length > 0 ? (
                        budgets.filter(b => b.isOverBudget).slice(0, 1).map((budget, idx) => (
                            <div key={`critical-${idx}`} className="insight-item critical">
                                <span className="insight-icon" style={{ display: 'flex', alignItems: 'center' }}><IconAlertTriangle size={20} /></span>
                                <div className="insight-content">
                                    <h4>Critical: {budget.category} Overspend</h4>
                                    <p>{budget.aiRecommendation}</p>
                                </div>
                                <button className="action-btn danger" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/recommendations')}>
                                    <IconTarget size={16} /> Fix Now
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="insight-item critical" style={{ opacity: 0.5 }}>
                            <span className="insight-icon" style={{ display: 'flex', alignItems: 'center' }}><IconCheckCircle size={20} /></span>
                            <div className="insight-content">
                                <h4>No Critical Overspending</h4>
                                <p>You have no categories currently over budget. Great job!</p>
                            </div>
                        </div>
                    )}
                    
                    {budgets.filter(b => !b.isOverBudget && b.percentageUsed < 80).length > 0 ? (
                        budgets.filter(b => !b.isOverBudget && b.percentageUsed < 80).slice(0, 1).map((budget, idx) => (
                            <div key={`success-${idx}`} className="insight-item success">
                                <span className="insight-icon" style={{ display: 'flex', alignItems: 'center' }}><IconCheckCircle size={20} /></span>
                                <div className="insight-content">
                                    <h4>Good: {budget.category} Control</h4>
                                    <p>{budget.aiRecommendation}</p>
                                </div>
                                <button className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/')}>
                                    <IconTrendingUp size={16} /> View Details
                                </button>
                            </div>
                        ))
                    ) : null}
                </div>
            </div>

            {/* Budget Categories */}
            <div className="budgets-list">
                {budgets.map((budget) => (
                    <div key={budget._id} className={`budget-card ${budget.isOverBudget ? 'over-budget' : ''}`}>
                        <div className="budget-header">
                            <h4 className="section-title">{budget.category}</h4>
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
                                <span className={`trend ${budget.trends.change > 0 ? 'up' : 'down'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {budget.trends.change > 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
                                    {Math.abs(budget.trends.change).toFixed(1)}% vs last month
                                </span>
                            </div>
                        </div>

                        <div className="ai-recommendation">
                            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconLightbulb size={16} /> <strong>AI Recommendation:</strong> {budget.aiRecommendation}</p>
                        </div>

                        <div className="budget-actions">
                            <button
                                className="action-btn primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => handleOptimizeBudget(budget.category)}
                            >
                                <IconTarget size={16} /> Optimize
                            </button>
                            <button
                                className="action-btn secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => handleSetAlert(budget.category)}
                            >
                                <IconBell size={16} /> Set Alert
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            </>
            )}

            {activeTab === 'planner' && (
                <div className="planner-tab-content">
                    <h3 className="section-title">The Big Picture</h3>
                    <div className="budget-summary" style={{ marginBottom: '32px' }}>
                        <div className="summary-card">
                            <div className="summary-icon"><IconDollarSign size={24} /></div>
                            <div className="summary-content">
                                <h3 className="metric-value">LKR {totalIncome.toLocaleString()}</h3>
                                <p className="metric-label">Total Income</p>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon"><IconBarChart size={24} /></div>
                            <div className="summary-content">
                                <h3 className="metric-value">LKR {totalAllocated.toLocaleString()}</h3>
                                <p className="metric-label">Total Allocated</p>
                            </div>
                        </div>
                        <div className={`summary-card ${(totalIncome - totalAllocated) < 0 ? 'warning' : ''}`}>
                            <div className="summary-icon">
                                {(totalIncome - totalAllocated) < 0 ? <IconAlertTriangle size={24} /> : <IconCheckCircle size={24} />}
                            </div>
                            <div className="summary-content">
                                <h3 className="metric-value" style={{ color: (totalIncome - totalAllocated) < 0 ? 'var(--danger)' : 'var(--success)' }}>
                                    LKR {(totalIncome - totalAllocated).toLocaleString()}
                                </h3>
                                <p className="metric-label">Unallocated Cash</p>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: '32px' }}>
                        <h3 className="section-title">Add New Category</h3>
                        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. Vacation, Gifts" 
                                    value={newCategoryName} 
                                    onChange={(e) => setNewCategoryName(e.target.value)} 
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Budget Limit (LKR)</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    placeholder="0" 
                                    value={newCategoryAmount} 
                                    onChange={(e) => setNewCategoryAmount(e.target.value)} 
                                />
                            </div>
                            <button type="submit" className="action-btn primary" disabled={isAdding} style={{ height: '42px', padding: '0 24px' }}>
                                {isAdding ? 'Adding...' : 'Add Budget'}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <h3 className="section-title">Manage Allocations</h3>
                        <div className="insights-grid">
                            {budgets.map(budget => (
                                <div key={`manage-${budget._id}`} className="insight-item">
                                    <span className="insight-icon" style={{ display: 'flex', alignItems: 'center' }}><IconTarget size={20} /></span>
                                    <div className="insight-content">
                                        <h4>{budget.category}</h4>
                                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Limit: LKR {budget.allocatedAmount.toLocaleString()}</p>
                                    </div>
                                    <button className="action-btn secondary" onClick={() => handleEditClick(budget)}>
                                        Edit Limit
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Budget Modal */}
            {editingBudget && (
                <div className="modal-overlay" onClick={() => setEditingBudget(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Budget: {editingBudget.category}</h2>
                            <button className="modal-close" onClick={() => setEditingBudget(null)}>×</button>
                        </div>
                        
                        <div className="modal-body" style={{ marginTop: '16px' }}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Budget Limit (LKR)</label>
                                <input 
                                    type="number" 
                                    className="form-input"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '16px' }}
                                />
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    Currently spent: LKR {editingBudget.spentAmount.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button 
                                className="action-btn secondary" 
                                onClick={() => setEditingBudget(null)}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                className="action-btn primary" 
                                onClick={handleSaveBudget}
                                disabled={isSaving || !editAmount}
                            >
                                {isSaving ? 'Saving...' : 'Save Limit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};