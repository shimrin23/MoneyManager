import { formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog } from '../utils/systemMessages';
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
    alertThreshold?: number | null;
    alertTriggered?: boolean;
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

    // Budget Alert Modal State
    const [alertBudget, setAlertBudget] = useState<Budget | null>(null);
    const [alertLevel, setAlertLevel] = useState<string>('80');
    const [isSavingAlert, setIsSavingAlert] = useState(false);

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

    // Opens Recommendations with tips for this budget's category
    const handleOptimizeBudget = (category: string) => {
        navigate('/recommendations', { state: { optimizeCategory: category } });
    };

    const handleSetAlert = (budget: Budget) => {
        setAlertBudget(budget);
        setAlertLevel(String(budget.alertThreshold ?? 80));
    };

    const handleSaveAlert = async (remove = false) => {
        if (!alertBudget?._id) return;
        const level = parseFloat(alertLevel);
        if (!remove && (isNaN(level) || level < 1 || level > 100)) {
            notify.warning('Please enter an alert level between 1 and 100 percent.');
            return;
        }

        setIsSavingAlert(true);
        try {
            await apiClient.patch(`/budgets/${alertBudget._id}/alert`, { alertThreshold: remove ? null : level });
            notify.success(remove
                ? `Alert removed for ${alertBudget.category}.`
                : `Alert set: you'll be warned when ${alertBudget.category} reaches ${level}%.`);
            setAlertBudget(null);
            fetchBudgets();
        } catch (error) {
            console.error('Failed to set budget alert:', error);
            notify.error(getApiErrorMessage(error, 'Failed to set the alert. Please try again.'));
        } finally {
            setIsSavingAlert(false);
        }
    };

    const handleDeleteBudget = async (budget: Budget) => {
        if (!budget._id) return;
        const confirmed = await confirmDialog({
            title: 'Delete budget?',
            message: `The ${budget.category} budget will be removed.`,
            confirmText: 'Delete',
            danger: true,
        });
        if (!confirmed) return;

        try {
            await apiClient.delete(`/budgets/${budget._id}`);
            notify.success(`${budget.category} budget deleted.`);
            fetchBudgets();
        } catch (error) {
            console.error('Failed to delete budget:', error);
            notify.error(getApiErrorMessage(error, 'Failed to delete budget. Please try again.'));
        }
    };

    const handleEditClick = (budget: Budget) => {
        setEditingBudget(budget);
        setEditAmount(String(fromLkr(budget.allocatedAmount)));
    };

    const handleSaveBudget = async () => {
        if (!editingBudget || !editingBudget._id) return;
        const amount = parseFloat(editAmount);
        if (isNaN(amount) || amount < 0) {
            notify.warning('Please enter a budget limit of 0 or more.');
            return;
        }

        setIsSaving(true);
        try {
            await apiClient.put(`/budgets/${editingBudget._id}`, { allocatedAmount: toLkr(amount) });
            notify.success(`${editingBudget.category} limit updated to ${formatMoney(toLkr(amount))}.`);
            setEditingBudget(null);
            fetchBudgets(); // Refresh data to update progress bars
        } catch (error) {
            console.error('Failed to update budget:', error);
            notify.error(getApiErrorMessage(error, 'Failed to update budget. Please try again.'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(newCategoryAmount);
        if (!newCategoryName.trim()) {
            notify.warning('Please enter a category name.');
            return;
        }
        if (isNaN(amount) || amount < 0) {
            notify.warning('Please enter a budget limit of 0 or more.');
            return;
        }

        setIsAdding(true);
        try {
            await apiClient.post('/budgets', { category: newCategoryName.trim(), allocatedAmount: toLkr(amount) });
            notify.success(`${newCategoryName.trim()} budget added.`);
            setNewCategoryName('');
            setNewCategoryAmount('');
            fetchBudgets(); // Refresh to show new category
        } catch (error) {
            console.error('Failed to add category:', error);
            notify.error(getApiErrorMessage(error, 'Failed to add category. Please try again.'));
        } finally {
            setIsAdding(false);
        }
    };

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
                        <h3 className="metric-value">{formatMoney(totalIncome)}</h3>
                        <p className="metric-label">{totalIncome > 0 ? 'Monthly Income' : 'No income recorded this month'}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon"><IconBarChart size={24} /></div>
                    <div className="summary-content">
                        <h3 className="metric-value">{formatMoney(totalAllocated)}</h3>
                        <p className="metric-label">Total Budgeted</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon"><IconActivity size={24} /></div>
                    <div className="summary-content">
                        <h3 className="metric-value">{totalIncome > 0 ? `${Math.round((totalAllocated / totalIncome) * 100)}%` : '—'}</h3>
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
                    {budgets.filter(b => b.alertTriggered).map((budget) => (
                        <div key={`alert-${budget._id}`} className="insight-item critical">
                            <span className="insight-icon" style={{ display: 'flex', alignItems: 'center' }}><IconBell size={20} /></span>
                            <div className="insight-content">
                                <h4>Budget Alert: {budget.category}</h4>
                                <p>You have used {budget.percentageUsed}% of your {budget.category} budget (alert set at {budget.alertThreshold}%).</p>
                            </div>
                        </div>
                    ))}

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
                                <span className="spent">{formatMoney(budget.spentAmount)}</span>
                                <span className="total">/ {formatMoney(budget.allocatedAmount)}</span>
                                <span className={`percentage ${budget.isOverBudget ? 'over' : ''}`}>
                                    {budget.percentageUsed}%
                                </span>
                            </div>
                        </div>

                        <div className="budget-details">
                            <div className="remaining">
                                <span className={budget.remainingAmount >= 0 ? 'positive' : 'negative'}>
                                    {budget.remainingAmount >= 0 ? 'Remaining' : 'Over by'}:
                                    {formatMoney(Math.abs(budget.remainingAmount))}
                                </span>
                            </div>
                            <div className="trends">
                                <span className={`trend ${budget.trends.change > 0 ? 'up' : 'down'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {budget.trends.change > 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
                                    {Math.abs(budget.trends.change).toFixed(1)}% vs last month
                                </span>
                            </div>
                            {budget.alertThreshold != null && (
                                <span className={`status-badge ${budget.alertTriggered ? 'danger' : 'warning'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <IconBell size={12} /> Alert at {budget.alertThreshold}%
                                </span>
                            )}
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
                                onClick={() => handleSetAlert(budget)}
                            >
                                <IconBell size={16} /> {budget.alertThreshold != null ? 'Edit Alert' : 'Set Alert'}
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
                                <h3 className="metric-value">{formatMoney(totalIncome)}</h3>
                                <p className="metric-label">Total Income</p>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon"><IconBarChart size={24} /></div>
                            <div className="summary-content">
                                <h3 className="metric-value">{formatMoney(totalAllocated)}</h3>
                                <p className="metric-label">Total Allocated</p>
                            </div>
                        </div>
                        <div className={`summary-card ${(totalIncome - totalAllocated) < 0 ? 'warning' : ''}`}>
                            <div className="summary-icon">
                                {(totalIncome - totalAllocated) < 0 ? <IconAlertTriangle size={24} /> : <IconCheckCircle size={24} />}
                            </div>
                            <div className="summary-content">
                                <h3 className="metric-value" style={{ color: (totalIncome - totalAllocated) < 0 ? 'var(--danger)' : 'var(--success)' }}>
                                    {formatMoney((totalIncome - totalAllocated))}
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
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Budget Limit ({currencyCode()})</label>
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
                                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Limit: {formatMoney(budget.allocatedAmount)}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="action-btn secondary" onClick={() => handleEditClick(budget)}>
                                            Edit Limit
                                        </button>
                                        <button className="action-btn danger" onClick={() => handleDeleteBudget(budget)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Alert Modal */}
            {alertBudget && (
                <div className="modal-overlay" onClick={() => setAlertBudget(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Budget Alert: {alertBudget.category}</h2>
                            <button className="modal-close" onClick={() => setAlertBudget(null)}>×</button>
                        </div>

                        <div className="modal-body" style={{ marginTop: '16px' }}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Alert me when I have used (%)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="form-input"
                                    value={alertLevel}
                                    onChange={(e) => setAlertLevel(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '16px' }}
                                />
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    Currently used: {alertBudget.percentageUsed}% ({formatMoney(alertBudget.spentAmount)} of {formatMoney(alertBudget.allocatedAmount)})
                                </p>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                            {alertBudget.alertThreshold != null && (
                                <button
                                    className="action-btn danger"
                                    onClick={() => handleSaveAlert(true)}
                                    disabled={isSavingAlert}
                                    style={{ marginRight: 'auto' }}
                                >
                                    Remove Alert
                                </button>
                            )}
                            <button
                                className="action-btn secondary"
                                onClick={() => setAlertBudget(null)}
                                disabled={isSavingAlert}
                            >
                                Cancel
                            </button>
                            <button
                                className="action-btn primary"
                                onClick={() => handleSaveAlert()}
                                disabled={isSavingAlert || !alertLevel}
                            >
                                {isSavingAlert ? 'Saving...' : 'Save Alert'}
                            </button>
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
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Budget Limit ({currencyCode()})</label>
                                <input 
                                    type="number" 
                                    className="form-input"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '16px' }}
                                />
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    Currently spent: {formatMoney(editingBudget.spentAmount)}
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