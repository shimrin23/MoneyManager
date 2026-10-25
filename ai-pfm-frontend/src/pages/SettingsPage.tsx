import { formatDate, formatDateTime } from '../utils/appFormat';
// Settings Page
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { useAdminLang } from '../i18n/adminText';
import { USER_T } from '../i18n/userPagesText';
import { confirmDialog } from '../utils/systemMessages';
import { downloadFinancialDataPdf } from '../utils/exportFinancialDataPdf';

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
    background: '#ffffff',
    fontWeight: 600,
    fontSize: '0.95rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18)'
} as const;

const toastColors = {
    ok: { color: '#065f46', borderColor: '#6ee7b7' },
    fail: { color: '#991b1b', borderColor: '#fca5a5' },
    cancelled: { color: '#1f2937', borderColor: '#d1d5db' }
} as const;

export const SettingsPage = () => {
    const t = USER_T[useAdminLang()];
    const location = useLocation();
    // Other pages can open a specific tab by passing { tab } in navigation state
    const initialTab = (location.state as { tab?: 'general' | 'notifications' | 'privacy' | 'advanced' } | null)?.tab ?? 'general';
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'advanced'>(initialTab);
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
        <div className="settings-page">
            <div className="settings-header">
                <h1>{t.setTitle}</h1>
                <p>{t.setSub}</p>
            </div>

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

            <div className="settings-navigation">
                <button
                    className={`nav-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    {t.tabGeneral}
                </button>
                <button
                    className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    {t.tabNotifications}
                </button>
                <button
                    className={`nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('privacy')}
                >
                    {t.tabPrivacy}
                </button>
                <button
                    className={`nav-btn ${activeTab === 'advanced' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advanced')}
                >
                    {t.tabAdvanced}
                </button>
                <button
                    className="nav-btn"
                    onClick={() => navigate('/account-settings')}
                >
                    Account Settings
                </button>
            </div>

            <div className="settings-content">
                {activeTab === 'general' && (
                    <div className="general-settings">
                        <div className="settings-section">
                            <h3>{t.regional}</h3>

                            <div className="setting-group">
                                <label>{t.currency}</label>
                                <select
                                    value={appSettings.currency}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, currency: e.target.value }))}
                                >
                                    {currencyOptions.map(currency => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>{t.dateFormat}</label>
                                <select
                                    value={appSettings.dateFormat}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>{t.language}</label>
                                <select
                                    value={appSettings.language}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, language: e.target.value }))}
                                >
                                    {languageOptions.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>{t.timezone}</label>
                                <select
                                    value={appSettings.timezone}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, timezone: e.target.value }))}
                                >
                                    <option value="Asia/Colombo">Asia/Colombo</option>
                                    <option value="America/New_York">America/New_York</option>
                                    <option value="Europe/London">Europe/London</option>
                                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                                    <option value="Australia/Sydney">Australia/Sydney</option>
                                </select>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>{t.appearance}</h3>

                            <div className="setting-group">
                                <label>{t.theme}</label>
                                <select
                                    value={appSettings.theme}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
                                >
                                    <option value="light">{t.themeLight}</option>
                                    <option value="dark">{t.themeDark}</option>
                                    <option value="auto">{t.themeAuto}</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>{t.dashLayout}</label>
                                <select
                                    value={appSettings.dashboardLayout}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, dashboardLayout: e.target.value as 'compact' | 'detailed' | 'minimal' }))}
                                >
                                    <option value="compact">{t.layoutCompact}</option>
                                    <option value="detailed">{t.layoutDetailed}</option>
                                    <option value="minimal">{t.layoutMinimal}</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>{t.chartType}</label>
                                <select
                                    value={appSettings.chartType}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, chartType: e.target.value as 'line' | 'bar' | 'pie' }))}
                                >
                                    <option value="line">{t.chartLine}</option>
                                    <option value="bar">{t.chartBar}</option>
                                    <option value="pie">{t.chartPie}</option>
                                </select>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>{t.defaultBehavior}</h3>

                            <div className="setting-group">
                                <label>{t.defTxType}</label>
                                <select
                                    value={appSettings.defaultTransactionType}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, defaultTransactionType: e.target.value as 'expense' | 'income' }))}
                                >
                                    <option value="expense">{t.txExpense}</option>
                                    <option value="income">{t.txIncome}</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>{t.catSort}</label>
                                <select
                                    value={appSettings.categoryOrder}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, categoryOrder: e.target.value as 'alphabetical' | 'frequency' | 'custom' }))}
                                >
                                    <option value="alphabetical">{t.sortAlpha}</option>
                                    <option value="frequency">{t.sortFreq}</option>
                                    <option value="custom">{t.sortCustom}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="notification-settings">
                        <div className="settings-section">
                            <h3>{t.finAlerts}</h3>

                            <div className="setting-toggle">
                                <label>{t.budgetAlerts}</label>
                                <span className="toggle-description">{t.budgetAlertsSub}</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.budgetAlerts}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, budgetAlerts: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>Transaction Alerts</label>
                                <span className="toggle-description">Alerts for large transactions and unusual activity</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.transactionAlerts}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, transactionAlerts: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>{t.goalReminders}</label>
                                <span className="toggle-description">{t.goalRemindersSub}</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.goalReminders}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, goalReminders: e.target.checked }))}
                                />
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>{t.reports}</h3>

                            <div className="setting-toggle">
                                <label>{t.weekly}</label>
                                <span className="toggle-description">{t.weeklySub}</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.weeklyReports}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>{t.monthly}</label>
                                <span className="toggle-description">{t.monthlySub}</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.monthlyReports}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, monthlyReports: e.target.checked }))}
                                />
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>{t.secSystem}</h3>

                            <div className="setting-toggle">
                                <label>{t.secAlerts}</label>
                                <span className="toggle-description">{t.secAlertsSub} (Required, always on)</span>
                                <input
                                    type="checkbox"
                                    checked
                                    disabled
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>{t.marketing}</label>
                                <span className="toggle-description">{t.marketingSub}</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.marketingEmails}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                                />
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>{t.delivery}</h3>

                            <div className="setting-toggle">
                                <label>{t.push}</label>
                                <span className="toggle-description">{t.pushSub}</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.pushNotifications}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>{t.email}</label>
                                <span className="toggle-description">{t.emailSub}</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.emailNotifications}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>{t.sms}</label>
                                <span className="toggle-description">{t.smsSub}</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.smsNotifications}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div className="privacy-settings">
                        <div className="settings-section">
                            <h3>{t.dataCollection}</h3>

                            <div className="setting-toggle">
                                <label>{t.analyticsData}</label>
                                <span className="toggle-description">{t.analyticsSub}</span>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.analytics}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, analytics: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>{t.marketingTracking}</label>
                                <span className="toggle-description">{t.marketingTrackingSub}</span>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.marketingTracking}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, marketingTracking: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>{t.shareAnon}</label>
                                <span className="toggle-description">{t.shareAnonSub}</span>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.shareAnonData}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, shareAnonData: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>{t.activityTracking}</label>
                                <span className="toggle-description">{t.activityTrackingSub}</span>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.activityTracking}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, activityTracking: e.target.checked }))}
                                />
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>{t.profilePrivacy}</h3>

                            <div className="setting-group">
                                <label>{t.profVisibility}</label>
                                <select
                                    value={privacySettings.profileVisibility}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as 'private' | 'public' | 'friends' }))}
                                >
                                    <option value="private">{t.visPrivate}</option>
                                    <option value="friends">{t.visFriends}</option>
                                    <option value="public">{t.visPublic}</option>
                                </select>
                                <span className="setting-description">{t.visSub}</span>
                            </div>
                        </div>

                        <div className="privacy-info">
                            <h4>🔒 {t.privacyMatters}</h4>
                            <p>{t.privacyText}</p>
                            <button className="btn-secondary" onClick={() => navigate('/account-settings')}>
                                {t.viewData}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="advanced-settings">
                        <div className="settings-section">
                            <h3>{t.dataMgmt}</h3>
                            <div className="advanced-options">
                                <button className="btn-secondary" onClick={exportAllData}>
                                    {t.exportAll}
                                </button>
                                {exportError && <div className="alert alert-error">{exportError}</div>}
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>{t.resetOpts}</h3>
                            <div className="reset-options">
                                <button className="btn-warning" onClick={resetToDefaults}>
                                    {t.resetAll}
                                </button>
                                <span className="reset-description">{t.resetSub}</span>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>{t.appInfo}</h3>
                            <div className="app-info">
                                <div className="info-item">
                                    <span>{t.version}</span>
                                    <span>{__APP_VERSION__}</span>
                                </div>
                                <div className="info-item">
                                    <span>{t.lastUpdated}</span>
                                    <span>{formatDate(__BUILD_DATE__)}</span>
                                </div>
                                <div className="info-item">
                                    <span>{t.build}</span>
                                    <span>{__BUILD_DATE__.replace(/-/g, '')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="settings-actions">
                    <button
                        className="btn-secondary"
                        onClick={handleCancel}
                    >
                        {t.cancel}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={saveSettings}
                        disabled={loading}
                    >
                        {loading ? t.saving : t.saveSettings}
                    </button>
                </div>
            </div>
        </div>
    );
};
