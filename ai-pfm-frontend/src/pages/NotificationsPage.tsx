import { formatDate } from '../utils/appFormat';
// Notifications Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { confirmDialog } from '../utils/systemMessages';
import { useAdminLang } from '../i18n/adminText';
import { NOTIF_T } from '../i18n/notificationsText';
import { fillText } from '../i18n/dashboardText';
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


export const NotificationsPage = () => {
    const t = NOTIF_T[useAdminLang()];
    const navigate = useNavigate();
    const groupTitles: Record<string, string> = {
        'Financial Alerts': t.groupFinancial, 'Reports & Insights': t.groupReports,
        'Security & Marketing': t.groupSecurity, 'Delivery': t.groupDelivery,
    };
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
            setLoadError(t.loadFailed);
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
            title: t.deleteTitle,
            message: fillText(t.deleteMsg, { title: notification.title }),
            confirmText: t.delete,
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

        if (diffInHours < 1) return t.justNow;
        if (diffInHours < 24) return fillText(t.hoursAgo, { n: diffInHours });
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return fillText(t.daysAgo, { n: diffInDays });
        return formatDate(time);
    };

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === 'unread') return !notif.read;
        return true;
    });

    const unreadCount = notifications.filter(notif => !notif.read).length;

    if (loading) {
        return <div className="page-loading">{t.loading}</div>;
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
                        {t.tabAll} ({notifications.length})
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'unread'}
                        className={`nt-tab ${activeTab === 'unread' ? 'on' : ''}`}
                        onClick={() => setActiveTab('unread')}
                    >
                        {t.tabUnread} ({unreadCount})
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'settings'}
                        className={`nt-tab ${activeTab === 'settings' ? 'on' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        {t.tabSettings}
                    </button>
                </div>
                {activeTab !== 'settings' && unreadCount > 0 && (
                    <button className="btn-secondary nt-mark-all" onClick={markAllAsRead}>
                        {t.markAll}
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
                                <h3>{t.emptyTitle}</h3>
                                <p>{t.emptyText}</p>
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
                                                        {t.takeAction}
                                                    </button>
                                                    <button className="btn-secondary btn-sm" onClick={() => deleteNotification(notification.id)}>
                                                        {t.dismiss}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="nt-menu">
                                            {!notification.read && (
                                                <button
                                                    className="nt-icon-btn"
                                                    onClick={() => markAsRead(notification.id)}
                                                    title={t.markRead}
                                                    aria-label={t.markRead}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                        <path d="M20 6 9 17l-5-5" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                className="nt-icon-btn delete"
                                                onClick={() => confirmDelete(notification)}
                                                title={t.delete}
                                                aria-label={t.delete}
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
                    <h2>{t.prefTitle}</h2>
                    <p>{t.prefIntro}</p>

                    {!preferences ? (
                        <p className="np-loading">{t.prefLoading}</p>
                    ) : (
                        PREFERENCE_GROUPS.map(group => (
                            <section className="np-card" key={group.title}>
                                <h3 className="np-group-title">{groupTitles[group.title]}</h3>
                                {group.items.map(item => {
                                    const key = item.key;
                                    const isRequired = key === 'securityAlerts';
                                    const isOn = isRequired ? true : !!preferences[key];
                                    return (
                                        <div className="np-row" key={key}>
                                            <div className="np-row-text">
                                                <span className="np-label">
                                                    {t.prefLabel[key]}
                                                    {isRequired && <span className="np-badge">{t.required}</span>}
                                                </span>
                                                <span className="np-description">{t.prefDesc[key]}</span>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={isOn}
                                                aria-label={t.prefLabel[key]}
                                                className={`np-switch ${isOn ? 'on' : ''}`}
                                                disabled={isRequired}
                                                onClick={() => togglePreference(key)}
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
