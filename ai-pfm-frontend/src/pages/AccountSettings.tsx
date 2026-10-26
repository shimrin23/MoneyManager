// Account Settings Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { downloadFinancialDataPdf } from '../utils/exportFinancialDataPdf';
import { PasswordRules, isPasswordValid } from '../components/PasswordRules';
import { confirmDialog, promptDialog } from '../utils/systemMessages';
import { useAdminLang } from '../i18n/adminText';
import { ACCOUNT_T } from '../i18n/accountSettingsText';
import '../styles/SettingsRedesign.css';
import { USER_T } from '../i18n/userPagesText';

interface NotificationToggles {
    emailNotifications: boolean;
    pushNotifications: boolean;
}

const eyeWrapStyle = { position: 'relative' } as const;

// Show/hide toggle placed on the right side of a password input
const eyeButton = (visible: boolean, onToggle: () => void) => (
    <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        style={{
            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#6b7280',
            display: 'flex', alignItems: 'center'
        }}
    >
        {!visible ? (
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
);

export const AccountSettings = () => {
    const lang = useAdminLang();
    const t = ACCOUNT_T[lang];
    const tabs = USER_T[lang];
    const [settings, setSettings] = useState<NotificationToggles>({
        emailNotifications: true,
        pushNotifications: true
    });
    const [visiblePasswords, setVisiblePasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSettings();
    }, []);

    // Email and push preferences are stored with the other notification settings
    const fetchSettings = async () => {
        try {
            const response = await apiClient.get<NotificationToggles>('/settings/notifications');
            setSettings({
                emailNotifications: response.data.emailNotifications,
                pushNotifications: response.data.pushNotifications
            });
        } catch (err) {
            console.log('Settings not found, using defaults');
        }
    };

    const handleSettingChange = async (setting: keyof NotificationToggles) => {
        const newValue = !settings[setting];
        setSettings(prev => ({ ...prev, [setting]: newValue }));

        try {
            await apiClient.put('/settings/notifications', { [setting]: newValue });
            setMessage(t.settingsSaved);
        } catch (err) {
            setError(t.settingsFail);
            // Revert on error
            setSettings(prev => ({ ...prev, [setting]: !newValue }));
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError(t.passwordsNoMatch);
            return;
        }

        if (!isPasswordValid(passwordForm.newPassword)) {
            setError(t.passwordInvalid);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiClient.put('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            setMessage(t.passwordUpdated);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.error || t.passwordFailed);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = await confirmDialog({
            title: t.deleteConfirmTitle,
            message: t.deleteConfirmMessage,
            confirmText: t.continue,
            danger: true,
        });

        if (confirmed) {
            const finalConfirm = await promptDialog({
                title: t.deleteFinalTitle,
                message: t.deleteFinalMessage,
                placeholder: '',
                label: 'Type DELETE to confirm',
                confirmText: t.deleteFinalButton,
                danger: true,
                validate: (value) => (value === 'DELETE' ? null : t.deleteMismatch),
            });

            if (finalConfirm === 'DELETE') {
                try {
                    await apiClient.delete('/auth/account');
                    localStorage.removeItem('token');
                    window.dispatchEvent(new Event('auth-changed'));
                    navigate('/login');
                } catch (err) {
                    setError(t.deleteFail);
                }
            }
        }
    };

    const exportData = async () => {
        try {
            setLoading(true);
            await downloadFinancialDataPdf();
            setMessage(t.exportSuccess);
        } catch (err) {
            setError(t.exportFail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page st-page">
            <nav className="st-breadcrumb" aria-label="Breadcrumb">
                <button type="button" className="st-crumb-link" onClick={() => navigate('/settings', { state: { tab: 'advanced' } })}>{tabs.tabAdvanced}</button>
                <span className="st-crumb-sep" aria-hidden="true">›</span>
                <span>{t.title}</span>
            </nav>

            <div className="st-body">
                {message && <div className="alert-success">{message}</div>}
                {error && <div className="alert-error">{error}</div>}

                <section className="st-card">
                    <header className="st-card-h"><h3>{t.securitySection}</h3></header>
                    <div className="st-toggle">
                        <div>
                            <div className="st-toggle-t">{t.twoFactorTitle}</div>
                            <div className="st-toggle-s">{t.twoFactorDesc} · {t.twoFactorUnavailable}</div>
                        </div>
                        <input type="checkbox" className="st-switch" aria-label={t.twoFactorTitle} checked={false} disabled onChange={() => {}} />
                    </div>
                    <div className="st-toggle">
                        <div>
                            <div className="st-toggle-t">{t.emailTitle}</div>
                            <div className="st-toggle-s">{t.emailDesc}</div>
                        </div>
                        <input
                            type="checkbox"
                            className="st-switch"
                            aria-label={t.emailTitle}
                            checked={settings.emailNotifications}
                            onChange={() => handleSettingChange('emailNotifications')}
                        />
                    </div>
                    <div className="st-toggle">
                        <div>
                            <div className="st-toggle-t">{t.pushTitle}</div>
                            <div className="st-toggle-s">{t.pushDesc}</div>
                        </div>
                        <input
                            type="checkbox"
                            className="st-switch"
                            aria-label={t.pushTitle}
                            checked={settings.pushNotifications}
                            onChange={() => handleSettingChange('pushNotifications')}
                        />
                    </div>
                </section>

                <section className="st-card">
                    <header className="st-card-h"><h3>{t.passwordSection}</h3><p className="st-hint">Use at least 6 characters</p></header>
                    <form onSubmit={handlePasswordChange} className="st-form">
                        <div className="st-field">
                            <label>{t.currentPassword}</label>
                            <div style={eyeWrapStyle}>
                                <input
                                    className="st-input"
                                    type={visiblePasswords.current ? 'text' : 'password'}
                                    style={{ paddingRight: '2.5rem' }}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    required
                                    placeholder={t.enterCurrent}
                                />
                                {eyeButton(visiblePasswords.current, () => setVisiblePasswords(p => ({ ...p, current: !p.current })))}
                            </div>
                        </div>

                        <div className="st-field">
                            <label>{t.newPassword}</label>
                            <div style={eyeWrapStyle}>
                                <input
                                    className="st-input"
                                    type={visiblePasswords.new ? 'text' : 'password'}
                                    style={{ paddingRight: '2.5rem' }}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                    required
                                    placeholder={t.enterNew}
                                    minLength={8}
                                />
                                {eyeButton(visiblePasswords.new, () => setVisiblePasswords(p => ({ ...p, new: !p.new })))}
                            </div>
                            <PasswordRules password={passwordForm.newPassword} />
                        </div>

                        <div className="st-field">
                            <label>{t.confirmPassword}</label>
                            <div style={eyeWrapStyle}>
                                <input
                                    className="st-input"
                                    type={visiblePasswords.confirm ? 'text' : 'password'}
                                    style={{ paddingRight: '2.5rem' }}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    required
                                    placeholder={t.enterConfirm}
                                    minLength={8}
                                />
                                {eyeButton(visiblePasswords.confirm, () => setVisiblePasswords(p => ({ ...p, confirm: !p.confirm })))}
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading || !isPasswordValid(passwordForm.newPassword)}>
                            {loading ? t.updating : t.updatePassword}
                        </button>
                    </form>
                </section>


                <section className="st-card st-danger">
                    <header className="st-card-h"><h3>{t.dangerSection}</h3></header>
                    <div className="st-row">
                        <div>
                            <div className="st-toggle-t">{t.deleteTitle}</div>
                            <div className="st-toggle-s">{t.deleteDesc}</div>
                        </div>
                        <button type="button" className="btn-danger" onClick={handleDeleteAccount}>
                            {t.deleteButton}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
