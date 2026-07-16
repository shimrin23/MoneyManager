import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface Lease {
    _id: string;
    assetName: string;
    assetType: 'vehicle' | 'equipment' | 'property' | 'other';
    lessor: string;
    principalAmount: number;
    monthlyPayment: number;
    interestRate: number;
    tenureMonths: number;
    remainingMonths: number;
    outstandingBalance: number;
    startDate: string;
    endDate: string;
    nextPaymentDate: string;
    status: 'active' | 'completed' | 'defaulted';
    icon: string;
}

const mockLeases: Lease[] = [
    {
        _id: '1',
        assetName: 'Toyota Aqua 2022',
        assetType: 'vehicle',
        lessor: 'Commercial Leasing & Finance PLC',
        principalAmount: 4500000,
        monthlyPayment: 95000,
        interestRate: 14.5,
        tenureMonths: 60,
        remainingMonths: 38,
        outstandingBalance: 2850000,
        startDate: '2022-06-01',
        endDate: '2027-06-01',
        nextPaymentDate: '2026-07-05',
        status: 'active',
        icon: ''
    },
    {
        _id: '2',
        assetName: 'Office Equipment Package',
        assetType: 'equipment',
        lessor: 'Senkadagala Finance PLC',
        principalAmount: 850000,
        monthlyPayment: 22500,
        interestRate: 13.0,
        tenureMonths: 48,
        remainingMonths: 11,
        outstandingBalance: 198000,
        startDate: '2023-08-01',
        endDate: '2027-08-01',
        nextPaymentDate: '2026-07-08',
        status: 'active',
        icon: '🖥️'
    },
    {
        _id: '3',
        assetName: 'Honda CB500 Motorcycle',
        assetType: 'vehicle',
        lessor: 'People\'s Leasing & Finance PLC',
        principalAmount: 650000,
        monthlyPayment: 15500,
        interestRate: 15.0,
        tenureMonths: 48,
        remainingMonths: 0,
        outstandingBalance: 0,
        startDate: '2022-01-01',
        endDate: '2026-01-01',
        nextPaymentDate: '-',
        status: 'completed',
        icon: '🏍️'
    }
];

const getDaysUntil = (dateStr: string) => {
    if (dateStr === '-') return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const assetTypeLabel: Record<string, string> = {
    vehicle: 'Vehicle', equipment: 'Equipment', property: 'Property', other: 'Other'
};

export const LeasesPage = () => {
    const [leases, setLeases] = useState<Lease[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiClient.get('/leases');
                setLeases(res.data.leases || mockLeases);
            } catch {
                setLeases(mockLeases);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filtered = filter === 'all' ? leases : leases.filter(l => l.status === filter);
    const active = leases.filter(l => l.status === 'active');
    const totalMonthly = active.reduce((s, l) => s + l.monthlyPayment, 0);
    const totalOutstanding = active.reduce((s, l) => s + l.outstandingBalance, 0);

    if (loading) return <div className="loading-spinner">Loading leases...</div>;

    return (
        <div className="page-container leases-page">

            {/* Summary */}
            <div className="rec-summary-grid">
                <div className="rec-stat-card">
                    <div className="rec-stat-icon">📄</div>
                    <div>
                        <div className="rec-stat-value">{active.length}</div>
                        <div className="rec-stat-label">Active Leases</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">💸</div>
                    <div>
                        <div className="rec-stat-value">LKR {totalMonthly.toLocaleString()}</div>
                        <div className="rec-stat-label">Monthly Payment</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">⚖️</div>
                    <div>
                        <div className="rec-stat-value">LKR {(totalOutstanding / 1000000).toFixed(2)}M</div>
                        <div className="rec-stat-label">Total Outstanding</div>
                    </div>
                </div>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-icon">✅</div>
                    <div>
                        <div className="rec-stat-value">{leases.filter(l => l.status === 'completed').length}</div>
                        <div className="rec-stat-label">Completed</div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="rec-filter-row">
                {(['all', 'active', 'completed'] as const).map(f => (
                    <button key={f} className={`rec-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className="rec-filter-count">{(f === 'all' ? leases : leases.filter(l => l.status === f)).length}</span>
                    </button>
                ))}
            </div>

            {/* Lease Cards */}
            <div className="fd-list">
                {filtered.map(lease => {
                    const progress = ((lease.tenureMonths - lease.remainingMonths) / lease.tenureMonths) * 100;
                    const daysUntil = getDaysUntil(lease.nextPaymentDate);
                    return (
                        <div key={lease._id} className={`fd-card ${lease.status}`}>
                            <div className="fd-card-header">
                                <div className="fd-card-title-row">
                                    <span className="fd-icon">{lease.icon}</span>
                                    <div>
                                        <div className="fd-account">{lease.assetName}</div>
                                        <div className="fd-bank">{lease.lessor}</div>
                                    </div>
                                    <div className="fd-badges">
                                        <span className="fd-type-badge">{assetTypeLabel[lease.assetType]}</span>
                                        <span className="fd-status-badge" style={{ color: lease.status === 'active' ? '#10b981' : lease.status === 'completed' ? '#6366f1' : '#ef4444' }}>
                                            {lease.status === 'active' ? 'Active' : lease.status === 'completed' ? 'Completed' : 'Defaulted'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="fd-card-body">
                                <div className="fd-amounts-row">
                                    <div className="fd-amount-item">
                                        <div className="fd-amount-label">Monthly Payment</div>
                                        <div className="fd-amount-value">LKR {lease.monthlyPayment.toLocaleString()}</div>
                                    </div>
                                    <div className="fd-amount-item highlight">
                                        <div className="fd-amount-label">Outstanding</div>
                                        <div className="fd-amount-value">LKR {lease.outstandingBalance.toLocaleString()}</div>
                                    </div>
                                    <div className="fd-amount-item">
                                        <div className="fd-amount-label">Remaining</div>
                                        <div className="fd-amount-value">{lease.remainingMonths} months</div>
                                    </div>
                                </div>

                                <div className="fd-details-row">
                                    <span>📊 {lease.interestRate}% p.a.</span>
                                    <span>📅 {lease.tenureMonths} months tenure</span>
                                    {lease.status === 'active' && daysUntil !== null && (
                                        <span style={{ color: daysUntil <= 7 ? '#f59e0b' : 'var(--text-muted)' }}>
                                            ⏱ Next payment in {daysUntil}d ({lease.nextPaymentDate})
                                        </span>
                                    )}
                                </div>

                                <div className="fd-progress-wrap">
                                    <div className="fd-progress-labels">
                                        <span>{lease.startDate}</span>
                                        <span>{Math.round(progress)}% paid off</span>
                                        <span>{lease.endDate}</span>
                                    </div>
                                    <div className="fd-progress-bar">
                                        <div className="fd-progress-fill" style={{ width: `${progress}%`, background: lease.status === 'completed' ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="fd-card-actions">
                                {lease.status === 'active' && (
                                    <>
                                        <button className="action-btn secondary small">📋 View Schedule</button>
                                        <button className="action-btn secondary small">💳 Make Payment</button>
                                        <button className="action-btn danger small">🏁 Early Settlement</button>
                                    </>
                                )}
                                {lease.status === 'completed' && (
                                    <button className="action-btn secondary small">📄 View Agreement</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
