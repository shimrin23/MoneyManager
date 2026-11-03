import { DateInput } from '../components/DateInput';
import { formatDate, formatDateTime, formatMoney, toLkr, fromLkr, currencyCode } from '../utils/appFormat';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getApiErrorMessage } from '../api/client';
import { notify, confirmDialog } from '../utils/systemMessages';
import { useAdminLang } from '../i18n/adminText';
import { SUBS_T } from '../i18n/subscriptionsText';
import { fillText } from '../i18n/dashboardText';

interface Subscription {
    _id?: string;
    name: string;
    provider: string;
    amount: number;
    frequency: 'monthly' | 'yearly';
    nextPayment: string;
    category: string;
    isActive: boolean;
    lastUsed?: string;
    isZombie: boolean;
    cancelReason?: string;
    cancelledAt?: string;
}

interface CheaperAlternative {
    name: string;
    price: number;
    savings: number;
    provider: string;
}

interface SubscriptionTrend {
    month: string;
    amount: number;
}

export const SubscriptionsPage = () => {
    const t = SUBS_T[useAdminLang()];
    const CANCEL_REASON_LABELS: Record<string, string> = {
        'too-expensive': t.reasonExpensive,
        'not-used': t.reasonNotUsed,
        'found-alternative': t.reasonAlt,
        'temporary-pause': t.reasonPause,
        'other': t.reasonOther,
        'zombie-bulk-cancel': t.reasonZombie,
    };
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [showAlternativesModal, setShowAlternativesModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [trends, setTrends] = useState<SubscriptionTrend[]>([]);
    // Monthly income from the user's Profile; null until it is known (0 or unset means not entered)
    const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
    const [insightsStatus, setInsightsStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
    const [newSubscription, setNewSubscription] = useState<Subscription>({
        name: '',
        provider: '',
        amount: 0,
        frequency: 'monthly',
        nextPayment: '',
        category: '',
        isActive: true,
        isZombie: false
    });
    const [insightsMap, setInsightsMap] = useState<Record<string, { insight: string; alternatives: CheaperAlternative[] }>>({});

    useEffect(() => {
        fetchSubscriptions();
        fetchAIInsights();
        fetchTrends();
        // Fetch monthly income from the user's profile
        fetchMonthlyIncome();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            // Includes cancelled ones so they can be listed and restored
            const response = await apiClient.get('/subscriptions', { params: { includeInactive: true } });
            const data = response.data;
            
            setSubscriptions(data.subscriptions || []);
            setTotalMonthlyCost(data.summary?.totalMonthlyCost || 0);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
            setSubscriptions([]);
            setTotalMonthlyCost(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyIncome = async () => {
        try {
            const response = await apiClient.get('/auth/profile');
            const income = Number(response.data?.user?.monthlyIncome);
            setMonthlyIncome(income > 0 ? income : null);
        } catch (error) {
            console.error('Failed to fetch monthly income:', error);
            setMonthlyIncome(null);
        }
    };

    const fetchAIInsights = async () => {
        setInsightsStatus('loading');
        try {
            const response = await apiClient.get('/subscriptions/ai-insights');
            if (response.data && response.data.insights) {
                setInsightsMap(response.data.insights);
            }
            setInsightsStatus('ready');
        } catch (error) {
            console.error('Failed to fetch AI insights:', error);
            setInsightsStatus('failed');
        }
    };

    // Real subscription spending per month, from logged payments and matching expenses
    const fetchTrends = async () => {
        try {
            const response = await apiClient.get('/subscriptions/trends');
            setTrends(response.data?.trends || []);
        } catch (error) {
            console.error('Failed to fetch subscription trends:', error);
            setTrends([]);
        }
    };

    // Feature 1: Health Score Calculation (only when the user has entered their income)
    const getHealthScore = () => {
        if (!monthlyIncome) return null;
        const percentOfIncome = (totalMonthlyCost / monthlyIncome) * 100;
        if (percentOfIncome < 5) return { score: t.healthHealthy, icon: '', percentage: percentOfIncome };
        if (percentOfIncome < 10) return { score: t.healthReview, icon: '', percentage: percentOfIncome };
        return { score: t.healthOverloaded, icon: '', percentage: percentOfIncome };
    };

    // Feature 2: Usage Status Determination
    const getUsageStatus = (subscription: Subscription) => {
        if (subscription.isZombie) return { status: t.stZombie, icon: '', label: t.usageNoActivity };

        if (subscription.lastUsed) {
            const lastUsedDate = new Date(subscription.lastUsed);
            const now = new Date();
            const daysAgo = Math.floor((now.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysAgo < 7) return { status: t.stActive, icon: '', label: fillText(t.usageDays, { n: daysAgo }) };
            if (daysAgo < 60) return { status: t.stRarely, icon: '', label: fillText(t.usageWeeks, { n: Math.floor(daysAgo / 7) }) };
            return { status: t.stZombie, icon: '', label: fillText(t.usageMonths, { n: Math.floor(daysAgo / 30) }) };
        }
        return { status: t.stUnknown, icon: '', label: t.usageNoData };
    };



    // Whole days from today to the next payment date (negative = overdue), compared by calendar date
    const getDaysUntilPayment = (nextPayment: string) => {
        const [y, m, d] = nextPayment.slice(0, 10).split('-').map(Number);
        const due = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getDueStatus = (subscription: Subscription) => {
        const days = getDaysUntilPayment(subscription.nextPayment);
        if (days < 0) return { overdue: true, label: days === -1 ? t.overdueByOne : fillText(t.overdueByMany, { n: -days }), color: '#ef4444' };
        if (days === 0) return { overdue: false, label: t.dueToday, color: '#f59e0b' };
        if (days <= 7) return { overdue: false, label: days === 1 ? t.dueInOne : fillText(t.dueInMany, { n: days }), color: '#f59e0b' };
        return { overdue: false, label: fillText(t.dueInMany, { n: days }), color: 'var(--text-muted)' };
    };

    // Feature 5: Renewal Risk Detection
    const getRenewalRisk = (subscription: Subscription) => {
        const nextPaymentDate = new Date(subscription.nextPayment);
        const today = new Date();
        const daysUntilRenewal = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilRenewal <= 3 && daysUntilRenewal > 0) {
            const usageStatus = getUsageStatus(subscription);
            if (usageStatus.status === t.stRarely || usageStatus.status === t.stZombie) {
                return { risk: true, message: fillText(t.renewsIn, { n: daysUntilRenewal }) };
            }
        }
        return { risk: false };
    };

    const handleCancelSubscription = async (id: string) => {
        setSelectedSubscription(subscriptions.find(s => s._id === id) || null);
        setShowCancelModal(true);
    };

    const confirmCancelSubscription = async () => {
        if (!selectedSubscription?._id) return;

        try {
            // The cancellation reason (Feature 8) is saved with the cancellation
            await apiClient.delete(`/subscriptions/${selectedSubscription._id}`, {
                data: { reason: cancelReason || undefined }
            });

            notify.success(fillText(t.cancelledNote, { name: selectedSubscription.name }));
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedSubscription(null);
            await fetchSubscriptions();
            fetchTrends();
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            notify.error(getApiErrorMessage(error, t.cancelFailed));
        }
    };

    const handleRestoreSubscription = async (subscription: Subscription) => {
        try {
            await apiClient.put(`/subscriptions/${subscription._id}`, { isActive: true, isZombie: false });
            notify.success(fillText(t.restoredNote, { name: subscription.name }));
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to restore subscription:', error);
            notify.error(getApiErrorMessage(error, t.restoreFailed));
        }
    };

    const handleCancelAllZombies = async () => {
        const confirmed = await confirmDialog({
            title: fillText(t.cancelAllTitle, { n: zombieSubs.length, s: zombieSubs.length > 1 ? 's' : '' }),
            message: fillText(t.cancelAllMessage, { names: zombieSubs.map(s => s.name).join(', '), amount: formatMoney(savings) }),
            confirmText: t.cancelAllConfirm,
            cancelText: t.keepThem,
            danger: true,
        });
        if (!confirmed) return;
        try {
            const zombieIds = zombieSubs.map(sub => sub._id!);
            const response = await apiClient.post('/subscriptions/bulk-cancel', { subscriptionIds: zombieIds });
            notify.success(fillText(t.bulkCancelled, { n: response.data?.cancelledCount ?? zombieIds.length }));
            await fetchSubscriptions();
        } catch (error) {
            console.error('Failed to cancel zombie subscriptions:', error);
            notify.error(getApiErrorMessage(error, t.cancelAllFailed));
        }
    };

    const handleFindAlternative = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setShowAlternativesModal(true);
    };

    const closeAlternativesModal = () => {
        setShowAlternativesModal(false);
        setSelectedSubscription(null);
    };

    // Esc closes the alternatives popup
    useEffect(() => {
        if (!showAlternativesModal) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAlternativesModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showAlternativesModal]);

    const handleCreateSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validation
            if (!newSubscription.name.trim() || !newSubscription.provider.trim() || !newSubscription.category || !newSubscription.nextPayment) {
                notify.warning(t.requiredFields);
                return;
            }
            if (!(newSubscription.amount > 0)) {
                notify.warning(t.amountPositive);
                return;
            }

            await apiClient.post('/subscriptions', { ...newSubscription, amount: toLkr(newSubscription.amount) });
            
            // Reset form
            setNewSubscription({
                name: '',
                provider: '',
                amount: 0,
                frequency: 'monthly',
                nextPayment: '',
                category: '',
                isActive: true,
                isZombie: false
            });
            setShowAddForm(false);
            notify.success(t.addedNote);

            // Refresh subscription list
            await fetchSubscriptions();
            fetchAIInsights();
        } catch (error) {
            console.error('Failed to create subscription:', error);
            notify.error(getApiErrorMessage(error, t.createFailed));
        }
    };

    const activeSubs = subscriptions.filter(sub => sub.isActive);
    const cancelledSubs = subscriptions.filter(sub => !sub.isActive);
    const zombieSubs = subscriptions.filter(sub => sub.isZombie && sub.isActive);
    const savings = zombieSubs.reduce((sum, sub) => sum + (sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount), 0);
    const healthScore = getHealthScore();
    
    // Feature 7: Consolidation Suggestions
    const consolidationSuggestions = () => {
        const categoryGroups = activeSubs.reduce((acc: { [key: string]: Subscription[] }, sub) => {
            if (!acc[sub.category]) acc[sub.category] = [];
            acc[sub.category].push(sub);
            return acc;
        }, {});

        return Object.entries(categoryGroups)
            .filter(([, subs]) => subs.length > 1)
            .map(([category, subs]) => ({
                category,
                count: subs.length,
                totalCost: subs.reduce((sum, s) => sum + (s.frequency === 'yearly' ? s.amount / 12 : s.amount), 0),
                potentialSavings: subs.reduce((sum, s) => sum + (s.frequency === 'yearly' ? s.amount / 12 : s.amount), 0) * 0.3
            }));
    };

    if (loading) {
        return <div className="loading-spinner">{t.loading}</div>;
    }

    return (
        <div className="page-container su-page">
            {/* Feature 1: Subscription Health Score */}
            <section className="su-health">
                {healthScore ? (
                    <div className="su-health-row">
                        <div>
                            <h3>{t.healthTitle}</h3>
                            <p>
                                {healthScore.icon} <strong>{healthScore.score}</strong> — {fillText(t.healthBody.split(' — ')[1], { pct: (healthScore.percentage).toFixed(1) })}
                            </p>
                        </div>
                        <div className="su-health-badge">
                            <div className="su-health-value">{(healthScore.percentage).toFixed(1)}%</div>
                            <div className="su-health-label">{t.ofIncome}</div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3>{t.healthTitle}</h3>
                        <p>
                            {fillText(t.healthSpend, { amount: formatMoney(totalMonthlyCost) })}{' '}
                            <Link to="/profile" className="su-health-link">{t.addIncome}</Link>.
                        </p>
                    </div>
                )}
            </section>

            <div className="su-top">
                <button
                    className="btn-primary su-add-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {t.addSub}
                </button>
            </div>

            {/* Add Subscription Form */}
            {showAddForm && (
                <div className="card form-card gl-form">
                    <h3 className="gl-form-title">{t.addFormTitle}</h3>
                    <form onSubmit={handleCreateSubscription} className="subscription-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.serviceName}</label>
                                <input
                                    type="text"
                                    value={newSubscription.name}
                                    onChange={(e) => setNewSubscription({...newSubscription, name: e.target.value})}
                                    placeholder={t.servicePlaceholder}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t.provider}</label>
                                <input
                                    type="text"
                                    value={newSubscription.provider}
                                    onChange={(e) => setNewSubscription({...newSubscription, provider: e.target.value})}
                                    placeholder={t.providerPlaceholder}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{fillText(t.amount, { cur: currencyCode() })}</label>
                                <input
                                    type="number"
                                    value={newSubscription.amount || ''}
                                    onChange={(e) => setNewSubscription({...newSubscription, amount: Number(e.target.value)})}
                                    placeholder="1500"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t.frequency}</label>
                                <select
                                    value={newSubscription.frequency}
                                    onChange={(e) => setNewSubscription({...newSubscription, frequency: e.target.value as 'monthly' | 'yearly'})}
                                    required
                                >
                                    <option value="monthly">{t.monthly}</option>
                                    <option value="yearly">{t.yearly}</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{t.category}</label>
                                <select
                                    value={newSubscription.category}
                                    onChange={(e) => setNewSubscription({...newSubscription, category: e.target.value})}
                                    required
                                >
                                    <option value="">{t.selectCategory}</option>
                                    <option value="Entertainment">{t.catEntertainment}</option>
                                    <option value="Software">{t.catSoftware}</option>
                                    <option value="Health">{t.catHealth}</option>
                                    <option value="Education">{t.catEducation}</option>
                                    <option value="News">{t.catNews}</option>
                                    <option value="Gaming">{t.catGaming}</option>
                                    <option value="Music">{t.catMusic}</option>
                                    <option value="Cloud Storage">{t.catCloud}</option>
                                    <option value="Other">{t.catOther}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t.nextPaymentDate}</label>
                                <DateInput
                                    value={newSubscription.nextPayment}
                                    onChange={(e) => setNewSubscription({...newSubscription, nextPayment: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                                {t.cancel}
                            </button>
                            <button type="submit" className="btn-primary">
                                {t.addSubBtn}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Summary Cards */}
            <div className="rc-stats">
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.monthlyTotal}</span>
                    <span className="rc-stat-value">{formatMoney(totalMonthlyCost)}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.activeSubs}</span>
                    <span className="rc-stat-value">{activeSubs.length}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.zombieCount}</span>
                    <span className="rc-stat-value">{zombieSubs.length}</span>
                </div>
                <div className="rc-stat">
                    <span className="rc-stat-label">{t.potentialSavings}</span>
                    <span className="rc-stat-value">{formatMoney(savings)}</span>
                </div>
            </div>

            {/* Feature 6: Subscription Trend Analytics */}
            <section className="su-panel">
                <h3 className="su-panel-title">{t.trendTitle}</h3>
                {trends.some(t => t.amount > 0) ? (
                    <div className="su-trend">
                        {trends.map((trend, idx) => {
                            const maxAmount = Math.max(...trends.map(t => t.amount));
                            return (
                                <div key={idx} className="su-trend-col" title={`${formatMoney(trend.amount)}`}>
                                    <div className="su-trend-value">
                                        {trend.amount > 0 ? `${(trend.amount / 1000).toFixed(1)}K` : '0'}
                                    </div>
                                    <div className="su-trend-bar" style={{ height: `${Math.max(2, (trend.amount / maxAmount) * 100)}px` }}></div>
                                    <div className="su-trend-month">{trend.month}</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="su-muted">
                        {t.trendEmpty}
                    </p>
                )}
            </section>

            {/* Feature 7: Consolidation Suggestions */}
            {consolidationSuggestions().length > 0 && (
                <div className="su-note warn">
                    <h4>{t.consolidationTitle}</h4>
                    {consolidationSuggestions().map((suggestion, idx) => (
                        <p key={idx}>
                            <strong>{suggestion.category}:</strong> {fillText(t.consolidationLine, { count: suggestion.count, cost: formatMoney(suggestion.totalCost) })}
                            {' '}{t.consolidationAfter} <strong>{formatMoney(suggestion.potentialSavings)}/month</strong>.
                        </p>
                    ))}
                </div>
            )}

            {/* Zombie Subscriptions Alert */}
            {zombieSubs.length > 0 && (
                <div className="su-note bad su-zombie">
                    <div>
                        <h4>{t.zombieTitle}</h4>
                        <p>{fillText(t.zombieBody, { count: zombieSubs.length, amount: formatMoney(savings) })}</p>
                    </div>
                    <button className="su-btn danger" onClick={handleCancelAllZombies}>
                        {t.cancelAllZombies}
                    </button>
                </div>
            )}

            {/* Subscriptions List - Feature 10: Enhanced Card Layout */}
            <div className="su-grid">
                {activeSubs.map((subscription) => {
                    const usageStatus = getUsageStatus(subscription);
                    const insightData = subscription._id ? insightsMap[subscription._id] : null;
                    const insight = insightData?.insight
                        || (insightsStatus === 'loading' ? t.loadingInsight : t.insightUnavailable);
                    const renewalRisk = getRenewalRisk(subscription);
                    const dueStatus = getDueStatus(subscription);
                    const monthlyAmount = subscription.frequency === 'yearly' ? subscription.amount / 12 : subscription.amount;
                    const usageTone = usageStatus.status === t.stActive ? 'good' : usageStatus.status === t.stRarely ? 'warn' : 'bad';

                    return (
                        <article key={subscription._id} className={`su-card ${renewalRisk.risk || dueStatus.overdue ? 'alert' : ''}`}>
                            {/* Renewal Risk Warning - Feature 5 */}
                            {renewalRisk.risk && (
                                <div className="su-banner">{renewalRisk.message}</div>
                            )}

                            {/* Payment date has passed */}
                            {dueStatus.overdue && (
                                <div className="su-banner">
                                    {fillText(t.overdueBanner, { date: new Date(subscription.nextPayment).toLocaleDateString('en-LK'), label: dueStatus.label.toLowerCase() })}
                                </div>
                            )}

                            {/* Header - Subscription Name & Status */}
                            <div className="su-card-head">
                                <div className="su-card-title">
                                    <h4>{subscription.name}</h4>
                                    <span>{subscription.provider}</span>
                                </div>
                                <span className={`su-pill ${usageTone}`}>
                                    {usageStatus.icon} {usageStatus.status}
                                </span>
                            </div>

                            {/* Usage Info - Feature 2 */}
                            <p className="su-usage">{usageStatus.label}</p>

                            {/* Cost & Category Row */}
                            <div className="su-facts">
                                <div>
                                    <div className="su-fact-label">{t.cost}</div>
                                    <div className="su-fact-value big">{formatMoney(monthlyAmount)}</div>
                                    <div className="su-fact-sub">{t.perMonth}</div>
                                </div>
                                <div>
                                    <div className="su-fact-label">{t.categoryLabel}</div>
                                    <div className="su-fact-value">{subscription.category}</div>
                                </div>
                                <div>
                                    <div className="su-fact-label">{t.nextRenewal}</div>
                                    <div className="su-fact-value" style={{ color: dueStatus.overdue ? '#ef4444' : undefined }}>{formatDate(subscription.nextPayment)}</div>
                                    <div className="su-fact-sub" style={{ color: dueStatus.color }}>{dueStatus.label}</div>
                                </div>
                            </div>

                            {/* AI Insight Card - Feature 3 */}
                            <div className="su-insight">
                                <strong>{t.aiInsight}</strong> {insight}
                            </div>

                            {/* Impact Summary - Feature 9 */}
                            <div className="su-impact">
                                <strong>{t.ifCancel}</strong>
                                <ul>
                                    <li>{fillText(t.saveMonthly, { amount: formatMoney(monthlyAmount) })}</li>
                                    {monthlyIncome && <li>{fillText(t.freesUp, { pct: ((monthlyAmount / monthlyIncome) * 100).toFixed(1) })}</li>}
                                    <li>{fillText(t.annualSavings, { amount: formatMoney((monthlyAmount * 12)) })}</li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="su-actions">
                                <button className="btn-primary btn-sm" onClick={() => handleFindAlternative(subscription)}>
                                    {t.viewAlternatives}
                                </button>
                                <button className="btn-secondary btn-sm" onClick={() => notify.info(t.downgradeSoon)}>
                                    {t.downgrade}
                                </button>
                                <button className="btn-secondary btn-sm" onClick={() => handleCancelSubscription(subscription._id!)}>
                                    {t.cancelBtn}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {activeSubs.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon" style={{ display: 'none' }}></div>
                    <h3>{t.noSubs}</h3>
                    <p>{t.noSubsSub}</p>
                </div>
            )}

            {/* Cancelled / dismissed subscriptions can be brought back */}
            {cancelledSubs.length > 0 && (
                <section className="su-panel su-cancelled">
                    <h3 className="su-panel-title">
                        {fillText(t.cancelledTitle, { n: cancelledSubs.length })}
                    </h3>
                    {cancelledSubs.map(sub => (
                        <div key={sub._id} className="su-cancelled-row">
                            <div>
                                <div className="su-cancelled-name">{sub.name}</div>
                                <div className="su-cancelled-meta">
                                    {sub.provider} · {formatMoney(sub.amount)}/{sub.frequency === 'yearly' ? t.perYear : t.perMonthShort}
                                    {sub.cancelledAt && ` · ${fillText(t.cancelledOn, { date: formatDate(sub.cancelledAt) })}`}
                                    {sub.cancelReason && ` · ${CANCEL_REASON_LABELS[sub.cancelReason] || sub.cancelReason}`}
                                </div>
                            </div>
                            <button className="btn-secondary su-restore-btn" onClick={() => handleRestoreSubscription(sub)}>
                                {t.restore}
                            </button>
                        </div>
                    ))}
                </section>
            )}

            {/* Modal: Cheaper Alternatives - Feature 4 */}
            {showAlternativesModal && selectedSubscription && (
                <div className="su-overlay" onClick={closeAlternativesModal}>
                    <div
                        className="gl-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="alternatives-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="gl-modal-head">
                            <h2 id="alternatives-title">{fillText(t.altTitle, { name: selectedSubscription.name })}</h2>
                            <button type="button" className="gl-modal-close" onClick={closeAlternativesModal} aria-label={t.close} title={t.close}>
                                ×
                            </button>
                        </div>

                        {(() => {
                            const insightData = selectedSubscription._id ? insightsMap[selectedSubscription._id] : null;
                            const alternatives = insightData ? (insightData.alternatives || []) : [];

                            return (
                                <div>
                                    {alternatives.length > 0 ? (
                                        <div>
                                            <div className="su-table-wrap">
                                                <table className="su-table">
                                                    <thead>
                                                        <tr>
                                                            <th>{t.colAlternative}</th>
                                                            <th className="center">{t.colPrice}</th>
                                                            <th className="right">{t.colSavings}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {alternatives.map((alt, idx) => (
                                                            <tr key={idx}>
                                                                <td>
                                                                    <div className="su-alt-name">{alt.name}</div>
                                                                    <div className="su-alt-provider">{alt.provider}</div>
                                                                </td>
                                                                <td className="center strong">
                                                                    {formatMoney(alt.price)}
                                                                </td>
                                                                <td className="right strong su-saving">
                                                                    {alt.savings > 0 ? `+${formatMoney(alt.savings)}` : t.altNA}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="gl-modal-actions su-modal-actions">
                                                <button className="btn-secondary" onClick={closeAlternativesModal}>
                                                    {t.close}
                                                </button>
                                                <button className="btn-primary" onClick={() => notify.info(t.switchSoon)}>
                                                    {t.switchPlan}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="su-modal-text">
                                                {insightsStatus === 'failed'
                                                    ? t.altFailed
                                                    : t.altNone}
                                            </p>
                                            <div className="gl-modal-actions su-modal-actions">
                                                <button type="button" className="btn-secondary" onClick={closeAlternativesModal}>
                                                    {t.close}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Modal: Cancel Subscription - Features 8 & 9 */}
            {showCancelModal && selectedSubscription && (
                <div className="su-overlay">
                    <div className="gl-modal gl-form" role="dialog" aria-modal="true" aria-labelledby="cancel-sub-title">
                        <div className="gl-modal-head">
                            <h2 id="cancel-sub-title">{fillText(t.cancelTitle, { name: selectedSubscription.name })}</h2>
                            <button
                                type="button"
                                className="gl-modal-close"
                                aria-label={t.close}
                                title={t.close}
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedSubscription(null);
                                    setCancelReason('');
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Feature 9: Impact Summary */}
                        <div className="su-impact su-impact-modal">
                            <strong>{t.cancelWill}</strong>
                            <ul>
                                <li>{fillText(t.saveMonthly, { amount: formatMoney((selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount)) })}</li>
                                {monthlyIncome && <li>{fillText(t.freesUp, { pct: (((selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount) / monthlyIncome) * 100).toFixed(1) })}</li>}
                                <li>{fillText(t.annualSavings, { amount: formatMoney(((selectedSubscription.frequency === 'yearly' ? selectedSubscription.amount / 12 : selectedSubscription.amount) * 12)) })}</li>
                            </ul>
                        </div>

                        {/* Feature 8: Cancel Reason Tracking */}
                        <div className="form-group">
                            <label htmlFor="cancel-reason">{t.reasonLabel}</label>
                            <select
                                id="cancel-reason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            >
                                <option value="">{t.selectReason}</option>
                                <option value="too-expensive">{t.reasonExpensive}</option>
                                <option value="not-used">{t.reasonNotUsed}</option>
                                <option value="found-alternative">{t.reasonAlt}</option>
                                <option value="temporary-pause">{t.reasonPause}</option>
                                <option value="other">{t.reasonOther}</option>
                            </select>
                        </div>

                        <div className="gl-modal-actions su-modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedSubscription(null);
                                    setCancelReason('');
                                }}
                            >
                                {t.keepSub}
                            </button>
                            <button className="gl-delete-btn" onClick={confirmCancelSubscription}>
                                {t.confirmCancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
