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

const getDaysUntil = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return null;
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
    
    // New Form State
    const [showNewForm, setShowNewForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newLease, setNewLease] = useState({
        assetName: '',
        assetType: 'vehicle' as Lease['assetType'],
        lessor: '',
        principalAmount: '',
        monthlyPayment: '',
        interestRate: '',
        tenureMonths: '',
        startDate: '',
        icon: '🚗'
    });

    const fetchLeases = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get('/leases');
            setLeases(res.data.leases || []);
        } catch (err: any) {
            console.error('Failed to fetch leases:', err);
            setError('Unable to load leases. Please try again.');
            setLeases([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeases();
    }, []);

    const handleNewLeaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/leases', {
                ...newLease,
                principalAmount: Number(newLease.principalAmount),
                monthlyPayment: Number(newLease.monthlyPayment),
                interestRate: Number(newLease.interestRate),
                tenureMonths: Number(newLease.tenureMonths)
            });
            setShowNewForm(false);
            setNewLease({
                assetName: '', assetType: 'vehicle', lessor: '', principalAmount: '',
                monthlyPayment: '', interestRate: '', tenureMonths: '', startDate: '', icon: '🚗'
            });
            await fetchLeases();
        } catch (err) {
            console.error('Failed to create lease:', err);
            alert('Failed to create lease. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: Lease['status']) => {
        try {
            await apiClient.put(`/leases/${id}`, { status });
            await fetchLeases();
        } catch (err) {
            console.error('Failed to update lease:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this lease?')) return;
        try {
            await apiClient.delete(`/leases/${id}`);
            setLeases(prev => prev.filter(l => l._id !== id));
        } catch (err) {
            console.error('Failed to delete lease:', err);
        }
    };

    const filtered = filter === 'all' ? leases : leases.filter(l => l.status === filter);
    const active = leases.filter(l => l.status === 'active');
    const totalMonthly = active.reduce((s, l) => s + l.monthlyPayment, 0);
    const totalOutstanding = active.reduce((s, l) => s + l.outstandingBalance, 0);

    if (loading) return <div className="loading-spinner">Loading leases...</div>;

    return (
        <div className="page-container leases-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button className="action-btn primary" onClick={() => setShowNewForm(!showNewForm)}>
                    + Add New Lease
                </button>
            </div>

            {error && (
                <div className="rec-alert-banner" style={{ marginBottom: '1.5rem', background: 'rgba(239,68,68,0.15)', borderColor: '#ef4444' }}>
                    {error}
                </div>
            )}

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

            {/* New Lease Form */}
            {showNewForm && (
                <div className="card fd-form-card">
                    <h3 className="section-title">Add New Lease</h3>
                    <form onSubmit={handleNewLeaseSubmit} className="fd-form">
                        <div className="fd-form-grid">
                            <div className="form-group">
                                <label>Asset Name</label>
                                <input type="text" placeholder="e.g. Toyota Aqua 2022" value={newLease.assetName} onChange={e => setNewLease({ ...newLease, assetName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Lessor / Finance Company</label>
                                <input type="text" placeholder="e.g. Commercial Leasing" value={newLease.lessor} onChange={e => setNewLease({ ...newLease, lessor: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Asset Type</label>
                                <select value={newLease.assetType} onChange={e => setNewLease({ ...newLease, assetType: e.target.value as Lease['assetType'] })}>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="property">Property</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Principal Amount (LKR)</label>
                                <input type="number" placeholder="e.g. 4500000" value={newLease.principalAmount} onChange={e => setNewLease({ ...newLease, principalAmount: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Monthly Payment (LKR)</label>
                                <input type="number" placeholder="e.g. 95000" value={newLease.monthlyPayment} onChange={e => setNewLease({ ...newLease, monthlyPayment: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Interest Rate (% p.a.)</label>
                                <input type="number" step="0.1" placeholder="e.g. 14.5" value={newLease.interestRate} onChange={e => setNewLease({ ...newLease, interestRate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Tenure (Months)</label>
                                <input type="number" placeholder="e.g. 60" value={newLease.tenureMonths} onChange={e => setNewLease({ ...newLease, tenureMonths: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input type="date" value={newLease.startDate} onChange={e => setNewLease({ ...newLease, startDate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="fd-form-actions">
                            <button type="submit" className="action-btn primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Lease'}
                            </button>
                            <button type="button" className="action-btn secondary" onClick={() => setShowNewForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty State */}
            {leases.length === 0 && !showNewForm && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', margin: '0 auto 1rem', width: '80px', height: '80px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>No Leases Added</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                        Keep track of your vehicle and equipment leases, outstanding balances, and monthly payments.
                    </p>
                    <button className="action-btn primary" onClick={() => setShowNewForm(true)}>+ Add New Lease</button>
                </div>
            )}

            {/* Filter */}
            {leases.length > 0 && (
                <div className="rec-filter-row">
                    {(['all', 'active', 'completed'] as const).map(f => (
                        <button key={f} className={`rec-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="rec-filter-count">{(f === 'all' ? leases : leases.filter(l => l.status === f)).length}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Lease Cards */}
            <div className="fd-list">
                {filtered.map(lease => {
                    const progress = lease.tenureMonths > 0 ? ((lease.tenureMonths - lease.remainingMonths) / lease.tenureMonths) * 100 : 100;
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
                                        <div className="fd-amount-value">LKR {Math.round(lease.outstandingBalance).toLocaleString()}</div>
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
                                            ⏱ Next payment in {daysUntil}d ({new Date(lease.nextPaymentDate).toLocaleDateString()})
                                        </span>
                                    )}
                                </div>

                                <div className="fd-progress-wrap">
                                    <div className="fd-progress-labels">
                                        <span>{new Date(lease.startDate).toLocaleDateString()}</span>
                                        <span>{Math.round(progress)}% paid off</span>
                                        <span>{new Date(lease.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="fd-progress-bar">
                                        <div className="fd-progress-fill" style={{ width: `${progress}%`, background: lease.status === 'completed' ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="fd-card-actions">
                                {lease.status === 'active' && (
                                    <>
                                        <button className="action-btn secondary small" onClick={() => handleUpdateStatus(lease._id, 'completed')}>Mark Completed</button>
                                        <button className="action-btn danger small" onClick={() => handleDelete(lease._id)}>Delete</button>
                                    </>
                                )}
                                {lease.status !== 'active' && (
                                    <button className="action-btn secondary small" onClick={() => handleDelete(lease._id)}>Delete</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
