import { formatDate } from '../utils/appFormat';
// Notifications Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import '../styles/NotificationPreferences.css';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    title: string;
    message: string;
    link?: string;
    actionRequired?: boolean;
    read: boolean;
    timestamp: string;
}

// Same preference data as the Settings page (/settings/notifications)
type Preferences = Record<string, boolean>;

const PREFERENCE_GROUPS = [
    {
        title: 'Financial Alerts',
        items: [
            { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Get notified when approaching budget limits' },
            { key: 'transactionAlerts', label: 'Transaction Alerts', description: 'Alerts for large transactions and unusual activity' },
            { key: 'goalReminders', label: 'Goal Reminders', description: 'Reminders about your savings goals' }
        ]
    },
    {
        title: 'Reports & Insights',
        items: [
            { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly summary of your financial activity' },
            { key: 'monthlyReports', label: 'Monthly Reports', description: 'Comprehensive monthly financial health report' }
        ]
    },
    {
        title: 'Security & Marketing',
        items: [
            { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications (always enabled)' },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and financial tips' }
        ]
    },
    {
        title: 'Delivery',
        items: [
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Notifications on this device' },
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Notifications sent to your email' },
            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Notifications sent by text message' }
        ]
    }
];

const NOTIFICATION_ICONS: Record<Notification['type'], string> = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    alert: '🚨'
};

export const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [preferences, setPreferences] = useState<Preferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');

    // Lets the header bell refresh its unread badge
    const notifyChanged = () => window.dispatchEvent(new Event('notifications-changed'));

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get<Notification[]>('/notifications');
            setNotifications(response.data);
            setLoadError('');
        } catch (err) {
            console.error('Failed to fetch notifications', err);
            setLoadError('Could not load notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPreferences = async () => {
        try {
            const response = await apiClient.get<Preferences>('/settings/notifications');
            setPreferences(response.data);
        } catch (err) {
            console.error('Failed to load notification preferences', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchPreferences();
    }, []);

    const markAsRead = async (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif => (notif.id === notificationId ? { ...notif, read: true } : notif))
        );
        try {
            await apiClient.put(`/notifications/${notificationId}/read`);
            notifyChanged();
        } catch (err) {
            console.error('Failed to mark notification as read', err);
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        try {
            await apiClient.put('/notifications/mark-all-read');
            notifyChanged();
        } catch (err) {
            console.error('Failed to mark all notifications as read', err);
            fetchNotifications();
        }
    };

    const deleteNotification = async (notificationId: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        try {
            await apiClient.delete(`/notifications/${notificationId}`);
            notifyChanged();
        } catch (err) {
            console.error('Failed to delete notification', err);
            fetchNotifications();
        }
    };

    const takeAction = async (notification: Notification) => {
        if (!notification.read) await markAsRead(notification.id);
        if (notification.link) navigate(notification.link);
    };

    const togglePreference = async (key: string) => {
        if (!preferences || key === 'securityAlerts') return;
        const next = { ...preferences, [key]: !preferences[key] };
        setPreferences(next);
        try {
            await apiClient.put('/settings/notifications', next);
        } catch (err) {
            console.error('Failed to update notification preferences', err);
            setPreferences(preferences);
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
        return formatDate(time);
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
                <h1>Notifications</h1>
                <p>Stay updated with your financial activity and alerts</p>
            </div>

            <div className="notifications-navigation">
                <button
                    className={`nav-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All ({notifications.length})
                </button>
                <button
                    className={`nav-btn ${activeTab === 'unread' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread ({unreadCount})
                </button>
                <button
                    className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            <div className="notifications-content">
                {activeTab !== 'settings' && (
                    <>
                        {loadError && <div className="alert alert-error">{loadError}</div>}

                        {unreadCount > 0 && (
                            <div className="notifications-actions">
                                <button className="btn-secondary" onClick={markAllAsRead}>
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
                                            {NOTIFICATION_ICONS[notification.type]}
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
                                                    <button className="action-btn primary" onClick={() => takeAction(notification)}>
                                                        Take Action
                                                    </button>
                                                    <button className="action-btn secondary" onClick={() => deleteNotification(notification.id)}>
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
                        <p>Choose what notifications you want to receive. These are the same as on the Settings page.</p>

                        {!preferences ? (
                            <p className="np-loading">Loading preferences...</p>
                        ) : (
                            PREFERENCE_GROUPS.map(group => (
                                <section className="np-card" key={group.title}>
                                    <h3 className="np-group-title">{group.title}</h3>
                                    {group.items.map(item => {
                                        const isRequired = item.key === 'securityAlerts';
                                        const isOn = isRequired ? true : !!preferences[item.key];
                                        return (
                                            <div className="np-row" key={item.key}>
                                                <div className="np-row-text">
                                                    <span className="np-label">
                                                        {item.label}
                                                        {isRequired && <span className="np-badge">Required</span>}
                                                    </span>
                                                    <span className="np-description">{item.description}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={isOn}
                                                    aria-label={item.label}
                                                    className={`np-switch ${isOn ? 'on' : ''}`}
                                                    disabled={isRequired}
                                                    onClick={() => togglePreference(item.key)}
                                                >
                                                    <span className="np-knob" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </section>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
