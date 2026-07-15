import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface ConfigRow {
    key: string;
    description: string;
    value: string | number | boolean;
    type: 'feature' | 'threshold' | 'ai' | 'system';
    active: boolean;
}

const mockConfigs: ConfigRow[] = [
    { key: 'feature.spendingTrends',          description: 'Enable AI-powered spending trend analysis',      value: true,        type: 'feature',   active: true  },
    { key: 'feature.anomalyDetection',         description: 'Enable real-time anomaly detection engine',      value: true,        type: 'feature',   active: true  },
    { key: 'feature.recurringDetection',       description: 'Auto-detect recurring transaction patterns',     value: true,        type: 'feature',   active: true  },
    { key: 'feature.goalRecommendations',      description: 'AI goal recommendations based on savings',       value: true,        type: 'feature',   active: true  },
    { key: 'feature.budgetRecommendations',    description: 'Smart budget optimization recommendations',      value: true,        type: 'feature',   active: true  },
    { key: 'feature.subscriptionCleanup',      description: 'Detect and flag unused subscriptions',           value: true,        type: 'feature',   active: false },
    { key: 'threshold.anomalyScore',           description: 'Minimum anomaly score to flag a transaction',    value: 0.7,         type: 'threshold', active: true  },
    { key: 'threshold.realtimeIngestion',      description: 'Transaction amount for real-time sync (LKR)',    value: 50000,       type: 'threshold', active: true  },
    { key: 'threshold.recurringOccurrences',   description: 'Min occurrences to classify as recurring',       value: 2,           type: 'threshold', active: true  },
    { key: 'ai.geminiModel',                   description: 'Gemini model used for AI recommendations',       value: 'gemini-pro',type: 'ai',        active: true  },
    { key: 'ai.recommendationBatchSize',       description: 'Max recommendations generated per user per day', value: 5,           type: 'ai',        active: true  },
    { key: 'system.syncBatchSize',             description: 'Bank sync batch size per job run',               value: 50,          type: 'system',    active: true  },
    { key: 'system.consentExpiryDays',         description: 'Days before open banking consent expires (0=never)', value: 0,      type: 'system',    active: true  },
];

const TYPE_COLORS: Record<string, string> = {
    feature: '#6366f1', threshold: '#f59e0b', ai: '#10b981', system: '#3b82f6',
};

export const AdminConfigPage = () => {
    const [configs, setConfigs]   = useState<ConfigRow[]>(mockConfigs);
    const [typeFilter, setTypeFilter] = useState<string>('all');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.get('/admin/config');
                setConfigs(res.data.configs || mockConfigs);
            } catch {
                console.warn('Falling back to mock admin configuration');
            }
        };
        load();
    }, []);

    const toggleConfig = async (key: string) => {
        setConfigs(prev => prev.map(c => c.key === key ? { ...c, active: !c.active } : c));
        await apiClient.patch(`/admin/config/${key}/toggle`).catch(() => undefined);
    };

    const filtered = typeFilter === 'all' ? configs : configs.filter(c => c.type === typeFilter);
    const activeCount = configs.filter(c => c.active).length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">System Configuration</h1>
                    <p className="page-subtitle">Manage feature flags, AI thresholds and system parameters</p>
                </div>
            </div>

            <div className="rec-summary-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                <div className="rec-stat-card"><div className="rec-stat-icon"></div><div><div className="rec-stat-value">{configs.length}</div><div className="rec-stat-label">Total Keys</div></div></div>
                <div className="rec-stat-card accepted"><div className="rec-stat-icon"></div><div><div className="rec-stat-value">{activeCount}</div><div className="rec-stat-label">Active</div></div></div>
                <div className="rec-stat-card"><div className="rec-stat-icon"></div><div><div className="rec-stat-value">{configs.length - activeCount}</div><div className="rec-stat-label">Inactive</div></div></div>
                <div className="rec-stat-card savings"><div className="rec-stat-icon"></div><div><div className="rec-stat-value">{configs.filter(c => c.type === 'ai').length}</div><div className="rec-stat-label">AI Keys</div></div></div>
            </div>

            <div className="filter-pill-row">
                {[
                    { val: 'all',       label: 'All Types',  color: '#6366f1' },
                    { val: 'feature',   label: 'Feature',    color: '#6366f1' },
                    { val: 'threshold', label: 'Threshold',  color: '#f59e0b' },
                    { val: 'ai',        label: 'AI',         color: '#10b981' },
                    { val: 'system',    label: 'System',     color: '#3b82f6' },
                ].map(({ val, label, color }) => (
                    <button key={val}
                        className={`filter-pill ${typeFilter === val ? 'active' : ''}`}
                        style={{ '--fp-color': color } as React.CSSProperties}
                        onClick={() => setTypeFilter(val)}
                    >
                        {label}
                        <span className="pill-count">
                            {val === 'all' ? configs.length : configs.filter(c => c.type === val).length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="admin-table-wrapper">
                    <table className="admin-table" style={{ width: '100%' }}>
                        <thead>
                            <tr><th>Key</th><th>Description</th><th>Type</th><th>Value</th><th>Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.key}>
                                    <td className="admin-cell-strong" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{c.key}</td>
                                    <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)', maxWidth: '280px' }}>{c.description}</td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block', padding: '0.18rem 0.6rem', borderRadius: '10px',
                                            fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                                            background: TYPE_COLORS[c.type] + '22', color: TYPE_COLORS[c.type],
                                            border: `1px solid ${TYPE_COLORS[c.type]}44`
                                        }}>{c.type}</span>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>{String(c.value)}</td>
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
