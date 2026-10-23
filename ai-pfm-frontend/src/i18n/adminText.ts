import { useEffect, useState } from 'react';

// Admin portal text in the three languages the app supports.
// Keys are shared, so TypeScript fails the build if a language is missing one.
// Data values (config keys, audit action codes, user emails) are not translated.

export type AdminLang = 'en' | 'si' | 'ta';

export interface AdminText {
  hdrDashboard: string; hdrDashboardSub: string;
  hdrUsers: string; hdrUsersSub: string;
  hdrConfig: string; hdrConfigSub: string;
  hdrAudit: string; hdrAuditSub: string;
  hdrReports: string; hdrReportsSub: string;

  dashSubtitle: string;
  statTotalUsers: string; statActiveUsers: string; statDisabledUsers: string; statConfigKeys: string;
  sectionUsers: string; sectionConfig: string;

  colName: string; colEmail: string; colRole: string; colStatus: string; colActions: string;
  colKey: string; colType: string; colValue: string; colSegment: string; colJoined: string;
  colDescription: string; colTime: string; colActor: string; colEvent: string;
  colResource: string; colDetails: string; colSeverity: string;

  btnDisable: string; btnEnable: string; btnActivate: string; btnDeactivate: string;
  statusActive: string; statusDisabled: string; statusInactive: string;

  roleAdmin: string; roleOperations: string; roleOps: string; roleManager: string;
  roleCustomer: string; roleUser: string;
  segPremium: string; segStandard: string; segBasic: string;

  usersSubtitle: string; statTotal: string; statActive: string; statDisabled: string; statPremium: string;
  searchUsers: string; noUsers: string;
  filterAllRoles: string; filterCustomer: string; filterAdmin: string; filterOps: string; filterManager: string;

  configSubtitle: string; statTotalKeys: string; statInactive: string; statAiKeys: string;
  filterAllTypes: string; typeFeature: string; typeThreshold: string; typeAi: string; typeSystem: string;

  auditSubtitle: string; statTotalEvents: string; statCritical: string; statWarnings: string; statInfo: string;
  searchAudit: string; filterAll: string; sevInfo: string; sevWarning: string; sevCritical: string; noLogs: string;
}

const en: AdminText = {
  hdrDashboard: 'Admin Dashboard', hdrDashboardSub: 'System overview',
  hdrUsers: 'User Management', hdrUsersSub: 'Manage platform users',
  hdrConfig: 'System Configuration', hdrConfigSub: 'Platform settings',
  hdrAudit: 'Audit Logs', hdrAuditSub: 'System activity history',
  hdrReports: 'Reports & Analytics', hdrReportsSub: 'Platform metrics',

  dashSubtitle: 'Manage users, roles, and configuration with audit-friendly toggles.',
  statTotalUsers: 'Total Users', statActiveUsers: 'Active Users', statDisabledUsers: 'Disabled Users', statConfigKeys: 'Config Keys',
  sectionUsers: 'Users', sectionConfig: 'Configuration',

  colName: 'Name', colEmail: 'Email', colRole: 'Role', colStatus: 'Status', colActions: 'Actions',
  colKey: 'Key', colType: 'Type', colValue: 'Value', colSegment: 'Segment', colJoined: 'Joined',
  colDescription: 'Description', colTime: 'Time', colActor: 'Actor', colEvent: 'Action',
  colResource: 'Resource', colDetails: 'Details', colSeverity: 'Severity',

  btnDisable: 'Disable', btnEnable: 'Enable', btnActivate: 'Activate', btnDeactivate: 'Deactivate',
  statusActive: 'active', statusDisabled: 'disabled', statusInactive: 'inactive',

  roleAdmin: 'Admin', roleOperations: 'Operations', roleOps: 'Ops', roleManager: 'Manager',
  roleCustomer: 'Customer', roleUser: 'User',
  segPremium: 'Premium', segStandard: 'Standard', segBasic: 'Basic',

  usersSubtitle: 'View, enable, disable and manage all platform users',
  statTotal: 'Total Users', statActive: 'Active', statDisabled: 'Disabled', statPremium: 'Premium',
  searchUsers: 'Search by name or email...', noUsers: 'No users match your search',
  filterAllRoles: 'All Roles', filterCustomer: 'Customer', filterAdmin: 'Admin', filterOps: 'Ops', filterManager: 'Manager',

  configSubtitle: 'Manage feature flags, AI thresholds and system parameters',
  statTotalKeys: 'Total Keys', statInactive: 'Inactive', statAiKeys: 'AI Keys',
  filterAllTypes: 'All Types', typeFeature: 'Feature', typeThreshold: 'Threshold', typeAi: 'AI', typeSystem: 'System',

  auditSubtitle: 'Full activity trail: all admin, ops, and system actions',
  statTotalEvents: 'Total Events', statCritical: 'Critical', statWarnings: 'Warnings', statInfo: 'Info',
  searchAudit: 'Search actor, action or details...', filterAll: 'All',
  sevInfo: 'Info', sevWarning: 'Warning', sevCritical: 'Critical', noLogs: 'No logs match your filter',
};

const si: AdminText = {
  hdrDashboard: 'පරිපාලන උපකරණ පුවරුව', hdrDashboardSub: 'පද්ධතිය පිළිබඳ දළ විශ්ලේෂණය',
  hdrUsers: 'පරිශීලක කළමනාකරණය', hdrUsersSub: 'වේදිකාවේ පරිශීලකයන් කළමනාකරණය කරන්න',
  hdrConfig: 'පද්ධති වින්‍යාසය', hdrConfigSub: 'වේදිකා සැකසුම්',
  hdrAudit: 'විගණන ලඝු-සටහන්', hdrAuditSub: 'පද්ධති ක්‍රියාකාරකම් ඉතිහාසය',
  hdrReports: 'වාර්තා සහ විශ්ලේෂණ', hdrReportsSub: 'වේදිකා මිනුම්',

  dashSubtitle: 'විගණනයට හිතකර ස්විච් මගින් පරිශීලකයන්, භූමිකා සහ වින්‍යාසය කළමනාකරණය කරන්න.',
  statTotalUsers: 'මුළු පරිශීලකයන්', statActiveUsers: 'සක්‍රිය පරිශීලකයන්', statDisabledUsers: 'අක්‍රිය පරිශීලකයන්', statConfigKeys: 'වින්‍යාස යතුරු',
  sectionUsers: 'පරිශීලකයන්', sectionConfig: 'වින්‍යාසය',

  colName: 'නම', colEmail: 'ඊමේල්', colRole: 'භූමිකාව', colStatus: 'තත්ත්වය', colActions: 'ක්‍රියා',
  colKey: 'යතුර', colType: 'වර්ගය', colValue: 'අගය', colSegment: 'ඛණ්ඩය', colJoined: 'එක් වූ දිනය',
  colDescription: 'විස්තරය', colTime: 'වේලාව', colActor: 'ක්‍රියාකරු', colEvent: 'ක්‍රියාව',
  colResource: 'සම්පත', colDetails: 'විස්තර', colSeverity: 'බරපතලකම',

  btnDisable: 'අක්‍රිය කරන්න', btnEnable: 'සක්‍රිය කරන්න', btnActivate: 'සක්‍රිය කරන්න', btnDeactivate: 'අක්‍රිය කරන්න',
  statusActive: 'සක්‍රිය', statusDisabled: 'අක්‍රිය', statusInactive: 'අක්‍රිය',

  roleAdmin: 'පරිපාලක', roleOperations: 'මෙහෙයුම්', roleOps: 'මෙහෙයුම්', roleManager: 'කළමනාකරු',
  roleCustomer: 'පාරිභෝගික', roleUser: 'පරිශීලක',
  segPremium: 'ප්‍රිමියම්', segStandard: 'සම්මත', segBasic: 'මූලික',

  usersSubtitle: 'වේදිකාවේ සියලු පරිශීලකයන් බලන්න, සක්‍රිය, අක්‍රිය සහ කළමනාකරණය කරන්න',
  statTotal: 'මුළු පරිශීලකයන්', statActive: 'සක්‍රිය', statDisabled: 'අක්‍රිය', statPremium: 'ප්‍රිමියම්',
  searchUsers: 'නම හෝ ඊමේල් මගින් සොයන්න...', noUsers: 'ඔබේ සෙවුමට ගැළපෙන පරිශීලකයන් නැත',
  filterAllRoles: 'සියලු භූමිකා', filterCustomer: 'පාරිභෝගික', filterAdmin: 'පරිපාලක', filterOps: 'මෙහෙයුම්', filterManager: 'කළමනාකරු',

  configSubtitle: 'විශේෂාංග ධජ, AI සීමා සහ පද්ධති පරාමිති කළමනාකරණය කරන්න',
  statTotalKeys: 'මුළු යතුරු', statInactive: 'අක්‍රිය', statAiKeys: 'AI යතුරු',
  filterAllTypes: 'සියලු වර්ග', typeFeature: 'විශේෂාංග', typeThreshold: 'සීමාව', typeAi: 'AI', typeSystem: 'පද්ධතිය',

  auditSubtitle: 'සම්පූර්ණ ක්‍රියාකාරකම් වාර්තාව: සියලු පරිපාලක, මෙහෙයුම් සහ පද්ධති ක්‍රියා',
  statTotalEvents: 'මුළු සිදුවීම්', statCritical: 'බරපතල', statWarnings: 'අනතුරු ඇඟවීම්', statInfo: 'තොරතුරු',
  searchAudit: 'ක්‍රියාකරු, ක්‍රියාව හෝ විස්තර සොයන්න...', filterAll: 'සියල්ල',
  sevInfo: 'තොරතුරු', sevWarning: 'අනතුරු ඇඟවීම', sevCritical: 'බරපතල', noLogs: 'ඔබේ පෙරහනට ගැළපෙන ලඝු-සටහන් නැත',
};

const ta: AdminText = {
  hdrDashboard: 'நிர்வாக டாஷ்போர்டு', hdrDashboardSub: 'கணினி கண்ணோட்டம்',
  hdrUsers: 'பயனர் நிர்வாகம்', hdrUsersSub: 'தளப் பயனர்களை நிர்வகிக்கவும்',
  hdrConfig: 'கணினி கட்டமைப்பு', hdrConfigSub: 'தள அமைப்புகள்',
  hdrAudit: 'தணிக்கை பதிவுகள்', hdrAuditSub: 'கணினி செயல்பாட்டு வரலாறு',
  hdrReports: 'அறிக்கைகள் மற்றும் பகுப்பாய்வு', hdrReportsSub: 'தள அளவீடுகள்',

  dashSubtitle: 'தணிக்கைக்கு ஏற்ற மாற்றுகளுடன் பயனர்கள், பாத்திரங்கள் மற்றும் கட்டமைப்பை நிர்வகிக்கவும்.',
  statTotalUsers: 'மொத்த பயனர்கள்', statActiveUsers: 'செயலில் உள்ள பயனர்கள்', statDisabledUsers: 'முடக்கப்பட்ட பயனர்கள்', statConfigKeys: 'கட்டமைப்பு விசைகள்',
  sectionUsers: 'பயனர்கள்', sectionConfig: 'கட்டமைப்பு',

  colName: 'பெயர்', colEmail: 'மின்னஞ்சல்', colRole: 'பாத்திரம்', colStatus: 'நிலை', colActions: 'செயல்கள்',
  colKey: 'விசை', colType: 'வகை', colValue: 'மதிப்பு', colSegment: 'பிரிவு', colJoined: 'சேர்ந்த தேதி',
  colDescription: 'விளக்கம்', colTime: 'நேரம்', colActor: 'செய்தவர்', colEvent: 'செயல்',
  colResource: 'வளம்', colDetails: 'விவரங்கள்', colSeverity: 'தீவிரம்',

  btnDisable: 'முடக்கு', btnEnable: 'இயக்கு', btnActivate: 'செயல்படுத்து', btnDeactivate: 'செயலிழக்கச் செய்',
  statusActive: 'செயலில்', statusDisabled: 'முடக்கப்பட்டது', statusInactive: 'செயலற்றது',

  roleAdmin: 'நிர்வாகி', roleOperations: 'செயல்பாடுகள்', roleOps: 'செயல்பாடு', roleManager: 'மேலாளர்',
  roleCustomer: 'வாடிக்கையாளர்', roleUser: 'பயனர்',
  segPremium: 'பிரீமியம்', segStandard: 'நிலையான', segBasic: 'அடிப்படை',

  usersSubtitle: 'தளத்தின் அனைத்து பயனர்களையும் பார்க்கவும், இயக்கவும், முடக்கவும், நிர்வகிக்கவும்',
  statTotal: 'மொத்த பயனர்கள்', statActive: 'செயலில்', statDisabled: 'முடக்கப்பட்டது', statPremium: 'பிரீமியம்',
  searchUsers: 'பெயர் அல்லது மின்னஞ்சல் மூலம் தேடுக...', noUsers: 'தேடலுக்குப் பொருந்தும் பயனர்கள் இல்லை',
  filterAllRoles: 'அனைத்து பாத்திரங்கள்', filterCustomer: 'வாடிக்கையாளர்', filterAdmin: 'நிர்வாகி', filterOps: 'செயல்பாடு', filterManager: 'மேலாளர்',

  configSubtitle: 'அம்ச கொடிகள், AI வரம்புகள் மற்றும் கணினி அளவுருக்களை நிர்வகிக்கவும்',
  statTotalKeys: 'மொத்த விசைகள்', statInactive: 'செயலற்றவை', statAiKeys: 'AI விசைகள்',
  filterAllTypes: 'அனைத்து வகைகள்', typeFeature: 'அம்சம்', typeThreshold: 'வரம்பு', typeAi: 'AI', typeSystem: 'கணினி',

  auditSubtitle: 'முழு செயல்பாட்டு தடம்: அனைத்து நிர்வாக, செயல்பாட்டு மற்றும் கணினி செயல்கள்',
  statTotalEvents: 'மொத்த நிகழ்வுகள்', statCritical: 'தீவிரமான', statWarnings: 'எச்சரிக்கைகள்', statInfo: 'தகவல்',
  searchAudit: 'செய்தவர், செயல் அல்லது விவரங்களைத் தேடுக...', filterAll: 'அனைத்தும்',
  sevInfo: 'தகவல்', sevWarning: 'எச்சரிக்கை', sevCritical: 'தீவிரமான', noLogs: 'உங்கள் வடிகட்டிக்குப் பொருந்தும் பதிவுகள் இல்லை',
};

export const ADMIN_T: Record<AdminLang, AdminText> = { en, si, ta };

// Returns the current language and updates when the header switcher changes it.
export const useAdminLang = (): AdminLang => {
  const [lang, setLang] = useState<AdminLang>(() => {
    const saved = localStorage.getItem('lang');
    return saved === 'si' || saved === 'ta' ? saved : 'en';
  });

  useEffect(() => {
    const onLang = (e: Event) => {
      const next = (e as CustomEvent).detail;
      setLang(next === 'si' || next === 'ta' ? next : 'en');
    };
    window.addEventListener('lang-changed', onLang);
    return () => window.removeEventListener('lang-changed', onLang);
  }, []);

  return lang;
};
