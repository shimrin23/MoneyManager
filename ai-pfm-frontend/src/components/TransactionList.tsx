import { useEffect, useState } from 'react';
import { apiClient } from '../api/client.ts';

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

    const syncBank = async () => {
        try {
            await apiClient.post('/transactions/sync');
            fetchTransactions();
        } catch (error) {
            alert("Sync failed");
        }
    };

    return (
        <div className="card transaction-list">
            <div className="header-row">
                <h2>Recent Transactions</h2>
                <button className="secondary-btn" onClick={syncBank}>🔄 Sync Bank</button>
            </div>
            
            <div className="table-container">
                <table className="responsive-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t) => (
                            <tr key={t._id} className={t.type}>
                                <td data-label="Date">
                                    {new Date(t.date).toLocaleDateString()}
                                </td>
                                <td data-label="Description" className="description-cell">
                                    <span className="description-text">{t.description}</span>
                                </td>
                                <td data-label="Category">
                                    <span className="category-tag">{t.category}</span>
                                </td>
                                <td data-label="Amount" className="amount">
                                    {t.type === 'income' ? '+' : '-'}Rs. {t.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
