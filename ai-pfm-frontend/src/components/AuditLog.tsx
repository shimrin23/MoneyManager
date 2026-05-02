import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface AuditEntry {
    id: string;
    timestamp: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: Record<string, any>;
    status: 'success' | 'failed';
    ipAddress?: string;
}

export const AuditLog = () => {
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: 'all',
        status: 'all',
        dateRange: 'all',
        search: '',
    });
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    useEffect(() => {
        loadAuditLogs();
    }, []);

    const loadAuditLogs = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/audit-logs').catch(() => ({
                data: { logs: mockAuditLogs },
            }));
            setAuditLogs(response.data.logs || mockAuditLogs);
        } catch (err) {
            console.error('Failed to load audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create':
                return '✚';
            case 'update':
                return '✎';
            case 'delete':
                return '✕';
            case 'login':
                return '→';
            case 'logout':
                return '←';
            default:
                return '◆';
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'create':
                return 'action-create';
            case 'update':
                return 'action-update';
            case 'delete':
                return 'action-delete';
            case 'login':
                return 'action-login';
            case 'logout':
                return 'action-logout';
            default:
                return 'action-default';
        }
    };

    if (loading) {
        return (
            <div className="audit-log-container">
                <div className="loading-spinner">Loading audit logs...</div>
            </div>
        );
    }

    return (
        <div className="audit-log-container">
            <div className="audit-log-header">
                <h2>Audit Log</h2>
                <p>Track all system activities and changes</p>
            </div>

            {/* Filters */}
            <div className="audit-filters">
                <div className="filter-group">
                    <label>Search</label>
                    <input
                        type="text"
                        placeholder="Search by user, action, or entity..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Action</label>
                    <select
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        className="filter-select"
                    >
                        <option value="all">All Actions</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Date Range</label>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                        className="filter-select"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>

            {/* Audit Logs Timeline */}
            <div className="audit-timeline">
                {auditLogs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    auditLogs.map((log) => (
                        <div
                            key={log.id}
                            className={`audit-entry ${log.status === 'failed' ? 'failed' : ''}`}
                        >
                            <div
                                className="audit-entry-header"
                                onClick={() =>
                                    setExpandedLog(expandedLog === log.id ? null : log.id)
                                }
                            >
                                <div className={`action-icon ${getActionColor(log.action)}`}>
                                    {getActionIcon(log.action)}
                                </div>
                                <div className="entry-info">
                                    <div className="entry-title">
                                        <strong>{log.action.toUpperCase()}</strong>
                                        <span className="entity-type">{log.entityType}</span>
                                        <span
                                            className={`status-badge status-${log.status}`}
                                        >
                                            {log.status}
                                        </span>
                                    </div>
                                    <div className="entry-meta">
                                        <span className="user-id">{log.userId}</span>
                                        <span className="timestamp">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                        {log.ipAddress && (
                                            <span className="ip-address">{log.ipAddress}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="expand-icon">
                                    {expandedLog === log.id ? '▼' : '▶'}
                                </div>
                            </div>

                            {expandedLog === log.id && (
                                <div className="audit-entry-details">
                                    <div className="detail-section">
                                        <h5>Entity Information</h5>
                                        <div className="detail-item">
                                            <span className="label">Entity Type:</span>
                                            <span className="value">{log.entityType}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Entity ID:</span>
                                            <span className="value mono">{log.entityId}</span>
                                        </div>
                                    </div>

                                    {Object.keys(log.changes).length > 0 && (
                                        <div className="detail-section">
                                            <h5>Changes</h5>
                                            {Object.entries(log.changes).map(([key, value]) => (
                                                <div key={key} className="change-item">
                                                    <span className="change-field">{key}:</span>
                                                    <span className="change-value">
                                                        {typeof value === 'object'
                                                            ? JSON.stringify(value)
                                                            : String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="detail-section">
                                        <h5>Access Information</h5>
                                        <div className="detail-item">
                                            <span className="label">User ID:</span>
                                            <span className="value">{log.userId}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Timestamp:</span>
                                            <span className="value">
                                                {new Date(log.timestamp).toISOString()}
                                            </span>
                                        </div>
                                        {log.ipAddress && (
                                            <div className="detail-item">
                                                <span className="label">IP Address:</span>
                                                <span className="value mono">{log.ipAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const mockAuditLogs: AuditEntry[] = [
    {
        id: 'al1',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        userId: 'u1',
        action: 'update',
        entityType: 'user',
        entityId: 'u2',
        changes: { status: 'disabled', role: 'ops' },
        status: 'success',
        ipAddress: '192.168.1.100',
    },
    {
        id: 'al2',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        userId: 'u3',
        action: 'create',
        entityType: 'transaction',
        entityId: 'tx-12345',
        changes: { amount: 500, category: 'groceries' },
        status: 'success',
        ipAddress: '192.168.1.101',
    },
    {
        id: 'al3',
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
        userId: 'u1',
        action: 'login',
        entityType: 'session',
        entityId: 'sess-789',
        changes: {},
        status: 'success',
        ipAddress: '192.168.1.102',
    },
    {
        id: 'al4',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        userId: 'u4',
        action: 'delete',
        entityType: 'transaction',
        entityId: 'tx-11111',
        changes: { reason: 'duplicate entry' },
        status: 'failed',
        ipAddress: '192.168.1.103',
    },
    {
        id: 'al5',
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        userId: 'u2',
        action: 'update',
        entityType: 'config',
        entityId: 'cfg-sync-batch',
        changes: { old_value: '50', new_value: '100' },
        status: 'success',
        ipAddress: '192.168.1.104',
    },
];

export default AuditLog;
