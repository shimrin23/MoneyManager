// Add Transaction Form — Premium Responsive Layout
import { useState } from 'react';
import { apiClient } from '../api/client.ts';
import { DatePicker } from './DatePicker';
import { getLocalDateString } from '../utils/date';

interface TransactionFormProps {
    onTransactionAdded: () => void;
    onCancel?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
    'Food & Dining': '🍽️', 'Shopping': '🛍️', 'Entertainment': '🎭',
    'Transport': '🚗', 'Bills & Utilities': '⚡', 'Healthcare': '🏥',
    'Education': '📚', 'Travel': '✈️', 'Salary': '💼', 'Freelance': '💻',
    'Business': '🏢', 'Investment': '📈', 'Gift': '🎁', 'Other': '📌',
};

export const AddTransactionForm = ({ onTransactionAdded, onCancel }: TransactionFormProps) => {
    const today = getLocalDateString();
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        type: 'expense' as 'income' | 'expense',
        date: today
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = {
        expense: ['Food & Dining', 'Shopping', 'Entertainment', 'Transport',
            'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'],
        income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other']
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (!formData.amount || !formData.category) throw new Error('Amount and category are required');
            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) throw new Error('Please enter a valid amount');
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Please login again');

            await apiClient.post('/transactions', { ...formData, amount }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setFormData({ amount: '', category: '', description: '', type: 'expense', date: getLocalDateString() });
            onTransactionAdded();
            alert('Transaction added successfully!');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isExpense = formData.type === 'expense';

    return (
        <div className="add-transaction-form" style={{ width: '100%' }}>
            <h3 style={{
                fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)',
                marginBottom: 'var(--sp-5)', display: 'none'
            }}>
                Add New Transaction
            </h3>

            {error && (
                <div className="alert-error" style={{ marginBottom: 'var(--sp-4)' }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="transaction-form">
                {/* Type toggle — full width */}
                <div className="form-group">
                    <label>Transaction Type</label>
                    <div className="type-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${isExpense ? 'active' : ''}`}
                            onClick={() => setFormData(p => ({ ...p, type: 'expense', category: '' }))}
                            aria-pressed={isExpense}
                            style={isExpense ? { borderColor: '#ef4444', color: '#f87171', background: 'rgba(239,68,68,0.1)' } : {}}
                        >
                            <span aria-hidden="true">💸</span> Expense
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${!isExpense ? 'active' : ''}`}
                            onClick={() => setFormData(p => ({ ...p, type: 'income', category: '' }))}
                            aria-pressed={!isExpense}
                            style={!isExpense ? { borderColor: '#10b981', color: '#34d399', background: 'rgba(16,185,129,0.1)' } : {}}
                        >
                            <span aria-hidden="true">💰</span> Income
                        </button>
                    </div>
                </div>

                {/* 2-col grid: Amount + Category */}
                <div className="form-grid-2">
                    <div className="form-group">
                        <label htmlFor="tx-amount">Amount (LKR)</label>
                        <input
                            id="tx-amount"
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            required
                            aria-required="true"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tx-category">Category</label>
                        <select
                            id="tx-category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            aria-required="true"
                        >
                            <option value="">Select category…</option>
                            {categories[formData.type].map(cat => (
                                <option key={cat} value={cat}>
                                    {CATEGORY_ICONS[cat] || '•'} {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description — full width */}
                <div className="form-group">
                    <label htmlFor="tx-description">Description <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <input
                        id="tx-description"
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g. Lunch at restaurant, Monthly salary…"
                    />
                </div>

                {/* Date — full width */}
                <div className="form-group">
                    <DatePicker
                        label="Date"
                        value={formData.date}
                        onChange={(date) => setFormData(p => ({ ...p, date }))}
                        required
                        maxDate={getLocalDateString()}
                        placeholder="Select transaction date"
                    />
                </div>

                {/* Actions */}
                <div className="transaction-form-actions">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                        style={{
                            background: isExpense
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : 'linear-gradient(135deg, #10b981, #059669)'
                        }}
                    >
                        {loading
                            ? 'Adding…'
                            : `Add ${isExpense ? 'Expense' : 'Income'}`}
                    </button>
                </div>
            </form>
        </div>
    );
};