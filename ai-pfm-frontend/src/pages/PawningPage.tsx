import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface PawnItem {
    _id: string;
    itemDescription: string;
    itemType: 'gold' | 'jewelry' | 'electronics' | 'documents' | 'other';
    icon: string;
    pledgedValue: number;
    loanAmount: number;
    interestRate: number;
    monthlyInterest: number;
    pledgeDate: string;
    redemptionDate: string;
    branch: string;
    ticketNumber: string;
    status: 'active' | 'redeemed' | 'auctioned' | 'renewed';
    daysRemaining: number;
    totalInterestAccrued: number;
    totalDue: number;
}

const mockPawnItems: PawnItem[] = [
    {
        _id: '1',
        itemDescription: '22K Gold Chain — 18g',
        itemType: 'gold',
        icon: '💍',
        pledgedValue: 180000,
        loanAmount: 126000,
        interestRate: 24,
        monthlyInterest: 2520,
        pledgeDate: '2026-04-15',
        redemptionDate: '2026-07-15',
        branch: 'Colombo 03 Branch',
        ticketNumber: 'PWN-2026-0041',
        status: 'active',
        daysRemaining: 16,
        totalInterestAccrued: 7560,
        totalDue: 133560
    },
    {
        _id: '2',
        itemDescription: '18K Gold Bangles — Set of 4 (32g)',
        itemType: 'jewelry',
        icon: '📿',
        pledgedValue: 290000,
        loanAmount: 200000,
        interestRate: 22,
        monthlyInterest: 3667,
        pledgeDate: '2026-05-01',
        redemptionDate: '2026-08-01',
        branch: 'Nugegoda Branch',
        ticketNumber: 'PWN-2026-0089',
        status: 'active',
        daysRemaining: 33,
        totalInterestAccrued: 7334,
        totalDue: 207334
    },
    {
        _id: '3',
        itemDescription: 'Gold Sovereign Coins — 5 pcs',
        itemType: 'gold',
        icon: '🪙',
        pledgedValue: 95000,
        loanAmount: 66500,
        interestRate: 24,
        monthlyInterest: 1330,
        pledgeDate: '2026-01-10',
        redemptionDate: '2026-04-10',
        branch: 'Colombo 03 Branch',
        ticketNumber: 'PWN-2026-0012',
        status: 'redeemed',
        daysRemaining: 0,
        totalInterestAccrued: 3990,
        totalDue: 0
    }
];

const itemTypeLabel: Record<string, string> = {
    gold: 'Gold', jewelry: 'Jewelry', electronics: 'Electronics', documents: 'Documents', other: 'Other'
};

const urgencyColor = (days: number) => {
    if (days <= 7) return '#ef4444';
    if (days <= 21) return '#f59e0b';
    return '#10b981';
};

export const PawningPage = () => {
    const [items, setItems] = useState<PawnItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'redeemed'>('all');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiClient.get('/pawning');
                setItems(res.data.pawning || mockPawnItems);
            } catch {
                setItems(mockPawnItems);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    const active = items.filter(i => i.status === 'active');
    const totalLoan = active.reduce((s, i) => s + i.loanAmount, 0);
    const totalDue = active.reduce((s, i) => s + i.totalDue, 0);
    const urgentCount = active.filter(i => i.daysRemaining <= 21).length;

    if (loading) return <div className="loading-spinner">Loading pawning details...</div>;

    return (
        <div className="page-container pawning-page">
            {urgentCount > 0 && (
                <div className="rec-alert-banner danger" style={{ marginBottom: '1.5rem' }}>
                    ⚠️ {urgentCount} item{urgentCount > 1 ? 's' : ''} due within 21 days — redeem or renew soon
                </div>
            )}

            {/* Summary */}
            <div className="rec-summary-grid">
                <div className="rec-stat-card">
                    <div className="rec-stat-icon">🏷️</div>
                    <div>
                        <div className="rec-stat-value">{active.length}</div>
                        <div className="rec-stat-label">Active Pledges</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">💰</div>
                    <div>
                        <div className="rec-stat-value">LKR {totalLoan.toLocaleString()}</div>
                        <div className="rec-stat-label">Total Loan Amount</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">📋</div>
                    <div>
                        <div className="rec-stat-value">LKR {totalDue.toLocaleString()}</div>
                        <div className="rec-stat-label">Total Amount Due</div>
                    </div>
                </div>
                <div className="rec-stat-card" style={{ borderColor: urgentCount > 0 ? 'rgba(239,68,68,0.3)' : undefined }}>
                    <div className="rec-stat-icon">⏰</div>
                    <div>
                        <div className="rec-stat-value" style={{ color: urgentCount > 0 ? '#ef4444' : undefined }}>{urgentCount}</div>
                        <div className="rec-stat-label">Due Within 21 Days</div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="rec-filter-row">
                {(['all', 'active', 'redeemed'] as const).map(f => (
                    <button key={f} className={`rec-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className="rec-filter-count">{(f === 'all' ? items : items.filter(i => i.status === f)).length}</span>
                    </button>
                ))}
            </div>

            {/* Pawn Cards */}
            <div className="pawn-list">
                {filtered.map(item => (
                    <div key={item._id} className={`pawn-card ${item.status} ${item.daysRemaining <= 7 && item.status === 'active' ? 'urgent' : ''}`}>
                        <div className="pawn-card-header">
                            <div className="pawn-header-left">
                                <span className="pawn-icon">{item.icon}</span>
                                <div>
                                    <div className="pawn-name">{item.itemDescription}</div>
                                    <div className="pawn-meta">
                                        <span className="fd-type-badge">{itemTypeLabel[item.itemType]}</span>
                                        <span className="pawn-ticket">Ticket: {item.ticketNumber}</span>
                                        <span className="pawn-branch">📍 {item.branch}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pawn-header-right">
                                {item.status === 'active' && (
                                    <div className="pawn-urgency" style={{ color: urgencyColor(item.daysRemaining) }}>
                                        ⏱ {item.daysRemaining} days left
                                    </div>
                                )}
                                <span className="fd-status-badge" style={{
                                    color: item.status === 'active' ? '#f59e0b' : item.status === 'redeemed' ? '#10b981' : '#ef4444'
                                }}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="pawn-card-body">
                            <div className="pawn-amounts-row">
                                <div className="pawn-amount-item">
                                    <div className="fd-amount-label">Pledged Value</div>
                                    <div className="fd-amount-value">LKR {item.pledgedValue.toLocaleString()}</div>
                                </div>
                                <div className="pawn-amount-item">
                                    <div className="fd-amount-label">Loan Given</div>
                                    <div className="fd-amount-value">LKR {item.loanAmount.toLocaleString()}</div>
                                </div>
                                <div className="pawn-amount-item">
                                    <div className="fd-amount-label">Monthly Interest</div>
                                    <div className="fd-amount-value" style={{ color: '#f59e0b' }}>LKR {item.monthlyInterest.toLocaleString()}</div>
                                </div>
                                {item.status === 'active' && (
                                    <div className="pawn-amount-item highlight">
                                        <div className="fd-amount-label">Total Due Now</div>
                                        <div className="fd-amount-value" style={{ color: '#ef4444' }}>LKR {item.totalDue.toLocaleString()}</div>
                                    </div>
                                )}
                            </div>

                            <div className="fd-details-row">
                                <span>📊 {item.interestRate}% p.a.</span>
                                <span>📅 Pledged: {item.pledgeDate}</span>
                                <span>🗓 Redemption by: <strong style={{ color: urgencyColor(item.daysRemaining) }}>{item.redemptionDate}</strong></span>
                                <span style={{ color: '#f59e0b' }}>💸 Interest accrued: LKR {item.totalInterestAccrued.toLocaleString()}</span>
                            </div>
                        </div>

                        {item.status === 'active' && (
                            <div className="fd-card-actions">
                                <button className="action-btn primary small">✅ Redeem Now</button>
                                <button className="action-btn secondary small">🔄 Renew Pledge</button>
                                <button className="action-btn secondary small">📄 View Ticket</button>
                            </div>
                        )}
                        {item.status === 'redeemed' && (
                            <div className="fd-card-actions">
                                <button className="action-btn secondary small">📄 View Receipt</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
