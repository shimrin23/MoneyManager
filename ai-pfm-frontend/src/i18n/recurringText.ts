// Text for the Recurring page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface RecurringText {
  freqWeekly: string; freqMonthly: string; freqYearly: string; primaryAccount: string;
  warnFields: string; warnAmount: string; addedNote: string; movedDismissed: string; restoredNote: string; confirmedNote: string;
  foundOne: string; foundMany: string; noNew: string; paidNext: string; paidNote: string; deletedNote: string;
  failAdd: string; failStatus: string; failScan: string; failPay: string; failDelete: string;
  loading: string; addTitle: string; runScan: string; scanning: string;
  providerLabel: string; providerPh: string; nameLabel: string; namePh: string; amountLabel: string;
  categoryLabel: string; categoryPh: string; frequencyLabel: string; nextDue: string; adding: string; add: string;
  newPatterns: string; activeRecurring: string; awaitingReview: string; dueWithin7: string; monthlyTotal: string;
  filterAll: string; filterUnconfirmed: string; filterConfirmed: string; filterDismissed: string;
  lastCharged: string; nextOn: string; today: string; overdueDays: string; daysShort: string; thisYear: string;
  confirm: string; notRecurring: string; paidDue: string; pay: string; dismiss: string; restore: string; delete: string;
  confirmPayTitle: string; deleteSubTitle: string; close: string; payIntro: string; paymentDate: string;
  cancel: string; confirmPay: string; deleteConfirmText: string; deleteConfirm: string;
}

const en: RecurringText = {
  freqWeekly: 'Weekly', freqMonthly: 'Monthly', freqYearly: 'Yearly', primaryAccount: 'Primary Account',
  warnFields: 'Please fill in provider, name, amount, category and next due date.', warnAmount: 'Amount must be greater than 0.',
  addedNote: 'Subscription added.', movedDismissed: 'Moved to Dismissed. You can restore it from there.',
  restoredNote: 'Restored. Confirm it to track payments again.', confirmedNote: 'Confirmed as recurring.',
  foundOne: 'Found {n} new recurring payment.', foundMany: 'Found {n} new recurring payments.', noNew: 'No new recurring payments found.',
  paidNext: 'Payment logged. Next payment due {date}.', paidNote: 'Payment logged.', deletedNote: 'Subscription deleted.',
  failAdd: 'Failed to add subscription. Please try again.', failStatus: 'Failed to update subscription. Please try again.',
  failScan: 'AI scan failed. Please try again.', failPay: 'Failed to log payment. Please try again.', failDelete: 'Failed to delete subscription. Please try again.',
  loading: 'Detecting recurring transactions...', addTitle: 'Add Subscription', runScan: 'Run AI Scan', scanning: 'Scanning...',
  providerLabel: 'Provider', providerPh: 'e.g. Netflix', nameLabel: 'Name (Desc)', namePh: 'e.g. Premium Plan',
  amountLabel: 'Amount ({cur})', categoryLabel: 'Category', categoryPh: 'Entertainment', frequencyLabel: 'Frequency', nextDue: 'Next Due',
  adding: 'Adding...', add: 'Add',
  newPatterns: '{n} new pattern(s) detected — review below',
  activeRecurring: 'Active Recurring', awaitingReview: 'Awaiting Review', dueWithin7: 'Due Within 7 Days', monthlyTotal: 'Monthly Total',
  filterAll: 'All', filterUnconfirmed: 'Unconfirmed', filterConfirmed: 'Confirmed', filterDismissed: 'Dismissed',
  lastCharged: 'Last charged: {date}', nextOn: 'Next: {date}', today: 'Today', overdueDays: 'Overdue {n}d', daysShort: 'd',
  thisYear: '{amount} this year',
  confirm: 'Confirm', notRecurring: 'Not Recurring', paidDue: 'Paid — due in {n}d', pay: 'Pay', dismiss: 'Dismiss',
  restore: 'Restore', delete: 'Delete',
  confirmPayTitle: 'Confirm Payment', deleteSubTitle: 'Delete Subscription', close: 'Close',
  payIntro: 'You are about to log a payment for:', paymentDate: 'Payment date:', cancel: 'Cancel', confirmPay: 'Confirm Pay',
  deleteConfirmText: 'Are you sure you want to delete', deleteConfirm: 'Delete',
};

const si: RecurringText = {
  freqWeekly: 'සතිපතා', freqMonthly: 'මාසික', freqYearly: 'වාර්ෂික', primaryAccount: 'ප්‍රධාන ගිණුම',
  warnFields: 'කරුණාකර සපයන්නා, නම, මුදල, කාණ්ඩය සහ ඊළඟ නියමිත දිනය පුරවන්න.', warnAmount: 'මුදල 0 ට වඩා වැඩි විය යුතුය.',
  addedNote: 'දායකත්වය එකතු කරන ලදී.', movedDismissed: 'ප්‍රතික්ෂේප කළ ඒවාට ගෙන ගියා. එතැනින් ප්‍රත්‍යර්පණය කළ හැක.',
  restoredNote: 'ප්‍රත්‍යර්පණය කරන ලදී. නැවතත් ගෙවීම් නිරීක්ෂණය කිරීමට තහවුරු කරන්න.', confirmedNote: 'නිතර ගෙවීමක් ලෙස තහවුරු කරන ලදී.',
  foundOne: 'නව නිතර ගෙවීම් {n} ක් හමු විය.', foundMany: 'නව නිතර ගෙවීම් {n} ක් හමු විය.', noNew: 'නව නිතර ගෙවීම් හමු නොවීය.',
  paidNext: 'ගෙවීම සටහන් කරන ලදී. ඊළඟ ගෙවීම {date} දිනට නියමිතයි.', paidNote: 'ගෙවීම සටහන් කරන ලදී.', deletedNote: 'දායකත්වය මකා දමන ලදී.',
  failAdd: 'දායකත්වය එකතු කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', failStatus: 'දායකත්වය යාවත්කාලීන කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  failScan: 'AI ස්කෑන් අසාර්ථකයි. නැවත උත්සාහ කරන්න.', failPay: 'ගෙවීම සටහන් කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', failDelete: 'දායකත්වය මැකීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  loading: 'නිතර ගනුදෙනු හඳුනාගනිමින්...', addTitle: 'දායකත්වයක් එකතු කරන්න', runScan: 'AI ස්කෑන් ධාවනය කරන්න', scanning: 'ස්කෑන් කෙරෙමින්...',
  providerLabel: 'සපයන්නා', providerPh: 'උදා: Netflix', nameLabel: 'නම (විස්තරය)', namePh: 'උදා: Premium Plan',
  amountLabel: 'මුදල ({cur})', categoryLabel: 'කාණ්ඩය', categoryPh: 'විනෝදාස්වාදය', frequencyLabel: 'වාර ගණන', nextDue: 'ඊළඟ ගෙවීම',
  adding: 'එකතු කෙරෙමින්...', add: 'එකතු කරන්න',
  newPatterns: 'නව රටා {n} ක් හඳුනාගෙන ඇත — පහතින් සමාලෝචනය කරන්න',
  activeRecurring: 'සක්‍රිය නිතර ගෙවීම්', awaitingReview: 'සමාලෝචනය බලාපොරොත්තුවෙන්', dueWithin7: 'දින 7 ක් ඇතුළත ගෙවිය යුතු', monthlyTotal: 'මාසික මුළු',
  filterAll: 'සියල්ල', filterUnconfirmed: 'තහවුරු නොකළ', filterConfirmed: 'තහවුරු කළ', filterDismissed: 'ප්‍රතික්ෂේප කළ',
  lastCharged: 'අවසානයට අය කළේ: {date}', nextOn: 'ඊළඟ: {date}', today: 'අද', overdueDays: 'දින {n} ප්‍රමාදයි', daysShort: 'දින',
  thisYear: 'මෙම වර්ෂයේ {amount}',
  confirm: 'තහවුරු කරන්න', notRecurring: 'නිතර ගෙවීම නොවේ', paidDue: 'ගෙවා ඇත — දින {n} කින් ගෙවිය යුතුයි', pay: 'ගෙවන්න', dismiss: 'ප්‍රතික්ෂේප කරන්න',
  restore: 'ප්‍රත්‍යර්පණය කරන්න', delete: 'මකන්න',
  confirmPayTitle: 'ගෙවීම තහවුරු කරන්න', deleteSubTitle: 'දායකත්වය මකන්න', close: 'වසන්න',
  payIntro: 'ඔබ පහත සඳහා ගෙවීමක් සටහන් කිරීමට යන්නෙහිය:', paymentDate: 'ගෙවීම් දිනය:', cancel: 'අවලංගු කරන්න', confirmPay: 'ගෙවීම තහවුරු කරන්න',
  deleteConfirmText: 'ඔබට විශ්වාසද මෙය මකා දමන්න', deleteConfirm: 'මකන්න',
};

const ta: RecurringText = {
  freqWeekly: 'வாராந்திர', freqMonthly: 'மாதாந்திர', freqYearly: 'ஆண்டுதோறும்', primaryAccount: 'முதன்மைக் கணக்கு',
  warnFields: 'வழங்குநர், பெயர், தொகை, பிரிவு, அடுத்த நிலுவைத் தேதி ஆகியவற்றை நிரப்பவும்.', warnAmount: 'தொகை 0-ஐ விட அதிகமாக இருக்க வேண்டும்.',
  addedNote: 'சந்தா சேர்க்கப்பட்டது.', movedDismissed: 'நிராகரிக்கப்பட்டவற்றுக்கு நகர்த்தப்பட்டது. அங்கிருந்து மீட்டெடுக்கலாம்.',
  restoredNote: 'மீட்டமைக்கப்பட்டது. செலுத்தல்களை மீண்டும் கண்காணிக்க உறுதிப்படுத்தவும்.', confirmedNote: 'தொடர் கட்டணமாக உறுதிப்படுத்தப்பட்டது.',
  foundOne: 'புதிய தொடர் செலுத்தல் {n} கண்டறியப்பட்டது.', foundMany: 'புதிய தொடர் செலுத்தல்கள் {n} கண்டறியப்பட்டன.', noNew: 'புதிய தொடர் செலுத்தல்கள் எதுவும் கண்டறியப்படவில்லை.',
  paidNext: 'செலுத்தல் பதிவு செய்யப்பட்டது. அடுத்த செலுத்தல் {date} அன்று.', paidNote: 'செலுத்தல் பதிவு செய்யப்பட்டது.', deletedNote: 'சந்தா நீக்கப்பட்டது.',
  failAdd: 'சந்தாவைச் சேர்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', failStatus: 'சந்தாவைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  failScan: 'AI ஸ்கேன் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.', failPay: 'செலுத்தலைப் பதிவு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', failDelete: 'சந்தாவை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  loading: 'தொடர் பரிவர்த்தனைகள் கண்டறியப்படுகின்றன...', addTitle: 'சந்தாவைச் சேர்', runScan: 'AI ஸ்கேன் இயக்கு', scanning: 'ஸ்கேன் செய்யப்படுகிறது...',
  providerLabel: 'வழங்குநர்', providerPh: 'எ.கா. Netflix', nameLabel: 'பெயர் (விளக்கம்)', namePh: 'எ.கா. Premium Plan',
  amountLabel: 'தொகை ({cur})', categoryLabel: 'பிரிவு', categoryPh: 'பொழுதுபோக்கு', frequencyLabel: 'அதிர்வெண்', nextDue: 'அடுத்த நிலுவை',
  adding: 'சேர்க்கப்படுகிறது...', add: 'சேர்',
  newPatterns: 'புதிய வடிவங்கள் {n} கண்டறியப்பட்டன — கீழே மதிப்பாய்வு செய்யவும்',
  activeRecurring: 'செயலில் உள்ள தொடர்கள்', awaitingReview: 'மதிப்பாய்வுக்கு காத்திருக்கிறது', dueWithin7: '7 நாட்களுக்குள் நிலுவை', monthlyTotal: 'மாதாந்திர மொத்தம்',
  filterAll: 'அனைத்தும்', filterUnconfirmed: 'உறுதிப்படுத்தாதவை', filterConfirmed: 'உறுதிப்படுத்தியவை', filterDismissed: 'நிராகரிக்கப்பட்டவை',
  lastCharged: 'கடைசியாக வசூலிக்கப்பட்டது: {date}', nextOn: 'அடுத்தது: {date}', today: 'இன்று', overdueDays: '{n} நாட்கள் தாமதம்', daysShort: 'நா',
  thisYear: 'இந்த ஆண்டு {amount}',
  confirm: 'உறுதிப்படுத்து', notRecurring: 'தொடர் அல்ல', paidDue: 'செலுத்தப்பட்டது — {n} நாட்களில் நிலுவை', pay: 'செலுத்து', dismiss: 'நிராகரி',
  restore: 'மீட்டமை', delete: 'நீக்கு',
  confirmPayTitle: 'செலுத்தலை உறுதிப்படுத்து', deleteSubTitle: 'சந்தாவை நீக்கு', close: 'மூடு',
  payIntro: 'இதற்கான செலுத்தலைப் பதிவு செய்யவிருக்கிறீர்கள்:', paymentDate: 'செலுத்தும் தேதி:', cancel: 'ரத்து செய்', confirmPay: 'செலுத்தலை உறுதிப்படுத்து',
  deleteConfirmText: 'இதை நீக்க விரும்புகிறீர்களா', deleteConfirm: 'நீக்கு',
};

export const REC_T: Record<AdminLang, RecurringText> = { en, si, ta };
