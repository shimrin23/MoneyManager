import { formatDate } from '../utils/appFormat';
// Notifications Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { confirmDialog } from '../utils/systemMessages';
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

const NOTIFICATION_ICON_PATHS: Record<Notification['type'], string[]> = {
    info: ['M12 16v-4', 'M12 8h.01', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z'],
    warning: ['M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z', 'M12 9v4', 'M12 17h.01'],
    success: ['M22 11.1V12a10 10 0 1 1-5.9-9.1', 'M22 4 12 14.01l-3-3'],
    alert: ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0']
};

const NotificationIcon = ({ type }: { type: Notification['type'] }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {NOTIFICATION_ICON_PATHS[type].map(d => <path key={d} d={d} />)}
    </svg>
);

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

    // Asks before deleting from the bin button
    const confirmDelete = async (notification: Notification) => {
        const confirmed = await confirmDialog({
            title: 'Delete notification?',
            message: `"${notification.title}" will be removed.`,
            confirmText: 'Delete',
            danger: true,
        });
        if (confirmed) deleteNotification(notification.id);
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
        <div className="page-container nt-page">
            <div className="nt-toolbar">
                <div className="nt-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'all'}
                        className={`nt-tab ${activeTab === 'all' ? 'on' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'unread'}
                        className={`nt-tab ${activeTab === 'unread' ? 'on' : ''}`}
                        onClick={() => setActiveTab('unread')}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'settings'}
                        className={`nt-tab ${activeTab === 'settings' ? 'on' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                </div>
                {activeTab !== 'settings' && unreadCount > 0 && (
                    <button className="btn-secondary nt-mark-all" onClick={markAllAsRead}>
                        Mark All as Read
                    </button>
                )}
            </div>

            {activeTab !== 'settings' && (
                <>
                    {loadError && <div className="alert alert-error">{loadError}</div>}

                    <section className="nt-card">
                        {filteredNotifications.length === 0 ? (
                            <div className="nt-empty">
                                <span className="nt-empty-icon"><NotificationIcon type="alert" /></span>
                                <h3>No notifications</h3>
                                <p>You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="nt-list">
                                {filteredNotifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`nt-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                                    >
                                        <span className={`nt-icon ${notification.type}`}>
                                            <NotificationIcon type={notification.type} />
                                        </span>
                                        <div className="nt-body">
                                            <div className="nt-title-row">
                                                <h3>{notification.title}</h3>
                                                {!notification.read && <span className="nt-dot" aria-hidden="true" />}
                                            </div>
                                            <p className="nt-message">{notification.message}</p>
                                            <span className="nt-time">{getTimeAgo(notification.timestamp)}</span>
                                            {notification.actionRequired && (
                                                <div className="nt-actions">
                                                    <button className="btn-primary btn-sm" onClick={() => takeAction(notification)}>
                                                        Take Action
                                                    </button>
                                                    <button className="btn-secondary btn-sm" onClick={() => deleteNotification(notification.id)}>
                                                        Dismiss
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="nt-menu">
                                            {!notification.read && (
                                                <button
                                                    className="nt-icon-btn"
                                                    onClick={() => markAsRead(notification.id)}
                                                    title="Mark as read"
                                                    aria-label="Mark as read"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                        <path d="M20 6 9 17l-5-5" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                className="nt-icon-btn delete"
                                                onClick={() => confirmDelete(notification)}
                                                title="Delete"
                                                aria-label="Delete"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {activeTab === 'settings' && (
                <div className="nt-settings">
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
    );
};
