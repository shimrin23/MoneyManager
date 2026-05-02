import { useState } from 'react';
import UserManagement from './UserManagement';
import RoleManager from './RoleManager';
import AuditLog from './AuditLog';
import '../styles/AdminDashboard.css';

type AdminTab = 'users' | 'roles' | 'audit';

export const AdminDashboardEnhanced = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('users');

    const tabs: { id: AdminTab; label: string; icon: string; description: string }[] = [
        {
            id: 'users',
            label: 'User Management',
            icon: '👥',
            description: 'Manage user accounts and permissions',
        },
        {
            id: 'roles',
            label: 'Role Management',
            icon: '🔐',
            description: 'Define roles and manage permissions',
        },
        {
            id: 'audit',
            label: 'Audit Log',
            icon: '📋',
            description: 'Track system activities and changes',
        },
    ];

    return (
        <div className="admin-dashboard-enhanced">
            <div className="admin-dashboard-header">
                <div className="header-content">
                    <h1>🛠️ Admin Dashboard</h1>
                    <p className="header-subtitle">Manage system, users, roles, and track all activities</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="admin-tabs-container">
                <div className="admin-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className="tab-description">
                    {tabs.find((t) => t.id === activeTab)?.description}
                </div>
            </div>

            {/* Tab Content */}
            <div className="admin-content">
                {activeTab === 'users' && (
                    <div className="tab-content active">
                        <UserManagement />
                    </div>
                )}
                {activeTab === 'roles' && (
                    <div className="tab-content active">
                        <RoleManager />
                    </div>
                )}
                {activeTab === 'audit' && (
                    <div className="tab-content active">
                        <AuditLog />
                    </div>
                )}
            </div>

            {/* Quick Stats Footer */}
            <div className="admin-footer">
                <div className="footer-info">
                    <p>Last updated: {new Date().toLocaleString()}</p>
                </div>
                <div className="footer-actions">
                    <button className="btn-export">📥 Export Data</button>
                    <button className="btn-refresh">🔄 Refresh</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardEnhanced;
