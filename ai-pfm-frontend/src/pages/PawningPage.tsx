import { DateInput } from '../components/DateInput';
import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog } from '../utils/systemMessages';
import { useAdminLang } from '../i18n/adminText';
import { PAWN_T } from '../i18n/pawningText';
import { fillText } from '../i18n/dashboardText';

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

const urgencyTone = (days: number): 'bad' | 'warn' | 'good' => {
    if (days <= 7) return 'bad';
    if (days <= 21) return 'warn';
    return 'good';
};

export const PawningPage = () => {
    const t = PAWN_T[useAdminLang()];
    const itemTypeLabel: Record<string, string> = {
        gold: t.typeGold, jewelry: t.typeJewelry, electronics: t.typeElectronics, documents: t.typeDocuments, other: t.typeOther
    };
    const statusLabel: Record<string, string> = {
        active: t.statusActive, redeemed: t.statusRedeemed, auctioned: t.statusAuctioned, renewed: t.statusRenewed
    };
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
            setError(t.loadFailed);
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
            notify.success(t.addedNote);
            await fetchItems();
        } catch (err) {
            console.error('Failed to create pawning item:', err);
            notify.error(getApiErrorMessage(err, t.failCreate));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRedeem = async (item: PawnItem) => {
        const confirmed = await confirmDialog({
            title: t.redeemTitle,
            message: fillText(t.redeemMsg, { desc: item.itemDescription, ticket: item.ticketNumber, amount: formatMoney(Math.round(item.totalDue)) }),
            confirmText: t.redeem,
        });
        if (!confirmed) return;
        try {
            await apiClient.put(`/pawning/${item._id}`, { status: 'redeemed' });
            notify.success(t.redeemedNote);
            await fetchItems();
        } catch (err) {
            console.error('Failed to update pawning item:', err);
            notify.error(getApiErrorMessage(err, t.failUpdate));
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: t.deleteTitle,
            message: t.deleteMsg,
            confirmText: t.delete,
            danger: true,
        });
        if (!confirmed) return;
        try {
            await apiClient.delete(`/pawning/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
            notify.success(t.deletedNote);
        } catch (err) {
            console.error('Failed to delete pawning item:', err);
            notify.error(t.failDelete);
        }
    };

    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    const active = items.filter(i => i.status === 'active');
    const totalLoan = active.reduce((s, i) => s + i.loanAmount, 0);
    const totalPledged = active.reduce((s, i) => s + i.pledgedValue, 0);
    const urgentItems = active.filter(i => i.daysRemaining <= 21).length;

    if (loading) return <div className="loading-spinner">{t.loading}</div>;

    return (
        <div className="page-container fin-page">
            <div className="page-header">
                <div style={{ flex: 1 }}></div>
                <button className="btn-primary" onClick={() => setShowNewForm(!showNewForm)}>
                    {t.addBtn}
                </button>
            </div>

            {error && <div className="rc-banner error">{error}</div>}

            {/* Summary */}
            <div className="rc-stats">
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.statActive}</span>
                    <span className="rc-stat-value">{active.length}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.statLoan}</span>
                    <span className="rc-stat-value">{formatMoney(totalLoan)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.statPledged}</span>
                    <span className="rc-stat-value">{formatMoney(totalPledged)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.statUrgent}</span>
                    <span className="rc-stat-value">{urgentItems}</span>
                </div>
            </div>

            {/* New Pawn Item Form */}
            {showNewForm && (
                <div className="card form-card gl-form">
                    <h3 className="gl-form-title">{t.formTitle}</h3>
                    <form onSubmit={handleNewItemSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.itemDesc}</label>
                                <input type="text" placeholder={t.phDesc} value={newItem.itemDescription} onChange={e => setNewItem({ ...newItem, itemDescription: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>{t.itemType}</label>
                                <select value={newItem.itemType} onChange={e => setNewItem({ ...newItem, itemType: e.target.value as PawnItem['itemType'] })}>
                                    <option value="gold">{t.typeGold}</option>
                                    <option value="jewelry">{t.typeJewelry}</option>
                                    <option value="electronics">{t.typeElectronics}</option>
                                    <option value="documents">{t.typeDocuments}</option>
                                    <option value="other">{t.typeOther}</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{fillText(t.pledgedLabel, { cur: currencyCode() })}</label>
                                <input type="number" min="1" placeholder={t.phPledged} value={newItem.pledgedValue} onChange={e => setNewItem({ ...newItem, pledgedValue: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>{fillText(t.loanLabel, { cur: currencyCode() })}</label>
                                <input type="number" min="1" placeholder={t.phLoan} value={newItem.loanAmount} onChange={e => setNewItem({ ...newItem, loanAmount: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.interestLabel}</label>
                                <input type="number" step="0.01" min="0" max="100" placeholder={t.phInterest} value={newItem.interestRate} onChange={e => setNewItem({ ...newItem, interestRate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>{t.branch}</label>
                                <input type="text" placeholder={t.phBranch} value={newItem.branch} onChange={e => setNewItem({ ...newItem, branch: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.ticket}</label>
                                <input type="text" placeholder={t.phTicket} value={newItem.ticketNumber} onChange={e => setNewItem({ ...newItem, ticketNumber: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>{t.pledgeDate}</label>
                                <DateInput value={newItem.pledgeDate} onChange={e => setNewItem({ ...newItem, pledgeDate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.redemptionDate}</label>
                                <DateInput min={newItem.pledgeDate || undefined} value={newItem.redemptionDate} onChange={e => setNewItem({ ...newItem, redemptionDate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowNewForm(false)}>{t.cancel}</button>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? t.saving : t.save}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 && !showNewForm && (
                <div className="empty-state">
                    <h3>{t.emptyTitle}</h3>
                    <p>{t.emptyText}</p>
                    <button className="btn-primary" onClick={() => setShowNewForm(true)}>{t.addBtn}</button>
                </div>
            )}

            {/* Filter */}
            {items.length > 0 && (
                <div className="rec-filter-row fin-filters">
                    {(['all', 'active', 'redeemed'] as const).map(f => (
                        <button key={f} className={`rec-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {({ all: t.filterAll, active: t.filterActive, redeemed: t.filterRedeemed })[f]}
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
                                <span className={`gl-pill ${statusPill}`}>{statusLabel[item.status]}</span>
                            </div>

                            <div className="gl-kv">
                                <div><span>{t.kvLoan}</span><span>{formatMoney(item.loanAmount)}</span></div>
                                <div><span>{t.kvDueNow}</span><span>{formatMoney(Math.round(item.totalDue))}</span></div>
                                <div><span>{t.kvPledged}</span><span>{formatMoney(item.pledgedValue)}</span></div>
                                <div><span>{t.kvRate}</span><span>{fillText(t.kvRateValue, { rate: item.interestRate, monthly: formatMoney(Math.round(item.monthlyInterest)) })}</span></div>
                                <div><span>{t.kvAccrued}</span><span>{formatMoney(Math.round(item.totalInterestAccrued))}</span></div>
                                {item.status === 'active' && (
                                    <>
                                        <div><span>{t.kvRedemption}</span><span>{formatDate(item.redemptionDate)}</span></div>
                                        <div>
                                            <span>{t.kvTimeLeft}</span>
                                            <span className={`fin-${tone}`}>
                                                {item.daysRemaining < 0 ? fillText(t.overdueBy, { n: -item.daysRemaining }) : fillText(t.daysLeft, { n: item.daysRemaining })}
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

                            <div className="gl-actions fd-actions">
                                {item.status === 'active' && (
                                    <>
                                        <button className="btn-primary btn-sm" onClick={() => handleRedeem(item)}>{t.redeemItem}</button>
                                        <button className="btn-secondary btn-sm" onClick={() => handleDelete(item._id)}>{t.delete}</button>
                                    </>
                                )}
                                {item.status !== 'active' && (
                                    <button className="btn-secondary btn-sm" onClick={() => handleDelete(item._id)}>{t.delete}</button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};
