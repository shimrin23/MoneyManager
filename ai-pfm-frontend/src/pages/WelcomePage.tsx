import { useNavigate } from 'react-router-dom';
import '../styles/WelcomePage.css';

const FEATURES = [
    {
        icon: '🧠',
        title: 'AI-Powered Recommendations',
        desc: 'Personalized budgets, savings goals, and debt repayment strategies generated from your spending patterns.',
        color: '#667eea',
    },
    {
        icon: '❤️',
        title: 'Financial Health Score',
        desc: 'Composite score (0–100) updated dynamically based on liquidity, savings habit, EMI ratio, and credit utilization.',
        color: '#f59e0b',
    },
    {
        icon: '📊',
        title: 'Cash Flow Forecasting',
        desc: 'Time-series forecasting predicts your daily balances for the next 30–90 days and highlights shortfall risk days.',
        color: '#10b981',
    },
    {
        icon: '🔍',
        title: 'Anomaly Detection',
        desc: 'AI flags duplicate charges, sudden spikes, and unusual merchants using Isolation Forest models in real time.',
        color: '#ef4444',
    },
    {
        icon: '🎯',
        title: 'Goal Optimization',
        desc: 'Automatically allocates surpluses to your savings goals — travel funds, education, emergencies — and rebalances dynamically.',
        color: '#8b5cf6',
    },
    {
        icon: '💳',
        title: 'Debt Optimization',
        desc: 'Avalanche vs snowball simulations detect high-interest debt and recommend IPP conversion or loan restructuring.',
        color: '#06b6d4',
    },
];

const STEPS = [
    {
        step: '01',
        icon: '🔗',
        title: 'Connect Your Accounts',
        desc: 'Link savings, credit cards, fixed deposits, loans, leases, and pawning — all in one secure platform.',
    },
    {
        step: '02',
        icon: '🤖',
        title: 'AI Analyzes Your Finances',
        desc: 'Our engine categorizes transactions, detects patterns, forecasts cash flow, and generates your Financial Health Score.',
    },
    {
        step: '03',
        icon: '⚡',
        title: 'Act on Recommendations',
        desc: 'Accept a recommendation with one tap to automatically create budgets, alerts, goals, or schedule transfers.',
    },
];

const INSTRUMENTS = [
    { icon: '🏦', label: 'Savings & Current' },
    { icon: '💳', label: 'Credit Cards' },
    { icon: '🏛️', label: 'Fixed Deposits' },
    { icon: '💰', label: 'Loans' },
    { icon: '🚗', label: 'Leases' },
    { icon: '💎', label: 'Pawning' },
    { icon: '🔄', label: 'Subscriptions' },
    { icon: '📅', label: 'Scheduled Transfers' },
];

const STATS = [
    { value: '0–100', label: 'Health Score Range' },
    { value: '30–90d', label: 'Cash Flow Forecast' },
    { value: '99.9%', label: 'Platform Uptime' },
    { value: 'EN/SI/TA', label: 'Trilingual Support' },
];

export const WelcomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-page">
            {/* ── Nav ── */}
            <nav className="welcome-nav">
                <div className="welcome-nav-brand">
                    <span className="brand-icon">💹</span>
                    <span className="brand-name">Epic<span>PFM</span></span>
                </div>
                <div className="welcome-nav-actions">
                    <button className="nav-ghost-btn" onClick={() => navigate('/login')}>Login</button>
                    <button className="nav-cta-btn"   onClick={() => navigate('/signup')}>Get Started</button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="hero-section">
                <div className="hero-orb orb-1" />
                <div className="hero-orb orb-2" />
                <div className="hero-orb orb-3" />

                <div className="hero-badge">🚀 AI-Powered · Epic Lanka Private Limited</div>

                <h1 className="hero-title">
                    Your Personal<br />
                    <span className="hero-gradient-text">Financial Coach</span>
                </h1>

                <p className="hero-subtitle">
                    A dynamic AI module that continuously analyzes your entire financial portfolio —
                    accounts, cards, deposits, loans, leases, and more — turning your banking app
                    into an intelligent financial advisor.
                </p>

                <div className="hero-actions">
                    <button className="hero-primary-btn" onClick={() => navigate('/signup')}>
                        Start Free Today
                        <span className="btn-arrow">→</span>
                    </button>
                    <button className="hero-secondary-btn" onClick={() => navigate('/login')}>
                        Sign In
                    </button>
                </div>

                {/* Health score preview card */}
                <div className="hero-preview-card">
                    <div className="preview-card-header">
                        <span className="preview-card-title">Financial Health Score</span>
                        <span className="preview-badge good">Good</span>
                    </div>
                    <div className="preview-score-row">
                        <span className="preview-score">78</span>
                        <span className="preview-score-max">/100</span>
                        <span className="preview-score-trend">↑ +5 this week</span>
                    </div>
                    <div className="preview-score-bar">
                        <div className="preview-score-fill" style={{ width: '78%' }} />
                    </div>
                    <div className="preview-factors">
                        <div className="preview-factor">
                            <span className="factor-dot green" /> Savings Habit
                        </div>
                        <div className="preview-factor">
                            <span className="factor-dot yellow" /> EMI Ratio
                        </div>
                        <div className="preview-factor">
                            <span className="factor-dot green" /> Liquidity
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="stats-section">
                {STATS.map(s => (
                    <div className="stat-item" key={s.label}>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </section>

            {/* ── Features ── */}
            <section className="features-section">
                <div className="section-header">
                    <div className="section-badge">Core Capabilities</div>
                    <h2 className="section-title">Everything your finances need</h2>
                    <p className="section-subtitle">
                        Built from the ground up on the Epic Lanka BRD — covering data enrichment,
                        ML modeling, recommendation-to-action conversion, and full governance.
                    </p>
                </div>

                <div className="features-grid">
                    {FEATURES.map(f => (
                        <div className="feature-card" key={f.title} style={{ '--fc': f.color } as React.CSSProperties}>
                            <div className="feature-icon">{f.icon}</div>
                            <h3 className="feature-title">{f.title}</h3>
                            <p className="feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="how-section">
                <div className="section-header">
                    <div className="section-badge">How It Works</div>
                    <h2 className="section-title">From data to action in three steps</h2>
                </div>

                <div className="steps-row">
                    {STEPS.map((s, i) => (
                        <div className="step-card" key={s.step}>
                            <div className="step-number">{s.step}</div>
                            <div className="step-icon">{s.icon}</div>
                            <h3 className="step-title">{s.title}</h3>
                            <p className="step-desc">{s.desc}</p>
                            {i < STEPS.length - 1 && <div className="step-connector" />}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Financial instruments ── */}
            <section className="instruments-section">
                <div className="section-header">
                    <div className="section-badge">Unified Portfolio</div>
                    <h2 className="section-title">All your financial instruments, one view</h2>
                    <p className="section-subtitle">
                        Captures and unifies data from every product with real-time ingestion for large
                        transactions and daily batch updates for portfolio-level analytics.
                    </p>
                </div>

                <div className="instruments-grid">
                    {INSTRUMENTS.map(inst => (
                        <div className="instrument-chip" key={inst.label}>
                            <span className="instrument-icon">{inst.icon}</span>
                            <span className="instrument-label">{inst.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Recommendation lifecycle ── */}
            <section className="lifecycle-section">
                <div className="lifecycle-content">
                    <div className="section-badge light">Recommendation Engine</div>
                    <h2 className="lifecycle-title">Every recommendation is actionable</h2>
                    <p className="lifecycle-desc">
                        Each insight is presented with a <strong>Reason</strong>, <strong>Action</strong>,
                        <strong> Projected Impact</strong>, and <strong>Execution Path</strong>. Accept it with
                        one tap — budgets, goals, alerts, and transfers are created automatically.
                    </p>
                    <div className="lifecycle-tags">
                        <span className="tag">Budget Caps</span>
                        <span className="tag">Savings Goals</span>
                        <span className="tag">Debt Tools</span>
                        <span className="tag">Recurring Payments</span>
                        <span className="tag">Push Alerts</span>
                        <span className="tag">FD Account Creation</span>
                    </div>
                </div>

                <div className="lifecycle-card">
                    <div className="rec-card">
                        <div className="rec-card-header">
                            <span className="rec-type-badge">💡 Budget Recommendation</span>
                            <span className="rec-impact">Save LKR 8,400/mo</span>
                        </div>
                        <p className="rec-reason">
                            🍽️ Dining spend increased <strong>25%</strong> vs last month
                        </p>
                        <p className="rec-action-text">Set a monthly dining cap of <strong>LKR 15,000</strong></p>
                        <div className="rec-buttons">
                            <button className="rec-accept">✓ Accept</button>
                            <button className="rec-snooze">⏰ Snooze</button>
                            <button className="rec-decline">✕ Decline</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Roles ── */}
            <section className="roles-section">
                <div className="section-header">
                    <div className="section-badge">Access Control</div>
                    <h2 className="section-title">Role-based platform for every stakeholder</h2>
                </div>
                <div className="roles-grid">
                    <div className="role-card admin-role">
                        <div className="role-icon">🛠️</div>
                        <h3>Admin</h3>
                        <p>Configure recommendation templates, thresholds, and segments in trilingual formats</p>
                    </div>
                    <div className="role-card ops-role">
                        <div className="role-icon">⚙️</div>
                        <h3>Operations</h3>
                        <p>Monitor execution outcomes, manage user segments, and oversee audit trails</p>
                    </div>
                    <div className="role-card manager-role">
                        <div className="role-icon">📈</div>
                        <h3>Manager</h3>
                        <p>View acceptance rates, health score distributions, and savings lift analytics</p>
                    </div>
                    <div className="role-card customer-role">
                        <div className="role-icon">👤</div>
                        <h3>Customer</h3>
                        <p>Receive personalized AI insights and act on recommendations with one tap</p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="cta-orb cta-orb-1" />
                <div className="cta-orb cta-orb-2" />
                <h2 className="cta-title">Ready to transform your financial health?</h2>
                <p className="cta-subtitle">
                    Join Epic Lanka's AI-powered PFM platform and let intelligent recommendations
                    guide you to better financial decisions every day.
                </p>
                <div className="cta-actions">
                    <button className="cta-primary-btn" onClick={() => navigate('/signup')}>
                        Get Started Free
                    </button>
                    <button className="cta-secondary-btn" onClick={() => navigate('/login')}>
                        Login to Dashboard
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="welcome-footer">
                <div className="footer-brand">
                    <span className="brand-icon">💹</span>
                    <span className="brand-name">Epic<span>PFM</span></span>
                </div>
                <p className="footer-copy">© 2026 Epic Lanka Private Limited · Dynamic AI-Powered Personal Financial Management</p>
                <div className="footer-links">
                    <span>EN</span><span>·</span><span>සි</span><span>·</span><span>த</span>
                </div>
            </footer>
        </div>
    );
};
