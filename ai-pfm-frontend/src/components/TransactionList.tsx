import { useEffect, useState } from 'react';
import { apiClient } from '../api/client.ts';
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
    const [hasPFMConsent, setHasPFMConsent] = useState<boolean | null>(null);
    const [syncMode, setSyncMode] = useState<'mock' | 'real' | 'unknown'>('unknown');
    const [consentBusy, setConsentBusy] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

    const categories = {
        expense: ['Food & Dining', 'Shopping', 'Entertainment', 'Transport',
            'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'],
        income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other']
    };

    const fetchTransactions = async () => {
        try {
            const response = await apiClient.get('/transactions');
            setTransactions(response.data.data);
        } catch (error) {
            console.error("Error fetching transactions", error);
        }
    };

    const fetchConsentStatus = async () => {
        try {
            const response = await apiClient.get('/consent/check/pfm_analysis');
            setHasPFMConsent(!!response.data?.hasConsent);
        } catch (error) {
            console.error('Error checking consent status', error);
            setHasPFMConsent(false);
        }
    };

    const fetchSyncHealth = async () => {
        try {
            const response = await apiClient.get('/transactions/sync/health');
            const mode = response.data?.bankingIntegration?.mode;
            if (mode === 'mock' || mode === 'real') {
                setSyncMode(mode);
                return;
            }
            setSyncMode('unknown');
        } catch (error) {
            console.error('Error checking sync health', error);
            setSyncMode('unknown');
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchConsentStatus();
        fetchSyncHealth();
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
                alert(apiMessage ? `Sync failed: ${apiMessage}` : 'Sync failed');
                return;
            }
            alert('Sync failed');
        }
    };

    const enablePFMConsent = async () => {
        try {
            setConsentBusy(true);
            await apiClient.post('/consent/grant', {
                consentType: 'pfm_analysis',
                version: 'v1.0'
            });
            await fetchConsentStatus();
        } catch (error) {
            console.error('Failed to grant consent', error);
            alert('Failed to enable consent');
        } finally {
            setConsentBusy(false);
        }
    };

    const disablePFMConsent = async () => {
        try {
            setConsentBusy(true);
            await apiClient.post('/consent/revoke', {
                consentType: 'pfm_analysis'
            });
            await fetchConsentStatus();
        } catch (error) {
            console.error('Failed to revoke consent', error);
            alert('Failed to disable consent');
        } finally {
            setConsentBusy(false);
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

    const confirmDeleteTransaction = (transactionId: string) => {
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
            alert('Failed to delete transaction');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="card transaction-list">
            <div className="header-row">
                <h2>Recent Transactions</h2>
                <div className="transaction-toolbar">
                    <button className="secondary-btn" onClick={refreshData}>🔄 Refresh Data</button>
                </div>
            </div>
            
            <div className="table-container">
                <table className="responsive-table">
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
                        {transactions.map((t) => {
                            const isDeleting = deletingId === t._id;

                            return (
                                <tr key={t._id} className={t.type}>
                                    <td data-label="Date">
                                        {new Date(t.date).toLocaleDateString()}
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
                                        {t.type === 'income' ? '+' : '-'}Rs. {t.amount.toLocaleString()}
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
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Confirm Deletion</h2>
                            <button className="modal-close" onClick={cancelDelete}>×</button>
                        </div>
                        <div style={{ padding: '1rem 0 2rem 0', color: 'var(--color-text)' }}>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={cancelDelete}>
                                Cancel
                            </button>
                            <button 
                                className="btn-primary" 
                                style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} 
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
