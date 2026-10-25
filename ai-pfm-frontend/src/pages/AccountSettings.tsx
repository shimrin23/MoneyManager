// Account Settings Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { downloadFinancialDataPdf } from '../utils/exportFinancialDataPdf';
import { PasswordRules, isPasswordValid } from '../components/PasswordRules';
import { confirmDialog, promptDialog } from '../utils/systemMessages';
import { useAdminLang } from '../i18n/adminText';
import { ACCOUNT_T } from '../i18n/accountSettingsText';
import '../styles/NotificationPreferences.css';
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
        {visible ? (
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
                placeholder: 'DELETE',
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
        <div className="settings-page">
            <div className="settings-header">
                <h1>{tabs.setTitle}</h1>
                <p>{tabs.setSub}</p>
            </div>

            <div className="settings-navigation">
                <button className="nav-btn" onClick={() => navigate('/settings', { state: { tab: 'general' } })}>
                    {tabs.tabGeneral}
                </button>
                <button className="nav-btn" onClick={() => navigate('/settings', { state: { tab: 'notifications' } })}>
                    {tabs.tabNotifications}
                </button>
                <button className="nav-btn" onClick={() => navigate('/settings', { state: { tab: 'privacy' } })}>
                    {tabs.tabPrivacy}
                </button>
                <button className="nav-btn" onClick={() => navigate('/settings', { state: { tab: 'advanced' } })}>
                    {tabs.tabAdvanced}
                </button>
                <button className="nav-btn active">
                    {t.title}
                </button>
            </div>

            <div className="settings-content">
                {message && <div className="alert-success">{message}</div>}
                {error && <div className="alert-error">{error}</div>}

                {/* Security Settings */}
                <div className="settings-section">
                    <h2>🔐 {t.securitySection}</h2>

                    <div className="np-card">
                        <div className="np-row">
                            <div className="np-row-text">
                                <span className="np-label">
                                    {t.twoFactorTitle}
                                    <span className="np-badge">{t.twoFactorUnavailable}</span>
                                </span>
                                <span className="np-description">{t.twoFactorDesc}</span>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={false}
                                aria-label={t.twoFactorTitle}
                                className="np-switch"
                                disabled
                            >
                                <span className="np-knob" />
                            </button>
                        </div>

                        <div className="np-row">
                            <div className="np-row-text">
                                <span className="np-label">{t.emailTitle}</span>
                                <span className="np-description">{t.emailDesc}</span>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={settings.emailNotifications}
                                aria-label={t.emailTitle}
                                className={`np-switch ${settings.emailNotifications ? 'on' : ''}`}
                                onClick={() => handleSettingChange('emailNotifications')}
                            >
                                <span className="np-knob" />
                            </button>
                        </div>

                        <div className="np-row">
                            <div className="np-row-text">
                                <span className="np-label">{t.pushTitle}</span>
                                <span className="np-description">{t.pushDesc}</span>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={settings.pushNotifications}
                                aria-label={t.pushTitle}
                                className={`np-switch ${settings.pushNotifications ? 'on' : ''}`}
                                onClick={() => handleSettingChange('pushNotifications')}
                            >
                                <span className="np-knob" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="settings-section" style={{ maxWidth: '360px' }}>
                    <h2>🔑 {t.passwordSection}</h2>
                    <form onSubmit={handlePasswordChange} className="password-form">
                        <div className="form-group">
                            <label>{t.currentPassword}</label>
                            <div style={eyeWrapStyle}>
                                <input
                                    type={visiblePasswords.current ? 'text' : 'password'}
                                    style={{ paddingRight: '2.5rem' }}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        currentPassword: e.target.value
                                    }))}
                                    required
                                    placeholder={t.enterCurrent}
                                />
                                {eyeButton(visiblePasswords.current, () => setVisiblePasswords(p => ({ ...p, current: !p.current })))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t.newPassword}</label>
                            <div style={eyeWrapStyle}>
                                <input
                                    type={visiblePasswords.new ? 'text' : 'password'}
                                    style={{ paddingRight: '2.5rem' }}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        newPassword: e.target.value
                                    }))}
                                    required
                                    placeholder={t.enterNew}
                                    minLength={8}
                                />
                                {eyeButton(visiblePasswords.new, () => setVisiblePasswords(p => ({ ...p, new: !p.new })))}
                            </div>
                            <PasswordRules password={passwordForm.newPassword} />
                        </div>

                        <div className="form-group">
                            <label>{t.confirmPassword}</label>
                            <div style={eyeWrapStyle}>
                                <input
                                    type={visiblePasswords.confirm ? 'text' : 'password'}
                                    style={{ paddingRight: '2.5rem' }}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        confirmPassword: e.target.value
                                    }))}
                                    required
                                    placeholder={t.enterConfirm}
                                    minLength={8}
                                />
                                {eyeButton(visiblePasswords.confirm, () => setVisiblePasswords(p => ({ ...p, confirm: !p.confirm })))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || !isPasswordValid(passwordForm.newPassword)}
                        >
                            {loading ? t.updating : t.updatePassword}
                        </button>
                    </form>
                </div>

                {/* Data & Privacy */}
                <div className="settings-section">
                    <h2>📊 {t.dataSection}</h2>

                    <div className="np-card">
                        <div className="np-row">
                            <div className="np-row-text">
                                <span className="np-label">{t.exportTitle}</span>
                                <span className="np-description">{t.exportDesc}</span>
                            </div>
                            <button
                                type="button"
                                className="np-action"
                                onClick={exportData}
                                disabled={loading}
                            >
                                📥 {t.exportButton}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="settings-section danger-zone">
                    <h2>⚠️ {t.dangerSection}</h2>

                    <div className="action-item">
                        <div className="action-info">
                            <h3>{t.deleteTitle}</h3>
                            <p>{t.deleteDesc}</p>
                        </div>
                        <button
                            className="btn-danger"
                            onClick={handleDeleteAccount}
                        >
                            🗑️ {t.deleteButton}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
