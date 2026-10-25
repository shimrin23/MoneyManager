// Add Transaction Form — Premium Responsive Layout
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client.ts';
import { DatePicker } from './DatePicker';
import { getLocalDateString } from '../utils/date';
import { currencyCode, fromLkr, toLkr } from '../utils/appFormat';

interface TransactionFormProps {
    onTransactionAdded: () => void;
    onCancel?: () => void;
    initialData?: any;
    isEditMode?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
    'Food & Dining': '', 'Shopping': '', 'Entertainment': '',
    'Transport': '', 'Bills & Utilities': '', 'Healthcare': '',
    'Education': '', 'Travel': '', 'Salary': '', 'Freelance': '',
    'Business': '', 'Investment': '', 'Gift': '', 'Other': '',
};

const DEFAULT_EXPENSE_CATEGORIES = ['Food & Dining', 'Shopping', 'Entertainment', 'Transport',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'];

export const AddTransactionForm =({ onTransactionAdded, onCancel, initialData, isEditMode }: TransactionFormProps) => {
    const today = getLocalDateString();
    // Default type comes from Settings (saved on the device when Settings is saved)
    const defaultType: 'income' | 'expense' = localStorage.getItem('pfm_default_tx_type') === 'income' ? 'income' : 'expense';
    const [formData, setFormData] = useState({
        amount: initialData?.amount !== undefined ? String(fromLkr(Number(initialData.amount))) : '',
        category: initialData?.category || '',
        description: initialData?.description || '',
        type: initialData?.type || defaultType,
        date: initialData?.date ? initialData.date.split('T')[0] : today
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    // Budget categories the user created (e.g. "Vacation") so their spending can be tracked
    useEffect(() => {
        apiClient.get('/budgets')
            .then((res) => {
                const known = new Set(DEFAULT_EXPENSE_CATEGORIES.map(c => c.toLowerCase()));
                const names: string[] = (res.data?.budgets || [])
                    .map((b: { category: string }) => b.category)
                    .filter((c: string) => c && !known.has(c.toLowerCase()));
                setCustomCategories(names);
            })
            .catch(() => setCustomCategories([])); // Default categories still work
    }, []);

    const categories: Record<'expense' | 'income', string[]> = {
        expense: [...DEFAULT_EXPENSE_CATEGORIES.slice(0, -1), ...customCategories, 'Other'],
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

            if (isEditMode && initialData?._id) {
                await apiClient.put(`/transactions/${initialData._id}`, { ...formData, amount: toLkr(amount) }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await apiClient.post('/transactions', { ...formData, amount: toLkr(amount) }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            setFormData({ amount: '', category: '', description: '', type: defaultType, date: getLocalDateString() });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onTransactionAdded();
            }, 1000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to add transaction';
            setError(`Error: ${errorMsg}`);
            console.error("Backend Error Details:", err.response?.data);
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
                {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Transaction' : 'Add Transaction')}
            </h3>

            {error && (
                <div className="alert-error" style={{ marginBottom: 'var(--sp-4)' }}>
                    ⚠️ {error}
                </div>
            )}
            {success && (
                <div style={{ color: '#059669', marginBottom: 'var(--sp-4)', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    ✅ Transaction {isEditMode ? 'updated' : 'added'} successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="transaction-form">
                {/* Type toggle — full width */}
                <div className="form-group full-width">
                    <div className="type-toggle-group">
                        <button
                            type="button"
                            className={`type-toggle-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                        >
                            <span className="icon">⬇️</span>
                            Expense
                        </button>
                        <button
                            type="button"
                            className={`type-toggle-btn ${formData.type === 'income' ? 'active income' : ''}`}
                            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                        >
                            <span className="icon">⬆️</span>
                            Income
                        </button>
                    </div>
                </div>

                {/* Amount */}
                <div className="form-group">
                    <label>Amount ({currencyCode()}) <span className="required">*</span></label>
                    <div className="input-with-icon">
                        <span className="input-prefix">{currencyCode()}</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="form-group">
                    <label>Category <span className="required">*</span></label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                    >
                        <option value="">Select a category</option>
                        {categories[formData.type as 'expense' | 'income']?.map((cat: string) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Date */}
                <div className="form-group">
                    <label>Date <span className="required">*</span></label>
                    <input
                        type="date"
                        value={formData.date}
                        max={getLocalDateString()}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>

                {/* Description */}
                <div className="form-group full-width">
                    <label>Description</label>
                    <input
                        type="text"
                        placeholder="What was this for?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="form-actions full-width" style={{ marginTop: 'var(--sp-4)' }}>
                    {onCancel && (
                        <button type="button" className="btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            flex: 1,
                            background: isExpense
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : 'linear-gradient(135deg, #10b981, #059669)'
                        }}
                    >
                        {loading
                            ? (isEditMode ? 'Updating…' : 'Adding…')
                            : (isEditMode ? 'Update' : `Add ${isExpense ? 'Expense' : 'Income'}`)}
                    </button>
                </div>
            </form>
        </div>
    );
};