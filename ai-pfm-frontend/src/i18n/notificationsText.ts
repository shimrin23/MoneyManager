// Text for the Notifications page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface NotificationsText {
  loading: string; loadFailed: string;
  tabAll: string; tabUnread: string; tabSettings: string; markAll: string;
  emptyTitle: string; emptyText: string;
  takeAction: string; dismiss: string; markRead: string; delete: string;
  deleteTitle: string; deleteMsg: string;
  prefTitle: string; prefIntro: string; prefLoading: string; required: string;
  justNow: string; hoursAgo: string; daysAgo: string;
  groupFinancial: string; groupReports: string; groupSecurity: string; groupDelivery: string;
  prefLabel: Record<string, string>; prefDesc: Record<string, string>;
}

const en: NotificationsText = {
  loading: 'Loading notifications...', loadFailed: 'Could not load notifications. Please try again.',
  tabAll: 'All', tabUnread: 'Unread', tabSettings: 'Settings', markAll: 'Mark All as Read',
  emptyTitle: 'No notifications', emptyText: "You're all caught up!",
  takeAction: 'Take Action', dismiss: 'Dismiss', markRead: 'Mark as read', delete: 'Delete',
  deleteTitle: 'Delete notification?', deleteMsg: '"{title}" will be removed.',
  prefTitle: 'Notification Preferences',
  prefIntro: 'Choose what notifications you want to receive. These are the same as on the Settings page.',
  prefLoading: 'Loading preferences...', required: 'Required',
  justNow: 'Just now', hoursAgo: '{n}h ago', daysAgo: '{n}d ago',
  groupFinancial: 'Financial Alerts', groupReports: 'Reports & Insights', groupSecurity: 'Security & Marketing', groupDelivery: 'Delivery',
  prefLabel: {
    budgetAlerts: 'Budget Alerts', transactionAlerts: 'Transaction Alerts', goalReminders: 'Goal Reminders',
    weeklyReports: 'Weekly Reports', monthlyReports: 'Monthly Reports',
    securityAlerts: 'Security Alerts', marketingEmails: 'Marketing Emails',
    pushNotifications: 'Push Notifications', emailNotifications: 'Email Notifications', smsNotifications: 'SMS Notifications',
  },
  prefDesc: {
    budgetAlerts: 'Get notified when approaching budget limits',
    transactionAlerts: 'Alerts for large transactions and unusual activity',
    goalReminders: 'Reminders about your savings goals',
    weeklyReports: 'Weekly summary of your financial activity',
    monthlyReports: 'Comprehensive monthly financial health report',
    securityAlerts: 'Important security notifications (always enabled)',
    marketingEmails: 'Product updates and financial tips',
    pushNotifications: 'Notifications on this device',
    emailNotifications: 'Notifications sent to your email',
    smsNotifications: 'Notifications sent by text message',
  },
};

const si: NotificationsText = {
  loading: 'දැනුම්දීම් පූරණය වෙමින්...', loadFailed: 'දැනුම්දීම් පූරණය කළ නොහැක. නැවත උත්සාහ කරන්න.',
  tabAll: 'සියල්ල', tabUnread: 'නොකියවූ', tabSettings: 'සැකසුම්', markAll: 'සියල්ල කියවූ ලෙස සලකුණු කරන්න',
  emptyTitle: 'දැනුම්දීම් නැත', emptyText: 'ඔබ සියල්ල බලා ඇත!',
  takeAction: 'ක්‍රියාමාර්ගය ගන්න', dismiss: 'ඉවත ලන්න', markRead: 'කියවූ ලෙස සලකුණු කරන්න', delete: 'මකන්න',
  deleteTitle: 'දැනුම්දීම මකන්නද?', deleteMsg: '"{title}" ඉවත් කෙරෙනු ඇත.',
  prefTitle: 'දැනුම්දීම් මනාපයන්',
  prefIntro: 'ඔබට ලැබීමට අවශ්‍ය දැනුම්දීම් තෝරන්න. මේවා සැකසුම් පිටුවේ ඇති ඒවාම වේ.',
  prefLoading: 'මනාපයන් පූරණය වෙමින්...', required: 'අනිවාර්ය',
  justNow: 'දැන්ම', hoursAgo: 'පැය {n} කට පෙර', daysAgo: 'දින {n} කට පෙර',
  groupFinancial: 'මූල්‍ය ඇඟවීම්', groupReports: 'වාර්තා සහ අවබෝධ', groupSecurity: 'ආරක්ෂාව සහ වෙළඳ දැන්වීම්', groupDelivery: 'බෙදා හැරීම',
  prefLabel: {
    budgetAlerts: 'අයවැය ඇඟවීම්', transactionAlerts: 'ගනුදෙනු ඇඟවීම්', goalReminders: 'ඉලක්ක මතක් කිරීම්',
    weeklyReports: 'සතිපතා වාර්තා', monthlyReports: 'මාසික වාර්තා',
    securityAlerts: 'ආරක්ෂක ඇඟවීම්', marketingEmails: 'වෙළඳ ඊමේල්',
    pushNotifications: 'තල්ලු දැනුම්දීම්', emailNotifications: 'ඊමේල් දැනුම්දීම්', smsNotifications: 'SMS දැනුම්දීම්',
  },
  prefDesc: {
    budgetAlerts: 'අයවැය සීමාවට ළඟා වන විට දැනුම් දෙන්න',
    transactionAlerts: 'විශාල ගනුදෙනු සහ අසාමාන්‍ය ක්‍රියාකාරකම් සඳහා ඇඟවීම්',
    goalReminders: 'ඔබේ ඉතිරි කිරීමේ ඉලක්ක පිළිබඳ මතක් කිරීම්',
    weeklyReports: 'ඔබේ මූල්‍ය ක්‍රියාකාරකම්වල සතිපතා සාරාංශය',
    monthlyReports: 'පූර්ණ මාසික මූල්‍ය සෞඛ්‍ය වාර්තාව',
    securityAlerts: 'වැදගත් ආරක්ෂක දැනුම්දීම් (සැමවිටම සක්‍රියයි)',
    marketingEmails: 'නිෂ්පාදන යාවත්කාලීන සහ මූල්‍ය ඉඟි',
    pushNotifications: 'මෙම උපාංගයේ දැනුම්දීම්',
    emailNotifications: 'ඔබේ ඊමේලයට යවන දැනුම්දීම්',
    smsNotifications: 'කෙටි පණිවිඩයෙන් යවන දැනුම්දීම්',
  },
};

const ta: NotificationsText = {
  loading: 'அறிவிப்புகள் ஏற்றப்படுகின்றன...', loadFailed: 'அறிவிப்புகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  tabAll: 'அனைத்தும்', tabUnread: 'படிக்காதவை', tabSettings: 'அமைப்புகள்', markAll: 'அனைத்தையும் படித்ததாகக் குறி',
  emptyTitle: 'அறிவிப்புகள் இல்லை', emptyText: 'நீங்கள் அனைத்தையும் பார்த்துவிட்டீர்கள்!',
  takeAction: 'நடவடிக்கை எடு', dismiss: 'நிராகரி', markRead: 'படித்ததாகக் குறி', delete: 'நீக்கு',
  deleteTitle: 'அறிவிப்பை நீக்கவா?', deleteMsg: '"{title}" அகற்றப்படும்.',
  prefTitle: 'அறிவிப்பு விருப்பத்தேர்வுகள்',
  prefIntro: 'நீங்கள் பெற விரும்பும் அறிவிப்புகளைத் தேர்ந்தெடுக்கவும். இவை அமைப்புகள் பக்கத்தில் உள்ளவையே.',
  prefLoading: 'விருப்பத்தேர்வுகள் ஏற்றப்படுகின்றன...', required: 'கட்டாயம்',
  justNow: 'இப்போது', hoursAgo: '{n} மணி நேரத்திற்கு முன்', daysAgo: '{n} நாட்களுக்கு முன்',
  groupFinancial: 'நிதி எச்சரிக்கைகள்', groupReports: 'அறிக்கைகள் & நுண்ணறிவு', groupSecurity: 'பாதுகாப்பு & விளம்பரங்கள்', groupDelivery: 'அனுப்புதல்',
  prefLabel: {
    budgetAlerts: 'பட்ஜெட் எச்சரிக்கைகள்', transactionAlerts: 'பரிவர்த்தனை எச்சரிக்கைகள்', goalReminders: 'இலக்கு நினைவூட்டல்கள்',
    weeklyReports: 'வாராந்திர அறிக்கைகள்', monthlyReports: 'மாதாந்திர அறிக்கைகள்',
    securityAlerts: 'பாதுகாப்பு எச்சரிக்கைகள்', marketingEmails: 'விளம்பர மின்னஞ்சல்கள்',
    pushNotifications: 'புஷ் அறிவிப்புகள்', emailNotifications: 'மின்னஞ்சல் அறிவிப்புகள்', smsNotifications: 'SMS அறிவிப்புகள்',
  },
  prefDesc: {
    budgetAlerts: 'பட்ஜெட் வரம்புகளை நெருங்கும்போது அறிவிக்கவும்',
    transactionAlerts: 'பெரிய பரிவர்த்தனைகள் மற்றும் அசாதாரண செயல்பாட்டுக்கான எச்சரிக்கைகள்',
    goalReminders: 'உங்கள் சேமிப்பு இலக்குகள் பற்றிய நினைவூட்டல்கள்',
    weeklyReports: 'உங்கள் நிதிச் செயல்பாட்டின் வாராந்திர சுருக்கம்',
    monthlyReports: 'விரிவான மாதாந்திர நிதி ஆரோக்கிய அறிக்கை',
    securityAlerts: 'முக்கியமான பாதுகாப்பு அறிவிப்புகள் (எப்போதும் இயக்கத்தில்)',
    marketingEmails: 'தயாரிப்பு புதுப்பிப்புகள் மற்றும் நிதி குறிப்புகள்',
    pushNotifications: 'இந்தச் சாதனத்தில் அறிவிப்புகள்',
    emailNotifications: 'உங்கள் மின்னஞ்சலுக்கு அனுப்பப்படும் அறிவிப்புகள்',
    smsNotifications: 'குறுஞ்செய்தி மூலம் அனுப்பப்படும் அறிவிப்புகள்',
  },
};

export const NOTIF_T: Record<AdminLang, NotificationsText> = { en, si, ta };
