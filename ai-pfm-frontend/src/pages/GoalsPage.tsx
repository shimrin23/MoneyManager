import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface Goal {
    _id?: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    status: 'In Progress' | 'Completed' | 'Paused';
}

export const GoalsPage = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newGoal, setNewGoal] = useState<Goal>({
        title: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: '',
        status: 'In Progress'
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
            setNewGoal({ title: '', targetAmount: 0, currentAmount: 0, deadline: '', status: 'In Progress' });
            setShowForm(false);
        } catch (error) {
            console.error('Error creating goal:', error);
            alert('Failed to create goal. Please try again.');
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
                                <label>Target Date</label>
                                <input
                                    type="date"
                                    value={newGoal.deadline}
                                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                                    required
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
                    return (
                        <div key={goal._id} className="card goal-card">
                            <div className="goal-header">
                                <h3>{goal.title}</h3>
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
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="progress-details">
                                    <span>{progress.toFixed(1)}% Complete</span>
                                    <span className="deadline">{getDaysRemaining(goal.deadline)}</span>
                                </div>
                            </div>
                            
                            <div className="goal-actions">
                                <button className="btn-secondary btn-sm">Edit</button>
                                <button 
                                    className="btn-primary btn-sm"
                                    onClick={() => {
                                        const amount = prompt('Enter progress amount:');
                                        if (amount && goal._id) {
                                            handleAddProgress(goal._id, Number(amount));
                                        }
                                    }}
                                >
                                    Add Progress
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
        </div>
    );
};