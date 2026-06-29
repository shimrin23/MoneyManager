import { useState } from 'react';
import { apiClient } from '../api/client.ts';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPages.css';

const DEMO_USERS: Record<string, { role: string; token: string }> = {
    'admin@epiclanka.lk':    { role: 'admin',    token: 'demo-admin-token' },
    'ops@epiclanka.lk':      { role: 'ops',       token: 'demo-ops-token' },
    'manager@epiclanka.lk':  { role: 'manager',   token: 'demo-manager-token' },
    'customer@epiclanka.lk': { role: 'customer',  token: 'demo-customer-token' },
};

const DEMO_PASSWORDS: Record<string, string> = {
    'admin@epiclanka.lk':    'Admin@1234',
    'ops@epiclanka.lk':      'Ops@1234',
    'manager@epiclanka.lk':  'Manager@1234',
    'customer@epiclanka.lk': 'Customer@1234',
};

const FEATURES = [
    { icon: '🧠', text: 'AI-powered spending insights & recommendations' },
    { icon: '❤️', text: 'Real-time Financial Health Score (0–100)' },
    { icon: '📊', text: 'Cash flow forecasting for 30–90 days' },
    { icon: '🎯', text: 'Smart goal tracking & debt optimization' },
];

export const Login = () => {
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error,        setError]        = useState('');
    const [loading,      setLoading]      = useState(false);
    const navigate = useNavigate();

    const doLogin = (role: string, token: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        window.dispatchEvent(new Event('auth-changed'));
        navigate(role === 'customer' ? '/dashboard' : '/admin');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await apiClient.post('/auth/login', { email, password });
            const role = res.data.role || res.data.user?.role || 'customer';
            doLogin(role, res.data.token);
        } catch {
            const demo = DEMO_USERS[email.toLowerCase()];
            if (demo && DEMO_PASSWORDS[email.toLowerCase()] === password) {
                doLogin(demo.role, demo.token);
                return;
            }
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Orbs */}
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-orb auth-orb-3" />

            {/* Left panel */}
            <div className="auth-left">
                <Link to="/welcome" className="auth-brand">
                    <span className="auth-brand-icon">💹</span>
                    <span className="auth-brand-name">Epic<span>PFM</span></span>
                </Link>

                <div className="auth-left-body">
                    <h2 className="auth-left-title">
                        Turn your bank app into a<br />
                        <span className="auth-gradient-text">financial coach</span>
                    </h2>
                    <p className="auth-left-sub">
                        Epic Lanka's AI-powered PFM module analyses your entire portfolio
                        and delivers personalised recommendations — all in one tap.
                    </p>

                    <ul className="auth-feature-list">
                        {FEATURES.map(f => (
                            <li key={f.text} className="auth-feature-item">
                                <span className="auth-feature-icon">{f.icon}</span>
                                <span>{f.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Mini health score */}
                <div className="auth-score-card">
                    <div className="auth-score-label">Financial Health Score</div>
                    <div className="auth-score-row">
                        <span className="auth-score-val">78</span>
                        <span className="auth-score-max">/100</span>
                        <span className="auth-score-trend">↑ +5 this week</span>
                    </div>
                    <div className="auth-score-bar">
                        <div className="auth-score-fill" style={{ width: '78%' }} />
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-card-header">
                        <h1 className="auth-card-title">Welcome back</h1>
                        <p className="auth-card-sub">Sign in to your EpicPFM account</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="auth-form-new">
                        <div className="auth-field">
                            <label className="auth-label">Email address</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">✉️</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="you@epiclanka.lk"
                                    disabled={loading}
                                    autoComplete="email"
                                    className="auth-input"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    disabled={loading}
                                    autoComplete="current-password"
                                    className="auth-input"
                                />
                                <button
                                    type="button"
                                    className="auth-eye-btn"
                                    onClick={() => setShowPassword(p => !p)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide' : 'Show'}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? (
                                <span className="auth-spinner">⏳ Signing in…</span>
                            ) : (
                                <>Sign In <span className="auth-btn-arrow">→</span></>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider"><span>New to EpicPFM?</span></div>

                    <p className="auth-switch">
                        <Link to="/signup" className="auth-link">Create a free account →</Link>
                    </p>

                    <p className="auth-back">
                        <Link to="/welcome" className="auth-back-link">← Back to home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
