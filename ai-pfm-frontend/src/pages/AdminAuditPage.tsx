import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface AuditEntry {
    id: string;
    timestamp: string;
    actor: string;
    actorRole: string;
    action: string;
    resource: string;
    details: string;
    severity: 'info' | 'warning' | 'critical';
}

const mockAudit: AuditEntry[] = [
    { id: 'a1',  timestamp: '2026-06-29 12:41:05', actor: 'admin@epiclanka.lk',   actorRole: 'admin',   action: 'LOGIN',           resource: 'Auth',          details: 'Admin login from 192.168.1.10',              severity: 'info'     },
    { id: 'a2',  timestamp: '2026-06-29 12:40:12', actor: 'ops@epiclanka.lk',     actorRole: 'ops',     action: 'USER_DISABLED',   resource: 'User:u5',       details: 'Disabled user saman@example.com',            severity: 'warning'  },
    { id: 'a3',  timestamp: '2026-06-29 11:55:00', actor: 'admin@epiclanka.lk',   actorRole: 'admin',   action: 'CONFIG_CHANGED',  resource: 'Config',        details: 'Toggled feature.subscriptionCleanup → false', severity: 'warning'  },
    { id: 'a4',  timestamp: '2026-06-29 10:30:21', actor: 'manager@epiclanka.lk', actorRole: 'manager', action: 'REPORT_VIEWED',   resource: 'Analytics',     details: 'Viewed Reports & Analytics dashboard',       severity: 'info'     },
    { id: 'a5',  timestamp: '2026-06-29 09:15:44', actor: 'system',               actorRole: 'system',  action: 'ANOMALY_FLAGGED', resource: 'Tx:txn-8821',   details: 'Risk score 0.92 duplicate transaction',      severity: 'critical' },
    { id: 'a6',  timestamp: '2026-06-28 17:02:11', actor: 'ops@epiclanka.lk',     actorRole: 'ops',     action: 'USER_ENABLED',    resource: 'User:u3',       details: 'Re-enabled user kasun@example.com',          severity: 'info'     },
    { id: 'a7',  timestamp: '2026-06-28 14:55:30', actor: 'system',               actorRole: 'system',  action: 'SYNC_COMPLETED',  resource: 'BankSync',      details: 'Bank data sync: 142 transactions processed',  severity: 'info'     },
    { id: 'a8',  timestamp: '2026-06-28 11:10:00', actor: 'admin@epiclanka.lk',   actorRole: 'admin',   action: 'ROLE_CHANGED',    resource: 'User:u6',       details: 'Changed role customer → manager',            severity: 'critical' },
    { id: 'a9',  timestamp: '2026-06-27 16:30:00', actor: 'system',               actorRole: 'system',  action: 'ANOMALY_FLAGGED', resource: 'Tx:txn-7744',   details: 'Unusual merchant detected risk 0.78',        severity: 'warning'  },
    { id: 'a10', timestamp: '2026-06-27 09:00:00', actor: 'ops@epiclanka.lk',     actorRole: 'ops',     action: 'LOGIN',           resource: 'Auth',          details: 'Ops staff login from 10.0.0.5',              severity: 'info'     },
];

const SEVERITY_COLORS: Record<string, string> = {
    info: '#10b981', warning: '#f59e0b', critical: '#ef4444',
};
const ACTION_ICONS: Record<string, string> = {
    LOGIN: '', USER_DISABLED: '', USER_ENABLED: '', CONFIG_CHANGED: '',
    REPORT_VIEWED: '', ANOMALY_FLAGGED: '', SYNC_COMPLETED: '', ROLE_CHANGED: '',
};

export const AdminAuditPage = () => {
    const [logs, setLogs]         = useState<AuditEntry[]>(mockAudit);
    const [severity, setSeverity] = useState<string>('all');
    const [search, setSearch]     = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.get('/admin/audit');
                setLogs(res.data.logs || mockAudit);
            } catch {
                console.warn('Falling back to mock audit logs');
            }
        };
        load();
    }, []);

    const filtered = logs.filter(l => {
        const matchSev    = severity === 'all' || l.severity === severity;
        const matchSearch = l.actor.toLowerCase().includes(search.toLowerCase()) ||
                            l.action.toLowerCase().includes(search.toLowerCase()) ||
                            l.details.toLowerCase().includes(search.toLowerCase());
        return matchSev && matchSearch;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Audit Logs</h1>
                    <p className="page-subtitle">Full activity trail: all admin, ops, and system actions</p>
                </div>
            </div>

            <div className="rec-summary-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                <div className="rec-stat-card"><div className="rec-stat-icon"></div><div><div className="rec-stat-value">{logs.length}</div><div className="rec-stat-label">Total Events</div></div></div>
                <div className="rec-stat-card"><div className="rec-stat-icon"></div><div><div className="rec-stat-value" style={{ color: '#ef4444' }}>{logs.filter(l => l.severity === 'critical').length}</div><div className="rec-stat-label">Critical</div></div></div>
                <div className="rec-stat-card pending"><div className="rec-stat-icon"></div><div><div className="rec-stat-value" style={{ color: '#f59e0b' }}>{logs.filter(l => l.severity === 'warning').length}</div><div className="rec-stat-label">Warnings</div></div></div>
                <div className="rec-stat-card accepted"><div className="rec-stat-icon"></div><div><div className="rec-stat-value">{logs.filter(l => l.severity === 'info').length}</div><div className="rec-stat-label">Info</div></div></div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.95rem',
                            color: 'var(--text-muted)',
                            pointerEvents: 'none',
                        }}
                    >
                        
                    </span>
                    <input
                        type="text" placeholder="Search actor, action or details..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.7rem', borderRadius: '10px',
                                 border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: '0.88rem',
                                 boxSizing: 'border-box' }}
                    />
                </div>
                <div className="filter-pill-row" style={{ marginBottom: 0 }}>
                    {[
                        { val: 'all',      label: 'All',      color: '#6366f1' },
                        { val: 'info',     label: 'Info',     color: '#10b981' },
                        { val: 'warning',  label: 'Warning',  color: '#f59e0b' },
                        { val: 'critical', label: 'Critical', color: '#ef4444' },
                    ].map(({ val, label, color }) => (
                        <button key={val}
                            className={`filter-pill ${severity === val ? 'active' : ''}`}
                            style={{ '--fp-color': color } as React.CSSProperties}
                            onClick={() => setSeverity(val)}
                        >
                            {label}
                            <span className="pill-count">
                                {val === 'all' ? logs.length : logs.filter(l => l.severity === val).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="admin-table-wrapper">
                    <table className="admin-table" style={{ width: '100%' }}>
                        <thead>
                            <tr><th>Time</th><th>Actor</th><th>Action</th><th>Resource</th><th>Details</th><th>Severity</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(l => (
                                <tr key={l.id}>
                                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{l.timestamp}</td>
                                    <td>
                                        <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{l.actor}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{l.actorRole}</div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'monospace' }}>
                                            {ACTION_ICONS[l.action] || '📝'} {l.action}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{l.resource}</td>
                                    <td style={{ fontSize: '0.82rem', maxWidth: '260px' }}>{l.details}</td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '10px',
                                            fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                                            background: SEVERITY_COLORS[l.severity] + '22',
                                            color: SEVERITY_COLORS[l.severity],
                                            border: `1px solid ${SEVERITY_COLORS[l.severity]}44`
                                        }}>{l.severity}</span>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No logs match your filter</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
