import { useState, useEffect } from 'react';
import { apiClient } from '../api/client.ts';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPages.css';

export const Login = () => {
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error,        setError]        = useState('');
    const [loading,      setLoading]      = useState(false);
    
    // Custom Modals State
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Unverified account state
    const [showResendAlert, setShowResendAlert] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Google Sign In Mode
    const [useRealGoogle, setUseRealGoogle] = useState(false);

    const navigate = useNavigate();

    const doLogin = (role: string, token: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        window.dispatchEvent(new Event('auth-changed'));
        navigate(role === 'customer' ? '/dashboard' : '/admin');
    };

    // Initialize Google Sign-In SDK if Client ID is configured on the backend
    useEffect(() => {
        const fetchGoogleConfig = async () => {
            try {
                const res = await apiClient.get('/auth/google-client-id');
                const cId = res.data.clientId;
                if (cId && !cId.startsWith('your_') && cId !== '' && (window as any).google) {
                    setUseRealGoogle(true);
                    setTimeout(() => {
                        const container = document.getElementById("google-signin-btn-container");
                        if (container) {
                            (window as any).google.accounts.id.initialize({
                                client_id: cId,
                                callback: handleGoogleCredentialResponse,
                            });
                            (window as any).google.accounts.id.renderButton(
                                container,
                                { theme: "outline", size: "large", width: "100%", text: "continue_with" }
                            );
                        }
                    }, 100);
                }
            } catch (err) {
                console.error("Failed to load Google OAuth config from backend:", err);
            }
        };
        fetchGoogleConfig();
    }, []);

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
            setError(err.response?.data?.error || 'Google Login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShowResendAlert(false);
        setLoading(true);
        try {
            const res = await apiClient.post('/auth/login', { email, password });
            const role = res.data.role || res.data.user?.role || 'customer';
            doLogin(role, res.data.token);
        } catch (err: any) {
            const serverError = err.response?.data;
            if (serverError?.unverified) {
                setError(serverError.error || 'Please verify your email address before logging in.');
                setShowResendAlert(true);
                setUnverifiedEmail(serverError.email || email);
                return;
            }
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendStatus('loading');
        try {
            await apiClient.post('/auth/resend-verification', { email: unverifiedEmail });
            setResendStatus('success');
        } catch (err: any) {
            setResendStatus('error');
        }
    };

    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotStatus('loading');
        try {
            await apiClient.post('/auth/forgot-password', { email: forgotEmail });
            setForgotStatus('success');
        } catch (err: any) {
            setForgotStatus('error');
        }
    };

    return (
        <div className="auth-center-page">
            {/* Background orbs */}
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-orb auth-orb-3" />

            <div className="auth-center-card">
                {/* Logo */}
                <div className="auth-logo">
                    <span className="auth-logo-icon"></span>
                    <span className="auth-logo-name">MoneyManager</span>
                </div>

                <div className="auth-card-header">
                    <h1 className="auth-card-title">Welcome back</h1>
                    <p className="auth-card-sub">Sign in to your account</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <span></span> {error}
                    </div>
                )}

                {showResendAlert && (
                    <div className="auth-unverified-banner">
                        <p>Didn't receive the verification link?</p>
                        <button 
                            type="button" 
                            onClick={handleResendVerification} 
                            disabled={resendStatus === 'loading'}
                            className="auth-resend-btn"
                        >
                            {resendStatus === 'loading' ? 'Sending...' : 'Resend Link'}
                        </button>
                        {resendStatus === 'success' && <span className="resend-success-inline">Resent!</span>}
                        {resendStatus === 'error' && <span className="resend-error-inline">Failed.</span>}
                    </div>
                )}

                <form onSubmit={handleLogin} className="auth-form-new">
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

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrap">
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
                        </div>
                        <div className="auth-forgot-wrap">
                            <button
                                type="button"
                                className="auth-forgot-link"
                                onClick={() => setShowForgotPassword(true)}
                                tabIndex={-1}
                            >
                                Forgot password?
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

                <div className="auth-divider"><span>or continue with</span></div>

                {/* Google Sign In Container (Renders real SDK button or custom fallback button) */}
                {useRealGoogle ? (
                    <div id="google-signin-btn-container" className="auth-google-real-container"></div>
                ) : (
                    <button
                        type="button"
                        className="auth-google-btn"
                        onClick={() => alert("Google Sign-In is not configured yet. Please add GOOGLE_CLIENT_ID to your backend .env file and restart the server.")}
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
                    Don't have an account?{' '}
                    <Link to="/signup" className="auth-link">Create account</Link>
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="auth-modal-overlay" onClick={() => { setShowForgotPassword(false); setForgotStatus('idle'); setForgotEmail(''); }}>
                    <div className="auth-forgot-card" onClick={e => e.stopPropagation()}>
                        <h2>Reset Password</h2>
                        {(forgotStatus === 'idle' || forgotStatus === 'error') && (
                            <>
                                <p className="forgot-sub">Enter your email address and we'll send you a link to reset your password.</p>
                                {forgotStatus === 'error' && (
                                    <div className="auth-error" style={{ marginBottom: '1rem' }}>
                                        <span></span> Failed to send reset link. Please try again.
                                    </div>
                                )}
                                <form onSubmit={handleForgotPasswordSubmit}>
                                    <div className="auth-field">
                                        <label className="auth-label">Email address</label>
                                        <input
                                            type="email"
                                            value={forgotEmail}
                                            onChange={e => setForgotEmail(e.target.value)}
                                            required
                                            placeholder="you@example.com"
                                            className="auth-input auth-input-no-icon"
                                        />
                                    </div>
                                    <button type="submit" className="auth-submit-btn">Send Reset Link</button>
                                </form>
                            </>
                        )}
                        {forgotStatus === 'loading' && (
                            <div className="forgot-loading" style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <span className="auth-spinner">⏳ Processing request...</span>
                            </div>
                        )}
                        {forgotStatus === 'success' && (
                            <div className="forgot-success" style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <span className="success-icon" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}></span>
                                <h3>Check your email</h3>
                                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', margin: '1rem 0' }}>
                                    A password reset link has been sent to <strong>{forgotEmail}</strong> if an account exists.
                                </p>
                                <button className="auth-submit-btn" onClick={() => { setShowForgotPassword(false); setForgotStatus('idle'); setForgotEmail(''); }}>Close</button>
                            </div>
                        )}
                        {(forgotStatus === 'idle' || forgotStatus === 'error') && (
                            <button className="forgot-cancel-btn" onClick={() => setShowForgotPassword(false)}>Cancel</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
