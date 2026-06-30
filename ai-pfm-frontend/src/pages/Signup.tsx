import { useState } from 'react';
import { apiClient } from '../api/client.ts';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPages.css';

const PERKS = [
    { icon: '🔍', text: 'Anomaly detection — flags duplicate & unusual charges' },
    { icon: '💰', text: 'Unified view of all accounts, cards, FDs, and loans' },
    { icon: '📈', text: 'Personalised budget & savings goal automation' },
    { icon: '🌐', text: 'Trilingual support — English, Sinhala, Tamil' },
];

export const Signup = () => {
    const [name,         setName]         = useState('');
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error,        setError]        = useState('');
    const [loading,      setLoading]      = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiClient.post('/auth/signup', { name, email, password });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const strength = password.length === 0 ? 0
        : password.length < 6  ? 1
        : password.length < 10 ? 2
        : 3;
    const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];
    const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'][strength];

    return (
        <div className="auth-page">
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
                        Start your journey to<br />
                        <span className="auth-gradient-text">financial freedom</span>
                    </h2>
                    <p className="auth-left-sub">
                        Join Epic Lanka's AI-powered platform and let intelligent recommendations
                        guide every financial decision you make.
                    </p>

                    <ul className="auth-feature-list">
                        {PERKS.map(p => (
                            <li key={p.text} className="auth-feature-item">
                                <span className="auth-feature-icon">{p.icon}</span>
                                <span>{p.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="auth-score-card">
                    <div className="auth-score-label">Recommendation Engine</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                        Each recommendation includes a <strong style={{ color: '#a78bfa' }}>Reason</strong>,{' '}
                        <strong style={{ color: '#60a5fa' }}>Action</strong>, and{' '}
                        <strong style={{ color: '#34d399' }}>Projected Impact</strong>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['Budgets', 'Goals', 'Debt Tools', 'Alerts'].map(t => (
                            <span key={t} style={{ background: 'rgba(103,126,234,0.15)', border: '1px solid rgba(103,126,234,0.3)', color: '#a78bfa', fontSize: '0.72rem', padding: '0.3rem 0.7rem', borderRadius: '8px', fontWeight: 600 }}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-card-header">
                        <h1 className="auth-card-title">Create account</h1>
                        <p className="auth-card-sub">Join EpicPFM — it's free to get started</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="auth-form-new">
                        <div className="auth-field">
                            <label className="auth-label">Full name</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">👤</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    placeholder="Kamal Perera"
                                    disabled={loading}
                                    autoComplete="name"
                                    className="auth-input"
                                />
                            </div>
                        </div>

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
                                    placeholder="Min. 6 characters"
                                    disabled={loading}
                                    autoComplete="new-password"
                                    minLength={6}
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
                            {password.length > 0 && (
                                <div className="auth-strength">
                                    <div className="auth-strength-bar">
                                        {[1,2,3].map(n => (
                                            <div key={n} className="auth-strength-seg" style={{ background: n <= strength ? strengthColor : 'rgba(255,255,255,0.1)' }} />
                                        ))}
                                    </div>
                                    <span className="auth-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? (
                                <span className="auth-spinner">⏳ Creating account…</span>
                            ) : (
                                <>Create Account <span className="auth-btn-arrow">→</span></>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider"><span>Already have an account?</span></div>

                    <p className="auth-switch">
                        <Link to="/login" className="auth-link">Sign in instead →</Link>
                    </p>

                    <p className="auth-back">
                        <Link to="/welcome" className="auth-back-link">← Back to home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
