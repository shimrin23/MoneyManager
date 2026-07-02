import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import '../styles/AuthPages.css';

export const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    
    // Resend verification state
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [resendMessage, setResendMessage] = useState('');

    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token was provided. Please check your verification link.');
                return;
            }

            try {
                const res = await apiClient.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage(res.data.message || 'Your email has been successfully verified! Redirecting you to your dashboard...');
                
                const { token: jwtToken, role } = res.data;
                if (jwtToken && role) {
                    localStorage.setItem('token', jwtToken);
                    localStorage.setItem('userRole', role);
                    window.dispatchEvent(new Event('auth-changed'));
                    setTimeout(() => {
                        navigate(role === 'customer' ? '/dashboard' : '/admin');
                    }, 2000);
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification link is invalid or has expired.');
            }
        };
        verify();
    }, [token, navigate]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resendEmail) return;

        setResendStatus('loading');
        try {
            const res = await apiClient.post('/auth/resend-verification', { email: resendEmail });
            setResendStatus('success');
            setResendMessage(res.data.message || 'Verification link resent successfully!');
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
                            <button className="auth-submit-btn" onClick={() => navigate('/dashboard')}>
                                Go to Dashboard <span className="auth-btn-arrow">→</span>
                            </button>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '1rem' }}>
                                Redirecting you automatically in a moment...
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
                                    <div className="resend-alert success">
                                        <span>✔️</span> {resendMessage}
                                    </div>
                                )}
                                
                                {resendStatus === 'error' && (
                                    <div className="resend-alert error">
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
