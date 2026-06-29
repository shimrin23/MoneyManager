import { useEffect, useState } from 'react';

type Lang = 'en' | 'si' | 'ta';

const PAGE_T: Record<Lang, Record<string, string>> = {
    en: {
        title: 'Reports & Analytics',
        subtitle: 'PFM performance metrics: recommendation outcomes, health scores, savings impact',
        lastMonth: 'Last Month', threeMonths: '3 Months', sixMonths: '6 Months',
        avgAcceptance: 'Avg Acceptance Rate', totalSavings: 'Total Savings Lift',
        totalCustomers: 'Total Customers', goalAdoption: 'Goal Adoption Rate',
        acceptanceTitle: 'Recommendation Acceptance Rate (%)',
        acceptanceSub: 'Monthly trend: how many customers accept AI recommendations',
        savingsTitle: 'Savings Lift (LKR)',
        savingsSub: 'Total customer savings achieved by following recommendations',
        healthTitle: 'Financial Health Score Distribution',
        goalTitle: 'Goal Adoption by Category (%)',
        goalSub: '% of customers who created a goal in each category',
        recTitle: 'Recommendation Outcomes by Category',
        recSub: 'Accepted / Declined / Snoozed breakdown per recommendation type',
        category: 'Category', accepted: 'Accepted', declined: 'Declined', snoozed: 'Snoozed', visual: 'Visual',
        lowRisk: 'Low Risk (70–100)', medRisk: 'Medium Risk (40–69)', highRisk: 'High Risk (0–39)',
        breakdown: 'Breakdown of', byRiskTier: 'customers by risk tier',
    },
    si: {
        title: 'වාර්තා සහ විශ්ලේෂණ',
        subtitle: 'PFM කාර්ය සාධන දත්ත: නිර්දේශ ප්‍රතිඵල, සෞඛ්‍ය ලකුණු, ඉතිරිකිරීම් බලපෑම',
        lastMonth: 'පසුගිය මාසය', threeMonths: 'මාස 3', sixMonths: 'මාස 6',
        avgAcceptance: 'සාමාන්‍ය පිළිගැනීම', totalSavings: 'ඉතිරිකිරීම් ලාභය',
        totalCustomers: 'මුළු පාරිභෝගිකයන්', goalAdoption: 'ඉලක්ක ස්වීකරණය',
        acceptanceTitle: 'නිර්දේශ පිළිගැනීමේ අනුපාතය (%)',
        acceptanceSub: 'මාසික ප්‍රවණතා: AI නිර්දේශ පිළිගත් පාරිභෝගිකයන්',
        savingsTitle: 'ඉතිරිකිරීම් ලාභය (LKR)',
        savingsSub: 'නිර්දේශ අනුගමනය කිරීමෙන් ලැබූ ඉතිරිකිරීම්',
        healthTitle: 'මූල්‍ය සෞඛ්‍ය ලකුණු බෙදාහැරීම',
        goalTitle: 'ප්‍රවර්ගය අනුව ඉලක්ක ස්වීකරණය (%)',
        goalSub: '% පාරිභෝගිකයන් ඉලක්කයක් නිර්මාණය කළ',
        recTitle: 'ප්‍රවර්ගය අනුව නිර්දේශ ප්‍රතිඵල',
        recSub: 'පිළිගැනීම / ප්‍රතික්ෂේප / කල් දැමීම බෙදාහැරීම',
        category: 'ප්‍රවර්ගය', accepted: 'පිළිගත්', declined: 'ප්‍රතික්ෂේප', snoozed: 'කල් දැමූ', visual: 'දෘශ්‍ය',
        lowRisk: 'අඩු අවදානම (70–100)', medRisk: 'මධ්‍යම අවදානම (40–69)', highRisk: 'ඉහළ අවදානම (0–39)',
        breakdown: 'බෙදාහැරීම:', byRiskTier: 'පාරිභෝගිකයන් ‒ අවදානම් මට්ටම',
    },
    ta: {
        title: 'அறிக்கைகள் மற்றும் பகுப்பாய்வு',
        subtitle: 'PFM செயல்திறன் அளவீடுகள்: பரிந்துரை முடிவுகள், நலன் மதிப்பெண்கள், சேமிப்பு தாக்கம்',
        lastMonth: 'கடந்த மாதம்', threeMonths: '3 மாதங்கள்', sixMonths: '6 மாதங்கள்',
        avgAcceptance: 'சராசரி ஏற்பு விகிதம்', totalSavings: 'மொத்த சேமிப்பு ஆதாயம்',
        totalCustomers: 'மொத்த வாடிக்கையாளர்கள்', goalAdoption: 'இலக்கு ஏற்பு விகிதம்',
        acceptanceTitle: 'பரிந்துரை ஏற்பு விகிதம் (%)',
        acceptanceSub: 'மாதாந்திர போக்கு: AI பரிந்துரைகளை ஏற்கும் வாடிக்கையாளர்கள்',
        savingsTitle: 'சேமிப்பு ஆதாயம் (LKR)',
        savingsSub: 'பரிந்துரைகளை பின்பற்றி அடைந்த சேமிப்புகள்',
        healthTitle: 'நிதி ஆரோக்கிய மதிப்பெண் விநியோகம்',
        goalTitle: 'வகை வாரியாக இலக்கு ஏற்பு (%)',
        goalSub: '% வாடிக்கையாளர்கள் இலக்கை உருவாக்கினர்',
        recTitle: 'வகை வாரியாக பரிந்துரை முடிவுகள்',
        recSub: 'பரிந்துரை வகை வாரியாக ஏற்பு / நிராகரிப்பு / ஒத்திவைப்பு',
        category: 'வகை', accepted: 'ஏற்கப்பட்டது', declined: 'நிராகரிக்கப்பட்டது', snoozed: 'ஒத்திவைக்கப்பட்டது', visual: 'காட்சி',
        lowRisk: 'குறைந்த அபாயம் (70–100)', medRisk: 'நடுத்தர அபாயம் (40–69)', highRisk: 'அதிக அபாயம் (0–39)',
        breakdown: 'விவரம்:', byRiskTier: 'வாடிக்கையாளர்கள் — அபாய நிலை',
    },
};

interface MonthData { month: string; value: number; }

const acceptanceData: MonthData[] = [
    { month: 'Jan', value: 62 }, { month: 'Feb', value: 68 }, { month: 'Mar', value: 71 },
    { month: 'Apr', value: 65 }, { month: 'May', value: 78 }, { month: 'Jun', value: 83 },
];

const savingsLiftData: MonthData[] = [
    { month: 'Jan', value: 12000 }, { month: 'Feb', value: 18500 }, { month: 'Mar', value: 22000 },
    { month: 'Apr', value: 19800 }, { month: 'May', value: 31000 }, { month: 'Jun', value: 38400 },
];

const healthDistribution = [
    { labelKey: 'lowRisk',  count: 1240, color: '#10b981', pct: 31   },
    { labelKey: 'medRisk',  count: 2180, color: '#f59e0b', pct: 54.5 },
    { labelKey: 'highRisk', count: 580,  color: '#ef4444', pct: 14.5 },
];

const goalAdoption = [
    { category: 'Emergency Fund', adopted: 68, color: '#6366f1' },
    { category: 'Travel',         adopted: 54, color: '#8b5cf6' },
    { category: 'Education',      adopted: 41, color: '#3b82f6' },
    { category: 'Home Purchase',  adopted: 29, color: '#10b981' },
    { category: 'Retirement',     adopted: 22, color: '#f59e0b' },
];

const recByCategory = [
    { category: 'Budget',       accepted: 82, declined: 8,  snoozed: 10, color: '#6366f1' },
    { category: 'Goal',         accepted: 74, declined: 12, snoozed: 14, color: '#10b981' },
    { category: 'Debt',         accepted: 61, declined: 25, snoozed: 14, color: '#f59e0b' },
    { category: 'Subscription', accepted: 88, declined: 6,  snoozed: 6,  color: '#8b5cf6' },
    { category: 'Alert',        accepted: 91, declined: 3,  snoozed: 6,  color: '#ef4444' },
];

const BarChartSimple = ({ data, color, suffix = '', maxOverride }: {
    data: MonthData[]; color: string; suffix?: string; maxOverride?: number;
}) => {
    const max = maxOverride ?? Math.max(...data.map(d => d.value));
    return (
        <div className="analytics-bar-chart">
            {data.map(d => (
                <div key={d.month} className="analytics-bar-item">
                    <div className="analytics-bar-track">
                        <div
                            className="analytics-bar-fill"
                            style={{ height: `${(d.value / max) * 100}%`, background: color }}
                            title={`${d.value}${suffix}`}
                        />
                    </div>
                    <div className="analytics-bar-value">{typeof d.value === 'number' && d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}K` : `${d.value}${suffix}`}</div>
                    <div className="analytics-bar-label">{d.month}</div>
                </div>
            ))}
        </div>
    );
};

export const AdminAnalyticsPage = () => {
    const [period, setPeriod] = useState<'6m' | '3m' | '1m'>('6m');
    const [lang, setLang] = useState<Lang>(
        () => (localStorage.getItem('lang') as Lang) || 'en'
    );

    useEffect(() => {
        const onLang = (e: Event) => setLang((e as CustomEvent).detail as Lang);
        window.addEventListener('lang-changed', onLang);
        return () => window.removeEventListener('lang-changed', onLang);
    }, []);

    const t = PAGE_T[lang];

    const totalUsers    = healthDistribution.reduce((s, h) => s + h.count, 0);
    const avgAcceptance = Math.round(acceptanceData.reduce((s, d) => s + d.value, 0) / acceptanceData.length);
    const totalSavings  = savingsLiftData.reduce((s, d) => s + d.value, 0);

    const periodLabels: Record<'1m' | '3m' | '6m', string> = {
        '1m': t.lastMonth, '3m': t.threeMonths, '6m': t.sixMonths,
    };

    return (
        <div className="page-container admin-analytics-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t.title}</h1>
                    <p className="page-subtitle">{t.subtitle}</p>
                </div>
                <div className="filter-pill-row" style={{ marginBottom: 0 }}>
                    {(['1m', '3m', '6m'] as const).map(val => (
                        <button key={val}
                            className={`filter-pill ${period === val ? 'active' : ''}`}
                            style={{ '--fp-color': '#6366f1' } as React.CSSProperties}
                            onClick={() => setPeriod(val)}
                        >
                            {periodLabels[val]}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Summary */}
            <div className="rec-summary-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                <div className="rec-stat-card accepted">
                    <div className="rec-stat-icon">✅</div>
                    <div>
                        <div className="rec-stat-value">{avgAcceptance}%</div>
                        <div className="rec-stat-label">{t.avgAcceptance}</div>
                    </div>
                </div>
                <div className="rec-stat-card savings">
                    <div className="rec-stat-icon">💰</div>
                    <div>
                        <div className="rec-stat-value">LKR {(totalSavings / 1000).toFixed(0)}K</div>
                        <div className="rec-stat-label">{t.totalSavings}</div>
                    </div>
                </div>
                <div className="rec-stat-card">
                    <div className="rec-stat-icon">👥</div>
                    <div>
                        <div className="rec-stat-value">{totalUsers.toLocaleString()}</div>
                        <div className="rec-stat-label">{t.totalCustomers}</div>
                    </div>
                </div>
                <div className="rec-stat-card pending">
                    <div className="rec-stat-icon">🎯</div>
                    <div>
                        <div className="rec-stat-value">54%</div>
                        <div className="rec-stat-label">{t.goalAdoption}</div>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Recommendation Acceptance Rate */}
                <div className="card analytics-card">
                    <h3 className="section-title">{t.acceptanceTitle}</h3>
                    <p className="analytics-subtitle">{t.acceptanceSub}</p>
                    <BarChartSimple data={acceptanceData} color="linear-gradient(180deg,#6366f1,#8b5cf6)" suffix="%" />
                </div>

                {/* Savings Lift */}
                <div className="card analytics-card">
                    <h3 className="section-title">{t.savingsTitle}</h3>
                    <p className="analytics-subtitle">{t.savingsSub}</p>
                    <BarChartSimple data={savingsLiftData} color="linear-gradient(180deg,#10b981,#34d399)" maxOverride={40000} />
                </div>

                {/* Health Score Distribution */}
                <div className="card analytics-card">
                    <h3 className="section-title">{t.healthTitle}</h3>
                    <p className="analytics-subtitle">{t.breakdown} {totalUsers.toLocaleString()} {t.byRiskTier}</p>
                    <div className="health-dist-list">
                        {healthDistribution.map(h => (
                            <div key={h.labelKey} className="health-dist-item">
                                <div className="health-dist-info">
                                    <span className="health-dist-label">{t[h.labelKey]}</span>
                                    <span className="health-dist-count" style={{ color: h.color }}>{h.count.toLocaleString()} ({h.pct}%)</span>
                                </div>
                                <div className="health-dist-bar-track">
                                    <div className="health-dist-bar-fill" style={{ width: `${h.pct}%`, background: h.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Donut-style summary */}
                    <div className="health-donut-row">
                        {healthDistribution.map(h => (
                            <div key={h.labelKey} className="health-donut-item">
                                <div className="health-donut-circle" style={{ background: `conic-gradient(${h.color} ${h.pct * 3.6}deg, rgba(30,41,59,0.5) 0deg)` }}>
                                    <div className="health-donut-inner">{h.pct}%</div>
                                </div>
                                <div className="health-donut-label" style={{ color: h.color }}>{t[h.labelKey].split(' ')[0]} {t[h.labelKey].split(' ')[1]}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Goal Adoption */}
                <div className="card analytics-card">
                    <h3 className="section-title">{t.goalTitle}</h3>
                    <p className="analytics-subtitle">{t.goalSub}</p>
                    <div className="goal-adoption-list">
                        {goalAdoption.map(g => (
                            <div key={g.category} className="goal-adoption-item">
                                <div className="goal-adoption-info">
                                    <span className="goal-adoption-name">{g.category}</span>
                                    <span className="goal-adoption-pct" style={{ color: g.color }}>{g.adopted}%</span>
                                </div>
                                <div className="health-dist-bar-track">
                                    <div className="health-dist-bar-fill" style={{ width: `${g.adopted}%`, background: g.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendation by Category */}
                <div className="card analytics-card full-width">
                    <h3 className="section-title">{t.recTitle}</h3>
                    <p className="analytics-subtitle">{t.recSub}</p>
                    <div className="rec-outcome-table">
                        <div className="rec-outcome-header">
                            <span>{t.category}</span>
                            <span>{t.accepted}</span>
                            <span>{t.declined}</span>
                            <span>{t.snoozed}</span>
                            <span>{t.visual}</span>
                        </div>
                        {recByCategory.map(r => (
                            <div key={r.category} className="rec-outcome-row">
                                <span style={{ color: r.color, fontWeight: 700 }}>{r.category}</span>
                                <span style={{ color: '#10b981' }}>{r.accepted}%</span>
                                <span style={{ color: '#ef4444' }}>{r.declined}%</span>
                                <span style={{ color: '#f59e0b' }}>{r.snoozed}%</span>
                                <div className="rec-outcome-bar">
                                    <div style={{ width: `${r.accepted}%`, background: '#10b981', height: '100%', borderRadius: '4px 0 0 4px' }} />
                                    <div style={{ width: `${r.declined}%`, background: '#ef4444', height: '100%' }} />
                                    <div style={{ width: `${r.snoozed}%`, background: '#f59e0b', height: '100%', borderRadius: '0 4px 4px 0' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
