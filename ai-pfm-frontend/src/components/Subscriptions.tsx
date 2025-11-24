import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface Sub {
    name: string;
    amount: number;
    risk: 'High' | 'Low';
}

export const Subscriptions = () => {
    const [subs, setSubs] = useState<Sub[]>([]);

    useEffect(() => {
        apiClient.get('/transactions/subscriptions')
            .then(res => setSubs(res.data.subscriptions))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="card subscription-card">
            <h2>📅 Recurring Subscriptions</h2>
            <p className="sub-subtitle">Detected from your transaction history.</p>
            
            {subs.length === 0 ? <p>No subscriptions found.</p> : (
                <ul className="sub-list">
                    {subs.map((s, index) => (
                        <li key={index} className="sub-item">
                            <div className="sub-icon">
                                {s.name[0]} {/* First letter as icon */}
                            </div>
                            <div className="sub-details">
                                <strong>{s.name}</strong>
                                {s.risk === 'High' && <span className="badge-alert">Review Cost</span>}
                            </div>
                            <div className="sub-amount">-${s.amount}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};