// Text for the Dashboard, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface DashboardText {
  welcomeBack: string;
  balanceTitle: string; balanceSub: string;
  balance: string; incomeThisMonth: string; expensesThisMonth: string;
  incomeLabel: string; expensesLabel: string;
  noIncomeYet: string; noCardsAdded: string;
  txCount: string; txCountOne: string;
  cardCount: string; cardCountOne: string;
  netSaved: string; availableCredit: string; savingsRate: string;
  unavailable: string; noScoreYet: string; couldNotLoadScore: string;
  financialHealth: string; basedOn30: string; viewDetailedHealth: string;
  score: string; savings: string; risk: string;
  recentTransactions: string; latestActivities: string;
  syncTitle: string; syncAria: string; syncing: string; sync: string;
  syncFailed: string; syncFailedGeneric: string;
  loadingTransactions: string; noTransactionsYet: string;
  subscriptionsTitle: string; recurringDetected: string; viewCashFlow: string;
  openAiCoach: string; openAiAria: string;
  recurringSubscriptions: string; detectedFromHistory: string; noneFound: string;
  spendingTrends: string; loadingCharts: string; viewSmartBudgets: string; samplePreview: string;
}

const en: DashboardText = {
  welcomeBack: 'Welcome back',
  balanceTitle: 'Balance Summary',
  balanceSub: "All recorded transactions, and this month's totals",
  balance: 'Balance',
  incomeThisMonth: 'Income this month',
  expensesThisMonth: 'Expenses this month',
  incomeLabel: 'Income · {month}',
  expensesLabel: 'Expenses · {month}',
  noIncomeYet: 'No income yet',
  noCardsAdded: 'No cards added',
  txCount: '{n} transactions',
  txCountOne: '{n} transaction',
  cardCount: '{n} cards',
  cardCountOne: '{n} card',
  netSaved: 'Net saved',
  availableCredit: 'Available credit',
  savingsRate: 'Savings rate {n}%',
  unavailable: 'Unavailable',
  noScoreYet: 'No score yet',
  couldNotLoadScore: 'Could not load your score. Please refresh the page.',
  financialHealth: 'Financial Health',
  basedOn30: 'Based on the last 30 days',
  viewDetailedHealth: 'View detailed financial health',
  score: 'Score',
  savings: 'Savings',
  risk: 'Risk',
  recentTransactions: 'Recent Transactions',
  latestActivities: 'Latest {n} activities',
  syncTitle: 'Sync latest bank transactions',
  syncAria: 'Sync bank transactions',
  syncing: 'Syncing…',
  sync: 'Sync',
  syncFailed: 'Sync failed: {msg}',
  syncFailedGeneric: 'Sync failed. Please try again.',
  loadingTransactions: 'Loading transactions…',
  noTransactionsYet: 'No transactions yet. Add your first transaction to get started.',
  subscriptionsTitle: 'Subscriptions',
  recurringDetected: 'Recurring charges detected',
  viewCashFlow: 'View cash flow and subscriptions',
  openAiCoach: 'AI Coach',
  openAiAria: 'Open AI Assistant',
  recurringSubscriptions: 'Recurring Subscriptions',
  detectedFromHistory: 'Detected from your transaction history.',
  noneFound: 'None found',
  spendingTrends: 'Spending Trends',
  loadingCharts: 'Loading charts…',
  viewSmartBudgets: 'View smart budgets',
  samplePreview: 'Sample Preview',
};

const si: DashboardText = {
  welcomeBack: 'ආයුබෝවන්',
  balanceTitle: 'ශේෂ සාරාංශය',
  balanceSub: 'සියලු වාර්තා කළ ගනුදෙනු සහ මෙම මාසයේ එකතුව',
  balance: 'ශේෂය',
  incomeThisMonth: 'මෙම මාසයේ ආදායම',
  expensesThisMonth: 'මෙම මාසයේ වියදම්',
  incomeLabel: 'ආදායම · {month}',
  expensesLabel: 'වියදම් · {month}',
  noIncomeYet: 'තවම ආදායමක් නැත',
  noCardsAdded: 'කාඩ්පත් එකතු කර නැත',
  txCount: 'ගනුදෙනු {n}',
  txCountOne: 'ගනුදෙනු {n}',
  cardCount: 'කාඩ්පත් {n}',
  cardCountOne: 'කාඩ්පත {n}',
  netSaved: 'ඉතිරි කළ මුදල',
  availableCredit: 'ලබාගත හැකි ණය',
  savingsRate: 'ඉතිරි කිරීමේ අනුපාතය {n}%',
  unavailable: 'ලබා ගත නොහැක',
  noScoreYet: 'තවම ලකුණු නැත',
  couldNotLoadScore: 'ඔබේ ලකුණු පූරණය කළ නොහැකි විය. කරුණාකර පිටුව නැවුම් කරන්න.',
  financialHealth: 'මූල්‍ය සෞඛ්‍යය',
  basedOn30: 'අවසන් දින 30 මත පදනම් වේ',
  viewDetailedHealth: 'මූල්‍ය සෞඛ්‍යය විස්තරාත්මකව බලන්න',
  score: 'ලකුණු',
  savings: 'ඉතිරි කිරීම',
  risk: 'අවදානම',
  recentTransactions: 'මෑත ගනුදෙනු',
  latestActivities: 'අවසන් ක්‍රියාකාරකම් {n}',
  syncTitle: 'නවතම බැංකු ගනුදෙනු සමමුහුර්ත කරන්න',
  syncAria: 'බැංකු ගනුදෙනු සමමුහුර්ත කරන්න',
  syncing: 'සමමුහුර්ත වෙමින්…',
  sync: 'සමමුහුර්ත කරන්න',
  syncFailed: 'සමමුහුර්ත කිරීම අසාර්ථකයි: {msg}',
  syncFailedGeneric: 'සමමුහුර්ත කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  loadingTransactions: 'ගනුදෙනු පූරණය වෙමින්…',
  noTransactionsYet: 'තවම ගනුදෙනු නැත. ආරම්භ කිරීමට ඔබේ පළමු ගනුදෙනුව එකතු කරන්න.',
  subscriptionsTitle: 'දායකත්ව',
  recurringDetected: 'නිතර ගෙවීම් හඳුනාගෙන ඇත',
  viewCashFlow: 'මුදල් ප්‍රවාහය සහ දායකත්ව බලන්න',
  openAiCoach: 'AI පුහුණුකරු',
  openAiAria: 'AI සහායක විවෘත කරන්න',
  recurringSubscriptions: 'නිතර ගෙවන දායකත්ව',
  detectedFromHistory: 'ඔබේ ගනුදෙනු ඉතිහාසයෙන් හඳුනාගෙන ඇත.',
  noneFound: 'කිසිවක් හමු නොවීය',
  spendingTrends: 'වියදම් ප්‍රවණතා',
  loadingCharts: 'ප්‍රස්තාර පූරණය වෙමින්…',
  viewSmartBudgets: 'චතුර අයවැය බලන්න',
  samplePreview: 'නිදර්ශන පෙරදසුන',
};

const ta: DashboardText = {
  welcomeBack: 'மீண்டும் வருக',
  balanceTitle: 'இருப்பு சுருக்கம்',
  balanceSub: 'பதிவு செய்யப்பட்ட அனைத்து பரிவர்த்தனைகளும், இந்த மாதத்தின் மொத்தமும்',
  balance: 'இருப்பு',
  incomeThisMonth: 'இந்த மாத வருமானம்',
  expensesThisMonth: 'இந்த மாத செலவுகள்',
  incomeLabel: 'வருமானம் · {month}',
  expensesLabel: 'செலவுகள் · {month}',
  noIncomeYet: 'இன்னும் வருமானம் இல்லை',
  noCardsAdded: 'அட்டைகள் சேர்க்கப்படவில்லை',
  txCount: '{n} பரிவர்த்தனைகள்',
  txCountOne: '{n} பரிவர்த்தனை',
  cardCount: '{n} அட்டைகள்',
  cardCountOne: '{n} அட்டை',
  netSaved: 'சேமித்த நிகர தொகை',
  availableCredit: 'கிடைக்கும் கடன்',
  savingsRate: 'சேமிப்பு விகிதம் {n}%',
  unavailable: 'கிடைக்கவில்லை',
  noScoreYet: 'இன்னும் மதிப்பெண் இல்லை',
  couldNotLoadScore: 'உங்கள் மதிப்பெண்ணை ஏற்ற முடியவில்லை. பக்கத்தை மீண்டும் ஏற்றவும்.',
  financialHealth: 'நிதி ஆரோக்கியம்',
  basedOn30: 'கடந்த 30 நாட்களின் அடிப்படையில்',
  viewDetailedHealth: 'நிதி ஆரோக்கியத்தை விரிவாகப் பார்க்கவும்',
  score: 'மதிப்பெண்',
  savings: 'சேமிப்பு',
  risk: 'ஆபத்து',
  recentTransactions: 'சமீபத்திய பரிவர்த்தனைகள்',
  latestActivities: 'சமீபத்திய {n} செயல்பாடுகள்',
  syncTitle: 'சமீபத்திய வங்கி பரிவர்த்தனைகளை ஒத்திசைக்கவும்',
  syncAria: 'வங்கி பரிவர்த்தனைகளை ஒத்திசைக்கவும்',
  syncing: 'ஒத்திசைக்கிறது…',
  sync: 'ஒத்திசை',
  syncFailed: 'ஒத்திசைவு தோல்வியடைந்தது: {msg}',
  syncFailedGeneric: 'ஒத்திசைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
  loadingTransactions: 'பரிவர்த்தனைகள் ஏற்றப்படுகின்றன…',
  noTransactionsYet: 'இன்னும் பரிவர்த்தனைகள் இல்லை. தொடங்க உங்கள் முதல் பரிவர்த்தனையைச் சேர்க்கவும்.',
  subscriptionsTitle: 'சந்தாக்கள்',
  recurringDetected: 'தொடர் கட்டணங்கள் கண்டறியப்பட்டன',
  viewCashFlow: 'பணப்புழக்கம் மற்றும் சந்தாக்களைப் பார்க்கவும்',
  openAiCoach: 'AI பயிற்சியாளர்',
  openAiAria: 'AI உதவியாளரைத் திறக்கவும்',
  recurringSubscriptions: 'தொடர் சந்தாக்கள்',
  detectedFromHistory: 'உங்கள் பரிவர்த்தனை வரலாற்றிலிருந்து கண்டறியப்பட்டது.',
  noneFound: 'எதுவும் இல்லை',
  spendingTrends: 'செலவுப் போக்குகள்',
  loadingCharts: 'வரைபடங்கள் ஏற்றப்படுகின்றன…',
  viewSmartBudgets: 'ஸ்மார்ட் பட்ஜெட்டைப் பார்க்கவும்',
  samplePreview: 'மாதிரி முன்னோட்டம்',
};

export const DASHBOARD_T: Record<AdminLang, DashboardText> = { en, si, ta };

// Replaces {name} placeholders with values
export const fillText = (template: string, vars: Record<string, string | number> = {}): string =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
