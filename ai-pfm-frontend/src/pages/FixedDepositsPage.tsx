import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface FixedDeposit {
    _id: string;
    accountNumber: string;
    principalAmount: number;
    interestRate: number;
    tenure: number;
    tenureUnit: 'months' | 'years';
    startDate: string;
    maturityDate: string;
    maturityAmount: number;
    interestEarned: number;
    type: 'Standard' | 'Goal-Linked' | 'Tax Saver';
    status: 'active' | 'matured' | 'prematurely-closed';
    autoRenewal: boolean;
    bank: string;
}

const mockFDs: FixedDeposit[] = [
    {
        _id: '1',
        accountNumber: 'FD-****-8821',
        principalAmount: 500000,
        interestRate: 12.5,
        tenure: 12,
        tenureUnit: 'months',
        startDate: '2026-01-10',
        maturityDate: '2027-01-10',
        maturityAmount: 562500,
        interestEarned: 31250,
        type: 'Standard',
        status: 'active',
        autoRenewal: true,
        bank: 'Commercial Bank'
    },
    {
        _id: '2',
        accountNumber: 'FD-****-3345',
        principalAmount: 200000,
        interestRate: 11.0,
        tenure: 6,
        tenureUnit: 'months',
        startDate: '2026-03-15',
        maturityDate: '2026-09-15',
        maturityAmount: 211000,
        interestEarned: 5500,
        type: 'Goal-Linked',
        status: 'active',
        autoRenewal: false,
        bank: 'HNB'
    },
    {
        _id: '3',
        accountNumber: 'FD-****-6612',
        principalAmount: 150000,
        interestRate: 13.0,
        tenure: 24,
        tenureUnit: 'months',
        startDate: '2024-06-01',
        maturityDate: '2026-06-01',
        maturityAmount: 171500,
        interestEarned: 21500,
        type: 'Tax Saver',
        status: 'matured',
        autoRenewal: false,
        bank: 'Sampath Bank'
    }
];

const getDaysUntilMaturity = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getMaturityStatus = (daysLeft: number) => {
    if (daysLeft < 0) return { label: 'Matured', color: '#10b981' };
    if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: '#f59e0b' };
    if (daysLeft <= 90) return { label: `${daysLeft}d left`, color: '#6366f1' };
    return { label: `${Math.ceil(daysLeft / 30)}mo left`, color: '#64748b' };
};

export const FixedDepositsPage = () => {
    const [fds, setFDs] = useState<FixedDeposit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewFDForm, setShowNewFDForm] = useState(false);
    const [newFD, setNewFD] = useState({
        principalAmount: '',
        interestRate: '',
        tenure: '',
        tenureUnit: 'months' as 'months' | 'years',
        type: 'Standard' as FixedDeposit['type'],
        autoRenewal: false
    });

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiClient.get('/fixed-deposits');
                setFDs(res.data.fixedDeposits || mockFDs);
            } catch {
                setFDs(mockFDs);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const activeFDs = fds.filter(f => f.status === 'active');
    const totalPrincipal = activeFDs.reduce((s, f) => s + f.principalAmount, 0);
    const totalMaturityValue = activeFDs.reduce((s, f) => s + f.maturityAmount, 0);
    const maturitySoon = activeFDs.filter(f => getDaysUntilMaturity(f.maturityDate) <= 90).length;

    const handleNewFDSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const principal = Number(newFD.principalAmount);
        const rate = Number(newFD.interestRate);
        const tenureMonths = newFD.tenureUnit === 'years' ? Number(newFD.tenure) * 12 : Number(newFD.tenure);
        const interestEarned = (principal * rate * tenureMonths) / (100 * 12);
        const startDate = new Date().toISOString().split('T')[0];
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

        const created: FixedDeposit = {
            _id: Date.now().toString(),
            accountNumber: `FD-****-${Math.floor(1000 + Math.random() * 9000)}`,
            principalAmount: principal,
            interestRate: rate,
            tenure: Number(newFD.tenure),
            tenureUnit: newFD.tenureUnit,
            startDate,
            maturityDate: maturityDate.toISOString().split('T')[0],
            maturityAmount: principal + interestEarned,
            interestEarned,
            type: newFD.type,
            status: 'active',
            autoRenewal: newFD.autoRenewal,
            bank: 'Your Bank'
        };
        setFDs(prev => [created, ...prev]);
        setShowNewFDForm(false);
        setNewFD({ principalAmount: '', interestRate: '', tenure: '', tenureUnit: 'months', type: 'Standard', autoRenewal: false });
    };

    if (loading) return <div className="loading-spinner">Loading fixed deposits...</div>;

    return (
        <div className="page-container fd-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button className="action-btn primary" onClick={() => setShowNewFDForm(!showNewFDForm)}>
                    + Open New FD
                </button>
            </div>

            {/* Summary */}
            <div className="rec-summary-grid">
                <div className="rec-stat-card">
                    <div className="rec-stat-icon">🏛️</div>
                    <div>
                        <div className="rec-stat-value">{activeFDs.length}</div>
                        <div className="rec-stat-label">Active FDs</div>
                    </div>
                </div>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-icon">💵</div>
                    <div>
                        <div className="rec-stat-value">LKR {(totalPrincipal / 1000).toFixed(0)}K</div>
                        <div className="rec-stat-label">Total Principal</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">📈</div>
                    <div>
                        <div className="rec-stat-value">LKR {(totalMaturityValue / 1000).toFixed(1)}K</div>
                        <div className="rec-stat-label">Maturity Value</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">⏰</div>
                    <div>
                        <div className="rec-stat-value">{maturitySoon}</div>
                        <div className="rec-stat-label">Maturing in 90 Days</div>
                    </div>
                </div>
            </div>

            {/* New FD Form */}
            {showNewFDForm && (
                <div className="card fd-form-card">
                    <h3 className="section-title">Open New Fixed Deposit</h3>
                    <form onSubmit={handleNewFDSubmit} className="fd-form">
                        <div className="fd-form-grid">
                            <div className="form-group">
                                <label>Principal Amount (LKR)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 100000"
                                    value={newFD.principalAmount}
                                    onChange={e => setNewFD({ ...newFD, principalAmount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g. 12.5"
                                    value={newFD.interestRate}
                                    onChange={e => setNewFD({ ...newFD, interestRate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tenure</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        placeholder="e.g. 12"
                                        value={newFD.tenure}
                                        onChange={e => setNewFD({ ...newFD, tenure: e.target.value })}
                                        required
                                        style={{ flex: 1 }}
                                    />
                                    <select
                                        value={newFD.tenureUnit}
                                        onChange={e => setNewFD({ ...newFD, tenureUnit: e.target.value as 'months' | 'years' })}
                                    >
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>FD Type</label>
                                <select value={newFD.type} onChange={e => setNewFD({ ...newFD, type: e.target.value as FixedDeposit['type'] })}>
                                    <option value="Standard">Standard</option>
                                    <option value="Goal-Linked">Goal-Linked</option>
                                    <option value="Tax Saver">Tax Saver</option>
                                </select>
                            </div>
                        </div>
                        <div className="fd-form-check">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={newFD.autoRenewal}
                                    onChange={e => setNewFD({ ...newFD, autoRenewal: e.target.checked })}
                                />
                                Enable Auto-Renewal at maturity
                            </label>
                        </div>
                        <div className="fd-form-actions">
                            <button type="submit" className="action-btn primary">Open FD</button>
                            <button type="button" className="action-btn secondary" onClick={() => setShowNewFDForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* FD Cards */}
            <div className="fd-list">
                {fds.map(fd => {
                    const daysLeft = getDaysUntilMaturity(fd.maturityDate);
                    const matStatus = getMaturityStatus(daysLeft);
                    const progress = fd.status === 'active'
                        ? Math.min(100, Math.max(0, ((new Date().getTime() - new Date(fd.startDate).getTime()) /
                            (new Date(fd.maturityDate).getTime() - new Date(fd.startDate).getTime())) * 100))
                        : 100;

                    return (
                        <div key={fd._id} className={`fd-card ${fd.status}`}>
                            <div className="fd-card-header">
                                <div className="fd-card-title-row">
                                    <span className="fd-icon">🏦</span>
                                    <div>
                                        <div className="fd-account">{fd.accountNumber}</div>
                                        <div className="fd-bank">{fd.bank}</div>
                                    </div>
                                    <div className="fd-badges">
                                        <span className="fd-type-badge">{fd.type}</span>
                                        <span className="fd-status-badge" style={{ color: fd.status === 'active' ? '#10b981' : '#f59e0b' }}>
                                            {fd.status === 'active' ? 'Active' : fd.status === 'matured' ? 'Matured' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="fd-card-body">
                                <div className="fd-amounts-row">
                                    <div className="fd-amount-item">
                                        <div className="fd-amount-label">Principal</div>
                                        <div className="fd-amount-value">LKR {fd.principalAmount.toLocaleString()}</div>
                                    </div>
                                    <div className="fd-amount-item highlight">
                                        <div className="fd-amount-label">At Maturity</div>
                                        <div className="fd-amount-value">LKR {fd.maturityAmount.toLocaleString()}</div>
                                    </div>
                                    <div className="fd-amount-item green">
                                        <div className="fd-amount-label">Interest</div>
                                        <div className="fd-amount-value">LKR {fd.interestEarned.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="fd-details-row">
                                    <span>📊 {fd.interestRate}% p.a.</span>
                                    <span>📅 {fd.tenure} {fd.tenureUnit}</span>
                                    <span>🔄 {fd.autoRenewal ? 'Auto-Renew On' : 'No Auto-Renew'}</span>
                                    <span style={{ color: matStatus.color }}>⏱ {matStatus.label}</span>
                                </div>

                                {fd.status === 'active' && (
                                    <div className="fd-progress-wrap">
                                        <div className="fd-progress-labels">
                                            <span>{fd.startDate}</span>
                                            <span>{Math.round(progress)}% elapsed</span>
                                            <span>{fd.maturityDate}</span>
                                        </div>
                                        <div className="fd-progress-bar">
                                            <div className="fd-progress-fill" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="fd-card-actions">
                                {fd.status === 'active' && (
                                    <>
                                        <button className="action-btn secondary small">📄 e-Advice</button>
                                        <button className="action-btn secondary small">🔁 Renew</button>
                                        <button className="action-btn danger small">💸 Withdraw Early</button>
                                    </>
                                )}
                                {fd.status === 'matured' && (
                                    <>
                                        <button className="action-btn primary small">🔁 Renew FD</button>
                                        <button className="action-btn secondary small">📄 Certificate</button>
                                        <button className="action-btn secondary small">💳 Transfer to Account</button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
