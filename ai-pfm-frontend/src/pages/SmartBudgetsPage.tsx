import { formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog } from '../utils/systemMessages';
import { IconAlertTriangle, IconCheckCircle, IconTarget, IconBell, IconTrendingUp, IconTrendingDown, IconLightbulb } from '../components/Icons';
import { useAdminLang } from '../i18n/adminText';
import { SB_T } from '../i18n/smartBudgetsText';
import { fillText } from '../i18n/dashboardText';

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
    const t = SB_T[useAdminLang()];
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
            notify.warning(t.warnAlertRange);
            return;
        }

        setIsSavingAlert(true);
        try {
            await apiClient.patch(`/budgets/${alertBudget._id}/alert`, { alertThreshold: remove ? null : level });
            notify.success(remove
                ? fillText(t.alertRemoved, { cat: alertBudget.category })
                : fillText(t.alertSet, { cat: alertBudget.category, level }));
            setAlertBudget(null);
            fetchBudgets();
        } catch (error) {
            console.error('Failed to set budget alert:', error);
            notify.error(getApiErrorMessage(error, t.failAlert));
        } finally {
            setIsSavingAlert(false);
        }
    };

    const handleDeleteBudget = async (budget: Budget) => {
        if (!budget._id) return;
        const confirmed = await confirmDialog({
            title: t.deleteTitle,
            message: fillText(t.deleteMsg, { cat: budget.category }),
            confirmText: t.deleteBtn,
            danger: true,
        });
        if (!confirmed) return;

        try {
            await apiClient.delete(`/budgets/${budget._id}`);
            notify.success(fillText(t.deletedNote, { cat: budget.category }));
            fetchBudgets();
        } catch (error) {
            console.error('Failed to delete budget:', error);
            notify.error(getApiErrorMessage(error, t.failDelete));
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
            notify.warning(t.warnLimit);
            return;
        }

        setIsSaving(true);
        try {
            await apiClient.put(`/budgets/${editingBudget._id}`, { allocatedAmount: toLkr(amount) });
            notify.success(fillText(t.limitUpdated, { cat: editingBudget.category, amount: formatMoney(toLkr(amount)) }));
            setEditingBudget(null);
            fetchBudgets(); // Refresh data to update progress bars
        } catch (error) {
            console.error('Failed to update budget:', error);
            notify.error(getApiErrorMessage(error, t.failUpdate));
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(newCategoryAmount);
        if (!newCategoryName.trim()) {
            notify.warning(t.warnCatName);
            return;
        }
        if (isNaN(amount) || amount < 0) {
            notify.warning(t.warnLimit);
            return;
        }

        setIsAdding(true);
        try {
            await apiClient.post('/budgets', { category: newCategoryName.trim(), allocatedAmount: toLkr(amount) });
            notify.success(fillText(t.addedNote, { cat: newCategoryName.trim() }));
            setNewCategoryName('');
            setNewCategoryAmount('');
            fetchBudgets(); // Refresh to show new category
        } catch (error) {
            console.error('Failed to add category:', error);
            notify.error(getApiErrorMessage(error, t.failAdd));
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) {
        return <div className="loading-spinner">{t.loading}</div>;
    }

    return (
        <div className="page-container smart-budgets-page">

            {/* Tabs Header */}
            <div className="rec-filters" style={{ marginBottom: '32px' }}>
                <button
                    className={`rec-filter-btn ${activeTab === 'tracker' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tracker')}
                >
                    {t.tabTracker}
                </button>
                <button
                    className={`rec-filter-btn ${activeTab === 'planner' ? 'active' : ''}`}
                    onClick={() => setActiveTab('planner')}
                >
                    {t.tabPlanner}
                </button>
            </div>

            {activeTab === 'tracker' && (
                <>
                    {/* Spending Trends Charts */}
            <SpendingTrends />

            {/* Budget Summary */}
            <div className="sb-stats">
                <div className="sb-stat">
                    <span className="sb-stat-label">{totalIncome > 0 ? t.statIncome : t.noIncome}</span>
                    <span className="sb-stat-value">{formatMoney(totalIncome)}</span>
                </div>
                <div className="sb-stat">
                    <span className="sb-stat-label">{t.statBudgeted}</span>
                    <span className="sb-stat-value">{formatMoney(totalAllocated)}</span>
                </div>
                <div className="sb-stat">
                    <span className="sb-stat-label">{t.statIncomeAllocated}</span>
                    <span className="sb-stat-value">{totalIncome > 0 ? `${Math.round((totalAllocated / totalIncome) * 100)}%` : '—'}</span>
                </div>
                <div className="sb-stat">
                    <span className="sb-stat-label">{t.statOverCats}</span>
                    <span className="sb-stat-value">{overBudgetCount}</span>
                </div>
            </div>

            {/* AI Budget Insights */}
            <section className="sb-panel">
                <h3 className="sb-panel-title">{t.insightsTitle}</h3>
                <div className="sb-insights">
                    {budgets.filter(b => b.alertTriggered).map((budget) => (
                        <div key={`alert-${budget._id}`} className="sb-note bad">
                            <span className="sb-note-icon"><IconBell size={18} /></span>
                            <div className="sb-note-body">
                                <h4>{fillText(t.alertTitle, { cat: budget.category })}</h4>
                                <p>{fillText(t.alertBody, { pct: budget.percentageUsed, cat: budget.category, threshold: budget.alertThreshold ?? '' })}</p>
                            </div>
                        </div>
                    ))}

                    {budgets.filter(b => b.isOverBudget).length > 0 ? (
                        budgets.filter(b => b.isOverBudget).slice(0, 1).map((budget, idx) => (
                            <div key={`critical-${idx}`} className="sb-note bad">
                                <span className="sb-note-icon"><IconAlertTriangle size={18} /></span>
                                <div className="sb-note-body">
                                    <h4>{fillText(t.criticalTitle, { cat: budget.category })}</h4>
                                    <p>{budget.aiRecommendation}</p>
                                    <button className="sb-note-btn" onClick={() => navigate('/recommendations')}>
                                        <IconTarget size={14} /> {t.fixNow}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="insight-item success">
                            <span className="insight-icon" style={{ display: 'flex', alignItems: 'center' }}><IconCheckCircle size={20} /></span>
                            <div className="insight-content">
                                <h4>{t.noCritTitle}</h4>
                                <p>{t.noCritText}</p>
                            </div>
                        </div>
                    )}

                    {budgets.filter(b => !b.isOverBudget && b.percentageUsed < 80).length > 0 ? (
                        budgets.filter(b => !b.isOverBudget && b.percentageUsed < 80).slice(0, 1).map((budget, idx) => (
                            <div key={`success-${idx}`} className="sb-note good">
                                <span className="sb-note-icon"><IconCheckCircle size={18} /></span>
                                <div className="sb-note-body">
                                    <h4>{fillText(t.goodTitle, { cat: budget.category })}</h4>
                                    <p>{budget.aiRecommendation}</p>
                                    <button className="sb-note-btn" onClick={() => navigate('/')}>
                                        <IconTrendingUp size={14} /> {t.viewDetails}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : null}
                </div>
            </section>

            {/* Budget Categories */}
            <div className="sb-grid">
                {budgets.map((budget) => {
                    const tone = budget.isOverBudget ? 'bad' : budget.percentageUsed > 80 ? 'warn' : 'good';
                    return (
                    <article key={budget._id} className={`sb-card ${budget.isOverBudget ? 'over-budget' : ''}`}>
                        <div className="sb-card-head">
                            <div className="sb-card-name">
                                <h4>{budget.category}</h4>
                            </div>
                            {budget.isOverBudget ? (
                                <span className="sb-pill bad">{t.pillOver}</span>
                            ) : budget.percentageUsed > 80 ? (
                                <span className="sb-pill warn">{t.pillAlmost}</span>
                            ) : (
                                <span className="sb-pill good">{t.pillOnTrack}</span>
                            )}
                        </div>

                        <div className="sb-amounts">
                            <span className="sb-spent">{formatMoney(budget.spentAmount)}</span>
                            <span className="sb-total">/ {formatMoney(budget.allocatedAmount)}</span>
                        </div>

                        <div className="sb-bar">
                            <span className={tone} style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }} />
                        </div>

                        <div className="sb-row">
                            <span>{budget.percentageUsed}%</span>
                            <span>
                                {budget.remainingAmount >= 0 ? t.remaining : t.overBy}: {formatMoney(Math.abs(budget.remainingAmount))}
                            </span>
                        </div>

                        <div className="sb-meta">
                            <span className={`sb-trend ${budget.trends.change > 0 ? 'up' : 'down'}`}>
                                {budget.trends.change > 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
                                {fillText(t.vsLastMonth, { pct: Math.abs(budget.trends.change).toFixed(1) })}
                            </span>
                            {budget.alertThreshold != null && (
                                <span className={`sb-pill ${budget.alertTriggered ? 'bad' : 'warn'}`}>
                                    <IconBell size={12} /> {fillText(t.alertAt, { n: budget.alertThreshold })}
                                </span>
                            )}
                        </div>

                        <div className="sb-ai">
                            <span className="sb-ai-icon"><IconLightbulb size={16} /></span>
                            <p><strong>{t.aiRec}</strong> {budget.aiRecommendation}</p>
                        </div>

                        <div className="sb-actions">
                            <button className="action-btn primary" onClick={() => handleOptimizeBudget(budget.category)}>
                                <IconTarget size={16} /> {t.optimize}
                            </button>
                            <button className="action-btn secondary" onClick={() => handleSetAlert(budget)}>
                                <IconBell size={16} /> {budget.alertThreshold != null ? t.editAlert : t.setAlert}
                            </button>
                        </div>
                    </article>
                    );
                })}
            </div>
            </>
            )}

            {activeTab === 'planner' && (
                <div className="planner-tab-content">
                    <section className="sb-panel">
                        <h3 className="sb-panel-title">{t.bigPicture}</h3>
                        <div className="sb-stats sb-stats-3">
                            <div className="sb-stat">
                                <span className="sb-stat-label">{t.totalIncome}</span>
                                <span className="sb-stat-value">{formatMoney(totalIncome)}</span>
                            </div>
                            <div className="sb-stat">
                                <span className="sb-stat-label">{t.totalAllocated}</span>
                                <span className="sb-stat-value">{formatMoney(totalAllocated)}</span>
                            </div>
                            <div className="sb-stat">
                                <span className="sb-stat-label">{t.unallocated}</span>
                                <span className="sb-stat-value">{formatMoney((totalIncome - totalAllocated))}</span>
                            </div>
                        </div>
                    </section>

                    <section className="sb-panel">
                        <h3 className="sb-panel-title">{t.addNewCat}</h3>
                        <form onSubmit={handleAddCategory} className="sb-form">
                            <div className="sb-field">
                                <label htmlFor="sbCatName">{t.catName}</label>
                                <input
                                    id="sbCatName"
                                    type="text"
                                    className="sb-input"
                                    placeholder={t.catPh}
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>
                            <div className="sb-field">
                                <label htmlFor="sbCatLimit">{fillText(t.budgetLimit, { cur: currencyCode() })}</label>
                                <input
                                    id="sbCatLimit"
                                    type="number"
                                    className="sb-input"
                                    placeholder="0"
                                    value={newCategoryAmount}
                                    onChange={(e) => setNewCategoryAmount(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="action-btn primary sb-form-btn" disabled={isAdding}>
                                {isAdding ? t.adding : t.addBudget}
                            </button>
                        </form>
                    </section>

                    <section className="sb-panel">
                        <h3 className="sb-panel-title">{t.manage}</h3>
                        <div className="sb-alloc-list">
                            {budgets.map(budget => (
                                <div key={`manage-${budget._id}`} className="sb-alloc-row">
                                    <div className="sb-alloc-info">
                                        <h4>{budget.category}</h4>
                                        <p>{fillText(t.limit, { amount: formatMoney(budget.allocatedAmount) })}</p>
                                    </div>
                                    <div className="sb-alloc-actions">
                                        <button className="action-btn secondary" onClick={() => handleEditClick(budget)}>
                                            {t.editLimit}
                                        </button>
                                        <button className="action-btn danger" onClick={() => handleDeleteBudget(budget)}>
                                            {t.delete}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* Budget Alert Modal */}
            {alertBudget && (
                <div className="modal-overlay" onClick={() => setAlertBudget(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{fillText(t.alertTitle, { cat: alertBudget.category })}</h2>
                            <button className="modal-close" onClick={() => setAlertBudget(null)}>×</button>
                        </div>

                        <div className="modal-body" style={{ marginTop: '16px' }}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t.alertLabel}</label>
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
                                    {fillText(t.currentlyUsed, { pct: alertBudget.percentageUsed, spent: formatMoney(alertBudget.spentAmount), alloc: formatMoney(alertBudget.allocatedAmount) })}
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
                                    {t.removeAlert}
                                </button>
                            )}
                            <button
                                className="action-btn secondary"
                                onClick={() => setAlertBudget(null)}
                                disabled={isSavingAlert}
                            >
                                {t.cancel}
                            </button>
                            <button
                                className="action-btn primary"
                                onClick={() => handleSaveAlert()}
                                disabled={isSavingAlert || !alertLevel}
                            >
                                {isSavingAlert ? t.saving : t.saveAlert}
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
                            <h2 className="modal-title">{fillText(t.editTitle, { cat: editingBudget.category })}</h2>
                            <button className="modal-close" onClick={() => setEditingBudget(null)}>×</button>
                        </div>
                        
                        <div className="modal-body" style={{ marginTop: '16px' }}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{fillText(t.budgetLimit, { cur: currencyCode() })}</label>
                                <input 
                                    type="number" 
                                    className="form-input"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '16px' }}
                                />
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    {fillText(t.currentlySpent, { amount: formatMoney(editingBudget.spentAmount) })}
                                </p>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button 
                                className="action-btn secondary" 
                                onClick={() => setEditingBudget(null)}
                                disabled={isSaving}
                            >
                                {t.cancel}
                            </button>
                            <button
                                className="action-btn primary"
                                onClick={handleSaveBudget}
                                disabled={isSaving || !editAmount}
                            >
                                {isSaving ? t.saving : t.saveLimit}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};