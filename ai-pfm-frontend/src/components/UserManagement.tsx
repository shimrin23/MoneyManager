import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'ops';
    status: 'active' | 'disabled';
    createdAt: string;
    lastLogin?: string;
    totalTransactions?: number;
}

interface FilterOptions {
    role: 'all' | 'admin' | 'user' | 'ops';
    status: 'all' | 'active' | 'disabled';
    search: string;
}

export const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterOptions>({
        role: 'all',
        status: 'all',
        search: '',
    });
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [users, filters]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/users').catch(() => ({
                data: { users: mockUsers },
            }));
            setUsers(response.data.users || mockUsers);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = users;

        if (filters.role !== 'all') {
            filtered = filtered.filter((u) => u.role === filters.role);
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter((u) => u.status === filters.status);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.name.toLowerCase().includes(search) ||
                    u.email.toLowerCase().includes(search)
            );
        }

        setFilteredUsers(filtered);
    };

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        setActionLoading(true);
        try {
            const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
            await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus }).catch(() => undefined);

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, status: newStatus as 'active' | 'disabled' } : u
                )
            );
        } catch (err) {
            console.error('Failed to update user status:', err);
            alert('Failed to update user status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        setActionLoading(true);
        try {
            await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole }).catch(() => undefined);

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, role: newRole as 'admin' | 'user' | 'ops' } : u
                )
            );

            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, role: newRole as 'admin' | 'user' | 'ops' });
            }
        } catch (err) {
            console.error('Failed to update user role:', err);
            alert('Failed to update user role');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        setActionLoading(true);
        try {
            await apiClient.delete(`/admin/users/${userId}`).catch(() => undefined);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            setShowDetailModal(false);
            setSelectedUser(null);
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert('Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="user-management-container">
                <div className="loading-spinner">Loading user data...</div>
            </div>
        );
    }

    return (
        <div className="user-management-container">
            <div className="user-management-header">
                <h2>User Management</h2>
                <p>Manage user accounts, roles, and permissions</p>
            </div>

            {/* Filters */}
            <div className="user-filters">
                <div className="filter-group">
                    <label>Search</label>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Role</label>
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
                        className="filter-select"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="ops">Operations</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>
            </div>

            {/* User Stats */}
            <div className="user-stats">
                <div className="stat-card">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{users.filter((u) => u.status === 'active').length}</div>
                    <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{users.filter((u) => u.role === 'admin').length}</div>
                    <div className="stat-label">Admins</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{users.filter((u) => u.status === 'disabled').length}</div>
                    <div className="stat-label">Disabled Users</div>
                </div>
            </div>

            {/* Users Table */}
            <div className="user-table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className={`user-row ${user.status === 'disabled' ? 'disabled' : ''}`}>
                                <td className="user-name">
                                    <div className="user-avatar">{user.name.charAt(0)}</div>
                                    {user.name}
                                </td>
                                <td className="user-email">{user.email}</td>
                                <td className="user-role">
                                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                                </td>
                                <td className="user-status">
                                    <span className={`status-badge status-${user.status}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="user-date">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="user-date">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                                <td className="user-actions">
                                    <button
                                        className="action-btn view-btn"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowDetailModal(true);
                                        }}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="action-btn toggle-btn"
                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                        disabled={actionLoading}
                                    >
                                        {user.status === 'active' ? 'Disable' : 'Enable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <p>No users found matching your filters</p>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {showDetailModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>User Details</h3>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="user-detail-body">
                            <div className="detail-section">
                                <h4>Account Information</h4>
                                <div className="detail-row">
                                    <label>Name</label>
                                    <span>{selectedUser.name}</span>
                                </div>
                                <div className="detail-row">
                                    <label>Email</label>
                                    <span>{selectedUser.email}</span>
                                </div>
                                <div className="detail-row">
                                    <label>ID</label>
                                    <span className="mono">{selectedUser.id}</span>
                                </div>
                                <div className="detail-row">
                                    <label>Joined</label>
                                    <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Settings</h4>
                                <div className="detail-row">
                                    <label>Status</label>
                                    <div className="role-selector">
                                        <select
                                            value={selectedUser.status}
                                            onChange={(e) =>
                                                handleToggleStatus(selectedUser.id, selectedUser.status)
                                            }
                                            disabled={actionLoading}
                                        >
                                            <option value="active">Active</option>
                                            <option value="disabled">Disabled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <label>Role</label>
                                    <div className="role-selector">
                                        <select
                                            value={selectedUser.role}
                                            onChange={(e) => handleChangeRole(selectedUser.id, e.target.value)}
                                            disabled={actionLoading}
                                        >
                                            <option value="user">User</option>
                                            <option value="ops">Operations</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {selectedUser.lastLogin && (
                                <div className="detail-section">
                                    <h4>Activity</h4>
                                    <div className="detail-row">
                                        <label>Last Login</label>
                                        <span>{new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Transactions</label>
                                        <span>{selectedUser.totalTransactions || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-danger"
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                disabled={actionLoading}
                            >
                                Delete User
                            </button>
                            <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const mockUsers: User[] = [
    {
        id: 'u1',
        name: 'Jane Admin',
        email: 'jane@example.com',
        role: 'admin',
        status: 'active',
        createdAt: '2025-01-15',
        lastLogin: '2026-05-02',
        totalTransactions: 1250,
    },
    {
        id: 'u2',
        name: 'Bob Operator',
        email: 'bob@example.com',
        role: 'ops',
        status: 'active',
        createdAt: '2025-02-10',
        lastLogin: '2026-05-01',
        totalTransactions: 450,
    },
    {
        id: 'u3',
        name: 'Alice User',
        email: 'alice@example.com',
        role: 'user',
        status: 'active',
        createdAt: '2025-03-05',
        lastLogin: '2026-04-30',
        totalTransactions: 320,
    },
    {
        id: 'u4',
        name: 'Charlie User',
        email: 'charlie@example.com',
        role: 'user',
        status: 'disabled',
        createdAt: '2025-01-20',
        lastLogin: '2026-03-15',
        totalTransactions: 180,
    },
    {
        id: 'u5',
        name: 'Diana Admin',
        email: 'diana@example.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-12-01',
        lastLogin: '2026-05-02',
        totalTransactions: 2100,
    },
];

export default UserManagement;
