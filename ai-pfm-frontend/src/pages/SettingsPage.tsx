import { formatDate, formatDateTime } from '../utils/appFormat';
// Settings Page
import { useState, useEffect, type ChangeEvent, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { useAdminLang } from '../i18n/adminText';
import { USER_T } from '../i18n/userPagesText';
import { confirmDialog } from '../utils/systemMessages';
import { downloadFinancialDataPdf } from '../utils/exportFinancialDataPdf';
import '../styles/SettingsRedesign.css';

interface AppSettings {
    currency: string;
    dateFormat: string;
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    defaultTransactionType: 'expense' | 'income';
    categoryOrder: 'alphabetical' | 'frequency' | 'custom';
    chartType: 'line' | 'bar' | 'pie';
    dashboardLayout: 'compact' | 'detailed' | 'minimal';
}

interface NotificationSettings {
    budgetAlerts: boolean;
    transactionAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    goalReminders: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
}

interface PrivacySettings {
    dataCollection: boolean;
    analytics: boolean;
    marketingTracking: boolean;
    shareAnonData: boolean;
    profileVisibility: 'private' | 'public' | 'friends';
    activityTracking: boolean;
}

const APP_DEFAULT_SETTINGS: AppSettings = {
    currency: 'LKR',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    timezone: 'Asia/Colombo',
    theme: 'auto',
    defaultTransactionType: 'expense',
    categoryOrder: 'frequency',
    chartType: 'line',
    dashboardLayout: 'detailed'
};

const NOTIFICATION_DEFAULT_SETTINGS: NotificationSettings = {
    budgetAlerts: true,
    transactionAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    goalReminders: true,
    securityAlerts: true,
    marketingEmails: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false
};

const PRIVACY_DEFAULT_SETTINGS: PrivacySettings = {
    dataCollection: true,
    analytics: true,
    marketingTracking: false,
    shareAnonData: true,
    profileVisibility: 'private',
    activityTracking: true
};

// Fixed in the top-right corner, so the notice shows wherever the user is on the page
// Solid background so the text stays readable over the page header
const toastStyle = {
    position: 'fixed',
    top: '5.25rem',
    right: '1.25rem',
    zIndex: 1000,
    minWidth: '240px',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid',
    background: 'var(--card)',
    fontWeight: 600,
    fontSize: '0.95rem',
    boxShadow: 'var(--shadow-md)'
} as const;

const toastColors = {
    ok: { color: 'var(--text)', borderColor: 'var(--border)' },
    fail: { color: '#f87171', borderColor: '#f87171' },
    cancelled: { color: 'var(--text-muted)', borderColor: 'var(--border)' }
} as const;

const ICON_DOWNLOAD = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
    </svg>
);

const ICON_SHIELD = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// Building blocks for the settings page: cards, labelled selects and row toggles
const SetCard = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="st-card">
        <header className="st-card-h"><h3>{title}</h3></header>
        {children}
    </section>
);

const SetSelect = ({ label, value, onChange, children }: {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    children: ReactNode;
}) => (
    <div className="st-field">
        <label>{label}</label>
        <select className="st-input" value={value} onChange={onChange}>{children}</select>
    </div>
);

const SetToggle = ({ label, desc, checked, onChange, disabled }: {
    label: string;
    desc: string;
    checked: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}) => (
    <div className="st-toggle">
        <div>
            <div className="st-toggle-t">{label}</div>
            <div className="st-toggle-s">{desc}</div>
        </div>
        <input
            type="checkbox"
            className="st-switch"
            aria-label={label}
            checked={checked}
            disabled={disabled}
            onChange={onChange ?? (() => {})}
        />
    </div>
);

export const SettingsPage = () => {
    const t = USER_T[useAdminLang()];
    const location = useLocation();
    // Other pages can open a specific tab by passing { tab } in navigation state
    // The tab is kept in the browser tab's session, so a refresh stays on the same tab
    const savedTab = (() => { try { return sessionStorage.getItem('settings-tab'); } catch { return null; } })();
    const initialTab = ((location.state as { tab?: 'general' | 'notifications' | 'privacy' | 'advanced' } | null)?.tab
        ?? (['general', 'notifications', 'privacy', 'advanced'].includes(savedTab ?? '') ? savedTab : null)
        ?? 'general') as 'general' | 'notifications' | 'privacy' | 'advanced';
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'advanced'>(initialTab);
    useEffect(() => {
        try { sessionStorage.setItem('settings-tab', activeTab); } catch { /* storage may be blocked */ }
    }, [activeTab]);
    // A tab passed by a link is used once; clear it from the page history so a refresh uses the tab the user last chose
    useEffect(() => {
        if ((location.state as { tab?: string } | null)?.tab) {
            navigate(location.pathname + location.search, { replace: true, state: null });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'ok' | 'fail' | 'cancelled' | ''>('');
    // Last saved values, so Cancel can throw away unsaved edits
    const [savedSettings, setSavedSettings] = useState<{ app: AppSettings; notifications: NotificationSettings; privacy: PrivacySettings } | null>(null);
    const [exportError, setExportError] = useState('');
    const [loadFailed, setLoadFailed] = useState(false);
    const navigate = useNavigate();

    const [appSettings, setAppSettings] = useState<AppSettings>({
        currency: 'LKR',
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
        timezone: 'Asia/Colombo',
        theme: 'auto',
        defaultTransactionType: 'expense',
        categoryOrder: 'frequency',
        chartType: 'line',
        dashboardLayout: 'detailed'
    });

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        budgetAlerts: true,
        transactionAlerts: true,
        weeklyReports: true,
        monthlyReports: true,
        goalReminders: true,
        securityAlerts: true,
        marketingEmails: false,
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false
    });

    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        dataCollection: true,
        analytics: true,
        marketingTracking: false,
        shareAnonData: true,
        profileVisibility: 'private',
        activityTracking: true
    });

    // Profile Visibility is chosen first and only saved when the Save button is pressed
    const [visibilityDraft, setVisibilityDraft] = useState<PrivacySettings['profileVisibility'] | null>(null);

    // Currency and language names are kept as they are written in their own language.
    const currencyOptions = [
        { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
        { code: 'EUR', name: 'Euro (€)', symbol: '€' },
        { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
        { code: 'LKR', name: 'Sri Lankan Rupee (Rs)', symbol: 'Rs' },
        { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
        { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
        { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' }
    ];

    const languageOptions = [
        { code: 'en', name: 'English' },
        { code: 'si', name: 'සිංහල' },
        { code: 'ta', name: 'தமிழ்' }
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        setLoadFailed(false);
        try {
            const [appResponse, notificationResponse, privacyResponse] = await Promise.all([
                apiClient.get('/settings/app'),
                apiClient.get('/settings/notifications'),
                apiClient.get('/settings/privacy')
            ]);

            setAppSettings(appResponse.data);
            setNotificationSettings(notificationResponse.data);
            setPrivacySettings(privacyResponse.data);
            setSavedSettings({ app: appResponse.data, notifications: notificationResponse.data, privacy: privacyResponse.data });
        } catch (err) {
            console.error('Failed to load settings:', err);
            setLoadFailed(true);
        } finally {
            setLoading(false);
        }
    };

    // Notifications and Privacy switches save as soon as they change, so those tabs have no Save button
    useEffect(() => {
        if (!savedSettings) return;
        if (JSON.stringify(notificationSettings) === JSON.stringify(savedSettings.notifications)) return;
        apiClient.put('/settings/notifications', notificationSettings)
            .then(() => setSavedSettings(prev => prev && { ...prev, notifications: { ...notificationSettings } }))
            .catch(() => setNotificationSettings({ ...savedSettings.notifications }));
    }, [notificationSettings]);

    useEffect(() => {
        if (!savedSettings) return;
        if (JSON.stringify(privacySettings) === JSON.stringify(savedSettings.privacy)) return;
        apiClient.put('/settings/privacy', privacySettings)
            .then(() => setSavedSettings(prev => prev && { ...prev, privacy: { ...privacySettings } }))
            .catch(() => setPrivacySettings({ ...savedSettings.privacy }));
    }, [privacySettings]);

    const saveSettings = async () => {
        setLoading(true);
        setSaveStatus('');

        try {
            await Promise.all([
                apiClient.put('/settings/app', appSettings),
                apiClient.put('/settings/notifications', notificationSettings),
                apiClient.put('/settings/privacy', privacySettings)
            ]);

            setSaveStatus('ok');
            window.dispatchEvent(new CustomEvent('app-settings-changed', { detail: appSettings }));
            setSavedSettings({ app: appSettings, notifications: notificationSettings, privacy: privacySettings });
            setTimeout(() => setSaveStatus(''), 3000);
        } catch {
            setSaveStatus('fail');
            setTimeout(() => setSaveStatus(''), 3000);
            // Reload so the page shows what is actually stored, in case one of the three saves went through
            await loadSettings();
        } finally {
            setLoading(false);
        }
    };

    // Downloads the user's data file (same export as Account Settings)
    const exportAllData = async () => {
        setExportError('');
        try {
            await downloadFinancialDataPdf();
        } catch (err) {
            console.error('Failed to export data:', err);
            setExportError('Failed to export data. Please try again.');
        }
    };

    const isDirty = savedSettings !== null && JSON.stringify([appSettings, notificationSettings, privacySettings]) !==
        JSON.stringify([savedSettings.app, savedSettings.notifications, savedSettings.privacy]);

    // Cancel throws away unsaved edits and stays on this page
    const handleCancel = () => {
        if (!savedSettings) return;
        setAppSettings({ ...savedSettings.app });
        setNotificationSettings({ ...savedSettings.notifications });
        setPrivacySettings({ ...savedSettings.privacy });
        if (isDirty) {
            setSaveStatus('cancelled');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    // Restores the default values and saves them straight away
    const resetToDefaults = async () => {
        const confirmed = await confirmDialog({ title: t.resetAll, message: t.setResetConfirm, confirmText: t.resetAll, danger: true });
        if (!confirmed) return;

        setAppSettings({ ...APP_DEFAULT_SETTINGS });
        setNotificationSettings({ ...NOTIFICATION_DEFAULT_SETTINGS });
        setPrivacySettings({ ...PRIVACY_DEFAULT_SETTINGS });

        setLoading(true);
        setSaveStatus('');
        try {
            await Promise.all([
                apiClient.put('/settings/app', APP_DEFAULT_SETTINGS),
                apiClient.put('/settings/notifications', NOTIFICATION_DEFAULT_SETTINGS),
                apiClient.put('/settings/privacy', PRIVACY_DEFAULT_SETTINGS)
            ]);
            window.dispatchEvent(new CustomEvent('app-settings-changed', { detail: APP_DEFAULT_SETTINGS }));
            setSavedSettings({ app: { ...APP_DEFAULT_SETTINGS }, notifications: { ...NOTIFICATION_DEFAULT_SETTINGS }, privacy: { ...PRIVACY_DEFAULT_SETTINGS } });
            setSaveStatus('ok');
        } catch {
            setSaveStatus('fail');
        } finally {
            setLoading(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    return (
        <div className="settings-page st-page">
            {loadFailed && (
                <div className="alert alert-error" role="alert">
                    Could not load your saved settings, so the values below are defaults and may not be yours.{' '}
                    <button type="button" className="btn-secondary" onClick={loadSettings}>Try again</button>
                </div>
            )}

            {saveStatus && (
                <div
                    className={`alert ${saveStatus === 'fail' ? 'alert-error' : 'alert-success'}`}
                    role="status"
                    style={{ ...toastStyle, ...toastColors[saveStatus] }}
                >
                    {saveStatus === 'fail' ? t.setSaveFailed : saveStatus === 'cancelled' ? 'Unsaved changes discarded' : t.setSaved}
                </div>
            )}

            <div className="st-tabs" role="tablist">
                {([
                    ['general', t.tabGeneral],
                    ['notifications', t.tabNotifications],
                    ['privacy', t.tabPrivacy],
                    ['advanced', t.tabAdvanced]
                ] as const).map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === key}
                        className={`st-tab ${activeTab === key ? 'on' : ''}`}
                        onClick={() => setActiveTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="st-body">
                {activeTab === 'general' && (
                    <>
                        <SetCard title={t.regional}>
                            <div className="st-grid">
                                <SetSelect label={t.currency} value={appSettings.currency} onChange={(e) => setAppSettings(prev => ({ ...prev, currency: e.target.value }))}>
                                    {currencyOptions.map(currency => (
                                        <option key={currency.code} value={currency.code}>{currency.name}</option>
                                    ))}
                                </SetSelect>
                                <SetSelect label={t.dateFormat} value={appSettings.dateFormat} onChange={(e) => setAppSettings(prev => ({ ...prev, dateFormat: e.target.value }))}>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                                </SetSelect>
                                <SetSelect label={t.timezone} value={appSettings.timezone} onChange={(e) => setAppSettings(prev => ({ ...prev, timezone: e.target.value }))}>
                                    <option value="Asia/Colombo">Asia/Colombo</option>
                                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                                    <option value="America/New_York">America/New_York</option>
                                    <option value="America/Toronto">America/Toronto</option>
                                    <option value="Europe/London">Europe/London</option>
                                    <option value="Europe/Paris">Europe/Paris</option>
                                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                                    <option value="Australia/Sydney">Australia/Sydney</option>
                                </SetSelect>
                            </div>
                        </SetCard>

                        <SetCard title={t.appearance}>
                            <div className="st-grid">
                                <div className="st-field-short">
                                <SetSelect label={t.dashLayout} value={appSettings.dashboardLayout} onChange={(e) => setAppSettings(prev => ({ ...prev, dashboardLayout: e.target.value as 'compact' | 'detailed' | 'minimal' }))}>
                                    <option value="compact">{t.layoutCompact}</option>
                                    <option value="detailed">{t.layoutDetailed}</option>
                                    <option value="minimal">{t.layoutMinimal}</option>
                                </SetSelect>
                                </div>
                            </div>
                        </SetCard>

                        <SetCard title={t.defaultBehavior}>
                            <div className="st-grid">
                                <div className="st-field-short">
                                <SetSelect label={t.defTxType} value={appSettings.defaultTransactionType} onChange={(e) => setAppSettings(prev => ({ ...prev, defaultTransactionType: e.target.value as 'expense' | 'income' }))}>
                                    <option value="expense">{t.txExpense}</option>
                                    <option value="income">{t.txIncome}</option>
                                </SetSelect>
                                </div>
                            </div>
                        </SetCard>
                    </>
                )}

                {activeTab === 'notifications' && (
                    <>
                        <SetCard title={t.finAlerts}>
                            <SetToggle label={t.budgetAlerts} desc={t.budgetAlertsSub} checked={notificationSettings.budgetAlerts} onChange={(e) => setNotificationSettings(prev => ({ ...prev, budgetAlerts: e.target.checked }))} />
                            <SetToggle label="Transaction Alerts" desc="Alerts for large transactions and unusual activity" checked={notificationSettings.transactionAlerts} onChange={(e) => setNotificationSettings(prev => ({ ...prev, transactionAlerts: e.target.checked }))} />
                            <SetToggle label={t.goalReminders} desc={t.goalRemindersSub} checked={notificationSettings.goalReminders} onChange={(e) => setNotificationSettings(prev => ({ ...prev, goalReminders: e.target.checked }))} />
                        </SetCard>

                        <SetCard title={t.reports}>
                            <SetToggle label={t.weekly} desc={t.weeklySub} checked={notificationSettings.weeklyReports} onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))} />
                            <SetToggle label={t.monthly} desc={t.monthlySub} checked={notificationSettings.monthlyReports} onChange={(e) => setNotificationSettings(prev => ({ ...prev, monthlyReports: e.target.checked }))} />
                        </SetCard>

                        <SetCard title={t.secSystem}>
                            <SetToggle label={t.secAlerts} desc={`${t.secAlertsSub} (Required, always on)`} checked disabled />
                        </SetCard>

                        <SetCard title={t.delivery}>
                            <SetToggle label={t.push} desc={t.pushSub} checked={notificationSettings.pushNotifications} onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))} />
                            <SetToggle label={t.email} desc={t.emailSub} checked={notificationSettings.emailNotifications} onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))} />
                            <SetToggle label={t.sms} desc={t.smsSub} checked={notificationSettings.smsNotifications} onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))} />
                        </SetCard>
                    </>
                )}

                {activeTab === 'privacy' && (
                    <>
                        <SetCard title={t.dataCollection}>
                            <SetToggle label={t.analyticsData} desc={t.analyticsSub} checked={privacySettings.analytics} onChange={(e) => setPrivacySettings(prev => ({ ...prev, analytics: e.target.checked }))} />
                            <SetToggle label={t.marketingTracking} desc={t.marketingTrackingSub} checked={privacySettings.marketingTracking} onChange={(e) => setPrivacySettings(prev => ({ ...prev, marketingTracking: e.target.checked }))} />
                            <SetToggle label={t.shareAnon} desc={t.shareAnonSub} checked={privacySettings.shareAnonData} onChange={(e) => setPrivacySettings(prev => ({ ...prev, shareAnonData: e.target.checked }))} />
                            <SetToggle label={t.activityTracking} desc={t.activityTrackingSub} checked={privacySettings.activityTracking} onChange={(e) => setPrivacySettings(prev => ({ ...prev, activityTracking: e.target.checked }))} />
                        </SetCard>

                        <div className="st-narrow">
                            <SetCard title={t.profilePrivacy}>
                                <div className="st-visibility-row">
                                    <div className="st-grid">
                                        <SetSelect label={t.profVisibility} value={visibilityDraft ?? privacySettings.profileVisibility} onChange={(e) => setVisibilityDraft(e.target.value as 'private' | 'public' | 'friends')}>
                                            <option value="private">{t.visPrivate}</option>
                                            <option value="friends">{t.visFriends}</option>
                                            <option value="public">{t.visPublic}</option>
                                        </SetSelect>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        disabled={visibilityDraft === null || visibilityDraft === privacySettings.profileVisibility}
                                        onClick={() => {
                                            if (visibilityDraft === null) return;
                                            setPrivacySettings(prev => ({ ...prev, profileVisibility: visibilityDraft }));
                                            setVisibilityDraft(null);
                                        }}
                                    >
                                        {t.save}
                                    </button>
                                </div>
                                <p className="st-hint">{t.visSub}</p>
                            </SetCard>
                        </div>

                        <div className="st-note">
                            <h4>{t.privacyMatters}</h4>
                            <p>{t.privacyText}</p>
                            <button type="button" className="btn-secondary" onClick={() => navigate('/account-settings')}>
                                {t.viewData}
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'advanced' && (
                    <>
                        <SetCard title={t.dataMgmt}>
                            <div className="st-row">
                                <button type="button" className="btn-secondary st-btn-icon" onClick={exportAllData}>
                                    {ICON_DOWNLOAD}{t.exportAll}
                                </button>
                                <button type="button" className="btn-secondary st-btn-icon" onClick={() => navigate('/account-settings')}>
                                    {ICON_SHIELD}Account &amp; Security
                                </button>
                            </div>
                            {exportError && <div className="alert alert-error">{exportError}</div>}
                        </SetCard>

                        <SetCard title={t.resetOpts}>
                            <div className="st-row">
                                <span className="st-hint">{t.resetSub}</span>
                                <button type="button" className="btn-warning" onClick={resetToDefaults}>
                                    {t.resetAll}
                                </button>
                            </div>
                        </SetCard>

                        <SetCard title={t.appInfo}>
                            <div className="st-kv">
                                <div><span>{t.version}</span><span>{__APP_VERSION__}</span></div>
                                <div><span>{t.lastUpdated}</span><span>{formatDate(__BUILD_DATE__)}</span></div>
                                <div><span>{t.build}</span><span>{__BUILD_DATE__.replace(/-/g, '')}</span></div>
                            </div>
                        </SetCard>
                    </>
                )}
            </div>

            {activeTab === 'general' && (
                <div className="st-actions">
                    <button type="button" className="btn-secondary" onClick={handleCancel}>
                        {t.cancel}
                    </button>
                    <button type="button" className="btn-primary" onClick={saveSettings} disabled={loading}>
                        {loading ? t.saving : t.saveSettings}
                    </button>
                </div>
            )}
        </div>
    );
};
