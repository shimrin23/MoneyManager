// Notifications Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionRequired?: boolean;
}

interface NotificationSettings {
    budgetAlerts: boolean;
    transactionAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
}

export const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>({
        budgetAlerts: true,
        transactionAlerts: true,
        weeklyReports: true,
        monthlyReports: true,
        securityAlerts: true,
        marketingEmails: false
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        fetchNotificationSettings();
    }, []);

    const fetchNotifications = async () => {
        try {
            // Mock notifications for now - replace with real API call
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    type: 'warning',
                    title: 'Budget Alert',
                    message: 'You\'ve spent 85% of your dining budget this month',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    actionRequired: true
                },
                {
                    id: '2',
                    type: 'info',
                    title: 'Weekly Report Ready',
                    message: 'Your financial health score improved by 5 points this week',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    read: true
                },
                {
                    id: '3',
                    type: 'success',
                    title: 'Goal Achievement',
                    message: 'Congratulations! You\'ve reached your emergency fund goal',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    read: false
                },
                {
                    id: '4',
                    type: 'alert',
                    title: 'Security Alert',
                    message: 'New login detected from unknown device',
                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    read: true
                }
            ];
            setNotifications(mockNotifications);
        } catch (err) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchNotificationSettings = async () => {
        try {
            const response = await apiClient.get('/notifications/settings');
            if (response.data.settings) {
                setSettings(response.data.settings);
            }
        } catch (err) {
            console.log('Using default notification settings');
        }
    };

    const markAsRead = async (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );

        try {
            await apiClient.put(`/notifications/${notificationId}/read`);
        } catch (err) {
            console.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );

        try {
            await apiClient.put('/notifications/mark-all-read');
        } catch (err) {
            console.error('Failed to mark all notifications as read');
        }
    };

    const deleteNotification = async (notificationId: string) => {
        setNotifications(prev =>
            prev.filter(notif => notif.id !== notificationId)
        );

        try {
            await apiClient.delete(`/notifications/${notificationId}`);
        } catch (err) {
            console.error('Failed to delete notification');
        }
    };

    const updateNotificationSetting = async (setting: keyof NotificationSettings) => {
        const newValue = !settings[setting];
        setSettings(prev => ({ ...prev, [setting]: newValue }));

        try {
            await apiClient.put('/notifications/settings', {
                ...settings,
                [setting]: newValue
            });
        } catch (err) {
            console.error('Failed to update notification settings');
            // Revert on error
            setSettings(prev => ({ ...prev, [setting]: !newValue }));
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'warning': return '⚠️';
            case 'success': return '✅';
            case 'alert': return '🚨';
            case 'info':
            default: return 'ℹ️';
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return time.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === 'unread') return !notif.read;
        return true;
    });

    const unreadCount = notifications.filter(notif => !notif.read).length;

    if (loading) {
        return <div className="page-loading">Loading notifications...</div>;
    }

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Notifications</h1>
                <p>Stay updated with your financial activity and alerts</p>
            </div>

            <div className="notifications-tabs">
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All ({notifications.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread ({unreadCount})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            <div className="notifications-content">
                {activeTab !== 'settings' && (
                    <>
                        {unreadCount > 0 && (
                            <div className="notifications-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={markAllAsRead}
                                >
                                    Mark All as Read
                                </button>
                            </div>
                        )}

                        <div className="notifications-list">
                            {filteredNotifications.length === 0 ? (
                                <div className="empty-notifications">
                                    <div className="empty-icon">🔔</div>
                                    <h3>No notifications</h3>
                                    <p>You're all caught up!</p>
                                </div>
                            ) : (
                                filteredNotifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-header">
                                                <h3>{notification.title}</h3>
                                                <span className="notification-time">
                                                    {getTimeAgo(notification.timestamp)}
                                                </span>
                                            </div>
                                            <p className="notification-message">
                                                {notification.message}
                                            </p>
                                            {notification.actionRequired && (
                                                <div className="notification-actions">
                                                    <button className="action-btn primary">
                                                        Take Action
                                                    </button>
                                                    <button className="action-btn secondary">
                                                        Dismiss
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="notification-menu">
                                            {!notification.read && (
                                                <button
                                                    className="menu-btn"
                                                    onClick={() => markAsRead(notification.id)}
                                                    title="Mark as read"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                className="menu-btn delete"
                                                onClick={() => deleteNotification(notification.id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'settings' && (
                    <div className="notification-settings">
                        <h2>Notification Preferences</h2>
                        <p>Choose what notifications you want to receive</p>

                        <div className="settings-group">
                            <h3>Financial Alerts</h3>
                            
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Budget Alerts</h4>
                                    <p>Get notified when approaching budget limits</p>
                                </div>
                                <button
                                    className={`toggle-btn ${settings.budgetAlerts ? 'active' : ''}`}
                                    onClick={() => updateNotificationSetting('budgetAlerts')}
                                >
                                    {settings.budgetAlerts ? 'On' : 'Off'}
                                </button>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Transaction Alerts</h4>
                                    <p>Alerts for large transactions and unusual activity</p>
                                </div>
                                <button
                                    className={`toggle-btn ${settings.transactionAlerts ? 'active' : ''}`}
                                    onClick={() => updateNotificationSetting('transactionAlerts')}
                                >
                                    {settings.transactionAlerts ? 'On' : 'Off'}
                                </button>
                            </div>
                        </div>

                        <div className="settings-group">
                            <h3>Reports & Insights</h3>
                            
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Weekly Reports</h4>
                                    <p>Weekly summary of your financial activity</p>
                                </div>
                                <button
                                    className={`toggle-btn ${settings.weeklyReports ? 'active' : ''}`}
                                    onClick={() => updateNotificationSetting('weeklyReports')}
                                >
                                    {settings.weeklyReports ? 'On' : 'Off'}
                                </button>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Monthly Reports</h4>
                                    <p>Comprehensive monthly financial health report</p>
                                </div>
                                <button
                                    className={`toggle-btn ${settings.monthlyReports ? 'active' : ''}`}
                                    onClick={() => updateNotificationSetting('monthlyReports')}
                                >
                                    {settings.monthlyReports ? 'On' : 'Off'}
                                </button>
                            </div>
                        </div>

                        <div className="settings-group">
                            <h3>Security & Marketing</h3>
                            
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Security Alerts</h4>
                                    <p>Important security notifications (always enabled)</p>
                                </div>
                                <button className="toggle-btn active" disabled>
                                    Required
                                </button>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Marketing Emails</h4>
                                    <p>Product updates and financial tips</p>
                                </div>
                                <button
                                    className={`toggle-btn ${settings.marketingEmails ? 'active' : ''}`}
                                    onClick={() => updateNotificationSetting('marketingEmails')}
                                >
                                    {settings.marketingEmails ? 'On' : 'Off'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};