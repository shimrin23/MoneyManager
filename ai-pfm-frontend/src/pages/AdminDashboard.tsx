import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import '../styles/FinancialPages.css';

interface UserRow {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'disabled';
}

interface ConfigRow {
    key: string;
    value: string;
    type: string;
    active: boolean;
}

export const AdminDashboard = () => {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [configs, setConfigs] = useState<ConfigRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [u, c] = await Promise.all([
                apiClient.get('/admin/users').catch(() => ({ data: { users: mockUsers } })),
                apiClient.get('/admin/config').catch(() => ({ data: { configs: mockConfigs } })),
            ]);
            setUsers(u.data.users || mockUsers);
            setConfigs(c.data.configs || mockConfigs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = async (userId: string) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u)));
        await apiClient.patch(`/admin/users/${userId}/toggle`).catch(() => undefined);
    };

    const toggleConfig = async (key: string) => {
        setConfigs((prev) => prev.map((c) => (c.key === key ? { ...c, active: !c.active } : c)));
        await apiClient.patch(`/admin/config/${key}/toggle`).catch(() => undefined);
    };

    const formatRole = (role: string) => {
        if (role === 'ops') return 'Operations';
        if (role === 'admin') return 'Admin';
        return 'User';
    };

    if (loading) return <div className="loading-spinner">Loading admin data...</div>;

    return (
        <div className="page-container admin-dashboard-page">
            <div className="page-header">
                <h1>🛠️ Admin Dashboard</h1>
                <p className="page-subtitle">Manage users, roles, and configuration with audit-friendly toggles.</p>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <span className="admin-stat-label">Total Users</span>
                    <span className="admin-stat-value">{users.length}</span>
                </div>
                <div className="admin-stat-card">
                    <span className="admin-stat-label">Active Users</span>
                    <span className="admin-stat-value">{users.filter((u) => u.status === 'active').length}</span>
                </div>
                <div className="admin-stat-card">
                    <span className="admin-stat-label">Disabled Users</span>
                    <span className="admin-stat-value">{users.filter((u) => u.status === 'disabled').length}</span>
                </div>
                <div className="admin-stat-card">
                    <span className="admin-stat-label">Config Keys</span>
                    <span className="admin-stat-value">{configs.length}</span>
                </div>
            </div>

            <div className="card admin-section" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header admin-section-header">
                    <h3>Users</h3>
                </div>
                <div className="admin-table-wrapper">
                    <table className="admin-table" aria-label="Users table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="admin-cell-strong">{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{formatRole(u.role)}</td>
                                    <td>
                                        <span className={`admin-status-badge ${u.status === 'active' ? 'is-success' : 'is-danger'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="secondary admin-action-btn" onClick={() => toggleUser(u.id)}>
                                            {u.status === 'active' ? 'Disable' : 'Enable'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card admin-section">
                <div className="card-header admin-section-header">
                    <h3>Configuration</h3>
                </div>
                <div className="admin-table-wrapper">
                    <table className="admin-table" aria-label="Configuration table">
                        <thead>
                            <tr>
                                <th>Key</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configs.map((c) => (
                                <tr key={c.key}>
                                    <td className="admin-cell-strong">{c.key}</td>
                                    <td>{c.type}</td>
                                    <td>{c.value}</td>
                                    <td>
                                        <span className={`admin-status-badge ${c.active ? 'is-success' : 'is-danger'}`}>
                                            {c.active ? 'active' : 'inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="secondary admin-action-btn" onClick={() => toggleConfig(c.key)}>
                                            {c.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const mockUsers: UserRow[] = [
    { id: 'u1', name: 'Jane Admin', email: 'jane@example.com', role: 'admin', status: 'active' },
    { id: 'u2', name: 'Bob Ops', email: 'bob@example.com', role: 'ops', status: 'disabled' },
];

const mockConfigs: ConfigRow[] = [
    { key: 'feature.spendingTrends', value: 'on', type: 'feature', active: true },
    { key: 'limits.syncBatchSize', value: '50', type: 'system', active: true },
    { key: 'ai.geminiModel', value: 'gemini-pro', type: 'ai', active: true },
];

export default AdminDashboard;
