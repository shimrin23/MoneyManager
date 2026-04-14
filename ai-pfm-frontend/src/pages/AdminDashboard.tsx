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

    if (loading) return <div className="loading-spinner">Loading admin data...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🛠️ Admin Dashboard</h1>
                <p className="page-subtitle">Manage users, roles, and configuration with audit-friendly toggles.</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <h3>Users</h3>
                </div>
                <div className="table">
                    <div className="table-head">
                        <div>Name</div><div>Email</div><div>Role</div><div>Status</div><div>Actions</div>
                    </div>
                    {users.map((u) => (
                        <div key={u.id} className="table-row">
                            <div>{u.name}</div>
                            <div>{u.email}</div>
                            <div>{u.role}</div>
                            <div><span className={`status-badge ${u.status === 'active' ? 'success' : 'danger'}`}>{u.status}</span></div>
                            <div>
                                <button className="secondary" onClick={() => toggleUser(u.id)}>
                                    {u.status === 'active' ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Configuration</h3>
                </div>
                <div className="table">
                    <div className="table-head">
                        <div>Key</div><div>Type</div><div>Value</div><div>Status</div><div>Actions</div>
                    </div>
                    {configs.map((c) => (
                        <div key={c.key} className="table-row">
                            <div>{c.key}</div>
                            <div>{c.type}</div>
                            <div>{c.value}</div>
                            <div><span className={`status-badge ${c.active ? 'success' : 'danger'}`}>{c.active ? 'active' : 'inactive'}</span></div>
                            <div>
                                <button className="secondary" onClick={() => toggleConfig(c.key)}>
                                    {c.active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
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
