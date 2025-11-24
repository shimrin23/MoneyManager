// Account Settings Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';

interface SecuritySettings {
    twoFactorEnabled: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    dataExport: boolean;
}

export const AccountSettings = () => {
    const [settings, setSettings] = useState<SecuritySettings>({
        twoFactorEnabled: false,
        emailNotifications: true,
        pushNotifications: true,
        dataExport: false
    });
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

    const fetchSettings = async () => {
        try {
            const response = await apiClient.get('/auth/settings');
            if (response.data.settings) {
                setSettings(response.data.settings);
            }
        } catch (err) {
            console.log('Settings not found, using defaults');
        }
    };

    const handleSettingChange = async (setting: keyof SecuritySettings) => {
        const newValue = !settings[setting];
        setSettings(prev => ({ ...prev, [setting]: newValue }));
        
        try {
            await apiClient.put('/auth/settings', {
                ...settings,
                [setting]: newValue
            });
            setMessage('Settings updated successfully');
        } catch (err) {
            setError('Failed to update settings');
            // Revert on error
            setSettings(prev => ({ ...prev, [setting]: !newValue }));
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiClient.put('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            
            setMessage('Password updated successfully');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone.'
        );
        
        if (confirmed) {
            const finalConfirm = window.prompt(
                'Type "DELETE" to confirm account deletion:'
            );
            
            if (finalConfirm === 'DELETE') {
                try {
                    await apiClient.delete('/auth/account');
                    localStorage.removeItem('token');
                    navigate('/login');
                } catch (err) {
                    setError('Failed to delete account');
                }
            }
        }
    };

    const exportData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/auth/export-data', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'my-financial-data.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setMessage('Data export downloaded successfully');
        } catch (err) {
            setError('Failed to export data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Account Settings</h1>
                <p>Manage your account security and privacy preferences</p>
            </div>

            <div className="settings-content">
                {message && <div className="alert-success">{message}</div>}
                {error && <div className="alert-error">{error}</div>}

                {/* Security Settings */}
                <div className="settings-section">
                    <h2>🔐 Security & Privacy</h2>
                    
                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Two-Factor Authentication</h3>
                            <p>Add an extra layer of security to your account</p>
                        </div>
                        <button
                            className={`toggle-btn ${settings.twoFactorEnabled ? 'active' : ''}`}
                            onClick={() => handleSettingChange('twoFactorEnabled')}
                        >
                            {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Email Notifications</h3>
                            <p>Receive financial insights and alerts via email</p>
                        </div>
                        <button
                            className={`toggle-btn ${settings.emailNotifications ? 'active' : ''}`}
                            onClick={() => handleSettingChange('emailNotifications')}
                        >
                            {settings.emailNotifications ? 'On' : 'Off'}
                        </button>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Push Notifications</h3>
                            <p>Get real-time alerts for transactions and budgets</p>
                        </div>
                        <button
                            className={`toggle-btn ${settings.pushNotifications ? 'active' : ''}`}
                            onClick={() => handleSettingChange('pushNotifications')}
                        >
                            {settings.pushNotifications ? 'On' : 'Off'}
                        </button>
                    </div>
                </div>

                {/* Change Password */}
                <div className="settings-section">
                    <h2>🔑 Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="password-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    currentPassword: e.target.value
                                }))}
                                required
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    newPassword: e.target.value
                                }))}
                                required
                                placeholder="Enter new password"
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    confirmPassword: e.target.value
                                }))}
                                required
                                placeholder="Confirm new password"
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* Data & Privacy */}
                <div className="settings-section">
                    <h2>📊 Data & Privacy</h2>
                    
                    <div className="action-item">
                        <div className="action-info">
                            <h3>Export My Data</h3>
                            <p>Download a copy of all your financial data</p>
                        </div>
                        <button
                            className="btn-secondary"
                            onClick={exportData}
                            disabled={loading}
                        >
                            📥 Export Data
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="settings-section danger-zone">
                    <h2>⚠️ Danger Zone</h2>
                    
                    <div className="action-item">
                        <div className="action-info">
                            <h3>Delete Account</h3>
                            <p>Permanently delete your account and all data. This action cannot be undone.</p>
                        </div>
                        <button
                            className="btn-danger"
                            onClick={handleDeleteAccount}
                        >
                            🗑️ Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};