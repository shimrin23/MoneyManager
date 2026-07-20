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

    // New Form State
    const [showNewForm, setShowNewForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({
        itemDescription: '',
        itemType: 'gold' as PawnItem['itemType'],
        pledgedValue: '',
        loanAmount: '',
        interestRate: '',
        pledgeDate: '',
        redemptionDate: '',
        branch: '',
        ticketNumber: '',
        icon: '💍'
    });

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get('/pawning');
            setItems(res.data.pawning || []);
        } catch (err: any) {
            console.error('Failed to fetch pawning items:', err);
            setError('Unable to load pawning items. Please try again.');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleNewItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/pawning', {
                ...newItem,
                pledgedValue: Number(newItem.pledgedValue),
                loanAmount: Number(newItem.loanAmount),
                interestRate: Number(newItem.interestRate)
            });
            setShowNewForm(false);
            setNewItem({
                itemDescription: '', itemType: 'gold', pledgedValue: '', loanAmount: '',
                interestRate: '', pledgeDate: '', redemptionDate: '', branch: '', ticketNumber: '', icon: '💍'
            });
            await fetchItems();
        } catch (err) {
            console.error('Failed to create pawning item:', err);
            alert('Failed to create pawning item. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: PawnItem['status']) => {
        try {
            await apiClient.put(`/pawning/${id}`, { status });
            await fetchItems();
        } catch (err) {
            console.error('Failed to update pawning item:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this pawning item?')) return;
        try {
            await apiClient.delete(`/pawning/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
        } catch (err) {
            console.error('Failed to delete pawning item:', err);
        }
    };

    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    const active = items.filter(i => i.status === 'active');
    const totalLoan = active.reduce((s, i) => s + i.loanAmount, 0);
    const totalPledged = active.reduce((s, i) => s + i.pledgedValue, 0);
    const urgentItems = active.filter(i => i.daysRemaining <= 21).length;

    if (loading) return <div className="loading-spinner">Loading pawning items...</div>;

    return (
        <div className="page-container pawning-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button className="action-btn primary" onClick={() => setShowNewForm(!showNewForm)}>
                    + Add Pawn Item
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
                    <div className="rec-stat-icon">💍</div>
                    <div>
                        <div className="rec-stat-value">{active.length}</div>
                        <div className="rec-stat-label">Active Items</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">💸</div>
                    <div>
                        <div className="rec-stat-value">LKR {(totalLoan / 1000).toFixed(0)}K</div>
                        <div className="rec-stat-label">Total Loan Taken</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">💎</div>
                    <div>
                        <div className="rec-stat-value">LKR {(totalPledged / 1000).toFixed(0)}K</div>
                        <div className="rec-stat-label">Pledged Value</div>
                    </div>
                </div>
                <div className="rec-stat-card error">
                    <div className="rec-stat-icon">⚠️</div>
                    <div>
                        <div className="rec-stat-value">{urgentItems}</div>
                        <div className="rec-stat-label">Due in &lt; 21 Days</div>
                    </div>
                </div>
            </div>

            {/* New Pawn Item Form */}
            {showNewForm && (
                <div className="card fd-form-card">
                    <h3 className="section-title">Add Pawn Item</h3>
                    <form onSubmit={handleNewItemSubmit} className="fd-form">
                        <div className="fd-form-grid">
                            <div className="form-group">
                                <label>Item Description</label>
                                <input type="text" placeholder="e.g. 22K Gold Chain" value={newItem.itemDescription} onChange={e => setNewItem({ ...newItem, itemDescription: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Item Type</label>
                                <select value={newItem.itemType} onChange={e => setNewItem({ ...newItem, itemType: e.target.value as PawnItem['itemType'] })}>
                                    <option value="gold">Gold</option>
                                    <option value="jewelry">Jewelry</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="documents">Documents</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Pledged Value (LKR)</label>
                                <input type="number" placeholder="e.g. 180000" value={newItem.pledgedValue} onChange={e => setNewItem({ ...newItem, pledgedValue: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Loan Amount (LKR)</label>
                                <input type="number" placeholder="e.g. 126000" value={newItem.loanAmount} onChange={e => setNewItem({ ...newItem, loanAmount: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Interest Rate (% p.a.)</label>
                                <input type="number" step="0.1" placeholder="e.g. 24" value={newItem.interestRate} onChange={e => setNewItem({ ...newItem, interestRate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Branch</label>
                                <input type="text" placeholder="e.g. Colombo 03" value={newItem.branch} onChange={e => setNewItem({ ...newItem, branch: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Ticket Number</label>
                                <input type="text" placeholder="e.g. PWN-1234" value={newItem.ticketNumber} onChange={e => setNewItem({ ...newItem, ticketNumber: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Pledge Date</label>
                                <input type="date" value={newItem.pledgeDate} onChange={e => setNewItem({ ...newItem, pledgeDate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Redemption Date</label>
                                <input type="date" value={newItem.redemptionDate} onChange={e => setNewItem({ ...newItem, redemptionDate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="fd-form-actions">
                            <button type="submit" className="action-btn primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Pawn Item'}
                            </button>
                            <button type="button" className="action-btn secondary" onClick={() => setShowNewForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 && !showNewForm && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', margin: '0 auto 1rem', width: '80px', height: '80px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💍</div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>No Pawning Items Added</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                        Track your pawned items, keep an eye on redemption dates, and never miss a payment.
                    </p>
                    <button className="action-btn primary" onClick={() => setShowNewForm(true)}>+ Add Pawn Item</button>
                </div>
            )}

            {/* Filter */}
            {items.length > 0 && (
                <div className="rec-filter-row">
                    {(['all', 'active', 'redeemed'] as const).map(f => (
                        <button key={f} className={`rec-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="rec-filter-count">{(f === 'all' ? items : items.filter(i => i.status === f)).length}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Pawning Cards */}
            <div className="fd-list">
                {filtered.map(item => (
                    <div key={item._id} className={`fd-card ${item.status}`}>
                        <div className="fd-card-header">
                            <div className="fd-card-title-row">
                                <span className="fd-icon">{item.icon}</span>
                                <div>
                                    <div className="fd-account">{item.itemDescription}</div>
                                    <div className="fd-bank">{item.branch} | #{item.ticketNumber}</div>
                                </div>
                                <div className="fd-badges">
                                    <span className="fd-type-badge">{itemTypeLabel[item.itemType]}</span>
                                    <span className="fd-status-badge" style={{ color: item.status === 'active' ? '#f59e0b' : item.status === 'redeemed' ? '#10b981' : '#64748b' }}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="fd-card-body">
                            <div className="fd-amounts-row">
                                <div className="fd-amount-item">
                                    <div className="fd-amount-label">Loan Amount</div>
                                    <div className="fd-amount-value">LKR {item.loanAmount.toLocaleString()}</div>
                                </div>
                                <div className="fd-amount-item highlight" style={{ background: 'rgba(245,158,11,0.1)' }}>
                                    <div className="fd-amount-label" style={{ color: '#f59e0b' }}>Total Due Now</div>
                                    <div className="fd-amount-value" style={{ color: '#f59e0b' }}>LKR {Math.round(item.totalDue).toLocaleString()}</div>
                                </div>
                                <div className="fd-amount-item">
                                    <div className="fd-amount-label">Pledged Value</div>
                                    <div className="fd-amount-value">LKR {item.pledgedValue.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="fd-details-row">
                                <span>📈 {item.interestRate}% p.a. (LKR {Math.round(item.monthlyInterest)}/mo)</span>
                                <span>💰 Accrued Interest: LKR {Math.round(item.totalInterestAccrued).toLocaleString()}</span>
                            </div>

                            {item.status === 'active' && (
                                <div className="fd-progress-wrap" style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div style={{ color: 'var(--text-muted)' }}>Redemption Date</div>
                                            <div style={{ fontWeight: 600 }}>{new Date(item.redemptionDate).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: urgencyColor(item.daysRemaining) }}>
                                                {item.daysRemaining} Days
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining to Redeem</div>
                                        </div>
                                    </div>
                                    <div className="fd-progress-bar" style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                                        <div className="fd-progress-fill" style={{ 
                                            width: `${Math.max(5, Math.min(100, 100 - (item.daysRemaining / 90) * 100))}%`, 
                                            background: urgencyColor(item.daysRemaining) 
                                        }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="fd-card-actions">
                            {item.status === 'active' && (
                                <>
                                    <button className="action-btn secondary small" onClick={() => handleUpdateStatus(item._id, 'redeemed')}>Redeem Item</button>
                                    <button className="action-btn danger small" onClick={() => handleDelete(item._id)}>Delete</button>
                                </>
                            )}
                            {item.status !== 'active' && (
                                <button className="action-btn secondary small" onClick={() => handleDelete(item._id)}>Delete</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
