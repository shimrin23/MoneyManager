// Add Transaction Form Component
import { useState } from 'react';
import { apiClient } from '../api/client.ts';

interface TransactionFormProps {
    onTransactionAdded: () => void;
}

export const AddTransactionForm = ({ onTransactionAdded }: TransactionFormProps) => {
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        type: 'expense' as 'income' | 'expense',
        date: new Date().toISOString().split('T')[0] // Today's date
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = {
        expense: [
            'Food & Dining',
            'Shopping',
            'Entertainment', 
            'Transport',
            'Bills & Utilities',
            'Healthcare',
            'Education',
            'Travel',
            'Other'
        ],
        income: [
            'Salary',
            'Freelance',
            'Business',
            'Investment',
            'Gift',
            'Other'
        ]
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate form
            if (!formData.amount || !formData.category) {
                throw new Error('Amount and category are required');
            }

            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            // Add Authorization header
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login again');
            }

            // Submit transaction
            await apiClient.post('/transactions', {
                ...formData,
                amount
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Reset form
            setFormData({
                amount: '',
                category: '',
                description: '',
                type: 'expense',
                date: new Date().toISOString().split('T')[0]
            });

            // Notify parent component
            onTransactionAdded();

            alert('Transaction added successfully!');

        } catch (err: any) {
            console.error('Failed to add transaction:', err);
            setError(err.response?.data?.error || err.message || 'Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="card add-transaction-form">
            <h3>Add New Transaction</h3>
            
            {error && (
                <div className="alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="transaction-form">
                {/* Transaction Type */}
                <div className="form-group">
                    <label>Type</label>
                    <div className="type-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${formData.type === 'expense' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                        >
                            💸 Expense
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${formData.type === 'income' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                        >
                            💰 Income
                        </button>
                    </div>
                </div>

                {/* Amount */}
                <div className="form-group">
                    <label>Amount (LKR)</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        required
                    />
                </div>

                {/* Category */}
                <div className="form-group">
                    <label>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories[formData.type].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div className="form-group">
                    <label>Description (Optional)</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="e.g., Lunch at restaurant, Monthly salary"
                    />
                </div>

                {/* Date */}
                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Adding...' : `Add ${formData.type === 'expense' ? 'Expense' : 'Income'}`}
                </button>
            </form>
        </div>
    );
};