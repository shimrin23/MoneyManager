import { useState, useEffect } from 'react';
import { apiClient } from '../api/client.ts';
import { notify } from '../utils/systemMessages';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPages.css';

export const Signup = () => {
    const [name,         setName]         = useState('');
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error,        setError]        = useState('');
    const [loading,      setLoading]      = useState(false);
    
    // Success State
    const [isRegistered, setIsRegistered] = useState(false);

    // Google Sign In State
    const [googleRendered, setGoogleRendered] = useState(false);

    const navigate = useNavigate();

    const doLogin = (role: string, token: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        window.dispatchEvent(new Event('auth-changed'));
        navigate(role === 'customer' ? '/dashboard' : '/admin');
    };

    // Initialize Google Sign-In SDK if Client ID is configured on the backend
    useEffect(() => {
        let mounted = true;
        const fetchGoogleConfig = async () => {
            try {
                const res = await apiClient.get('/auth/google-client-id');
                const cId = res.data.clientId;
                if (!cId || cId.startsWith('your_') || cId === '') return;

                let attempts = 0;
                const tryRenderGoogle = () => {
                    if (!mounted) return;
                    const container = document.getElementById("google-signup-btn-container");
                    if ((window as any).google?.accounts?.id && container) {
                        try {
                            (window as any).google.accounts.id.initialize({
                                client_id: cId,
                                callback: handleGoogleCredentialResponse,
                            });
                            (window as any).google.accounts.id.renderButton(
                                container,
                                { theme: "outline", size: "large", width: "100%", text: "signup_with" }
                            );
                            if (mounted) setGoogleRendered(true);
                        } catch (e) {
                            console.warn("Google Sign-In button render error:", e);
                        }
                    } else if (attempts < 50) {
                        attempts++;
                        setTimeout(tryRenderGoogle, 100);
                    }
                };
                tryRenderGoogle();
            } catch (err) {
                console.error("Failed to load Google OAuth config from backend:", err);
            }
        };
        fetchGoogleConfig();
        return () => { mounted = false; };
    }, []);

    const handleGoogleFallbackClick = () => {
        if ((window as any).google?.accounts?.id) {
            try {
                (window as any).google.accounts.id.prompt();
                return;
            } catch (e) {
                console.warn("Google prompt error:", e);
            }
        }
        notify.warning("Google Sign-In is not configured yet. Please add GOOGLE_CLIENT_ID to your backend .env file and restart the server.");
    };

    const handleGoogleCredentialResponse = async (response: any) => {
        setError('');
        setLoading(true);
        try {
            const res = await apiClient.post('/auth/google-login', {
                credential: response.credential
            });
            const role = res.data.role || res.data.user?.role || 'customer';
            doLogin(role, res.data.token);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Google login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordValid) return;
        setError('');
        setLoading(true);
        try {
            await apiClient.post('/auth/signup', { name, email, password });
            setIsRegistered(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Password rules (must match the server: AUT-002)
    const passwordRules = [
        { label: 'At least 8 characters', ok: password.length >= 8 },
        { label: 'Contains a letter', ok: /[A-Za-z]/.test(password) },
        { label: 'Contains a number', ok: /\d/.test(password) },
    ];
    const passwordValid = passwordRules.every(rule => rule.ok);

    return (
        <div className="auth-center-page signup-compact">
            {/* Tighter spacing so the whole sign-up form fits on one screen */}
            <style>{`
                .signup-compact { padding: 1rem; }
                .signup-compact .auth-center-card { padding: 1.5rem 2rem 1.25rem; }
                .signup-compact .auth-card-header { margin-bottom: 1rem; }
                .signup-compact .auth-field { margin-bottom: 0.6rem; }
                .signup-compact .auth-label { margin-bottom: 0.25rem; }
                .signup-compact .auth-input { padding-top: 0.55rem; padding-bottom: 0.55rem; padding-left: 0.9rem; padding-right: 2.6rem; }
                .signup-compact .auth-eye-btn { left: auto; right: 0.85rem; }
                .signup-compact .auth-input-no-icon { padding-left: 0.9rem; }
                .signup-compact .auth-submit-btn { padding-top: 0.6rem; padding-bottom: 0.6rem; }
                .signup-compact .auth-google-btn { padding-top: 0.55rem; padding-bottom: 0.55rem; }
                .signup-compact .auth-divider { margin-bottom: 0.9rem; }
                .signup-compact .auth-switch-row { margin-top: 0.75rem; line-height: 1.1; }
                .signup-compact .auth-switch-row .auth-link { display: block; margin-top: 0.6rem; font-size: 0.92rem; }
            `}</style>
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-orb auth-orb-3" />

            <div className="auth-center-card">
                {/* Logo */}
                <div className="auth-logo" style={{ marginBottom: '0.25rem', marginRight: '0.5rem' }}>
                    <span className="auth-logo-icon">💰</span>
                    <span className="auth-logo-name">MoneyManager</span>
                </div>

                {isRegistered ? (
                    <div className="verify-status success" style={{ textAlign: 'center' }}>
                        <div className="verify-icon-wrap success-icon" style={{ margin: '0 auto 1.5rem' }}>
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 className="auth-card-title" style={{ marginBottom: '0.75rem' }}>Account Created!</h2>
                        <p className="verify-sub" style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.6', margin: '0.75rem 0 1.5rem' }}>
                            We have sent a verification link to <strong>{email.replace(/^(.)[^@]*(?=@)/, '$1***')}</strong>. Please check your inbox and click the link to verify your email.
                        </p>
                        <button className="auth-submit-btn" onClick={() => navigate('/login')}>
                            Go to Sign In <span className="auth-btn-arrow">→</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="auth-card-header" style={{ marginTop: 0 }}>
                            <h1 className="auth-card-title">Create account</h1>
                            <p className="auth-card-sub">Get started for free today</p>
                        </div>

                        {error && (
                            <div className="auth-error">
                                <span></span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="auth-form-new">
                            {/* Full name */}
                            <div className="auth-field">
                                <label className="auth-label">Full name</label>
                                <div className="auth-input-wrap">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        placeholder="Your full name"
                                        disabled={loading}
                                        autoComplete="name"
                                        className="auth-input auth-input-no-icon"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="auth-field">
                                <label className="auth-label">Email address</label>
                                <div className="auth-input-wrap">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        disabled={loading}
                                        autoComplete="email"
                                        className="auth-input auth-input-no-icon"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="auth-field">
                                <label className="auth-label">Password</label>
                                <div className="auth-input-wrap">
                                    <button
                                        type="button"
                                        className="auth-eye-btn"
                                        onClick={() => setShowPassword(p => !p)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        placeholder="At least 8 characters"
                                        disabled={loading}
                                        autoComplete="new-password"
                                        minLength={8}
                                        className="auth-input"
                                    />
                                </div>
                                {/* Password rules: green tick when met */}
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0.6rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    {passwordRules.map(rule => (
                                        <li key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: rule.ok ? '#059669' : '#6b7280' }}>
                                            <span aria-hidden="true" style={{ display: 'inline-flex', width: '16px', height: '16px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', border: rule.ok ? 'none' : '1px solid #9ca3af', background: rule.ok ? '#10b981' : 'transparent', color: '#fff', fontSize: '0.7rem' }}>
                                                {rule.ok ? '✓' : ''}
                                            </span>
                                            {rule.label}
                                        </li>
                                    ))}
                                </ul>
                                {password.length > 0 && !passwordValid && (
                                    <p role="alert" style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
                                        Password does not meet all the requirements above.
                                    </p>
                                )}
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading || !passwordValid}>
                                {loading ? (
                                    <span className="auth-spinner">⏳ Creating account…</span>
                                ) : (
                                    <>Create Account <span className="auth-btn-arrow">→</span></>
                                )}
                            </button>
                        </form>

                        <div className="auth-divider"><span>or continue with</span></div>

                        {/* Google Sign In Container (Renders real SDK button or custom fallback button) */}
                        <div
                            id="google-signup-btn-container"
                            className="auth-google-real-container"
                            style={{ display: googleRendered ? 'flex' : 'none' }}
                        ></div>

                        {!googleRendered && (
                            <button
                                type="button"
                                className="auth-google-btn"
                                onClick={handleGoogleFallbackClick}
                                disabled={loading}
                            >
                                <svg className="auth-google-icon" viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continue with Google
                            </button>
                        )}

                        <p className="auth-switch-row">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">Sign in</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
