import { formatDate, formatDateTime } from '../utils/appFormat';
import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface SupportTicket {
    id: string;
    ticketNumber: string;
    customerName: string;
    customerEmail: string;
    subject: string;
    message: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'closed';
    createdAt: string;
}

export const AdminSupportPage = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get<SupportTicket[]>('/admin/support/tickets')
            .then(res => setTickets(res.data))
            .catch(() => setError('Could not load support tickets.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page-loading">Loading support tickets...</div>;

    return (
        <div className="admin-page">
            {error && <div className="alert alert-error">{error}</div>}

            {!error && tickets.length === 0 && (
                <p>No support tickets yet.</p>
            )}

            {tickets.length > 0 && (
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Submitted</th>
                                <th>Customer</th>
                                <th>Subject</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>{ticket.ticketNumber}</td>
                                    <td>{formatDateTime(ticket.createdAt)}</td>
                                    <td>
                                        {ticket.customerName}
                                        <br />
                                        <small>{ticket.customerEmail}</small>
                                    </td>
                                    <td>{ticket.subject}</td>
                                    <td>{ticket.category}</td>
                                    <td>{ticket.priority}</td>
                                    <td>{ticket.status}</td>
                                    <td style={{ whiteSpace: 'pre-wrap', maxWidth: 320 }}>{ticket.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
