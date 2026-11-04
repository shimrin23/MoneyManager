import { formatDate, formatDateTime, formatMoney } from '../utils/appFormat';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client.ts';
import { notify } from '../utils/systemMessages';
import axios from 'axios';
import { AddTransactionForm } from './AddTransactionForm';
import { useAdminLang } from '../i18n/adminText';
import { TRANSACTIONS_T } from '../i18n/transactionsText';
import { fillText } from '../i18n/dashboardText';

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
    const t = TRANSACTIONS_T[useAdminLang()];
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
                notify.error(apiMessage ? fillText(t.syncFailed, { msg: apiMessage }) : t.syncFailedGeneric);
                return;
            }
            notify.error(t.syncFailedGeneric);
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
            notify.error(t.deleteFailed);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="card transaction-list">
            <div className="txn-header">
                <div>
                    <h2 className="txn-title">{t.title}</h2>
                    <p className="txn-subtitle">{t.subtitle}</p>
                </div>
                <div className="txn-header-actions">
                    <button type="button" className="btn-secondary txn-btn txn-btn-icon" onClick={refreshData} title={t.refresh} aria-label={t.refreshAria}>
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
                        {t.add}
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
                        placeholder={t.searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label={t.searchAria}
                    />
                </div>
                <select
                    className="txn-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
                    aria-label={t.filterTypeAria}
                >
                    <option value="all">{t.allTypes}</option>
                    <option value="income">{t.income}</option>
                    <option value="expense">{t.expense}</option>
                </select>
                <select
                    className="txn-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label={t.filterCategoryAria}
                >
                    <option value="all">{t.allCategories}</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="table-container">
                <table className="responsive-table txn-table">
                    <thead>
                        <tr>
                            <th>{t.colDate}</th>
                            <th>{t.colDescription}</th>
                            <th>{t.colCategory}</th>
                            <th>{t.colAmount}</th>
                            <th>{t.colActions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="txn-empty">
                                    {transactions.length === 0 ? t.noTransactions : t.noMatch}
                                </td>
                            </tr>
                        )}
                        {filteredTransactions.map((tx) => {
                            const isDeleting = deletingId === tx._id;

                            return (
                                <tr key={tx._id} className={tx.type}>
                                    <td data-label={t.colDate}>
                                        {formatDate(tx.date)}
                                    </td>
                                    <td data-label={t.colDescription} className="description-cell">
                                        <span className="description-text">{tx.description}</span>
                                        <div className="txn-badges">
                                            {tx.isRecurring && (
                                                <span className="badge badge-recurring">
                                                    {t.recurring}{tx.recurringFrequency ? ` (${tx.recurringFrequency})` : ''}
                                                </span>
                                            )}
                                            {tx.isAnomaly && (
                                                <span className="badge badge-anomaly">
                                                    {t.anomaly} {Math.round((tx.anomalyScore || 0) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td data-label={t.colCategory}>
                                        <span className="category-tag">{tx.category}</span>
                                    </td>
                                    <td data-label={t.colAmount} className="amount">
                                        {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                                    </td>
                                    <td data-label={t.colActions}>
                                        <div className="table-actions">
                                            <button
                                                className="table-action-btn edit"
                                                onClick={() => startEditing(tx)}
                                                disabled={deletingId !== null}
                                            >
                                                {t.edit}
                                            </button>
                                            <button
                                                className="table-action-btn delete"
                                                onClick={() => confirmDeleteTransaction(tx._id)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? t.deleting : t.delete}
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
                    {filteredTransactions.length} {filteredTransactions.length === 1 ? t.transactionOne : t.transactionMany}
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
                            <h2 className="modal-title">{t.addTitle}</h2>
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
                            <h2 className="modal-title">{t.editTitle}</h2>
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
                            <h2 className="modal-title">{t.confirmDeleteTitle}</h2>
                            <button className="modal-close" onClick={cancelDelete} aria-label={t.close}>×</button>
                        </div>
                        <p className="txn-confirm-text">
                            {t.confirmDeleteText}
                        </p>
                        <div className="txn-confirm-actions">
                            <button className="btn-secondary" onClick={cancelDelete}>
                                {t.cancel}
                            </button>
                            <button
                                className="btn-primary"
                                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                                onClick={executeDeleteTransaction}
                            >
                                {t.delete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
