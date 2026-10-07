import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import '../styles/AuthPages.css';

export const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [verifiedEmail, setVerifiedEmail] = useState('');
    const [countdown, setCountdown] = useState(3);
    
    // Resend verification state
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [resendMessage, setResendMessage] = useState('');

    const navigate = useNavigate();
    const token = searchParams.get('token');
    const hasVerifiedRef = useRef(false);

    // Function to navigate to login with verification state
    const goToLogin = (emailToPass?: string) => {
        navigate('/login', {
            replace: true,
            state: {
                verified: true,
                email: emailToPass || verifiedEmail,
                message: 'Email verified successfully! Please log in to your account.'
            }
        });
    };

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token was provided in the link. Please check your verification email.');
                return;
            }

            try {
                const res = await apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
                setStatus('success');
                const successMsg = res.data.message || 'Your email has been successfully verified! You can now log in.';
                setMessage(successMsg);

                const email = res.data.email || '';
                if (email) {
                    setVerifiedEmail(email);
                }

                // Explicitly clear any existing session tokens so user logs in cleanly
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                window.dispatchEvent(new Event('auth-changed'));

            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification link is invalid or has expired.');
            }
        };

        if (!hasVerifiedRef.current) {
            hasVerifiedRef.current = true;
            verify();
        }
    }, [token]);

    // Countdown timer for automatic redirect to login upon success
    useEffect(() => {
        if (status !== 'success') return;

        if (countdown <= 0) {
            goToLogin(verifiedEmail);
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [status, countdown, verifiedEmail]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resendEmail) return;

        setResendStatus('loading');
        try {
            const res = await apiClient.post('/auth/resend-verification', { email: resendEmail });
            setResendStatus('success');
            setResendMessage(res.data.message || 'Verification link resent successfully! Please check your inbox.');
        } catch (err: any) {
            setResendStatus('error');
            setResendMessage(err.response?.data?.error || 'Failed to resend verification link. Please try again.');
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
                    <span className="auth-logo-icon">💰</span>
                    <span className="auth-logo-name">MoneyManager</span>
                </div>

                <div className="verify-card-body">
                    {status === 'loading' && (
                        <div className="verify-status loading">
                            <div className="verify-spinner"></div>
                            <h2>Verifying your email</h2>
                            <p className="verify-sub">Please wait while we confirm your email address...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="verify-status success">
                            <div className="verify-icon-wrap success-icon">
                                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h2>Email Verified!</h2>
                            <p className="verify-sub">{message}</p>
                            
                            <button 
                                className="auth-submit-btn" 
                                onClick={() => goToLogin(verifiedEmail)}
                                style={{ width: '100%', marginBottom: '1rem' }}
                            >
                                Go to Sign In <span className="auth-btn-arrow">→</span>
                            </button>
                            
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                Redirecting you to login page in <strong>{countdown}s</strong>...
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="verify-status error">
                            <div className="verify-icon-wrap error-icon">
                                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </div>
                            <h2>Verification Failed</h2>
                            <p className="verify-sub">{message}</p>
                            
                            {/* Resend Link form */}
                            <div className="resend-section">
                                <div className="auth-divider"><span>resend link</span></div>
                                <p className="resend-instructions">Enter your email below to receive a new verification link.</p>
                                
                                {resendStatus === 'success' && (
                                    <div className="resend-alert success" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem' }}>
                                        <span>✓</span> {resendMessage}
                                    </div>
                                )}
                                
                                {resendStatus === 'error' && (
                                    <div className="resend-alert error" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem' }}>
                                        <span>⚠️</span> {resendMessage}
                                    </div>
                                )}

                                <form onSubmit={handleResend} className="resend-form">
                                    <input
                                        type="email"
                                        value={resendEmail}
                                        onChange={e => setResendEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        disabled={resendStatus === 'loading'}
                                        className="auth-input auth-input-no-icon"
                                    />
                                    <button 
                                        type="submit" 
                                        className="auth-submit-btn"
                                        disabled={resendStatus === 'loading'}
                                    >
                                        {resendStatus === 'loading' ? 'Sending...' : 'Get New Link'}
                                    </button>
                                </form>
                            </div>

                            <button className="forgot-cancel-btn" onClick={() => navigate('/login')}>
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
