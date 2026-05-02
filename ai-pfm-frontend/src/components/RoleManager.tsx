import { useState } from 'react';
import { apiClient } from '../api/client';

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    userCount: number;
}

interface Permission {
    id: string;
    name: string;
    description: string;
    category: 'users' | 'transactions' | 'config' | 'reports';
}

export const RoleManager = () => {
    const [roles, setRoles] = useState<Role[]>(mockRoles);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleSaveRole = async (role: Role) => {
        setActionLoading(true);
        try {
            await apiClient.put(`/admin/roles/${role.id}`, role).catch(() => undefined);
            setRoles((prev) =>
                prev.map((r) => (r.id === role.id ? role : r))
            );
            setShowRoleModal(false);
            setSelectedRole(null);
        } catch (err) {
            console.error('Failed to save role:', err);
            alert('Failed to save role');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="role-manager-container">
            <div className="role-manager-header">
                <h2>Role Management</h2>
                <p>Define roles and manage permissions</p>
            </div>

            <div className="roles-grid">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="role-card"
                        onClick={() => {
                            setSelectedRole(role);
                            setShowRoleModal(true);
                        }}
                    >
                        <div className="role-card-header">
                            <h3>{role.name}</h3>
                            <span className="user-count">{role.userCount} users</span>
                        </div>
                        <p className="role-description">{role.description}</p>
                        <div className="permissions-preview">
                            {role.permissions.slice(0, 3).map((p) => (
                                <span key={p.id} className="permission-tag">
                                    {p.name}
                                </span>
                            ))}
                            {role.permissions.length > 3 && (
                                <span className="permission-tag more">
                                    +{role.permissions.length - 3} more
                                </span>
                            )}
                        </div>
                        <button className="btn-manage" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRole(role);
                            setShowRoleModal(true);
                        }}>
                            Manage
                        </button>
                    </div>
                ))}
            </div>

            {/* Role Detail Modal */}
            {showRoleModal && selectedRole && (
                <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                    <div className="modal-content role-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedRole.name} Role</h3>
                            <button className="modal-close" onClick={() => setShowRoleModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="role-detail-body">
                            <div className="detail-section">
                                <h4>Role Information</h4>
                                <p className="role-description">{selectedRole.description}</p>
                                <div className="info-item">
                                    <span className="label">Users with this role:</span>
                                    <span className="value">{selectedRole.userCount}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Permissions</h4>
                                <div className="permissions-grid">
                                    {mockPermissions.map((category) => (
                                        <div key={category.category} className="permission-category">
                                            <h5>{category.category.charAt(0).toUpperCase() + category.category.slice(1)}</h5>
                                            {category.items.map((permission) => (
                                                <div key={permission.id} className="permission-item">
                                                    <input
                                                        type="checkbox"
                                                        id={`perm-${permission.id}`}
                                                        checked={selectedRole.permissions.some(
                                                            (p) => p.id === permission.id
                                                        )}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedRole({
                                                                    ...selectedRole,
                                                                    permissions: [
                                                                        ...selectedRole.permissions,
                                                                        permission,
                                                                    ],
                                                                });
                                                            } else {
                                                                setSelectedRole({
                                                                    ...selectedRole,
                                                                    permissions: selectedRole.permissions.filter(
                                                                        (p) => p.id !== permission.id
                                                                    ),
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor={`perm-${permission.id}`}>
                                                        <strong>{permission.name}</strong>
                                                        <p>{permission.description}</p>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-primary"
                                onClick={() => handleSaveRole(selectedRole)}
                                disabled={actionLoading}
                            >
                                Save Role
                            </button>
                            <button className="btn-secondary" onClick={() => setShowRoleModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const mockRoles: Role[] = [
    {
        id: 'r1',
        name: 'Admin',
        description: 'Full system access with all permissions',
        permissions: [
            { id: 'p1', name: 'Manage Users', description: 'Create, edit, delete users', category: 'users' },
            { id: 'p2', name: 'View Transactions', description: 'View all transactions', category: 'transactions' },
            { id: 'p3', name: 'Edit Config', description: 'Modify system configuration', category: 'config' },
            { id: 'p4', name: 'View Reports', description: 'Access all reports', category: 'reports' },
        ],
        userCount: 2,
    },
    {
        id: 'r2',
        name: 'User',
        description: 'Standard user with limited permissions',
        permissions: [
            { id: 'p2', name: 'View Transactions', description: 'View own transactions', category: 'transactions' },
            { id: 'p4', name: 'View Reports', description: 'View own reports', category: 'reports' },
        ],
        userCount: 45,
    },
    {
        id: 'r3',
        name: 'Operations',
        description: 'Operations staff with moderate permissions',
        permissions: [
            { id: 'p1', name: 'Manage Users', description: 'View and manage users', category: 'users' },
            { id: 'p2', name: 'View Transactions', description: 'View all transactions', category: 'transactions' },
            { id: 'p4', name: 'View Reports', description: 'Access all reports', category: 'reports' },
        ],
        userCount: 3,
    },
];

const mockPermissions = [
    {
        category: 'users',
        items: [
            { id: 'p1', name: 'Manage Users', description: 'Create, edit, and delete user accounts', category: 'users' as const },
            { id: 'p5', name: 'View Users', description: 'View user information', category: 'users' as const },
            { id: 'p6', name: 'Reset Password', description: 'Reset user passwords', category: 'users' as const },
        ],
    },
    {
        category: 'transactions',
        items: [
            { id: 'p2', name: 'View Transactions', description: 'View transaction records', category: 'transactions' as const },
            { id: 'p7', name: 'Edit Transactions', description: 'Modify transaction records', category: 'transactions' as const },
            { id: 'p8', name: 'Delete Transactions', description: 'Delete transaction records', category: 'transactions' as const },
        ],
    },
    {
        category: 'config',
        items: [
            { id: 'p3', name: 'Edit Config', description: 'Modify system configuration', category: 'config' as const },
            { id: 'p9', name: 'View Config', description: 'View system configuration', category: 'config' as const },
        ],
    },
    {
        category: 'reports',
        items: [
            { id: 'p4', name: 'View Reports', description: 'Access system reports', category: 'reports' as const },
            { id: 'p10', name: 'Export Reports', description: 'Export report data', category: 'reports' as const },
            { id: 'p11', name: 'Schedule Reports', description: 'Schedule automated reports', category: 'reports' as const },
        ],
    },
];

export default RoleManager;
