import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { DatePicker } from '../components/DatePicker';

interface Goal {
    _id?: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    status: 'In Progress' | 'Completed' | 'Paused';
    category?: string;
    priority?: 'High' | 'Medium' | 'Low';
    description?: string;
}

export const GoalsPage = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [newGoal, setNewGoal] = useState<Goal>({
        title: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: '',
        status: 'In Progress',
        category: 'Personal',
        priority: 'Medium',
        description: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await apiClient.get('/goals');
            setGoals(response.data.goals || []);
        } catch (error) {
            console.error('Error fetching goals:', error);
            // Fallback to empty array on error
            setGoals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/goals', newGoal);
            setGoals([...goals, response.data.goal]);
            setNewGoal({ title: '', targetAmount: 0, currentAmount: 0, deadline: '', status: 'In Progress', category: 'Personal', priority: 'Medium', description: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error creating goal:', error);
            alert('Failed to create goal. Please try again.');
        }
    };

    const handleUpdateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGoal || !editingGoal._id) return;

        try {
            const response = await apiClient.put(`/goals/${editingGoal._id}`, editingGoal);
            setGoals(goals.map(g => g._id === editingGoal._id ? response.data.goal : g));
            setEditingGoal(null);
            setShowDetailsModal(false);
            alert('Goal updated successfully!');
        } catch (error) {
            console.error('Error updating goal:', error);
            alert('Failed to update goal. Please try again.');
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await apiClient.delete(`/goals/${goalId}`);
                setGoals(goals.filter(g => g._id !== goalId));
                setShowDetailsModal(false);
                alert('Goal deleted successfully!');
            } catch (error) {
                console.error('Error deleting goal:', error);
                alert('Failed to delete goal. Please try again.');
            }
        }
    };

    const handleAddProgress = async (goalId: string, amount: number) => {
        try {
            const response = await apiClient.post(`/goals/${goalId}/progress`, { amount });
            setGoals(goals.map(goal => 
                goal._id === goalId ? response.data.goal : goal
            ));
        } catch (error) {
            console.error('Error adding progress:', error);
            alert('Failed to add progress. Please try again.');
        }
    };

    const getProgressPercentage = (current: number, target: number) => {
        return Math.min((current / target) * 100, 100);
    };

    const getMonthlyRequired = (targetAmount: number, currentAmount: number, deadline: string) => {
        const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const months = Math.ceil(days / 30);
        if (months <= 0) return 0;
        const remaining = Math.max(0, targetAmount - currentAmount);
        return Math.ceil(remaining / months);
    };

    const getGoalRiskStatus = (currentAmount: number, targetAmount: number, deadline: string) => {
        const progress = getProgressPercentage(currentAmount, targetAmount);
        const daysRemaining = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const expectedProgress = (100 * (Math.max(0, -daysRemaining) / Math.max(1, Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))))) || 0;

        // Calculate what progress should be by now
        const totalDays = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const initialDate = new Date(deadline);
        initialDate.setDate(initialDate.getDate() - totalDays);
        const daysPassed = totalDays - Math.max(0, daysRemaining);
        const expectedProgressPercentage = (daysPassed / totalDays) * 100;

        if (progress >= expectedProgressPercentage) return { status: 'On Track', color: '#10b981', icon: '✅' };
        if (progress >= expectedProgressPercentage - 10) return { status: 'Slightly Behind', color: '#f59e0b', icon: '⚠️' };
        return { status: 'High Risk', color: '#ef4444', icon: '🔴' };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getDaysRemaining = (deadline: string) => {
        const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} days left` : 'Overdue';
    };

    const getAISuggestion = (goal: Goal) => {
        const riskStatus = getGoalRiskStatus(goal.currentAmount, goal.targetAmount, goal.deadline);
        if (riskStatus.status === 'On Track') {
            return `You're on track! Continue saving LKR ${getMonthlyRequired(goal.targetAmount, goal.currentAmount, goal.deadline).toLocaleString('en-LK')} monthly.`;
        } else if (riskStatus.status === 'Slightly Behind') {
            return `You're slightly behind. Increase monthly savings to LKR ${(getMonthlyRequired(goal.targetAmount, goal.currentAmount, goal.deadline) * 1.2).toLocaleString('en-LK')} to stay on track.`;
        } else {
            return `High risk! Try to save LKR ${(getMonthlyRequired(goal.targetAmount, goal.currentAmount, goal.deadline) * 1.5).toLocaleString('en-LK')} monthly to catch up.`;
        }
    };

    const getCategoryIcon = (category?: string) => {
        const icons: { [key: string]: string } = {
            'Personal': '🚲',
            'Travel': '✈️',
            'Education': '🎓',
            'Emergency': '🆘',
            'Home': '🏠',
            'Investment': '💼'
        };
        return icons[category || 'Personal'] || '🎯';
    };

    if (loading) return <div className="loading">Loading your goals...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>🎯 Financial Goals</h1>
                    <p className="page-subtitle">Track and achieve your financial objectives</p>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    + Add New Goal
                </button>
            </div>

            {showForm && (
                <div className="card form-card">
                    <h3>Create New Financial Goal</h3>
                    <form onSubmit={handleCreateGoal} className="goal-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Goal Title</label>
                                <input
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                                    placeholder="e.g., Buy a House"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Target Amount (LKR)</label>
                                <input
                                    type="number"
                                    value={newGoal.targetAmount}
                                    onChange={(e) => setNewGoal({...newGoal, targetAmount: Number(e.target.value)})}
                                    placeholder="500000"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Current Savings (LKR)</label>
                                <input
                                    type="number"
                                    value={newGoal.currentAmount}
                                    onChange={(e) => setNewGoal({...newGoal, currentAmount: Number(e.target.value)})}
                                    placeholder="50000"
                                />
                            </div>
                            <div className="form-group">
                                <DatePicker
                                    label="Target Deadline"
                                    value={newGoal.deadline}
                                    onChange={(date) => setNewGoal({...newGoal, deadline: date})}
                                    required
                                    minDate={new Date().toISOString().split('T')[0]} // Can't select past dates
                                    placeholder="Select target date"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Create Goal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="goals-grid">
                {goals.map((goal) => {
                    const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
                    const riskStatus = getGoalRiskStatus(goal.currentAmount, goal.targetAmount, goal.deadline);
                    const monthlyRequired = getMonthlyRequired(goal.targetAmount, goal.currentAmount, goal.deadline);

                    return (
                        <div key={goal._id} className="card goal-card">
                            <div className="goal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '24px' }}>{getCategoryIcon(goal.category)}</span>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{goal.title}</h3>
                                        {goal.priority && <small style={{ color: '#666' }}>Priority: {goal.priority}</small>}
                                    </div>
                                </div>
                                <span className={`status-badge ${goal.status.toLowerCase().replace(' ', '-')}`}>
                                    {goal.status}
                                </span>
                            </div>
                            
                            <div className="goal-progress">
                                <div className="progress-info">
                                    <span>{formatCurrency(goal.currentAmount)}</span>
                                    <span>{formatCurrency(goal.targetAmount)}</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{ 
                                            width: `${progress}%`,
                                            backgroundColor: riskStatus.color,
                                            transition: 'width 0.3s ease'
                                        }}
                                    ></div>
                                </div>
                                <div className="progress-details">
                                    <span>{progress.toFixed(1)}% Complete</span>
                                    <span className="deadline">{getDaysRemaining(goal.deadline)}</span>
                                </div>
                            </div>

                            {/* Smart Goal Metrics */}
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '12px',
                                fontSize: '14px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#1f2937', fontWeight: '600' }}><strong>Monthly Required:</strong> {formatCurrency(monthlyRequired)}</span>
                                    <span style={{ color: '#059669', fontWeight: '600' }}><strong>{riskStatus.icon} Status:</strong> {riskStatus.status}</span>
                                </div>
                                <div style={{ color: '#374151', fontSize: '13px', fontWeight: '500' }}>
                                    📅 {new Date(goal.deadline).toLocaleDateString('en-LK')}
                                </div>
                            </div>

                            {/* AI Suggestion Box */}
                            <div style={{
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                padding: '10px',
                                borderRadius: '6px',
                                marginBottom: '12px',
                                fontSize: '13px',
                                color: '#1e40af'
                            }}>
                                🤖 {getAISuggestion(goal)}
                            </div>
                            
                            <div className="goal-actions">
                                <button 
                                    className="btn-secondary btn-sm"
                                    onClick={() => {
                                        setEditingGoal(goal);
                                        setShowDetailsModal(true);
                                    }}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="btn-primary btn-sm"
                                    onClick={() => {
                                        const amount = prompt(`Enter amount to add (Monthly needed: LKR ${monthlyRequired}):`);
                                        if (amount && goal._id) {
                                            handleAddProgress(goal._id, Number(amount));
                                        }
                                    }}
                                >
                                    Add Contribution
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {goals.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🎯</div>
                    <h3>No Goals Yet</h3>
                    <p>Start by creating your first financial goal to track your progress!</p>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        Create Your First Goal
                    </button>
                </div>
            )}

            {/* Goal Details Modal */}
            {showDetailsModal && editingGoal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Edit Goal Details</h2>
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateGoal}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label>Goal Title</label>
                                <input
                                    type="text"
                                    value={editingGoal.title}
                                    onChange={(e) => setEditingGoal({...editingGoal, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={editingGoal.category || 'Personal'}
                                        onChange={(e) => setEditingGoal({...editingGoal, category: e.target.value})}
                                    >
                                        <option>Personal</option>
                                        <option>Travel</option>
                                        <option>Education</option>
                                        <option>Emergency</option>
                                        <option>Home</option>
                                        <option>Investment</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={editingGoal.priority || 'Medium'}
                                        onChange={(e) => setEditingGoal({...editingGoal, priority: e.target.value as 'High' | 'Medium' | 'Low'})}
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label>Description</label>
                                <textarea
                                    value={editingGoal.description || ''}
                                    onChange={(e) => setEditingGoal({...editingGoal, description: e.target.value})}
                                    placeholder="Why is this goal important to you?"
                                    style={{ minHeight: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Target Amount (LKR)</label>
                                    <input
                                        type="number"
                                        value={editingGoal.targetAmount}
                                        onChange={(e) => setEditingGoal({...editingGoal, targetAmount: Number(e.target.value)})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Current Savings (LKR)</label>
                                    <input
                                        type="number"
                                        value={editingGoal.currentAmount}
                                        onChange={(e) => setEditingGoal({...editingGoal, currentAmount: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <DatePicker
                                    label="Target Deadline"
                                    value={editingGoal.deadline}
                                    onChange={(date) => setEditingGoal({...editingGoal, deadline: date})}
                                    required
                                    minDate={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>Status</label>
                                <select
                                    value={editingGoal.status}
                                    onChange={(e) => setEditingGoal({...editingGoal, status: e.target.value as 'In Progress' | 'Completed' | 'Paused'})}
                                >
                                    <option>In Progress</option>
                                    <option>Paused</option>
                                    <option>Completed</option>
                                </select>
                            </div>

                            {/* AI Insights Section */}
                            <div style={{
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#1e40af' }}>🤖 AI Insights</h4>
                                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#1e40af' }}>
                                    {getAISuggestion(editingGoal)}
                                </p>
                                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#1e40af' }}>
                                    Monthly Savings Required: <strong>{formatCurrency(getMonthlyRequired(editingGoal.targetAmount, editingGoal.currentAmount, editingGoal.deadline))}</strong>
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setEditingGoal(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    className="btn-danger"
                                    style={{ 
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        if (editingGoal._id) {
                                            handleDeleteGoal(editingGoal._id);
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                                <button type="submit" className="btn-primary" style={{ marginLeft: 'auto' }}>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};