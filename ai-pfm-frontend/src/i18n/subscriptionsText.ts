// Text for the Subscriptions page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface SubscriptionsText {
  loading: string;
  healthTitle: string; healthSpend: string; addIncome: string; ofIncome: string;
  healthBody: string; healthHealthy: string; healthReview: string; healthOverloaded: string;
  addSub: string; addFormTitle: string; serviceName: string; servicePlaceholder: string;
  provider: string; providerPlaceholder: string; amount: string; frequency: string; monthly: string; yearly: string;
  category: string; selectCategory: string;
  catEntertainment: string; catSoftware: string; catHealth: string; catEducation: string; catNews: string;
  catGaming: string; catMusic: string; catCloud: string; catOther: string;
  nextPaymentDate: string; cancel: string; addSubBtn: string;
  monthlyTotal: string; activeSubs: string; zombieCount: string; potentialSavings: string;
  trendTitle: string; trendEmpty: string;
  consolidationTitle: string; consolidationLine: string; consolidationAfter: string;
  zombieTitle: string; zombieBody: string; cancelAllZombies: string;
  overdueBanner: string; overdueByOne: string; overdueByMany: string; dueToday: string; dueInOne: string; dueInMany: string;
  renewsIn: string; rarelyUsed: string;
  stZombie: string; stActive: string; stRarely: string; stUnknown: string;
  usageNoActivity: string; usageDays: string; usageWeeks: string; usageMonths: string; usageNoData: string;
  cost: string; perMonth: string; categoryLabel: string; nextRenewal: string;
  aiInsight: string; loadingInsight: string; insightUnavailable: string;
  ifCancel: string; saveMonthly: string; freesUp: string; annualSavings: string;
  viewAlternatives: string; downgrade: string; cancelBtn: string;
  noSubs: string; noSubsSub: string;
  cancelledTitle: string; restore: string; cancelledOn: string; perYear: string; perMonthShort: string;
  altTitle: string; close: string; colAlternative: string; colPrice: string; colSavings: string; altNA: string;
  switchPlan: string; altFailed: string; altNone: string;
  cancelTitle: string; cancelWill: string; reasonLabel: string; selectReason: string;
  reasonExpensive: string; reasonNotUsed: string; reasonAlt: string; reasonPause: string; reasonOther: string; reasonZombie: string;
  keepSub: string; confirmCancel: string;
  cancelledNote: string; restoredNote: string; bulkCancelled: string; requiredFields: string; amountPositive: string;
  addedNote: string; downgradeSoon: string; switchSoon: string;
  cancelAllTitle: string; cancelAllMessage: string; cancelAllConfirm: string; keepThem: string;
  cancelFailed: string; restoreFailed: string; cancelAllFailed: string; createFailed: string;
}

const en: SubscriptionsText = {
  loading: 'Loading subscriptions...',
  healthTitle: 'Subscription Health Score', healthSpend: 'You spend {amount}/month on subscriptions. To see what share of your income that is,',
  addIncome: 'add your monthly income in Profile', ofIncome: 'of Income',
  healthBody: '{score} — Your subscriptions are {pct}% of monthly income',
  healthHealthy: 'Healthy', healthReview: 'Needs Review', healthOverloaded: 'Overloaded',
  addSub: '+ Add Subscription', addFormTitle: 'Add New Subscription', serviceName: 'Service Name', servicePlaceholder: 'e.g., Netflix Premium',
  provider: 'Provider', providerPlaceholder: 'e.g., Netflix', amount: 'Amount ({cur})', frequency: 'Frequency', monthly: 'Monthly', yearly: 'Yearly',
  category: 'Category', selectCategory: 'Select Category',
  catEntertainment: 'Entertainment', catSoftware: 'Software', catHealth: 'Health & Fitness', catEducation: 'Education', catNews: 'News & Media',
  catGaming: 'Gaming', catMusic: 'Music', catCloud: 'Cloud Storage', catOther: 'Other',
  nextPaymentDate: 'Next Payment Date', cancel: 'Cancel', addSubBtn: 'Add Subscription',
  monthlyTotal: 'Monthly Total', activeSubs: 'Active Subscriptions', zombieCount: 'Zombie Subscriptions', potentialSavings: 'Potential Monthly Savings',
  trendTitle: '6-Month Spending Trend',
  trendEmpty: 'No subscription payments recorded in the last 6 months yet. Payments you log with Pay on the Recurring page, and expenses from these providers, will show here.',
  consolidationTitle: 'AI Consolidation Opportunity',
  consolidationLine: 'You have {count} subscriptions costing {cost}/month.',
  consolidationAfter: 'Consolidating could save',
  zombieTitle: 'Zombie Subscriptions Detected!',
  zombieBody: "You have {count} subscriptions you haven't used in 3+ months. Cancel them to save {amount}/month.",
  cancelAllZombies: 'Cancel All Zombies',
  overdueBanner: 'Payment overdue: was due {date} ({label}). Log the payment on the Recurring page, or cancel if you no longer use it.',
  overdueByOne: 'Overdue by 1 day', overdueByMany: 'Overdue by {n} days', dueToday: 'Due today',
  dueInOne: 'Due in 1 day', dueInMany: 'Due in {n} days',
  renewsIn: 'Renews in {n} days - Rarely used', rarelyUsed: 'Rarely used',
  stZombie: 'Zombie', stActive: 'Actively Used', stRarely: 'Rarely Used', stUnknown: 'Unknown',
  usageNoActivity: 'No activity detected', usageDays: 'Last used: {n} days ago', usageWeeks: 'Last used: {n} weeks ago',
  usageMonths: 'Last used: {n} months ago', usageNoData: 'No usage data',
  cost: 'Cost', perMonth: '/month', categoryLabel: 'Category', nextRenewal: 'Next Renewal',
  aiInsight: 'AI Insight:', loadingInsight: 'Loading AI insight...', insightUnavailable: 'AI insight is not available right now. Please try again later.',
  ifCancel: 'If you cancel:', saveMonthly: 'Save {amount}/month', freesUp: 'Frees up {pct}% of your monthly income', annualSavings: 'Annual savings: {amount}',
  viewAlternatives: 'View Alternatives', downgrade: 'Downgrade', cancelBtn: 'Cancel',
  noSubs: 'No Subscriptions Found', noSubsSub: "We'll automatically detect recurring payments from your transactions",
  cancelledTitle: 'Cancelled Subscriptions ({n})', restore: 'Restore', cancelledOn: 'Cancelled {date}', perYear: 'year', perMonthShort: 'month',
  altTitle: 'Cheaper Alternatives for {name}', close: 'Close', colAlternative: 'Alternative', colPrice: 'Price', colSavings: 'Savings', altNA: 'N/A',
  switchPlan: 'Switch Plan', altFailed: 'Cheaper alternatives could not be loaded right now. Please try again later.', altNone: 'No cheaper alternatives available at this time.',
  cancelTitle: 'Cancel {name}?', cancelWill: 'Cancelling this will:', reasonLabel: 'Why are you cancelling? (optional)', selectReason: 'Select a reason...',
  reasonExpensive: 'Too expensive', reasonNotUsed: 'Not using it', reasonAlt: 'Found a cheaper alternative', reasonPause: 'Temporary pause', reasonOther: 'Other',
  reasonZombie: 'Cancelled as unused',
  keepSub: 'Keep Subscription', confirmCancel: 'Confirm Cancel',
  cancelledNote: '{name} cancelled. You can restore it from Cancelled Subscriptions.', restoredNote: '{name} restored.',
  bulkCancelled: 'Cancelled {n} subscription(s).', requiredFields: 'Please fill in all required fields.', amountPositive: 'Amount must be greater than 0.',
  addedNote: 'Subscription added.', downgradeSoon: 'Downgrade is coming soon.', switchSoon: 'Switch plan is coming soon.',
  cancelAllTitle: 'Cancel {n} zombie subscription{s}?',
  cancelAllMessage: 'This cancels {names} and saves {amount}/month. You can restore them later from Cancelled Subscriptions.',
  cancelAllConfirm: 'Cancel All', keepThem: 'Keep Them',
  cancelFailed: 'Failed to cancel subscription. Please try again.', restoreFailed: 'Failed to restore subscription. Please try again.',
  cancelAllFailed: 'Failed to cancel subscriptions. Please try again.', createFailed: 'Failed to create subscription. Please try again.',
};

const si: SubscriptionsText = {
  loading: 'දායකත්ව පූරණය වෙමින්...',
  healthTitle: 'දායකත්ව සෞඛ්‍ය ලකුණ', healthSpend: 'ඔබ දායකත්වයන් සඳහා මාසිකව {amount} වැය කරයි. ඒ ඔබේ ආදායමෙන් කුමන කොටසද යන්න බැලීමට,',
  addIncome: 'ඔබේ මාසික ආදායම පැතිකඩ තුළ එකතු කරන්න', ofIncome: 'ආදායමෙන්',
  healthBody: '{score} — ඔබේ දායකත්ව මාසික ආදායමෙන් {pct}% කි',
  healthHealthy: 'සෞඛ්‍ය සම්පන්නයි', healthReview: 'සමාලෝචනය අවශ්‍යයි', healthOverloaded: 'අධික ලෙස බරයි',
  addSub: '+ දායකත්වයක් එකතු කරන්න', addFormTitle: 'නව දායකත්වයක් එකතු කරන්න', serviceName: 'සේවාවේ නම', servicePlaceholder: 'උදා: Netflix Premium',
  provider: 'සපයන්නා', providerPlaceholder: 'උදා: Netflix', amount: 'මුදල ({cur})', frequency: 'වාර ගණන', monthly: 'මාසික', yearly: 'වාර්ෂික',
  category: 'කාණ්ඩය', selectCategory: 'කාණ්ඩය තෝරන්න',
  catEntertainment: 'විනෝදාස්වාදය', catSoftware: 'මෘදුකාංග', catHealth: 'සෞඛ්‍යය සහ ශාරීරික යෝග්‍යතාව', catEducation: 'අධ්‍යාපනය', catNews: 'ප්‍රවෘත්ති සහ මාධ්‍ය',
  catGaming: 'ක්‍රීඩා', catMusic: 'සංගීතය', catCloud: 'වලාකුළු ගබඩාව', catOther: 'වෙනත්',
  nextPaymentDate: 'ඊළඟ ගෙවීමේ දිනය', cancel: 'අවලංගු කරන්න', addSubBtn: 'දායකත්වය එකතු කරන්න',
  monthlyTotal: 'මාසික මුළු', activeSubs: 'සක්‍රිය දායකත්ව', zombieCount: 'භාවිතයට නොගන්නා දායකත්ව', potentialSavings: 'අපේක්ෂිත මාසික ඉතිරිය',
  trendTitle: 'මාස 6 වියදම් ප්‍රවණතාව',
  trendEmpty: 'අවසන් මාස 6 තුළ දායකත්ව ගෙවීම් තවම සටහන් කර නැත. නිතර ගෙවීම් පිටුවෙන් ගෙවීම් සටහන් කළ විට සහ මෙම සපයන්නන්ගේ වියදම් මෙහි පෙන්වේ.',
  consolidationTitle: 'AI ඒකාබද්ධ කිරීමේ අවස්ථාව',
  consolidationLine: 'ඔබට මාසිකව {cost} වියදම් කරන දායකත්ව {count} ක් ඇත.',
  consolidationAfter: 'ඒකාබද්ධ කිරීමෙන් ඉතිරි කළ හැක',
  zombieTitle: 'භාවිතයට නොගන්නා දායකත්ව හඳුනාගෙන ඇත!',
  zombieBody: 'මාස 3+ ක් තිස්සේ ඔබ භාවිතා නොකළ දායකත්ව {count} ක් ඇත. මාසිකව {amount} ඉතිරි කිරීමට ඒවා අවලංගු කරන්න.',
  cancelAllZombies: 'සියලු භාවිතයට නොගන්නා දායකත්ව අවලංගු කරන්න',
  overdueBanner: 'ගෙවීම ප්‍රමාද වී ඇත: {date} දිනට නියමිත විය ({label}). නිතර ගෙවීම් පිටුවේ ගෙවීම සටහන් කරන්න, නැතහොත් තවදුරටත් භාවිතා නොකරන්නේ නම් අවලංගු කරන්න.',
  overdueByOne: 'දින 1 ක් ප්‍රමාදයි', overdueByMany: 'දින {n} ක් ප්‍රමාදයි', dueToday: 'අද ගෙවිය යුතුයි',
  dueInOne: 'දින 1 කින් ගෙවිය යුතුයි', dueInMany: 'දින {n} කින් ගෙවිය යුතුයි',
  renewsIn: 'දින {n} කින් අලුත් වේ - අඩුවෙන් භාවිතා වේ', rarelyUsed: 'අඩුවෙන් භාවිතා වේ',
  stZombie: 'භාවිතයට නොගන්නා', stActive: 'සක්‍රියව භාවිතා වේ', stRarely: 'අඩුවෙන් භාවිතා වේ', stUnknown: 'නොදනී',
  usageNoActivity: 'ක්‍රියාකාරකම් හඳුනාගෙන නැත', usageDays: 'අවසානයට භාවිතා කළේ: දින {n} කට පෙර', usageWeeks: 'අවසානයට භාවිතා කළේ: සති {n} කට පෙර',
  usageMonths: 'අවසානයට භාවිතා කළේ: මාස {n} කට පෙර', usageNoData: 'භාවිත දත්ත නැත',
  cost: 'පිරිවැය', perMonth: '/මාසය', categoryLabel: 'කාණ්ඩය', nextRenewal: 'ඊළඟ අලුත් කිරීම',
  aiInsight: 'AI අවබෝධය:', loadingInsight: 'AI අවබෝධය පූරණය වෙමින්...', insightUnavailable: 'දැනට AI අවබෝධය ලබා ගත නොහැක. පසුව නැවත උත්සාහ කරන්න.',
  ifCancel: 'ඔබ අවලංගු කළහොත්:', saveMonthly: 'මාසිකව {amount} ඉතිරි කරන්න', freesUp: 'ඔබේ මාසික ආදායමෙන් {pct}% ක් නිදහස් වේ', annualSavings: 'වාර්ෂික ඉතිරිය: {amount}',
  viewAlternatives: 'විකල්ප බලන්න', downgrade: 'පහත් කරන්න', cancelBtn: 'අවලංගු කරන්න',
  noSubs: 'දායකත්ව හමු නොවීය', noSubsSub: 'ඔබේ ගනුදෙනුවලින් නිතර ගෙවීම් ස්වයංක්‍රීයව හඳුනාගනු ඇත',
  cancelledTitle: 'අවලංගු කළ දායකත්ව ({n})', restore: 'ප්‍රත්‍යර්පණය කරන්න', cancelledOn: '{date} දින අවලංගු කළා', perYear: 'වර්ෂය', perMonthShort: 'මාසය',
  altTitle: '{name} සඳහා අඩු මිල විකල්ප', close: 'වසන්න', colAlternative: 'විකල්පය', colPrice: 'මිල', colSavings: 'ඉතිරිය', altNA: 'නොමැත',
  switchPlan: 'සැලැස්ම වෙනස් කරන්න', altFailed: 'දැනට අඩු මිල විකල්ප පූරණය කළ නොහැක. පසුව නැවත උත්සාහ කරන්න.', altNone: 'මේ වෙලාවේ අඩු මිල විකල්ප නැත.',
  cancelTitle: '{name} අවලංගු කරන්නද?', cancelWill: 'මෙය අවලංගු කිරීමෙන්:', reasonLabel: 'ඔබ අවලංගු කරන්නේ ඇයි? (විකල්ප)', selectReason: 'හේතුවක් තෝරන්න...',
  reasonExpensive: 'ඉතා මිල අධිකයි', reasonNotUsed: 'භාවිතා නොකරයි', reasonAlt: 'අඩු මිල විකල්පයක් හමු විය', reasonPause: 'තාවකාලික විරාමය', reasonOther: 'වෙනත්',
  reasonZombie: 'භාවිතා නොකළ නිසා අවලංගු කළා',
  keepSub: 'දායකත්වය තබා ගන්න', confirmCancel: 'අවලංගු කිරීම තහවුරු කරන්න',
  cancelledNote: '{name} අවලංගු කරන ලදී. අවලංගු කළ දායකත්ව වලින් ඔබට එය ප්‍රත්‍යර්පණය කළ හැක.', restoredNote: '{name} ප්‍රත්‍යර්පණය කරන ලදී.',
  bulkCancelled: 'දායකත්ව {n} ක් අවලංගු කරන ලදී.', requiredFields: 'කරුණාකර අවශ්‍ය සියලු ක්ෂේත්‍ර පුරවන්න.', amountPositive: 'මුදල 0 ට වඩා වැඩි විය යුතුය.',
  addedNote: 'දායකත්වය එකතු කරන ලදී.', downgradeSoon: 'පහත් කිරීම ළඟදීම පැමිණේ.', switchSoon: 'සැලැස්ම වෙනස් කිරීම ළඟදීම පැමිණේ.',
  cancelAllTitle: 'භාවිතයට නොගන්නා දායකත්ව {n} ක් අවලංගු කරන්නද?',
  cancelAllMessage: '{names} අවලංගු වන අතර මාසිකව {amount} ඉතිරි වේ. පසුව අවලංගු කළ දායකත්ව වලින් ඒවා ප්‍රත්‍යර්පණය කළ හැක.',
  cancelAllConfirm: 'සියල්ල අවලංගු කරන්න', keepThem: 'ඒවා තබා ගන්න',
  cancelFailed: 'දායකත්වය අවලංගු කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', restoreFailed: 'දායකත්වය ප්‍රත්‍යර්පණය කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  cancelAllFailed: 'දායකත්ව අවලංගු කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', createFailed: 'දායකත්වය සෑදීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
};

const ta: SubscriptionsText = {
  loading: 'சந்தாக்கள் ஏற்றப்படுகின்றன...',
  healthTitle: 'சந்தா ஆரோக்கிய மதிப்பெண்', healthSpend: 'சந்தாக்களுக்கு மாதம் {amount} செலவிடுகிறீர்கள். உங்கள் வருமானத்தில் இது எவ்வளவு என்று பார்க்க,',
  addIncome: 'உங்கள் மாத வருமானத்தை சுயவிவரத்தில் சேர்க்கவும்', ofIncome: 'வருமானத்தில்',
  healthBody: '{score} — உங்கள் சந்தாக்கள் மாத வருமானத்தில் {pct}% ஆகும்',
  healthHealthy: 'ஆரோக்கியமானது', healthReview: 'மறுஆய்வு தேவை', healthOverloaded: 'அதிக சுமை',
  addSub: '+ சந்தாவைச் சேர்', addFormTitle: 'புதிய சந்தாவைச் சேர்', serviceName: 'சேவையின் பெயர்', servicePlaceholder: 'எ.கா., Netflix Premium',
  provider: 'வழங்குநர்', providerPlaceholder: 'எ.கா., Netflix', amount: 'தொகை ({cur})', frequency: 'அதிர்வெண்', monthly: 'மாதாந்திரம்', yearly: 'ஆண்டுதோறும்',
  category: 'பிரிவு', selectCategory: 'பிரிவைத் தேர்ந்தெடுக்கவும்',
  catEntertainment: 'பொழுதுபோக்கு', catSoftware: 'மென்பொருள்', catHealth: 'ஆரோக்கியம் மற்றும் உடற்பயிற்சி', catEducation: 'கல்வி', catNews: 'செய்திகள் மற்றும் ஊடகம்',
  catGaming: 'விளையாட்டு', catMusic: 'இசை', catCloud: 'கிளவுட் சேமிப்பு', catOther: 'மற்றவை',
  nextPaymentDate: 'அடுத்த செலுத்தும் தேதி', cancel: 'ரத்து செய்', addSubBtn: 'சந்தாவைச் சேர்',
  monthlyTotal: 'மாதாந்திர மொத்தம்', activeSubs: 'செயலில் உள்ள சந்தாக்கள்', zombieCount: 'பயன்படுத்தப்படாத சந்தாக்கள்', potentialSavings: 'சாத்தியமான மாதச் சேமிப்பு',
  trendTitle: '6 மாத செலவுப் போக்கு',
  trendEmpty: 'கடந்த 6 மாதங்களில் சந்தா செலுத்தல்கள் இன்னும் பதிவாகவில்லை. தொடர் பக்கத்தில் நீங்கள் பதிவு செய்யும் செலுத்தல்களும், இந்த வழங்குநர்களின் செலவுகளும் இங்கே தெரியும்.',
  consolidationTitle: 'AI ஒருங்கிணைப்பு வாய்ப்பு',
  consolidationLine: 'மாதம் {cost} செலவாகும் {count} சந்தாக்கள் உங்களிடம் உள்ளன.',
  consolidationAfter: 'ஒருங்கிணைப்பதன் மூலம் சேமிக்கலாம்',
  zombieTitle: 'பயன்படுத்தப்படாத சந்தாக்கள் கண்டறியப்பட்டன!',
  zombieBody: '3+ மாதங்களாக நீங்கள் பயன்படுத்தாத {count} சந்தாக்கள் உள்ளன. மாதம் {amount} சேமிக்க அவற்றை ரத்து செய்யுங்கள்.',
  cancelAllZombies: 'அனைத்து பயன்படுத்தப்படாத சந்தாக்களையும் ரத்து செய்',
  overdueBanner: 'செலுத்தல் தாமதமானது: {date} அன்று செலுத்த வேண்டியது ({label}). தொடர் பக்கத்தில் செலுத்தலைப் பதிவு செய்யுங்கள், அல்லது இனி பயன்படுத்தவில்லை என்றால் ரத்து செய்யுங்கள்.',
  overdueByOne: '1 நாள் தாமதம்', overdueByMany: '{n} நாட்கள் தாமதம்', dueToday: 'இன்று செலுத்த வேண்டும்',
  dueInOne: '1 நாளில் செலுத்த வேண்டும்', dueInMany: '{n} நாட்களில் செலுத்த வேண்டும்',
  renewsIn: '{n} நாட்களில் புதுப்பிக்கப்படும் - அரிதாகப் பயன்படுத்தப்படுகிறது', rarelyUsed: 'அரிதாகப் பயன்படுத்தப்படுகிறது',
  stZombie: 'பயன்படுத்தப்படாதது', stActive: 'தீவிரமாகப் பயன்படுத்தப்படுகிறது', stRarely: 'அரிதாகப் பயன்படுத்தப்படுகிறது', stUnknown: 'தெரியவில்லை',
  usageNoActivity: 'செயல்பாடு கண்டறியப்படவில்லை', usageDays: 'கடைசியாகப் பயன்படுத்தியது: {n} நாட்களுக்கு முன்', usageWeeks: 'கடைசியாகப் பயன்படுத்தியது: {n} வாரங்களுக்கு முன்',
  usageMonths: 'கடைசியாகப் பயன்படுத்தியது: {n} மாதங்களுக்கு முன்', usageNoData: 'பயன்பாட்டுத் தரவு இல்லை',
  cost: 'செலவு', perMonth: '/மாதம்', categoryLabel: 'பிரிவு', nextRenewal: 'அடுத்த புதுப்பித்தல்',
  aiInsight: 'AI நுண்ணறிவு:', loadingInsight: 'AI நுண்ணறிவு ஏற்றப்படுகிறது...', insightUnavailable: 'தற்போது AI நுண்ணறிவு கிடைக்கவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  ifCancel: 'நீங்கள் ரத்து செய்தால்:', saveMonthly: 'மாதம் {amount} சேமிக்கலாம்', freesUp: 'உங்கள் மாத வருமானத்தில் {pct}% விடுவிக்கப்படும்', annualSavings: 'ஆண்டுச் சேமிப்பு: {amount}',
  viewAlternatives: 'மாற்றுகளைப் பார்', downgrade: 'தரம் குறை', cancelBtn: 'ரத்து செய்',
  noSubs: 'சந்தாக்கள் எதுவும் கிடைக்கவில்லை', noSubsSub: 'உங்கள் பரிவர்த்தனைகளிலிருந்து தொடர் செலுத்தல்களை நாங்கள் தானாகக் கண்டறிவோம்',
  cancelledTitle: 'ரத்து செய்யப்பட்ட சந்தாக்கள் ({n})', restore: 'மீட்டமை', cancelledOn: '{date} அன்று ரத்து செய்யப்பட்டது', perYear: 'ஆண்டு', perMonthShort: 'மாதம்',
  altTitle: '{name} க்கான குறைந்த விலை மாற்றுகள்', close: 'மூடு', colAlternative: 'மாற்று', colPrice: 'விலை', colSavings: 'சேமிப்பு', altNA: 'இல்லை',
  switchPlan: 'திட்டத்தை மாற்று', altFailed: 'தற்போது குறைந்த விலை மாற்றுகளை ஏற்ற முடியவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்.', altNone: 'இந்த நேரத்தில் குறைந்த விலை மாற்றுகள் இல்லை.',
  cancelTitle: '{name} ஐ ரத்து செய்யவா?', cancelWill: 'இதை ரத்து செய்தால்:', reasonLabel: 'ஏன் ரத்து செய்கிறீர்கள்? (விருப்பம்)', selectReason: 'ஒரு காரணத்தைத் தேர்ந்தெடுக்கவும்...',
  reasonExpensive: 'மிகவும் விலை அதிகம்', reasonNotUsed: 'பயன்படுத்தவில்லை', reasonAlt: 'மலிவான மாற்று கிடைத்தது', reasonPause: 'தற்காலிக இடைநிறுத்தம்', reasonOther: 'மற்றவை',
  reasonZombie: 'பயன்படுத்தப்படாததால் ரத்து செய்யப்பட்டது',
  keepSub: 'சந்தாவைத் தொடரவும்', confirmCancel: 'ரத்து செய்வதை உறுதிப்படுத்து',
  cancelledNote: '{name} ரத்து செய்யப்பட்டது. ரத்து செய்யப்பட்ட சந்தாக்களில் இருந்து மீட்டெடுக்கலாம்.', restoredNote: '{name} மீட்டமைக்கப்பட்டது.',
  bulkCancelled: '{n} சந்தா(க்கள்) ரத்து செய்யப்பட்டன.', requiredFields: 'தேவையான எல்லா புலங்களையும் நிரப்பவும்.', amountPositive: 'தொகை 0-ஐ விட அதிகமாக இருக்க வேண்டும்.',
  addedNote: 'சந்தா சேர்க்கப்பட்டது.', downgradeSoon: 'தரம் குறைப்பு விரைவில் வரும்.', switchSoon: 'திட்ட மாற்றம் விரைவில் வரும்.',
  cancelAllTitle: 'பயன்படுத்தப்படாத {n} சந்தா(க்கள்) ரத்து செய்யவா?',
  cancelAllMessage: '{names} ரத்து செய்யப்பட்டு மாதம் {amount} சேமிக்கப்படும். பின்னர் ரத்து செய்யப்பட்ட சந்தாக்களில் இருந்து மீட்டெடுக்கலாம்.',
  cancelAllConfirm: 'அனைத்தையும் ரத்து செய்', keepThem: 'வைத்திரு',
  cancelFailed: 'சந்தாவை ரத்து செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', restoreFailed: 'சந்தாவை மீட்டமைக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  cancelAllFailed: 'சந்தாக்களை ரத்து செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', createFailed: 'சந்தாவை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
};

export const SUBS_T: Record<AdminLang, SubscriptionsText> = { en, si, ta };
