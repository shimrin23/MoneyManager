import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog } from '../utils/systemMessages';

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

const urgencyTone = (days: number): 'bad' | 'warn' | 'good' => {
    if (days <= 7) return 'bad';
    if (days <= 21) return 'warn';
    return 'good';
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
        } catch (err) {
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
                pledgedValue: toLkr(Number(newItem.pledgedValue)),
                loanAmount: toLkr(Number(newItem.loanAmount)),
                interestRate: Number(newItem.interestRate)
            });
            setShowNewForm(false);
            setNewItem({
                itemDescription: '', itemType: 'gold', pledgedValue: '', loanAmount: '',
                interestRate: '', pledgeDate: '', redemptionDate: '', branch: '', ticketNumber: '', icon: '💍'
            });
            notify.success('Pawn item added.');
            await fetchItems();
        } catch (err) {
            console.error('Failed to create pawning item:', err);
            notify.error(getApiErrorMessage(err, 'Failed to create pawning item. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRedeem = async (item: PawnItem) => {
        const confirmed = await confirmDialog({
            title: 'Redeem item?',
            message: `Mark ${item.itemDescription} (#${item.ticketNumber}) as redeemed? Total due now is ${formatMoney(Math.round(item.totalDue))}. This can't be undone.`,
            confirmText: 'Redeem',
        });
        if (!confirmed) return;
        try {
            await apiClient.put(`/pawning/${item._id}`, { status: 'redeemed' });
            notify.success('Item marked as redeemed.');
            await fetchItems();
        } catch (err) {
            console.error('Failed to update pawning item:', err);
            notify.error(getApiErrorMessage(err, 'Failed to update pawning item. Please try again.'));
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: 'Delete pawning item?',
            message: 'Are you sure you want to delete this pawning item?',
            confirmText: 'Delete',
            danger: true,
        });
        if (!confirmed) return;
        try {
            await apiClient.delete(`/pawning/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
            notify.success('Pawning item deleted.');
        } catch (err) {
            console.error('Failed to delete pawning item:', err);
            notify.error('Failed to delete pawning item. Please try again.');
        }
    };

    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    const active = items.filter(i => i.status === 'active');
    const totalLoan = active.reduce((s, i) => s + i.loanAmount, 0);
    const totalPledged = active.reduce((s, i) => s + i.pledgedValue, 0);
    const urgentItems = active.filter(i => i.daysRemaining <= 21).length;

    if (loading) return <div className="loading-spinner">Loading pawning items...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button className="btn-primary" onClick={() => setShowNewForm(!showNewForm)}>
                    + Add Pawn Item
                </button>
            </div>

            {error && <div className="rc-banner error">{error}</div>}

            {/* Summary */}
            <div className="rc-stats">
                <div className="rc-stat">
                    <span className="rc-stat-label">Active Items</span>
                    <span className="rc-stat-value">{active.length}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">Total Loan Taken</span>
                    <span className="rc-stat-value">{formatMoney(totalLoan)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">Pledged Value</span>
                    <span className="rc-stat-value">{formatMoney(totalPledged)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">Overdue or Due in &lt; 21 Days</span>
                    <span className="rc-stat-value">{urgentItems}</span>
                </div>
            </div>

            {/* New Pawn Item Form */}
            {showNewForm && (
                <div className="card form-card gl-form">
                    <h3 className="gl-form-title">Add Pawn Item</h3>
                    <form onSubmit={handleNewItemSubmit}>
                        <div className="form-row">
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
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Pledged Value ({currencyCode()})</label>
                                <input type="number" min="1" placeholder="e.g. 180000" value={newItem.pledgedValue} onChange={e => setNewItem({ ...newItem, pledgedValue: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Loan Amount ({currencyCode()})</label>
                                <input type="number" min="1" placeholder="e.g. 126000" value={newItem.loanAmount} onChange={e => setNewItem({ ...newItem, loanAmount: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Interest Rate (% p.a.)</label>
                                <input type="number" step="0.01" min="0" max="100" placeholder="e.g. 24" value={newItem.interestRate} onChange={e => setNewItem({ ...newItem, interestRate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Branch</label>
                                <input type="text" placeholder="e.g. Colombo 03" value={newItem.branch} onChange={e => setNewItem({ ...newItem, branch: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Ticket Number</label>
                                <input type="text" placeholder="e.g. PWN-1234" value={newItem.ticketNumber} onChange={e => setNewItem({ ...newItem, ticketNumber: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Pledge Date</label>
                                <input type="date" value={newItem.pledgeDate} onChange={e => setNewItem({ ...newItem, pledgeDate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Redemption Date</label>
                                <input type="date" min={newItem.pledgeDate || undefined} value={newItem.redemptionDate} onChange={e => setNewItem({ ...newItem, redemptionDate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowNewForm(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Pawn Item'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 && !showNewForm && (
                <div className="empty-state">
                    <h3>No Pawning Items Added</h3>
                    <p>Track your pawned items, keep an eye on redemption dates, and never miss a payment.</p>
                    <button className="btn-primary" onClick={() => setShowNewForm(true)}>+ Add Pawn Item</button>
                </div>
            )}

            {/* Filter */}
            {items.length > 0 && (
                <div className="rec-filter-row fin-filters">
                    {(['all', 'active', 'redeemed'] as const).map(f => (
                        <button key={f} className={`rec-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="rec-filter-count">{(f === 'all' ? items : items.filter(i => i.status === f)).length}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Pawning Cards */}
            <div className="fin-grid">
                {filtered.map(item => {
                    const tone = urgencyTone(item.daysRemaining);
                    const statusPill = item.status === 'active' ? 'in-progress' : item.status === 'redeemed' ? 'completed' : '';
                    return (
                        <article key={item._id} className="gl-card">
                            <div className="gl-head">
                                <div className="gl-head-main">
                                    <div className="gl-head-text">
                                        <h3>{item.itemDescription}</h3>
                                        <span className="gl-sub">{item.branch} | #{item.ticketNumber} · {itemTypeLabel[item.itemType]}</span>
                                    </div>
                                </div>
                                <span className={`gl-pill ${statusPill}`}>{item.status.toUpperCase()}</span>
                            </div>

                            <div className="gl-kv">
                                <div><span>Loan Amount</span><span>{formatMoney(item.loanAmount)}</span></div>
                                <div><span>Total Due Now</span><span>{formatMoney(Math.round(item.totalDue))}</span></div>
                                <div><span>Pledged Value</span><span>{formatMoney(item.pledgedValue)}</span></div>
                                <div><span>Interest Rate</span><span>{item.interestRate}% p.a. ({formatMoney(Math.round(item.monthlyInterest))}/mo)</span></div>
                                <div><span>Accrued Interest</span><span>{formatMoney(Math.round(item.totalInterestAccrued))}</span></div>
                                {item.status === 'active' && (
                                    <>
                                        <div><span>Redemption Date</span><span>{formatDate(item.redemptionDate)}</span></div>
                                        <div>
                                            <span>Time Left</span>
                                            <span className={`fin-${tone}`}>
                                                {item.daysRemaining < 0 ? `Overdue by ${-item.daysRemaining} days` : `${item.daysRemaining} days`}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {item.status === 'active' && (
                                <div className="gl-progress">
                                    <div className="gl-bar">
                                        <span
                                            className={tone}
                                            style={{ width: `${Math.max(5, Math.min(100, 100 - (item.daysRemaining / 90) * 100))}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="gl-actions">
                                {item.status === 'active' && (
                                    <>
                                        <button className="btn-primary btn-sm" onClick={() => handleRedeem(item)}>Redeem Item</button>
                                        <button className="btn-secondary btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                                    </>
                                )}
                                {item.status !== 'active' && (
                                    <button className="btn-secondary btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};
