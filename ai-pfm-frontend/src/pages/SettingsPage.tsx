// Settings Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';

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

export const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'advanced'>('general');
    const [loading, setLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
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
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'zh', name: '中文' },
        { code: 'ja', name: '日本語' },
        { code: 'si', name: 'සිංහල' },
        { code: 'ta', name: 'தமிழ்' }
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const [appResponse, notificationResponse, privacyResponse] = await Promise.all([
                apiClient.get('/settings/app'),
                apiClient.get('/settings/notifications'),
                apiClient.get('/settings/privacy')
            ]);
            
            setAppSettings(appResponse.data);
            setNotificationSettings(notificationResponse.data);
            setPrivacySettings(privacyResponse.data);
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        setSaveMessage('');
        
        try {
            await Promise.all([
                apiClient.put('/settings/app', appSettings),
                apiClient.put('/settings/notifications', notificationSettings),
                apiClient.put('/settings/privacy', privacySettings)
            ]);
            
            setSaveMessage('Settings saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            setSaveMessage('Failed to save settings. Please try again.');
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const resetToDefaults = () => {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            setAppSettings({
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

            setNotificationSettings({
                budgetAlerts: true,
                weeklyReports: true,
                monthlyReports: true,
                goalReminders: true,
                securityAlerts: true,
                marketingEmails: false,
                pushNotifications: true,
                emailNotifications: true,
                smsNotifications: false
            });

            setPrivacySettings({
                dataCollection: true,
                analytics: true,
                marketingTracking: false,
                shareAnonData: true,
                profileVisibility: 'private',
                activityTracking: true
            });
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Settings</h1>
                <p>Customize your MoneyManager experience</p>
            </div>

            {saveMessage && (
                <div className={`alert ${saveMessage.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
                    {saveMessage}
                </div>
            )}

            <div className="settings-navigation">
                <button
                    className={`nav-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    ⚙️ General
                </button>
                <button
                    className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    🔔 Notifications
                </button>
                <button
                    className={`nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('privacy')}
                >
                    🔒 Privacy
                </button>
                <button
                    className={`nav-btn ${activeTab === 'advanced' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advanced')}
                >
                    🔧 Advanced
                </button>
            </div>

            <div className="settings-content">
                {activeTab === 'general' && (
                    <div className="general-settings">
                        <div className="settings-section">
                            <h3>Regional Settings</h3>
                            
                            <div className="setting-group">
                                <label>Currency</label>
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
                                <label>Date Format</label>
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
                                <label>Language</label>
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
                                <label>Timezone</label>
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
                            <h3>Appearance</h3>
                            
                            <div className="setting-group">
                                <label>Theme</label>
                                <select
                                    value={appSettings.theme}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto (System)</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>Dashboard Layout</label>
                                <select
                                    value={appSettings.dashboardLayout}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, dashboardLayout: e.target.value as 'compact' | 'detailed' | 'minimal' }))}
                                >
                                    <option value="compact">Compact</option>
                                    <option value="detailed">Detailed</option>
                                    <option value="minimal">Minimal</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>Default Chart Type</label>
                                <select
                                    value={appSettings.chartType}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, chartType: e.target.value as 'line' | 'bar' | 'pie' }))}
                                >
                                    <option value="line">Line Chart</option>
                                    <option value="bar">Bar Chart</option>
                                    <option value="pie">Pie Chart</option>
                                </select>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>Default Behavior</h3>
                            
                            <div className="setting-group">
                                <label>Default Transaction Type</label>
                                <select
                                    value={appSettings.defaultTransactionType}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, defaultTransactionType: e.target.value as 'expense' | 'income' }))}
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>Category Sort Order</label>
                                <select
                                    value={appSettings.categoryOrder}
                                    onChange={(e) => setAppSettings(prev => ({ ...prev, categoryOrder: e.target.value as 'alphabetical' | 'frequency' | 'custom' }))}
                                >
                                    <option value="alphabetical">Alphabetical</option>
                                    <option value="frequency">Most Used First</option>
                                    <option value="custom">Custom Order</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="notification-settings">
                        <div className="settings-section">
                            <h3>Financial Alerts</h3>
                            
                            <div className="setting-toggle">
                                <label>Budget Alerts</label>
                                <span className="toggle-description">Get notified when you're close to budget limits</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.budgetAlerts}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, budgetAlerts: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>Goal Reminders</label>
                                <span className="toggle-description">Regular reminders about your financial goals</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.goalReminders}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, goalReminders: e.target.checked }))}
                                />
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>Reports</h3>
                            
                            <div className="setting-toggle">
                                <label>Weekly Reports</label>
                                <span className="toggle-description">Summary of your week's financial activity</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.weeklyReports}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>Monthly Reports</label>
                                <span className="toggle-description">Detailed monthly financial analysis</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.monthlyReports}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, monthlyReports: e.target.checked }))}
                                />
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>Security & System</h3>
                            
                            <div className="setting-toggle">
                                <label>Security Alerts</label>
                                <span className="toggle-description">Important security notifications</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.securityAlerts}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, securityAlerts: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>Marketing Emails</label>
                                <span className="toggle-description">Product updates and promotional content</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.marketingEmails}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                                />
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>Delivery Methods</h3>
                            
                            <div className="setting-toggle">
                                <label>Push Notifications</label>
                                <span className="toggle-description">In-app notifications</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.pushNotifications}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>Email Notifications</label>
                                <span className="toggle-description">Notifications via email</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.emailNotifications}
                                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>SMS Notifications</label>
                                <span className="toggle-description">Critical alerts via SMS</span>
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
                            <h3>Data Collection</h3>
                            
                            <div className="setting-toggle">
                                <label>Analytics Data</label>
                                <span className="toggle-description">Help us improve by sharing usage analytics</span>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.analytics}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, analytics: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>Marketing Tracking</label>
                                <span className="toggle-description">Allow tracking for personalized marketing</span>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.marketingTracking}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, marketingTracking: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>Share Anonymous Data</label>
                                <span className="toggle-description">Contribute to financial research (fully anonymized)</span>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.shareAnonData}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, shareAnonData: e.target.checked }))}
                                />
                            </div>

                            <div className="setting-toggle">
                                <label>Activity Tracking</label>
                                <span className="toggle-description">Track app usage for better recommendations</span>
                                <input
                                    type="checkbox"
                                    checked={privacySettings.activityTracking}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, activityTracking: e.target.checked }))}
                                />
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>Profile Privacy</h3>
                            
                            <div className="setting-group">
                                <label>Profile Visibility</label>
                                <select
                                    value={privacySettings.profileVisibility}
                                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as 'private' | 'public' | 'friends' }))}
                                >
                                    <option value="private">Private</option>
                                    <option value="friends">Friends Only</option>
                                    <option value="public">Public</option>
                                </select>
                                <span className="setting-description">Control who can see your profile information</span>
                            </div>
                        </div>

                        <div className="privacy-info">
                            <h4>🔒 Your Privacy Matters</h4>
                            <p>We take your privacy seriously. All financial data is encrypted and never shared with third parties. You can export or delete your data at any time from Account Settings.</p>
                            <button className="btn-secondary" onClick={() => navigate('/account-settings')}>
                                View Data Settings
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="advanced-settings">
                        <div className="settings-section">
                            <h3>Data Management</h3>
                            <div className="advanced-options">
                                <button className="btn-secondary" onClick={() => navigate('/account-settings')}>
                                    Export All Data
                                </button>
                                <button className="btn-secondary">
                                    Clear Cache
                                </button>
                                <button className="btn-secondary">
                                    Download Backup
                                </button>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>Reset Options</h3>
                            <div className="reset-options">
                                <button className="btn-warning" onClick={resetToDefaults}>
                                    Reset All Settings
                                </button>
                                <span className="reset-description">Restore all settings to default values</span>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>Developer Options</h3>
                            <div className="developer-options">
                                <button className="btn-secondary">
                                    View API Usage
                                </button>
                                <button className="btn-secondary">
                                    Download Debug Logs
                                </button>
                                <button className="btn-secondary">
                                    Test Notifications
                                </button>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>App Information</h3>
                            <div className="app-info">
                                <div className="info-item">
                                    <span>Version:</span>
                                    <span>2.1.0</span>
                                </div>
                                <div className="info-item">
                                    <span>Last Updated:</span>
                                    <span>January 2024</span>
                                </div>
                                <div className="info-item">
                                    <span>Build:</span>
                                    <span>20240115.1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="settings-actions">
                <button 
                    className="btn-primary" 
                    onClick={saveSettings}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
                <button 
                    className="btn-secondary" 
                    onClick={() => navigate('/dashboard')}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};