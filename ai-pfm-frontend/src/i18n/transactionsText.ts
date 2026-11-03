// Text for the Transactions page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface TransactionsText {
  title: string; subtitle: string;
  refresh: string; refreshAria: string; add: string;
  searchPlaceholder: string; searchAria: string;
  filterTypeAria: string; filterCategoryAria: string;
  allTypes: string; income: string; expense: string; allCategories: string;
  colDate: string; colDescription: string; colCategory: string; colAmount: string; colActions: string;
  noTransactions: string; noMatch: string;
  recurring: string; anomaly: string;
  edit: string; delete: string; deleting: string;
  addTitle: string; editTitle: string;
  confirmDeleteTitle: string; close: string;
  confirmDeleteText: string; cancel: string;
  transactionOne: string; transactionMany: string;
  syncFailed: string; syncFailedGeneric: string; deleteFailed: string;
}

const en: TransactionsText = {
  title: 'All transactions',
  subtitle: 'Search, filter and edit your history',
  refresh: 'Refresh data',
  refreshAria: 'Refresh data',
  add: 'Add',
  searchPlaceholder: 'Search description or category',
  searchAria: 'Search transactions',
  filterTypeAria: 'Filter by type',
  filterCategoryAria: 'Filter by category',
  allTypes: 'All types',
  income: 'Income',
  expense: 'Expense',
  allCategories: 'All categories',
  colDate: 'Date',
  colDescription: 'Description',
  colCategory: 'Category',
  colAmount: 'Amount',
  colActions: 'Actions',
  noTransactions: 'No transactions yet.',
  noMatch: 'No transactions match your filters.',
  recurring: 'Recurring',
  anomaly: 'Anomaly',
  edit: 'Edit',
  delete: 'Delete',
  deleting: 'Deleting...',
  addTitle: 'Add Transaction',
  editTitle: 'Edit Transaction',
  confirmDeleteTitle: 'Confirm Deletion',
  close: 'Close',
  confirmDeleteText: 'Are you sure you want to delete this transaction? This action cannot be undone.',
  cancel: 'Cancel',
  transactionOne: 'transaction',
  transactionMany: 'transactions',
  syncFailed: 'Sync failed: {msg}',
  syncFailedGeneric: 'Sync failed. Please try again.',
  deleteFailed: 'Failed to delete transaction. Please try again.',
};

const si: TransactionsText = {
  title: 'සියලු ගනුදෙනු',
  subtitle: 'ඔබේ ඉතිහාසය සොයන්න, පෙරහන් කර සංස්කරණය කරන්න',
  refresh: 'දත්ත නැවුම් කරන්න',
  refreshAria: 'දත්ත නැවුම් කරන්න',
  add: 'එකතු කරන්න',
  searchPlaceholder: 'විස්තරය හෝ කාණ්ඩය සොයන්න',
  searchAria: 'ගනුදෙනු සොයන්න',
  filterTypeAria: 'වර්ගය අනුව පෙරන්න',
  filterCategoryAria: 'කාණ්ඩය අනුව පෙරන්න',
  allTypes: 'සියලු වර්ග',
  income: 'ආදායම',
  expense: 'වියදම',
  allCategories: 'සියලු කාණ්ඩ',
  colDate: 'දිනය',
  colDescription: 'විස්තරය',
  colCategory: 'කාණ්ඩය',
  colAmount: 'මුදල',
  colActions: 'ක්‍රියා',
  noTransactions: 'තවම ගනුදෙනු නැත.',
  noMatch: 'ඔබේ පෙරහන්වලට ගැලපෙන ගනුදෙනු නැත.',
  recurring: 'නිතර',
  anomaly: 'අසාමාන්‍ය',
  edit: 'සංස්කරණය',
  delete: 'මකන්න',
  deleting: 'මකමින්...',
  addTitle: 'ගනුදෙනුවක් එකතු කරන්න',
  editTitle: 'ගනුදෙනුව සංස්කරණය කරන්න',
  confirmDeleteTitle: 'මකීම තහවුරු කරන්න',
  close: 'වසන්න',
  confirmDeleteText: 'මෙම ගනුදෙනුව මකා දැමීමට ඔබට විශ්වාසද? මෙය අහෝසි කළ නොහැක.',
  cancel: 'අවලංගු කරන්න',
  transactionOne: 'ගනුදෙනුව',
  transactionMany: 'ගනුදෙනු',
  syncFailed: 'සමමුහුර්ත කිරීම අසාර්ථකයි: {msg}',
  syncFailedGeneric: 'සමමුහුර්ත කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  deleteFailed: 'ගනුදෙනුව මැකීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
};

const ta: TransactionsText = {
  title: 'அனைத்து பரிவர்த்தனைகளும்',
  subtitle: 'உங்கள் வரலாற்றைத் தேடவும், வடிகட்டவும், திருத்தவும்',
  refresh: 'தரவைப் புதுப்பிக்கவும்',
  refreshAria: 'தரவைப் புதுப்பிக்கவும்',
  add: 'சேர்',
  searchPlaceholder: 'விளக்கம் அல்லது வகையைத் தேடவும்',
  searchAria: 'பரிவர்த்தனைகளைத் தேடவும்',
  filterTypeAria: 'வகையின்படி வடிகட்டவும்',
  filterCategoryAria: 'பிரிவின்படி வடிகட்டவும்',
  allTypes: 'எல்லா வகைகளும்',
  income: 'வருமானம்',
  expense: 'செலவு',
  allCategories: 'எல்லா பிரிவுகளும்',
  colDate: 'தேதி',
  colDescription: 'விளக்கம்',
  colCategory: 'பிரிவு',
  colAmount: 'தொகை',
  colActions: 'செயல்கள்',
  noTransactions: 'இன்னும் பரிவர்த்தனைகள் இல்லை.',
  noMatch: 'உங்கள் வடிகட்டிகளுக்கு பொருந்தும் பரிவர்த்தனைகள் இல்லை.',
  recurring: 'தொடர்',
  anomaly: 'முரண்பாடு',
  edit: 'திருத்து',
  delete: 'நீக்கு',
  deleting: 'நீக்கப்படுகிறது...',
  addTitle: 'பரிவர்த்தனையைச் சேர்க்கவும்',
  editTitle: 'பரிவர்த்தனையைத் திருத்தவும்',
  confirmDeleteTitle: 'நீக்குதலை உறுதிப்படுத்தவும்',
  close: 'மூடு',
  confirmDeleteText: 'இந்தப் பரிவர்த்தனையை நீக்க விரும்புகிறீர்களா? இதை மாற்ற முடியாது.',
  cancel: 'ரத்து செய்',
  transactionOne: 'பரிவர்த்தனை',
  transactionMany: 'பரிவர்த்தனைகள்',
  syncFailed: 'ஒத்திசைவு தோல்வியடைந்தது: {msg}',
  syncFailedGeneric: 'ஒத்திசைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
  deleteFailed: 'பரிவர்த்தனையை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
};

export const TRANSACTIONS_T: Record<AdminLang, TransactionsText> = { en, si, ta };
