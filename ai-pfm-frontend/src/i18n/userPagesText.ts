// Text for the user-side pages reached from the account menu:
// Edit Profile, Settings and Help & Support, in English, Sinhala and Tamil.
import { type AdminLang } from './adminText';

export interface UserPagesText {
  // Header titles (shown in the top bar)
  hdrProfile: string; hdrProfileSub: string;
  hdrHelp: string; hdrHelpSub: string;
  hdrSettings: string; hdrSettingsSub: string;

  // Edit Profile page
  profTitle: string; profSubtitle: string;
  profPersonal: string; profFullName: string; profEmail: string; profPhone: string; profDob: string;
  profAdditional: string; profAddress: string; profOccupation: string; profIncome: string;
  profCancel: string; profSave: string; profSaving: string;
  profUpdated: string; profUpdateFailed: string;
  profPlaceName: string; profPlaceEmail: string; profPlaceDob: string; profPlaceAddress: string; profPlaceOcc: string;
  profChangeAvatar: string;

  // Help & Support page
  helpNavFaq: string; helpNavGuides: string; helpNavContact: string;
  helpSearchPlaceholder: string; helpNoResults: string; helpNoResultsSub: string;
  helpGuidesTitle: string; helpReadGuide: string; helpResources: string;
  helpTerms: string; helpPrivacy: string; helpApi: string; helpMobile: string;
  helpEmailSupport: string; helpResponse: string; helpLiveChat: string; helpLiveChatSub: string;
  helpStartChat: string; helpPhoneSupport: string; helpPhoneHours: string;
  helpSubmitTitle: string; helpCategory: string; helpPriority: string; helpSubject: string; helpMessage: string;
  helpPlaceSubject: string; helpPlaceMessage: string;
  helpCatGeneral: string; helpCatTechnical: string; helpCatBilling: string; helpCatFeature: string; helpCatSecurity: string;
  helpPriLow: string; helpPriMedium: string; helpPriHigh: string;
  helpSubmitting: string; helpSubmit: string;
  helpTicketOk: string; helpTicketFail: string; helpErrSubject: string; helpErrMessage: string; helpTicketNumber: string;
  faqQ: string[]; faqA: string[];
  guideTitle: string[]; guideDesc: string[];

  // Settings page
  setTitle: string; setSub: string;
  tabGeneral: string; tabNotifications: string; tabPrivacy: string; tabAdvanced: string;
  setSaved: string; setSaveFailed: string; setResetConfirm: string;
  regional: string; currency: string; dateFormat: string; language: string; timezone: string;
  appearance: string; theme: string; themeLight: string; themeDark: string; themeAuto: string;
  dashLayout: string; layoutCompact: string; layoutDetailed: string; layoutMinimal: string;
  chartType: string; chartLine: string; chartBar: string; chartPie: string;
  defaultBehavior: string; defTxType: string; txExpense: string; txIncome: string;
  catSort: string; sortAlpha: string; sortFreq: string; sortCustom: string;
  finAlerts: string; budgetAlerts: string; budgetAlertsSub: string; goalReminders: string; goalRemindersSub: string;
  reports: string; weekly: string; weeklySub: string; monthly: string; monthlySub: string;
  secSystem: string; secAlerts: string; secAlertsSub: string; marketing: string; marketingSub: string;
  delivery: string; push: string; pushSub: string; email: string; emailSub: string; sms: string; smsSub: string;
  dataCollection: string; analyticsData: string; analyticsSub: string;
  marketingTracking: string; marketingTrackingSub: string; shareAnon: string; shareAnonSub: string;
  activityTracking: string; activityTrackingSub: string;
  profilePrivacy: string; profVisibility: string; visPrivate: string; visFriends: string; visPublic: string; visSub: string;
  privacyMatters: string; privacyText: string; viewData: string;
  dataMgmt: string; exportAll: string; clearCache: string; downloadBackup: string;
  resetOpts: string; resetAll: string; resetSub: string;
  devOpts: string; viewApi: string; debugLogs: string; testNotif: string;
  appInfo: string; version: string; lastUpdated: string; build: string;
  cancel: string; saving: string; saveSettings: string;
}

const en: UserPagesText = {
  hdrProfile: 'Edit Profile', hdrProfileSub: 'Update your personal info',
  hdrHelp: 'Help & Support', hdrHelpSub: 'Find answers or contact our support team',
  hdrSettings: 'Settings', hdrSettingsSub: 'Customize your MoneyManager experience',

  profTitle: 'Edit Profile', profSubtitle: 'Manage your personal information and preferences',
  profPersonal: 'Personal Information', profFullName: 'Full Name *', profEmail: 'Email Address *',
  profPhone: 'Phone Number', profDob: 'Date of Birth',
  profAdditional: 'Additional Details', profAddress: 'Address', profOccupation: 'Occupation',
  profIncome: 'Monthly Income (LKR)',
  profCancel: 'Cancel', profSave: 'Save Changes', profSaving: 'Saving...',
  profUpdated: 'Profile updated successfully!', profUpdateFailed: 'Failed to update profile',
  profPlaceName: 'Enter your full name', profPlaceEmail: 'Enter your email',
  profPlaceDob: 'Select your date of birth', profPlaceAddress: 'Enter your address',
  profPlaceOcc: 'Your job title', profChangeAvatar: 'Change avatar',

  helpNavFaq: 'FAQ', helpNavGuides: 'Guides', helpNavContact: 'Contact Support',
  helpSearchPlaceholder: 'Search frequently asked questions...',
  helpNoResults: 'No results found', helpNoResultsSub: 'Try different keywords or contact our support team',
  helpGuidesTitle: 'User Guides & Tutorials', helpReadGuide: 'Read Guide →', helpResources: 'Additional Resources',
  helpTerms: 'Terms of Service', helpPrivacy: 'Privacy Policy', helpApi: 'API Documentation', helpMobile: 'Mobile App Guide',
  helpEmailSupport: 'Email Support', helpResponse: 'Response time: 4-6 hours',
  helpLiveChat: 'Live Chat', helpLiveChatSub: 'Available 24/7 for urgent issues', helpStartChat: 'Start Chat',
  helpPhoneSupport: 'Phone Support', helpPhoneHours: 'Mon-Fri: 9AM-6PM',
  helpSubmitTitle: 'Submit a Support Ticket', helpCategory: 'Category', helpPriority: 'Priority',
  helpSubject: 'Subject', helpMessage: 'Message',
  helpPlaceSubject: 'Brief description of your issue',
  helpPlaceMessage: 'Please provide detailed information about your issue or question',
  helpCatGeneral: 'General Question', helpCatTechnical: 'Technical Issue', helpCatBilling: 'Billing',
  helpCatFeature: 'Feature Request', helpCatSecurity: 'Security Concern',
  helpPriLow: 'Low', helpPriMedium: 'Medium', helpPriHigh: 'High',
  helpSubmitting: 'Submitting...', helpSubmit: 'Submit Ticket',
  helpTicketOk: "Support ticket submitted successfully! We'll get back to you within 24 hours.",
  helpTicketFail: 'Failed to submit ticket. Please try again or email support@moneymanager.com',
  helpErrSubject: 'Subject is required', helpErrMessage: 'Message is required', helpTicketNumber: 'Ticket number',
  faqQ: [
    'How do I add my bank account?',
    'How is my Financial Health Score calculated?',
    'Is my financial data secure?',
    'How do I set up budget alerts?',
    'Can I export my data?',
    'What types of recommendations does the AI provide?',
    'How do I cancel my account?',
    "Why aren't my transactions showing up?",
  ],
  faqA: [
    "You can add transactions manually using the 'Add Transaction' form on your dashboard. For automatic bank integration, contact our support team.",
    'Your score is based on 5 factors: liquidity ratio (25%), savings habits (20%), debt management (25%), fee frequency (15%), and income stability (15%). The score updates automatically as you add new transactions.',
    'Yes! We use bank-level encryption (AES-256) for all data. Your information is never shared with third parties and is stored securely on our servers.',
    'Go to your Dashboard and look for budget recommendations from our AI coach. You can accept these to automatically create budget alerts, or manually set them in Account Settings.',
    'Yes! Go to Account Settings > Data & Privacy > Export My Data to download all your financial information in JSON format.',
    'Our AI analyzes your spending patterns to suggest budget optimizations, debt consolidation opportunities, subscription cleanups, savings goals, and investment recommendations.',
    'Go to Account Settings > Danger Zone > Delete Account. Note that this action is permanent and cannot be undone.',
    "Make sure you're logged in and adding transactions with the correct date format. If you're still having issues, try refreshing the page or contact support.",
  ],
  guideTitle: [
    'Getting Started Guide', 'Setting Up Budgets', 'Understanding Your Health Score',
    'AI Recommendations', 'Security & Privacy', 'Data Export & Backup',
  ],
  guideDesc: [
    'Learn the basics of MoneyManager', 'Create and manage your budgets effectively',
    'How to improve your financial health', 'Making the most of AI-powered insights',
    'Keeping your data safe and secure', 'Exporting and backing up your data',
  ],

  setTitle: 'Settings', setSub: 'Customize your MoneyManager experience',
  tabGeneral: 'General', tabNotifications: 'Notifications', tabPrivacy: 'Privacy', tabAdvanced: 'Advanced',
  setSaved: 'Settings saved successfully!', setSaveFailed: 'Failed to save settings. Please try again.',
  setResetConfirm: 'Are you sure you want to reset all settings to default values?',
  regional: 'Regional Settings', currency: 'Currency', dateFormat: 'Date Format', language: 'Language', timezone: 'Timezone',
  appearance: 'Appearance', theme: 'Theme', themeLight: 'Light', themeDark: 'Dark', themeAuto: 'Auto (System)',
  dashLayout: 'Dashboard Layout', layoutCompact: 'Compact', layoutDetailed: 'Detailed', layoutMinimal: 'Minimal',
  chartType: 'Default Chart Type', chartLine: 'Line Chart', chartBar: 'Bar Chart', chartPie: 'Pie Chart',
  defaultBehavior: 'Default Behavior', defTxType: 'Default Transaction Type', txExpense: 'Expense', txIncome: 'Income',
  catSort: 'Category Sort Order', sortAlpha: 'Alphabetical', sortFreq: 'Most Used First', sortCustom: 'Custom Order',
  finAlerts: 'Financial Alerts', budgetAlerts: 'Budget Alerts', budgetAlertsSub: "Get notified when you're close to budget limits",
  goalReminders: 'Goal Reminders', goalRemindersSub: 'Regular reminders about your financial goals',
  reports: 'Reports', weekly: 'Weekly Reports', weeklySub: "Summary of your week's financial activity",
  monthly: 'Monthly Reports', monthlySub: 'Detailed monthly financial analysis',
  secSystem: 'Security & System', secAlerts: 'Security Alerts', secAlertsSub: 'Important security notifications',
  marketing: 'Marketing Emails', marketingSub: 'Product updates and promotional content',
  delivery: 'Delivery Methods', push: 'Push Notifications', pushSub: 'In-app notifications',
  email: 'Email Notifications', emailSub: 'Notifications via email', sms: 'SMS Notifications', smsSub: 'Critical alerts via SMS',
  dataCollection: 'Data Collection', analyticsData: 'Analytics Data',
  analyticsSub: 'Help us improve by sharing usage analytics',
  marketingTracking: 'Marketing Tracking', marketingTrackingSub: 'Allow tracking for personalized marketing',
  shareAnon: 'Share Anonymous Data', shareAnonSub: 'Contribute to financial research (fully anonymized)',
  activityTracking: 'Activity Tracking', activityTrackingSub: 'Track app usage for better recommendations',
  profilePrivacy: 'Profile Privacy', profVisibility: 'Profile Visibility',
  visPrivate: 'Private', visFriends: 'Friends Only', visPublic: 'Public',
  visSub: 'Control who can see your profile information',
  privacyMatters: 'Your Privacy Matters',
  privacyText: 'We take your privacy seriously. All financial data is encrypted and never shared with third parties. You can export or delete your data at any time from Account Settings.',
  viewData: 'View Data Settings',
  dataMgmt: 'Data Management', exportAll: 'Export All Data', clearCache: 'Clear Cache', downloadBackup: 'Download Backup',
  resetOpts: 'Reset Options', resetAll: 'Reset All Settings', resetSub: 'Restore all settings to default values',
  devOpts: 'Developer Options', viewApi: 'View API Usage', debugLogs: 'Download Debug Logs', testNotif: 'Test Notifications',
  appInfo: 'App Information', version: 'Version:', lastUpdated: 'Last Updated:', build: 'Build:',
  cancel: 'Cancel', saving: 'Saving...', saveSettings: 'Save Settings',
};

const si: UserPagesText = {
  hdrProfile: 'පැතිකඩ සංස්කරණය', hdrProfileSub: 'ඔබේ පුද්ගලික තොරතුරු යාවත්කාලීන කරන්න',
  hdrHelp: 'උදව් සහ සහාය', hdrHelpSub: 'පිළිතුරු සොයන්න හෝ අපේ සහාය කණ්ඩායම අමතන්න',
  hdrSettings: 'සැකසුම්', hdrSettingsSub: 'යෙදුම් වින්‍යාසය',

  profTitle: 'පැතිකඩ සංස්කරණය', profSubtitle: 'ඔබේ පුද්ගලික තොරතුරු සහ මනාප කළමනාකරණය කරන්න',
  profPersonal: 'පුද්ගලික තොරතුරු', profFullName: 'සම්පූර්ණ නම *', profEmail: 'ඊමේල් ලිපිනය *',
  profPhone: 'දුරකථන අංකය', profDob: 'උපන් දිනය',
  profAdditional: 'අමතර විස්තර', profAddress: 'ලිපිනය', profOccupation: 'රැකියාව',
  profIncome: 'මාසික ආදායම (LKR)',
  profCancel: 'අවලංගු කරන්න', profSave: 'වෙනස්කම් සුරකින්න', profSaving: 'සුරකිමින්...',
  profUpdated: 'පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී!', profUpdateFailed: 'පැතිකඩ යාවත්කාලීන කිරීමට නොහැකි විය',
  profPlaceName: 'ඔබේ සම්පූර්ණ නම ඇතුළත් කරන්න', profPlaceEmail: 'ඔබේ ඊමේල් ලිපිනය ඇතුළත් කරන්න',
  profPlaceDob: 'ඔබේ උපන් දිනය තෝරන්න', profPlaceAddress: 'ඔබේ ලිපිනය ඇතුළත් කරන්න',
  profPlaceOcc: 'ඔබේ රැකියා තනතුර', profChangeAvatar: 'රූපය වෙනස් කරන්න',

  helpNavFaq: 'නිතර අසන ප්‍රශ්න', helpNavGuides: 'මාර්ගෝපදේශ', helpNavContact: 'සහාය අමතන්න',
  helpSearchPlaceholder: 'නිතර අසන ප්‍රශ්න සොයන්න...',
  helpNoResults: 'ප්‍රතිඵල හමු නොවීය', helpNoResultsSub: 'වෙනස් මූල පද උත්සාහ කරන්න හෝ අපේ සහාය කණ්ඩායම අමතන්න',
  helpGuidesTitle: 'පරිශීලක මාර්ගෝපදේශ සහ ඉගැන්වීම්', helpReadGuide: 'මාර්ගෝපදේශය කියවන්න →', helpResources: 'අතිරේක සම්පත්',
  helpTerms: 'සේවා කොන්දේසි', helpPrivacy: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය', helpApi: 'API ලේඛන', helpMobile: 'ජංගම යෙදුම් මාර්ගෝපදේශය',
  helpEmailSupport: 'ඊමේල් සහාය', helpResponse: 'පිළිතුරු කාලය: පැය 4-6',
  helpLiveChat: 'සජීවී කතාබස්', helpLiveChatSub: 'හදිසි ගැටලු සඳහා 24/7 ලබා ගත හැක', helpStartChat: 'කතාබස් ආරම්භ කරන්න',
  helpPhoneSupport: 'දුරකථන සහාය', helpPhoneHours: 'සඳුදා-සිකුරාදා: පෙ.ව. 9-ප.ව. 6',
  helpSubmitTitle: 'සහාය ටිකට්පතක් ඉදිරිපත් කරන්න', helpCategory: 'කාණ්ඩය', helpPriority: 'ප්‍රමුඛතාව',
  helpSubject: 'මාතෘකාව', helpMessage: 'පණිවිඩය',
  helpPlaceSubject: 'ඔබේ ගැටලුවේ කෙටි විස්තරය',
  helpPlaceMessage: 'ඔබේ ගැටලුව හෝ ප්‍රශ්නය පිළිබඳ විස්තරාත්මක තොරතුරු ලබා දෙන්න',
  helpCatGeneral: 'සාමාන්‍ය ප්‍රශ්නයක්', helpCatTechnical: 'තාක්ෂණික ගැටලුවක්', helpCatBilling: 'බිල්පත්',
  helpCatFeature: 'විශේෂාංග ඉල්ලීමක්', helpCatSecurity: 'ආරක්ෂක කරදරයක්',
  helpPriLow: 'අඩු', helpPriMedium: 'මධ්‍යම', helpPriHigh: 'ඉහළ',
  helpSubmitting: 'ඉදිරිපත් කරමින්...', helpSubmit: 'ටිකට්පත ඉදිරිපත් කරන්න',
  helpTicketOk: 'සහාය ටිකට්පත සාර්ථකව ඉදිරිපත් කරන ලදී! පැය 24ක් ඇතුළත අපි ඔබ වෙත පිළිතුරු දෙන්නෙමු.',
  helpTicketFail: 'ටිකට්පත ඉදිරිපත් කිරීමට නොහැකි විය. නැවත උත්සාහ කරන්න හෝ support@moneymanager.com වෙත ඊමේල් කරන්න',
  helpErrSubject: 'මාතෘකාව අවශ්‍යයි', helpErrMessage: 'පණිවිඩය අවශ්‍යයි', helpTicketNumber: 'ටිකට්පත් අංකය',
  faqQ: [
    'මගේ බැංකු ගිණුම මා එක් කරන්නේ කෙසේද?',
    'මගේ මූල්‍ය සෞඛ්‍ය ලකුණ ගණනය කරන්නේ කෙසේද?',
    'මගේ මූල්‍ය දත්ත ආරක්ෂිතද?',
    'අයවැය ඇඟවීම් මා සකසන්නේ කෙසේද?',
    'මගේ දත්ත නිර්යාත කළ හැකිද?',
    'AI මඟින් ලබා දෙන නිර්දේශ වර්ග මොනවාද?',
    'මගේ ගිණුම මා අවලංගු කරන්නේ කෙසේද?',
    'මගේ ගනුදෙනු පෙන්වන්නේ නැත්තේ ඇයි?',
  ],
  faqA: [
    "ඔබේ උපකරණ පුවරුවේ 'ගනුදෙනුවක් එක් කරන්න' ආකෘතිය භාවිතයෙන් ගනුදෙනු අතින් එක් කළ හැක. ස්වයංක්‍රීය බැංකු ඒකාබද්ධතාවය සඳහා, අපේ සහාය කණ්ඩායම අමතන්න.",
    'ඔබේ ලකුණ සාධක 5 මත පදනම් වේ: ද්‍රවශීලතා අනුපාතය (25%), ඉතිරි කිරීමේ පුරුදු (20%), ණය කළමනාකරණය (25%), ගාස්තු වාර ගණන (15%) සහ ආදායම් ස්ථාවරත්වය (15%). නව ගනුදෙනු එක් කරන විට ලකුණ ස්වයංක්‍රීයව යාවත්කාලීන වේ.',
    'ඔව්! අපි සියලු දත්ත සඳහා බැංකු මට්ටමේ සංකේතනය (AES-256) භාවිත කරමු. ඔබේ තොරතුරු කිසිවිටක තෙවන පාර්ශවයන්ට නොබෙදන අතර අපේ සේවාදායකවල ආරක්ෂිතව ගබඩා කෙරේ.',
    'ඔබේ උපකරණ පුවරුවට ගොස් අපේ AI උපදේශකයාගේ අයවැය නිර්දේශ බලන්න. ඒවා පිළිගෙන ස්වයංක්‍රීයව අයවැය ඇඟවීම් සෑදිය හැක, නැතහොත් ගිණුම් සැකසුම්වලින් අතින් සකසන්න.',
    'ඔව්! ගිණුම් සැකසුම් > දත්ත සහ පෞද්ගලිකත්වය > මගේ දත්ත නිර්යාත කරන්න වෙත ගොස් ඔබේ මූල්‍ය තොරතුරු සියල්ල JSON ආකෘතියෙන් බාගන්න.',
    'අපේ AI ඔබේ වියදම් රටා විශ්ලේෂණය කර අයවැය ප්‍රශස්තකරණය, ණය ඒකාබද්ධ කිරීමේ අවස්ථා, දායකත්ව පිරිසිදු කිරීම්, ඉතිරි කිරීමේ ඉලක්ක සහ ආයෝජන නිර්දේශ යෝජනා කරයි.',
    'ගිණුම් සැකසුම් > අනතුරු කලාපය > ගිණුම මකන්න වෙත යන්න. මෙම ක්‍රියාව ස්ථිර වන අතර අහෝසි කළ නොහැකි බව සලකන්න.',
    'ඔබ පිවිසී ඇති බවත් නිවැරදි දින ආකෘතියෙන් ගනුදෙනු එක් කරන බවත් සහතික කරගන්න. තවමත් ගැටලු ඇත්නම්, පිටුව නැවුම් කරන්න හෝ සහාය අමතන්න.',
  ],
  guideTitle: [
    'ආරම්භක මාර්ගෝපදේශය', 'අයවැය සැකසීම', 'ඔබේ සෞඛ්‍ය ලකුණ තේරුම් ගැනීම',
    'AI නිර්දේශ', 'ආරක්ෂාව සහ පෞද්ගලිකත්වය', 'දත්ත නිර්යාතය සහ උපස්ථය',
  ],
  guideDesc: [
    'MoneyManager හි මූලික කරුණු ඉගෙන ගන්න', 'ඔබේ අයවැය ඵලදායී ලෙස සාදා කළමනාකරණය කරන්න',
    'ඔබේ මූල්‍ය සෞඛ්‍ය වැඩිදියුණු කරන ආකාරය', 'AI බලයෙන් යුත් තීක්ෂ්ණ බුද්ධිය උපරිම ලෙස භාවිත කරන්න',
    'ඔබේ දත්ත ආරක්ෂිතව තබා ගන්න', 'ඔබේ දත්ත නිර්යාත කර උපස්ථය කරන්න',
  ],

  setTitle: 'සැකසුම්', setSub: 'ඔබේ MoneyManager අත්දැකීම අභිරුචිකරණය කරන්න',
  tabGeneral: 'සාමාන්‍ය', tabNotifications: 'දැනුම්දීම්', tabPrivacy: 'පෞද්ගලිකත්වය', tabAdvanced: 'උසස්',
  setSaved: 'සැකසුම් සාර්ථකව සුරකින ලදී!', setSaveFailed: 'සැකසුම් සුරැකීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.',
  setResetConfirm: 'සියලු සැකසුම් පෙරනිමි අගයන්ට යළි පිහිටුවීමට ඔබට විශ්වාසද?',
  regional: 'ප්‍රාදේශීය සැකසුම්', currency: 'මුදල් ඒකකය', dateFormat: 'දින ආකෘතිය', language: 'භාෂාව', timezone: 'වේලා කලාපය',
  appearance: 'පෙනුම', theme: 'තේමාව', themeLight: 'ආලෝක', themeDark: 'අඳුරු', themeAuto: 'ස්වයංක්‍රීය (පද්ධතිය)',
  dashLayout: 'උපකරණ පුවරු පිරිසැලසුම', layoutCompact: 'සංක්ෂිප්ත', layoutDetailed: 'විස්තරාත්මක', layoutMinimal: 'අවම',
  chartType: 'පෙරනිමි ප්‍රස්තාර වර්ගය', chartLine: 'රේඛා ප්‍රස්තාරය', chartBar: 'තීරු ප්‍රස්තාරය', chartPie: 'වටකුරු ප්‍රස්තාරය',
  defaultBehavior: 'පෙරනිමි හැසිරීම', defTxType: 'පෙරනිමි ගනුදෙනු වර්ගය', txExpense: 'වියදම', txIncome: 'ආදායම',
  catSort: 'කාණ්ඩ පෙළගැස්ම', sortAlpha: 'අකාරාදී', sortFreq: 'වැඩියෙන් භාවිත කළ පළමුව', sortCustom: 'අභිරුචි පෙළගැස්ම',
  finAlerts: 'මූල්‍ය ඇඟවීම්', budgetAlerts: 'අයවැය ඇඟවීම්', budgetAlertsSub: 'අයවැය සීමාවට ආසන්න වන විට දැනුම් දෙන්න',
  goalReminders: 'ඉලක්ක මතක් කිරීම්', goalRemindersSub: 'ඔබේ මූල්‍ය ඉලක්ක පිළිබඳ නිතර මතක් කිරීම්',
  reports: 'වාර්තා', weekly: 'සති වාර්තා', weeklySub: 'ඔබේ සතියේ මූල්‍ය ක්‍රියාකාරකම්වල සාරාංශය',
  monthly: 'මාසික වාර්තා', monthlySub: 'විස්තරාත්මක මාසික මූල්‍ය විශ්ලේෂණය',
  secSystem: 'ආරක්ෂාව සහ පද්ධතිය', secAlerts: 'ආරක්ෂක ඇඟවීම්', secAlertsSub: 'වැදගත් ආරක්ෂක දැනුම්දීම්',
  marketing: 'අලෙවි ඊමේල්', marketingSub: 'නිෂ්පාදන යාවත්කාලීන සහ ප්‍රවර්ධන අන්තර්ගතය',
  delivery: 'බෙදාහැරීමේ ක්‍රම', push: 'තල්ලු දැනුම්දීම්', pushSub: 'යෙදුම තුළ දැනුම්දීම්',
  email: 'ඊමේල් දැනුම්දීම්', emailSub: 'ඊමේල් හරහා දැනුම්දීම්', sms: 'SMS දැනුම්දීම්', smsSub: 'තීරණාත්මක ඇඟවීම් SMS හරහා',
  dataCollection: 'දත්ත එකතු කිරීම', analyticsData: 'විශ්ලේෂණ දත්ත',
  analyticsSub: 'භාවිත විශ්ලේෂණ බෙදා ගැනීමෙන් අපට වැඩිදියුණු කිරීමට උදවු කරන්න',
  marketingTracking: 'අලෙවි ලුහුබැඳීම', marketingTrackingSub: 'පුද්ගලීකරණය කළ අලෙවිය සඳහා ලුහුබැඳීමට ඉඩ දෙන්න',
  shareAnon: 'නිර්නාමික දත්ත බෙදා ගන්න', shareAnonSub: 'මූල්‍ය පර්යේෂණයට දායක වන්න (සම්පූර්ණයෙන් නිර්නාමික)',
  activityTracking: 'ක්‍රියාකාරකම් ලුහුබැඳීම', activityTrackingSub: 'වඩා හොඳ නිර්දේශ සඳහා යෙදුම් භාවිතය ලුහුබඳින්න',
  profilePrivacy: 'පැතිකඩ පෞද්ගලිකත්වය', profVisibility: 'පැතිකඩ දෘශ්‍යතාව',
  visPrivate: 'පෞද්ගලික', visFriends: 'මිතුරන්ට පමණි', visPublic: 'මහජනයාට',
  visSub: 'ඔබේ පැතිකඩ තොරතුරු බැලිය හැක්කේ කාටද යන්න පාලනය කරන්න',
  privacyMatters: 'ඔබේ පෞද්ගලිකත්වය වැදගත්ය',
  privacyText: 'අපි ඔබේ පෞද්ගලිකත්වය බරපතලව සලකමු. සියලු මූල්‍ය දත්ත සංකේතනය කර ඇති අතර තෙවන පාර්ශවයන් සමඟ කිසි විටෙකත් බෙදා ගන්නේ නැත. ගිණුම් සැකසුම්වලින් ඕනෑම වේලාවක ඔබේ දත්ත නිර්යාත කිරීමට හෝ මකා දැමීමට හැක.',
  viewData: 'දත්ත සැකසුම් බලන්න',
  dataMgmt: 'දත්ත කළමනාකරණය', exportAll: 'සියලු දත්ත නිර්යාත කරන්න', clearCache: 'හැඹිලිය හිස් කරන්න', downloadBackup: 'උපස්ථය බාගන්න',
  resetOpts: 'යළි පිහිටුවීමේ විකල්ප', resetAll: 'සියලු සැකසුම් යළි පිහිටුවන්න', resetSub: 'සියලු සැකසුම් පෙරනිමි අගයන්ට යළි පිහිටුවන්න',
  devOpts: 'සංවර්ධක විකල්ප', viewApi: 'API භාවිතය බලන්න', debugLogs: 'දෝෂ ලඝු-සටහන් බාගන්න', testNotif: 'දැනුම්දීම් පරීක්ෂා කරන්න',
  appInfo: 'යෙදුම් තොරතුරු', version: 'අනුවාදය:', lastUpdated: 'අවසන් යාවත්කාලීනය:', build: 'ගොඩනැගීම:',
  cancel: 'අවලංගු කරන්න', saving: 'සුරකිමින්...', saveSettings: 'සැකසුම් සුරකින්න',
};

const ta: UserPagesText = {
  hdrProfile: 'சுயவிவரத்தைத் திருத்து', hdrProfileSub: 'உங்கள் தனிப்பட்ட தகவலைப் புதுப்பிக்கவும்',
  hdrHelp: 'உதவி & ஆதரவு', hdrHelpSub: 'பதில்களைக் கண்டறியவும் அல்லது எங்கள் ஆதரவுக் குழுவைத் தொடர்புகொள்ளவும்',
  hdrSettings: 'அமைப்புகள்', hdrSettingsSub: 'பயன்பாட்டு கட்டமைப்பு',

  profTitle: 'சுயவிவரத்தைத் திருத்து', profSubtitle: 'உங்கள் தனிப்பட்ட தகவல் மற்றும் விருப்பங்களை நிர்வகிக்கவும்',
  profPersonal: 'தனிப்பட்ட தகவல்', profFullName: 'முழு பெயர் *', profEmail: 'மின்னஞ்சல் முகவரி *',
  profPhone: 'தொலைபேசி எண்', profDob: 'பிறந்த தேதி',
  profAdditional: 'கூடுதல் விவரங்கள்', profAddress: 'முகவரி', profOccupation: 'தொழில்',
  profIncome: 'மாத வருமானம் (LKR)',
  profCancel: 'ரத்துசெய்', profSave: 'மாற்றங்களைச் சேமி', profSaving: 'சேமிக்கிறது...',
  profUpdated: 'சுயவிவரம் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது!', profUpdateFailed: 'சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை',
  profPlaceName: 'உங்கள் முழு பெயரை உள்ளிடவும்', profPlaceEmail: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
  profPlaceDob: 'உங்கள் பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்', profPlaceAddress: 'உங்கள் முகவரியை உள்ளிடவும்',
  profPlaceOcc: 'உங்கள் வேலை பதவி', profChangeAvatar: 'படத்தை மாற்று',

  helpNavFaq: 'அடிக்கடி கேட்கப்படும் கேள்விகள்', helpNavGuides: 'வழிகாட்டிகள்', helpNavContact: 'ஆதரவைத் தொடர்புகொள்ள',
  helpSearchPlaceholder: 'அடிக்கடி கேட்கப்படும் கேள்விகளைத் தேடுக...',
  helpNoResults: 'முடிவுகள் எதுவும் கிடைக்கவில்லை', helpNoResultsSub: 'வேறு சொற்களை முயற்சிக்கவும் அல்லது எங்கள் ஆதரவுக் குழுவைத் தொடர்புகொள்ளவும்',
  helpGuidesTitle: 'பயனர் வழிகாட்டிகள் மற்றும் பயிற்சிகள்', helpReadGuide: 'வழிகாட்டியைப் படிக்கவும் →', helpResources: 'கூடுதல் வளங்கள்',
  helpTerms: 'சேவை விதிமுறைகள்', helpPrivacy: 'தனியுரிமைக் கொள்கை', helpApi: 'API ஆவணம்', helpMobile: 'மொபைல் பயன்பாட்டு வழிகாட்டி',
  helpEmailSupport: 'மின்னஞ்சல் ஆதரவு', helpResponse: 'பதில் நேரம்: 4-6 மணி நேரம்',
  helpLiveChat: 'நேரடி அரட்டை', helpLiveChatSub: 'அவசர சிக்கல்களுக்கு 24/7 கிடைக்கும்', helpStartChat: 'அரட்டையைத் தொடங்கு',
  helpPhoneSupport: 'தொலைபேசி ஆதரவு', helpPhoneHours: 'திங்கள்-வெள்ளி: காலை 9-மாலை 6',
  helpSubmitTitle: 'ஆதரவு டிக்கெட்டைச் சமர்ப்பிக்கவும்', helpCategory: 'வகை', helpPriority: 'முன்னுரிமை',
  helpSubject: 'தலைப்பு', helpMessage: 'செய்தி',
  helpPlaceSubject: 'உங்கள் சிக்கலின் சுருக்கமான விளக்கம்',
  helpPlaceMessage: 'உங்கள் சிக்கல் அல்லது கேள்வி பற்றிய விரிவான தகவலை வழங்கவும்',
  helpCatGeneral: 'பொதுவான கேள்வி', helpCatTechnical: 'தொழில்நுட்பச் சிக்கல்', helpCatBilling: 'கட்டணம்',
  helpCatFeature: 'அம்சக் கோரிக்கை', helpCatSecurity: 'பாதுகாப்பு கவலை',
  helpPriLow: 'குறைவு', helpPriMedium: 'நடுத்தரம்', helpPriHigh: 'அதிகம்',
  helpSubmitting: 'சமர்ப்பிக்கிறது...', helpSubmit: 'டிக்கெட்டைச் சமர்ப்பி',
  helpTicketOk: 'ஆதரவு டிக்கெட் வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டது! 24 மணி நேரத்திற்குள் உங்களைத் தொடர்புகொள்வோம்.',
  helpTicketFail: 'டிக்கெட்டைச் சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது support@moneymanager.com க்கு மின்னஞ்சல் அனுப்பவும்',
  helpErrSubject: 'தலைப்பு தேவை', helpErrMessage: 'செய்தி தேவை', helpTicketNumber: 'டிக்கெட் எண்',
  faqQ: [
    'என் வங்கிக் கணக்கை எவ்வாறு சேர்ப்பது?',
    'என் நிதி ஆரோக்கிய மதிப்பெண் எவ்வாறு கணக்கிடப்படுகிறது?',
    'என் நிதித் தரவு பாதுகாப்பானதா?',
    'பட்ஜெட் எச்சரிக்கைகளை எவ்வாறு அமைப்பது?',
    'என் தரவை ஏற்றுமதி செய்ய முடியுமா?',
    'AI எந்த வகையான பரிந்துரைகளை வழங்குகிறது?',
    'என் கணக்கை எவ்வாறு ரத்து செய்வது?',
    'என் பரிவர்த்தனைகள் ஏன் தோன்றவில்லை?',
  ],
  faqA: [
    "உங்கள் டாஷ்போர்டில் உள்ள 'பரிவர்த்தனையைச் சேர்' படிவத்தைப் பயன்படுத்தி பரிவர்த்தனைகளை கைமுறையாகச் சேர்க்கலாம். தானியங்கி வங்கி ஒருங்கிணைப்புக்கு, எங்கள் ஆதரவுக் குழுவைத் தொடர்புகொள்ளவும்.",
    'உங்கள் மதிப்பெண் 5 காரணிகளின் அடிப்படையில் அமைகிறது: பணப்புழக்க விகிதம் (25%), சேமிப்பு பழக்கங்கள் (20%), கடன் மேலாண்மை (25%), கட்டண அதிர்வெண் (15%) மற்றும் வருமான நிலைத்தன்மை (15%). புதிய பரிவர்த்தனைகளைச் சேர்க்கும்போது மதிப்பெண் தானாகப் புதுப்பிக்கப்படும்.',
    'ஆம்! எல்லாத் தரவுகளுக்கும் வங்கி-நிலை குறியாக்கத்தை (AES-256) பயன்படுத்துகிறோம். உங்கள் தகவல் மூன்றாம் தரப்பினருடன் ஒருபோதும் பகிரப்படுவதில்லை, எங்கள் சேவையகங்களில் பாதுகாப்பாகச் சேமிக்கப்படுகிறது.',
    'உங்கள் டாஷ்போர்டுக்குச் சென்று எங்கள் AI பயிற்சியாளரின் பட்ஜெட் பரிந்துரைகளைப் பாருங்கள். அவற்றை ஏற்றுக்கொண்டு பட்ஜெட் எச்சரிக்கைகளைத் தானாக உருவாக்கலாம், அல்லது கணக்கு அமைப்புகளில் கைமுறையாக அமைக்கலாம்.',
    'ஆம்! கணக்கு அமைப்புகள் > தரவு & தனியுரிமை > என் தரவை ஏற்றுமதி செய் என்பதற்குச் சென்று உங்கள் நிதித் தகவல் அனைத்தையும் JSON வடிவத்தில் பதிவிறக்கலாம்.',
    'உங்கள் செலவு முறைகளை AI பகுப்பாய்வு செய்து பட்ஜெட் மேம்படுத்தல்கள், கடன் ஒருங்கிணைப்பு வாய்ப்புகள், சந்தா சுத்தம் செய்தல், சேமிப்பு இலக்குகள் மற்றும் முதலீட்டு பரிந்துரைகளை பரிந்துரைக்கிறது.',
    'கணக்கு அமைப்புகள் > ஆபத்து மண்டலம் > கணக்கை நீக்கு என்பதற்குச் செல்லுங்கள். இந்தச் செயல் நிரந்தரமானது, திரும்பப் பெற முடியாது என்பதை கவனத்தில் கொள்ளுங்கள்.',
    'நீங்கள் உள்நுழைந்திருப்பதையும் சரியான தேதி வடிவத்தில் பரிவர்த்தனைகளைச் சேர்ப்பதையும் உறுதிசெய்யுங்கள். இன்னும் சிக்கல் இருந்தால், பக்கத்தைப் புதுப்பிக்கவும் அல்லது ஆதரவைத் தொடர்புகொள்ளவும்.',
  ],
  guideTitle: [
    'தொடக்க வழிகாட்டி', 'பட்ஜெட் அமைத்தல்', 'உங்கள் ஆரோக்கிய மதிப்பெண்ணைப் புரிந்துகொள்ளுதல்',
    'AI பரிந்துரைகள்', 'பாதுகாப்பு & தனியுரிமை', 'தரவு ஏற்றுமதி & காப்புப்பிரதி',
  ],
  guideDesc: [
    'MoneyManager இன் அடிப்படைகளைக் கற்றுக்கொள்ளுங்கள்', 'உங்கள் பட்ஜெட்டை திறம்பட உருவாக்கி நிர்வகிக்கவும்',
    'உங்கள் நிதி ஆரோக்கியத்தை மேம்படுத்துவது எப்படி', 'AI-இயங்கும் நுண்ணறிவுகளைச் சிறப்பாகப் பயன்படுத்துங்கள்',
    'உங்கள் தரவை பாதுகாப்பாக வைத்திருங்கள்', 'உங்கள் தரவை ஏற்றுமதி செய்து காப்புப்பிரதி எடுக்கவும்',
  ],

  setTitle: 'அமைப்புகள்', setSub: 'உங்கள் MoneyManager அனுபவத்தைத் தனிப்பயனாக்கவும்',
  tabGeneral: 'பொது', tabNotifications: 'அறிவிப்புகள்', tabPrivacy: 'தனியுரிமை', tabAdvanced: 'மேம்பட்டது',
  setSaved: 'அமைப்புகள் வெற்றிகரமாகச் சேமிக்கப்பட்டன!', setSaveFailed: 'அமைப்புகளைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  setResetConfirm: 'அனைத்து அமைப்புகளையும் இயல்புநிலை மதிப்புகளுக்கு மீட்டமைக்க விரும்புகிறீர்களா?',
  regional: 'பிராந்திய அமைப்புகள்', currency: 'நாணயம்', dateFormat: 'தேதி வடிவம்', language: 'மொழி', timezone: 'நேர மண்டலம்',
  appearance: 'தோற்றம்', theme: 'தீம்', themeLight: 'ஒளி', themeDark: 'இருள்', themeAuto: 'தானியங்கி (கணினி)',
  dashLayout: 'டாஷ்போர்டு அமைப்பு', layoutCompact: 'சுருக்கமான', layoutDetailed: 'விரிவான', layoutMinimal: 'குறைந்தபட்ச',
  chartType: 'இயல்புநிலை வரைபட வகை', chartLine: 'கோட்டு வரைபடம்', chartBar: 'பட்டை வரைபடம்', chartPie: 'வட்ட வரைபடம்',
  defaultBehavior: 'இயல்புநிலை நடத்தை', defTxType: 'இயல்புநிலை பரிவர்த்தனை வகை', txExpense: 'செலவு', txIncome: 'வருமானம்',
  catSort: 'வகை வரிசைப்படுத்தல்', sortAlpha: 'அகர வரிசை', sortFreq: 'அதிகம் பயன்படுத்தியது முதலில்', sortCustom: 'தனிப்பயன் வரிசை',
  finAlerts: 'நிதி எச்சரிக்கைகள்', budgetAlerts: 'பட்ஜெட் எச்சரிக்கைகள்', budgetAlertsSub: 'பட்ஜெட் வரம்புகளுக்கு அருகில் இருக்கும்போது அறிவிக்கப்படும்',
  goalReminders: 'இலக்கு நினைவூட்டல்கள்', goalRemindersSub: 'உங்கள் நிதி இலக்குகள் பற்றிய வழக்கமான நினைவூட்டல்கள்',
  reports: 'அறிக்கைகள்', weekly: 'வார அறிக்கைகள்', weeklySub: 'உங்கள் வாரத்தின் நிதி செயல்பாட்டுச் சுருக்கம்',
  monthly: 'மாத அறிக்கைகள்', monthlySub: 'விரிவான மாதாந்திர நிதி பகுப்பாய்வு',
  secSystem: 'பாதுகாப்பு & கணினி', secAlerts: 'பாதுகாப்பு எச்சரிக்கைகள்', secAlertsSub: 'முக்கியமான பாதுகாப்பு அறிவிப்புகள்',
  marketing: 'சந்தைப்படுத்தல் மின்னஞ்சல்கள்', marketingSub: 'தயாரிப்பு புதுப்பிப்புகள் மற்றும் விளம்பர உள்ளடக்கம்',
  delivery: 'அனுப்பும் முறைகள்', push: 'புஷ் அறிவிப்புகள்', pushSub: 'பயன்பாட்டிற்குள் அறிவிப்புகள்',
  email: 'மின்னஞ்சல் அறிவிப்புகள்', emailSub: 'மின்னஞ்சல் வழியாக அறிவிப்புகள்', sms: 'SMS அறிவிப்புகள்', smsSub: 'முக்கிய எச்சரிக்கைகள் SMS மூலம்',
  dataCollection: 'தரவு சேகரிப்பு', analyticsData: 'பகுப்பாய்வு தரவு',
  analyticsSub: 'பயன்பாட்டுப் பகுப்பாய்வைப் பகிர்ந்து எங்களுக்கு உதவுங்கள்',
  marketingTracking: 'சந்தைப்படுத்தல் கண்காணிப்பு', marketingTrackingSub: 'தனிப்பயன் சந்தைப்படுத்தலுக்கான கண்காணிப்பை அனுமதிக்கவும்',
  shareAnon: 'அநாமதேய தரவைப் பகிரவும்', shareAnonSub: 'நிதி ஆராய்ச்சிக்கு பங்களிக்கவும் (முழுமையாக அநாமதேயம்)',
  activityTracking: 'செயல்பாட்டு கண்காணிப்பு', activityTrackingSub: 'சிறந்த பரிந்துரைகளுக்காக பயன்பாட்டு பயன்பாட்டைக் கண்காணிக்கவும்',
  profilePrivacy: 'சுயவிவர தனியுரிமை', profVisibility: 'சுயவிவர தெரிவுநிலை',
  visPrivate: 'தனிப்பட்டது', visFriends: 'நண்பர்கள் மட்டும்', visPublic: 'பொது',
  visSub: 'உங்கள் சுயவிவரத் தகவலை யார் பார்க்கலாம் என்பதைக் கட்டுப்படுத்தவும்',
  privacyMatters: 'உங்கள் தனியுரிமை முக்கியம்',
  privacyText: 'உங்கள் தனியுரிமையை நாங்கள் தீவிரமாகக் கருதுகிறோம். அனைத்து நிதித் தரவும் குறியாக்கம் செய்யப்பட்டு மூன்றாம் தரப்பினருடன் ஒருபோதும் பகிரப்படுவதில்லை. கணக்கு அமைப்புகளிலிருந்து எந்த நேரத்திலும் உங்கள் தரவை ஏற்றுமதி செய்யலாம் அல்லது நீக்கலாம்.',
  viewData: 'தரவு அமைப்புகளைப் பார்',
  dataMgmt: 'தரவு மேலாண்மை', exportAll: 'அனைத்து தரவையும் ஏற்றுமதி செய்', clearCache: 'தற்காலிக சேமிப்பை அழி', downloadBackup: 'காப்புப்பிரதியைப் பதிவிறக்கு',
  resetOpts: 'மீட்டமைப்பு விருப்பங்கள்', resetAll: 'அனைத்து அமைப்புகளையும் மீட்டமை', resetSub: 'அனைத்து அமைப்புகளையும் இயல்புநிலை மதிப்புகளுக்கு மீட்டமைக்கவும்',
  devOpts: 'டெவலப்பர் விருப்பங்கள்', viewApi: 'API பயன்பாட்டைக் காண்', debugLogs: 'பிழைத்திருத்த பதிவுகளைப் பதிவிறக்கு', testNotif: 'அறிவிப்புகளைச் சோதி',
  appInfo: 'பயன்பாட்டுத் தகவல்', version: 'பதிப்பு:', lastUpdated: 'கடைசியாகப் புதுப்பிக்கப்பட்டது:', build: 'உருவாக்கம்:',
  cancel: 'ரத்துசெய்', saving: 'சேமிக்கிறது...', saveSettings: 'அமைப்புகளைச் சேமி',
};

export const USER_T: Record<AdminLang, UserPagesText> = { en, si, ta };
