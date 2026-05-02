import { useEffect, useState } from 'react';
import { apiClient } from '../api/client.ts';
import axios from 'axios';

interface Transaction {
    _id: string;
    amount: number;
    category: string;
    description: string;
    type: 'income' | 'expense';
    date: string;
}

export const TransactionList = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [hasPFMConsent, setHasPFMConsent] = useState<boolean | null>(null);
    const [syncMode, setSyncMode] = useState<'mock' | 'real' | 'unknown'>('unknown');
    const [consentBusy, setConsentBusy] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({
        amount: '',
        category: '',
        description: '',
        type: 'expense' as 'income' | 'expense',
        date: ''
    });
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    const syncBank = async () => {
        if (!hasPFMConsent) {
            alert('PFM consent is required. Click Enable PFM Consent first.');
            return;
        }

        try {
            await apiClient.post('/transactions/sync');
            fetchTransactions();
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
        setEditingId(transaction._id);
        setEditFormData({
            amount: transaction.amount.toString(),
            category: transaction.category,
            description: transaction.description || '',
            type: transaction.type,
            date: new Date(transaction.date).toISOString().split('T')[0]
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditFormData({
            amount: '',
            category: '',
            description: '',
            type: 'expense',
            date: ''
        });
    };

    const saveEdit = async (transactionId: string) => {
        const amount = parseFloat(editFormData.amount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        try {
            setSavingEdit(true);
            await apiClient.put(`/transactions/${transactionId}`, {
                ...editFormData,
                amount
            });
            await fetchTransactions();
            cancelEditing();
        } catch (error) {
            console.error('Failed to update transaction', error);
            alert('Failed to update transaction');
        } finally {
            setSavingEdit(false);
        }
    };

    const deleteTransaction = async (transactionId: string) => {
        const shouldDelete = window.confirm('Delete this transaction? This action cannot be undone.');
        if (!shouldDelete) return;

        try {
            setDeletingId(transactionId);
            await apiClient.delete(`/transactions/${transactionId}`);
            setTransactions((prev) => prev.filter((transaction) => transaction._id !== transactionId));
            if (editingId === transactionId) {
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
                    <span className={`sync-mode-badge ${syncMode}`}>
                        Sync Mode: {syncMode.toUpperCase()}
                    </span>
                    <span className={`consent-badge ${hasPFMConsent ? 'granted' : 'missing'}`}>
                        {hasPFMConsent ? 'PFM Consent: Enabled' : 'PFM Consent: Required'}
                    </span>
                    {hasPFMConsent ? (
                        <button
                            className="secondary-btn"
                            onClick={disablePFMConsent}
                            disabled={consentBusy}
                        >
                            {consentBusy ? 'Updating...' : 'Disable Consent'}
                        </button>
                    ) : (
                        <button
                            className="secondary-btn"
                            onClick={enablePFMConsent}
                            disabled={consentBusy}
                        >
                            {consentBusy ? 'Updating...' : 'Enable PFM Consent'}
                        </button>
                    )}
                    <button className="secondary-btn" onClick={syncBank} disabled={!hasPFMConsent}>🔄 Sync Bank</button>
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
                            const isEditing = editingId === t._id;
                            const isDeleting = deletingId === t._id;

                            return (
                                <tr key={t._id} className={t.type}>
                                    <td data-label="Date">
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                className="table-input"
                                                value={editFormData.date}
                                                onChange={(e) => setEditFormData((prev) => ({ ...prev, date: e.target.value }))}
                                            />
                                        ) : (
                                            new Date(t.date).toLocaleDateString()
                                        )}
                                    </td>
                                    <td data-label="Description" className="description-cell">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="table-input"
                                                value={editFormData.description}
                                                onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                                                placeholder="Description"
                                            />
                                        ) : (
                                            <span className="description-text">{t.description}</span>
                                        )}
                                    </td>
                                    <td data-label="Category">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="table-input"
                                                value={editFormData.category}
                                                onChange={(e) => setEditFormData((prev) => ({ ...prev, category: e.target.value }))}
                                            />
                                        ) : (
                                            <span className="category-tag">{t.category}</span>
                                        )}
                                    </td>
                                    <td data-label="Amount" className="amount">
                                        {isEditing ? (
                                            <div className="table-edit-amount">
                                                <select
                                                    className="table-input table-select"
                                                    value={editFormData.type}
                                                    onChange={(e) => setEditFormData((prev) => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                                                >
                                                    <option value="expense">Expense</option>
                                                    <option value="income">Income</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="table-input"
                                                    value={editFormData.amount}
                                                    onChange={(e) => setEditFormData((prev) => ({ ...prev, amount: e.target.value }))}
                                                />
                                            </div>
                                        ) : (
                                            `${t.type === 'income' ? '+' : '-'}Rs. ${t.amount.toLocaleString()}`
                                        )}
                                    </td>
                                    <td data-label="Actions">
                                        <div className="table-actions">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        className="table-action-btn save"
                                                        onClick={() => saveEdit(t._id)}
                                                        disabled={savingEdit}
                                                    >
                                                        {savingEdit ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        className="table-action-btn cancel"
                                                        onClick={cancelEditing}
                                                        disabled={savingEdit}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="table-action-btn edit"
                                                        onClick={() => startEditing(t)}
                                                        disabled={deletingId !== null}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="table-action-btn delete"
                                                        onClick={() => deleteTransaction(t._id)}
                                                        disabled={isDeleting || editingId !== null}
                                                    >
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
