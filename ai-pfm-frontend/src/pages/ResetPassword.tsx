import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { PasswordRules, isPasswordValid } from '../components/PasswordRules';
import '../styles/AuthPages.css';
import '../styles/LoginSplit.css';

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!token) {
            setStatus('error');
            setMessage('Reset password token is missing. Please request a new password reset link.');
            return;
        }

        if (!isPasswordValid(password)) {
            setStatus('error');
            setMessage('Password does not meet all the requirements.');
            return;
        }

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match. Please verify both fields.');
            return;
        }

        setStatus('loading');
        try {
            const res = await apiClient.post('/auth/reset-password', { token, password });
            setStatus('success');
            setMessage(res.data.message || 'Password reset successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
        }
    };

    return (
        <div className="auth-center-page login-split">
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-orb auth-orb-3" />

            <aside className="login-brand">
                <div className="login-brand-logo">
                    <span className="login-brand-mark">💰</span>
                    <span>MoneyManager</span>
                </div>
                <div>
                    <h2 className="login-brand-title">Know where every rupee goes.</h2>
                    <p className="login-brand-lead">Track spending, loans, leases, pawning and fixed deposits in one place, with an AI coach that tells you what to do next.</p>
                </div>
                <ul className="login-brand-points">
                    <li>A financial health score from 0 to 100, updated with every transaction</li>
                    <li>Alerts for unusual charges, duplicate bills and forgotten subscriptions</li>
                    <li>Made for Sri Lanka: LKR, local banks, and English, සිංහල, தமிழ்</li>
                </ul>
                <div className="login-brand-score">
                    <b>64</b>
                    <div>
                        <b>Health score</b>
                        <small>Savings rate 27% · Risk Medium</small>
                    </div>
                </div>
            </aside>

            <div className="auth-center-card">
                <div className="auth-logo">
                    <span className="auth-logo-icon">💰</span>
                    <span className="auth-logo-name">MoneyManager</span>
                </div>

                <div className="verify-card-body">
                    {status === 'success' ? (
                        <div className="verify-status success">
                            <div className="verify-icon-wrap success-icon">
                                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h2>Password Reset!</h2>
                            <p className="verify-sub">{message}</p>
                            <button className="auth-submit-btn" onClick={() => navigate('/login')}>
                                Go to Sign In <span className="auth-btn-arrow">→</span>
                            </button>
                        </div>
                    ) : (
                        <div style={{ width: '100%' }}>
                            <div className="auth-card-header">
                                <h1 className="auth-card-title">Choose New Password</h1>
                                <p className="auth-card-sub">Please enter your new secure password below</p>
                            </div>

                            {message && (
                                <div className={`auth-error ${status === 'error' ? 'error' : ''}`}>
                                    <span></span> {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form-new">
                                {/* New Password */}
                                <div className="auth-field">
                                    <label className="auth-label">New Password</label>
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
                                            disabled={status === 'loading'}
                                            minLength={8}
                                            className="auth-input"
                                        />
                                    </div>
                                    <PasswordRules password={password} />
                                </div>

                                {/* Confirm Password */}
                                <div className="auth-field">
                                    <label className="auth-label">Confirm Password</label>
                                    <div className="auth-input-wrap">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="Verify your new password"
                                            disabled={status === 'loading'}
                                            className="auth-input auth-input-no-icon"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="auth-submit-btn"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <span className="auth-spinner">⏳ Saving password…</span>
                                    ) : (
                                        <>Reset Password <span className="auth-btn-arrow">→</span></>
                                    )}
                                </button>
                            </form>

                            <button
                                type="button"
                                className="forgot-cancel-btn"
                                onClick={() => navigate('/login')}
                                style={{ marginTop: '1rem', width: '100%', display: 'block' }}
                            >
                                Cancel and Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
