import { formatDate, formatDateTime, formatMoney } from '../utils/appFormat';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client.ts';
import { notify } from '../utils/systemMessages';
import axios from 'axios';
import { AddTransactionForm } from './AddTransactionForm';

interface Transaction {
    _id: string;
    amount: number;
    category: string;
    description: string;
    type: 'income' | 'expense';
    date: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
    recurringDueDate?: string;
    isAnomaly?: boolean;
    anomalyScore?: number;
}

export const TransactionList = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const categories = useMemo(
        () => Array.from(new Set(transactions.map((t) => t.category).filter(Boolean))).sort(),
        [transactions]
    );

    const filteredTransactions = useMemo(() => {
        const query = search.trim().toLowerCase();
        return transactions.filter((t) => {
            if (typeFilter !== 'all' && t.type !== typeFilter) return false;
            if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
            if (!query) return true;
            return (
                (t.description || '').toLowerCase().includes(query) ||
                (t.category || '').toLowerCase().includes(query)
            );
        });
    }, [transactions, search, typeFilter, categoryFilter]);

    const totals = useMemo(
        () => filteredTransactions.reduce(
            (acc, t) => {
                if (t.type === 'income') acc.income += Number(t.amount) || 0;
                else acc.expense += Number(t.amount) || 0;
                return acc;
            },
            { income: 0, expense: 0 }
        ),
        [filteredTransactions]
    );

    const fetchTransactions = async () => {
        try {
            const response = await apiClient.get('/transactions');
            setTransactions(response.data.data);
        } catch (error) {
            console.error("Error fetching transactions", error);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const refreshData = async () => {
        try {
            await fetchTransactions();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const apiMessage =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.response?.data?.details;
                notify.error(apiMessage ? `Sync failed: ${apiMessage}` : 'Sync failed. Please try again.');
                return;
            }
            notify.error('Sync failed. Please try again.');
        }
    };

    const startEditing = (transaction: Transaction) => {
        setEditingTransaction(transaction);
    };

    const cancelEditing = () => {
        setEditingTransaction(null);
    };

    const handleTransactionUpdated = async () => {
        setEditingTransaction(null);
        await fetchTransactions();
    };

    const handleTransactionAdded = async () => {
        setIsAdding(false);
        await fetchTransactions();
    };

    const confirmDeleteTransaction =(transactionId: string) => {
        setTransactionToDelete(transactionId);
    };

    const cancelDelete = () => {
        setTransactionToDelete(null);
    };

    const executeDeleteTransaction = async () => {
        if (!transactionToDelete) return;
        
        const transactionId = transactionToDelete;
        setTransactionToDelete(null);
        
        try {
            setDeletingId(transactionId);
            await apiClient.delete(`/transactions/${transactionId}`);
            setTransactions((prev) => prev.filter((transaction) => transaction._id !== transactionId));
            if (editingTransaction?._id === transactionId) {
                cancelEditing();
            }
        } catch (error) {
            console.error('Failed to delete transaction', error);
            notify.error('Failed to delete transaction. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="card transaction-list">
            <div className="txn-header">
                <div>
                    <h2 className="txn-title">All transactions</h2>
                    <p className="txn-subtitle">Search, filter and edit your history</p>
                </div>
                <div className="txn-header-actions">
                    <button type="button" className="btn-secondary txn-btn txn-btn-icon" onClick={refreshData} title="Refresh data" aria-label="Refresh data">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
                            <path d="M3 21v-5h5" />
                        </svg>
                    </button>
                    <button type="button" className="btn-primary txn-btn" onClick={() => setIsAdding(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add
                    </button>
                </div>
            </div>

            <div className="txn-filters">
                <div className="txn-search">
                    <svg className="txn-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                    <input
                        type="text"
                        className="txn-input"
                        placeholder="Search description or category"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search transactions"
                    />
                </div>
                <select
                    className="txn-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
                    aria-label="Filter by type"
                >
                    <option value="all">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <select
                    className="txn-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                >
                    <option value="all">All categories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="table-container">
                <table className="responsive-table txn-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="txn-empty">
                                    {transactions.length === 0 ? 'No transactions yet.' : 'No transactions match your filters.'}
                                </td>
                            </tr>
                        )}
                        {filteredTransactions.map((t) => {
                            const isDeleting = deletingId === t._id;

                            return (
                                <tr key={t._id} className={t.type}>
                                    <td data-label="Date">
                                        {formatDate(t.date)}
                                    </td>
                                    <td data-label="Description" className="description-cell">
                                        <span className="description-text">{t.description}</span>
                                        <div className="txn-badges">
                                            {t.isRecurring && (
                                                <span className="badge badge-recurring">
                                                    Recurring{t.recurringFrequency ? ` (${t.recurringFrequency})` : ''}
                                                </span>
                                            )}
                                            {t.isAnomaly && (
                                                <span className="badge badge-anomaly">
                                                    Anomaly {Math.round((t.anomalyScore || 0) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td data-label="Category">
                                        <span className="category-tag">{t.category}</span>
                                    </td>
                                    <td data-label="Amount" className="amount">
                                        {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                                    </td>
                                    <td data-label="Actions">
                                        <div className="table-actions">
                                            <button
                                                className="table-action-btn edit"
                                                onClick={() => startEditing(t)}
                                                disabled={deletingId !== null}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="table-action-btn delete"
                                                onClick={() => confirmDeleteTransaction(t._id)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="txn-footer">
                <span className="txn-footer-count">
                    {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                </span>
                <span className="txn-footer-totals">
                    <span className="txn-footer-income">+{formatMoney(totals.income)}</span>
                    <span className="txn-footer-sep" aria-hidden="true">·</span>
                    <span className="txn-footer-expense">-{formatMoney(totals.expense)}</span>
                </span>
            </div>

            {isAdding && (
                <div className="modal-overlay" onClick={() => setIsAdding(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add Transaction</h2>
                            <button className="modal-close" onClick={() => setIsAdding(false)}>×</button>
                        </div>
                        <AddTransactionForm
                            onTransactionAdded={handleTransactionAdded}
                            onCancel={() => setIsAdding(false)}
                        />
                    </div>
                </div>
            )}

            {editingTransaction && (
                <div className="modal-overlay" onClick={cancelEditing}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Transaction</h2>
                            <button className="modal-close" onClick={cancelEditing}>×</button>
                        </div>
                        <AddTransactionForm 
                            onTransactionAdded={handleTransactionUpdated} 
                            onCancel={cancelEditing}
                            initialData={editingTransaction}
                            isEditMode={true}
                        />
                    </div>
                </div>
            )}

            {transactionToDelete && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="modal-content txn-confirm" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Confirm Deletion</h2>
                            <button className="modal-close" onClick={cancelDelete} aria-label="Close">×</button>
                        </div>
                        <p className="txn-confirm-text">
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </p>
                        <div className="txn-confirm-actions">
                            <button className="btn-secondary" onClick={cancelDelete}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                                onClick={executeDeleteTransaction}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
