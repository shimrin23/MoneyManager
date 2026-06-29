import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface UserRow {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin' | 'ops' | 'manager';
    status: 'active' | 'disabled';
    segment: string;
    joined: string;
}

const mockUsers: UserRow[] = [
    { id: 'u1', name: 'Kasun Perera',    email: 'kasun@example.com',   role: 'customer', status: 'active',   segment: 'premium',  joined: '2025-01-12' },
    { id: 'u2', name: 'Nimali Silva',    email: 'nimali@example.com',  role: 'customer', status: 'active',   segment: 'standard', joined: '2025-03-05' },
    { id: 'u3', name: 'Admin User',      email: 'admin@epiclanka.lk',  role: 'admin',    status: 'active',   segment: 'premium',  joined: '2024-11-01' },
    { id: 'u4', name: 'Ops Staff',       email: 'ops@epiclanka.lk',    role: 'ops',      status: 'active',   segment: 'standard', joined: '2024-11-01' },
    { id: 'u5', name: 'Saman Fernando',  email: 'saman@example.com',   role: 'customer', status: 'disabled', segment: 'basic',    joined: '2025-06-01' },
    { id: 'u6', name: 'Branch Manager',  email: 'manager@epiclanka.lk',role: 'manager',  status: 'active',   segment: 'premium',  joined: '2024-12-15' },
];

const ROLE_COLORS: Record<string, string> = {
    customer: '#3b82f6', admin: '#ef4444', ops: '#f59e0b', manager: '#8b5cf6',
};

export const AdminUsersPage = () => {
    const [users, setUsers]     = useState<UserRow[]>(mockUsers);
    const [search, setSearch]   = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.get('/admin/users');
                setUsers(res.data.users || mockUsers);
            } catch {
                console.warn('Falling back to mock admin users');
            }
        };
        load();
    }, []);

    const toggleUser = async (id: string) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u));
        await apiClient.patch(`/admin/users/${id}/toggle`).catch(() => undefined);
    };

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole   = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const stats = {
        total:    users.length,
        active:   users.filter(u => u.status === 'active').length,
        disabled: users.filter(u => u.status === 'disabled').length,
        premium:  users.filter(u => u.segment === 'premium').length,
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">👥 User Management</h1>
                    <p className="page-subtitle">View, enable, disable and manage all platform users</p>
                </div>
            </div>

            <div className="rec-summary-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                <div className="rec-stat-card"><div className="rec-stat-icon">👥</div><div><div className="rec-stat-value">{stats.total}</div><div className="rec-stat-label">Total Users</div></div></div>
                <div className="rec-stat-card accepted"><div className="rec-stat-icon">✅</div><div><div className="rec-stat-value">{stats.active}</div><div className="rec-stat-label">Active</div></div></div>
                <div className="rec-stat-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}><div className="rec-stat-icon">🚫</div><div><div className="rec-stat-value">{stats.disabled}</div><div className="rec-stat-label">Disabled</div></div></div>
                <div className="rec-stat-card savings"><div className="rec-stat-icon">⭐</div><div><div className="rec-stat-value">{stats.premium}</div><div className="rec-stat-label">Premium</div></div></div>
            </div>

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <input
                    type="text" placeholder="🔍  Search by name or email..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '200px', padding: '0.6rem 1rem', borderRadius: '10px',
                             border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: '0.88rem' }}
                />
                <div className="filter-pill-row" style={{ marginBottom: 0 }}>
                    {[
                        { val: 'all',      label: 'All Roles', color: '#6366f1' },
                        { val: 'customer', label: 'Customer',  color: '#3b82f6' },
                        { val: 'admin',    label: 'Admin',     color: '#ef4444' },
                        { val: 'ops',      label: 'Ops',       color: '#f59e0b' },
                        { val: 'manager',  label: 'Manager',   color: '#8b5cf6' },
                    ].map(({ val, label, color }) => (
                        <button key={val}
                            className={`filter-pill ${roleFilter === val ? 'active' : ''}`}
                            style={{ '--fp-color': color } as React.CSSProperties}
                            onClick={() => setRoleFilter(val)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="admin-table-wrapper">
                    <table className="admin-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Name</th><th>Email</th><th>Role</th>
                                <th>Segment</th><th>Joined</th><th>Status</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id}>
                                    <td className="admin-cell-strong">{u.name}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{u.email}</td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '10px',
                                            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                                            background: ROLE_COLORS[u.role] + '22', color: ROLE_COLORS[u.role],
                                            border: `1px solid ${ROLE_COLORS[u.role]}44`
                                        }}>{u.role}</span>
                                    </td>
                                    <td style={{ fontSize: '0.84rem', textTransform: 'capitalize' }}>{u.segment}</td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.joined}</td>
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
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users match your search</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
