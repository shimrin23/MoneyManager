// Text for the Credit Cards page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface CreditCardsText {
  loading: string; yourCards: string; cardsLinked: string; cardOne: string; cardMany: string; addCard: string;
  totalLimit: string; acrossAll: string; totalBalance: string; utilization: string; noLimitYet: string;
  minPaymentDue: string; thisMonth: string;
  editCard: string; addNewCard: string; trackSpending: string;
  cardName: string; cardNamePlaceholder: string; provider: string; selectProvider: string;
  creditLimit: string; currentBalance: string; minPaymentLabel: string; paymentDueDate: string;
  statementDate: string; last4: string;
  cancel: string; saving: string; saveChanges: string; addCardBtn: string;
  currentBalanceVisual: string; creditUtilization: string; minimumPayment: string; dueDate: string;
  overdue: string; dayOne: string; dayMany: string;
  availablePrefix: string; limitPrefix: string;
  viewTransactions: string; makePayment: string; edit: string; delete: string;
  noCards: string; noCardsSub: string; addFirstCard: string;
  txTitle: string; close: string; balancePrefix: string; availablePrefixShort: string;
  noActivity: string; colDate: string; colType: string; colAmount: string;
  typePayment: string; typeCharge: string; addCharge: string;
  deleteTitle: string; deleteMessage: string; deleteConfirm: string;
  paymentTitle: string; paymentMessage: string; paymentLabel: string; payConfirm: string;
  chargeTitle: string; chargeMessage: string; chargeLabel: string; chargeConfirm: string;
  noBalance: string; updatedNote: string; addedNote: string; deletedNote: string;
  paymentRecorded: string; chargeAdded: string;
  amountInvalid: string; paymentTooHigh: string; chargeTooHigh: string;
  saveFailed: string; deleteFailed: string; paymentFailed: string; chargeFailed: string;
  vName: string; vProvider: string; vLast4: string; vLimit: string; vBalanceNeg: string; vBalanceHigh: string;
  vMinNeg: string; vMinHigh: string; vDue: string;
  bankNames: { [key: string]: string };
}

const en: CreditCardsText = {
  loading: 'Loading your credit cards...', yourCards: 'Your cards', cardsLinked: 'linked', cardOne: 'credit card', cardMany: 'credit cards', addCard: '+ Add Card',
  totalLimit: 'Total Credit Limit', acrossAll: 'Across all cards', totalBalance: 'Total Balance', utilization: '{n}% utilization', noLimitYet: 'No credit limit yet',
  minPaymentDue: 'Min Payment Due', thisMonth: 'This month',
  editCard: 'Edit Credit Card', addNewCard: 'Add New Credit Card', trackSpending: 'Track spending and payment dates',
  cardName: 'Card Name', cardNamePlaceholder: 'e.g., Visa Platinum', provider: 'Provider', selectProvider: 'Select Provider',
  creditLimit: 'Credit Limit ({cur})', currentBalance: 'Current Balance ({cur})', minPaymentLabel: 'Minimum Payment Due ({cur})',
  paymentDueDate: 'Payment Due Date', statementDate: 'Statement Date', last4: 'Last 4 Digits (optional)',
  cancel: 'Cancel', saving: 'Saving...', saveChanges: 'Save Changes', addCardBtn: 'Add Card',
  currentBalanceVisual: 'Current balance', creditUtilization: 'Credit Utilization', minimumPayment: 'Minimum Payment', dueDate: 'Due Date',
  overdue: 'overdue', dayOne: 'day', dayMany: 'days',
  availablePrefix: 'Available {amount}', limitPrefix: 'Limit {amount}',
  viewTransactions: 'View Transactions', makePayment: 'Make Payment', edit: 'Edit', delete: 'Delete',
  noCards: 'No Credit Cards', noCardsSub: 'Add your credit cards to track spending and manage payments', addFirstCard: 'Add Your First Card',
  txTitle: '{name} transactions', close: 'Close', balancePrefix: 'Balance {balance}', availablePrefixShort: 'Available {amount}',
  noActivity: 'No payments or charges recorded yet.', colDate: 'Date', colType: 'Type', colAmount: 'Amount',
  typePayment: 'Payment', typeCharge: 'Charge', addCharge: 'Add Charge',
  deleteTitle: 'Delete credit card?', deleteMessage: '{name} ({provider}) and its payment history will be removed.', deleteConfirm: 'Delete',
  paymentTitle: 'Make payment', paymentMessage: '{name}: balance {balance}, minimum due {minDue}.', paymentLabel: 'Payment amount ({cur})', payConfirm: 'Pay',
  chargeTitle: 'Add charge', chargeMessage: '{name}: available limit {available}.', chargeLabel: 'Charge amount ({cur})', chargeConfirm: 'Add charge',
  noBalance: '{name} has no balance to pay.', updatedNote: '{name} updated.', addedNote: '{name} added.', deletedNote: '{name} deleted.',
  paymentRecorded: 'Payment of {amount} recorded for {name}.', chargeAdded: 'Charge of {amount} added to {name}.',
  amountInvalid: 'Please enter an amount greater than 0.',
  paymentTooHigh: 'Payment cannot be more than the balance ({amount}).',
  chargeTooHigh: 'Charge cannot be more than the available limit ({amount}).',
  saveFailed: 'Failed to save credit card. Please try again.', deleteFailed: 'Failed to delete credit card. Please try again.',
  paymentFailed: 'Failed to record payment. Please try again.', chargeFailed: 'Failed to add charge. Please try again.',
  vName: 'Please enter the card name.', vProvider: 'Please select the provider.', vLast4: 'Last 4 digits must be exactly 4 numbers.',
  vLimit: 'Credit limit must be more than 0.', vBalanceNeg: 'Current balance cannot be negative.',
  vBalanceHigh: 'Current balance cannot be more than the credit limit.', vMinNeg: 'Minimum payment cannot be negative.',
  vMinHigh: 'Minimum payment cannot be more than the current balance.', vDue: 'Please choose the payment due date.',
  bankNames: { 'Commercial Bank': 'Commercial Bank', 'Sampath Bank': 'Sampath Bank', 'HNB': 'Hatton National Bank', 'BOC': 'Bank of Ceylon', 'DFCC': 'DFCC Bank', 'Nations Trust': 'Nations Trust Bank' },
};

const si: CreditCardsText = {
  loading: 'ඔබේ ණය කාඩ්පත් පූරණය වෙමින්...', yourCards: 'ඔබේ කාඩ්පත්', cardsLinked: 'සම්බන්ධ කර ඇත', cardOne: 'ණය කාඩ්පතක්', cardMany: 'ණය කාඩ්පත්', addCard: '+ කාඩ්පතක් එකතු කරන්න',
  totalLimit: 'මුළු ණය සීමාව', acrossAll: 'සියලු කාඩ්පත් හරහා', totalBalance: 'මුළු ශේෂය', utilization: '{n}% භාවිතය', noLimitYet: 'තවම ණය සීමාවක් නැත',
  minPaymentDue: 'අවම ගෙවීම', thisMonth: 'මෙම මාසය',
  editCard: 'ණය කාඩ්පත සංස්කරණය', addNewCard: 'නව ණය කාඩ්පතක් එකතු කරන්න', trackSpending: 'වියදම් සහ ගෙවීම් දිනයන් නිරීක්ෂණය කරන්න',
  cardName: 'කාඩ්පතේ නම', cardNamePlaceholder: 'උදා: වීසා ප්ලැටිනම්', provider: 'සපයන්නා', selectProvider: 'සපයන්නා තෝරන්න',
  creditLimit: 'ණය සීමාව ({cur})', currentBalance: 'වර්තමාන ශේෂය ({cur})', minPaymentLabel: 'අවම ගෙවීම ({cur})',
  paymentDueDate: 'ගෙවීමේ නියමිත දිනය', statementDate: 'ප්‍රකාශ දිනය', last4: 'අවසාන ඉලක්කම් 4 (විකල්ප)',
  cancel: 'අවලංගු කරන්න', saving: 'සුරකිමින්...', saveChanges: 'වෙනස්කම් සුරකින්න', addCardBtn: 'කාඩ්පත එකතු කරන්න',
  currentBalanceVisual: 'වර්තමාන ශේෂය', creditUtilization: 'ණය භාවිතය', minimumPayment: 'අවම ගෙවීම', dueDate: 'නියමිත දිනය',
  overdue: 'කල්ඉකුත්', dayOne: 'දිනයි', dayMany: 'දින',
  availablePrefix: 'ලබාගත හැකි {amount}', limitPrefix: 'සීමාව {amount}',
  viewTransactions: 'ගනුදෙනු බලන්න', makePayment: 'ගෙවන්න', edit: 'සංස්කරණය', delete: 'මකන්න',
  noCards: 'ණය කාඩ්පත් නැත', noCardsSub: 'වියදම් නිරීක්ෂණය කර ගෙවීම් කළමනාකරණය කිරීමට ඔබේ ණය කාඩ්පත් එකතු කරන්න', addFirstCard: 'ඔබේ පළමු කාඩ්පත එකතු කරන්න',
  txTitle: '{name} ගනුදෙනු', close: 'වසන්න', balancePrefix: 'ශේෂය {balance}', availablePrefixShort: 'ලබාගත හැකි {amount}',
  noActivity: 'තවම ගෙවීම් හෝ ගාස්තු වාර්තා කර නැත.', colDate: 'දිනය', colType: 'වර්ගය', colAmount: 'මුදල',
  typePayment: 'ගෙවීම', typeCharge: 'ගාස්තුව', addCharge: 'ගාස්තුවක් එකතු කරන්න',
  deleteTitle: 'ණය කාඩ්පත මකන්නද?', deleteMessage: '{name} ({provider}) සහ එහි ගෙවීම් ඉතිහාසය ඉවත් කෙරේ.', deleteConfirm: 'මකන්න',
  paymentTitle: 'ගෙවීම කරන්න', paymentMessage: '{name}: ශේෂය {balance}, අවම නියමිත {minDue}.', paymentLabel: 'ගෙවන මුදල ({cur})', payConfirm: 'ගෙවන්න',
  chargeTitle: 'ගාස්තුවක් එකතු කරන්න', chargeMessage: '{name}: ලබාගත හැකි සීමාව {available}.', chargeLabel: 'ගාස්තු මුදල ({cur})', chargeConfirm: 'ගාස්තුව එකතු කරන්න',
  noBalance: '{name} ගෙවීමට ශේෂයක් නැත.', updatedNote: '{name} යාවත්කාලීන කරන ලදී.', addedNote: '{name} එකතු කරන ලදී.', deletedNote: '{name} මකා දමන ලදී.',
  paymentRecorded: '{name} සඳහා {amount} ගෙවීම සටහන් කරන ලදී.', chargeAdded: '{name} ට {amount} ගාස්තුව එකතු කරන ලදී.',
  amountInvalid: 'කරුණාකර 0 ට වැඩි මුදලක් ඇතුළත් කරන්න.',
  paymentTooHigh: 'ගෙවීම ශේෂයට ({amount}) වඩා වැඩි විය නොහැක.',
  chargeTooHigh: 'ගාස්තුව ලබාගත හැකි සීමාවට ({amount}) වඩා වැඩි විය නොහැක.',
  saveFailed: 'ණය කාඩ්පත සුරැකීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', deleteFailed: 'ණය කාඩ්පත මැකීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  paymentFailed: 'ගෙවීම සටහන් කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', chargeFailed: 'ගාස්තුව එකතු කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  vName: 'කරුණාකර කාඩ්පතේ නම ඇතුළත් කරන්න.', vProvider: 'කරුණාකර සපයන්නා තෝරන්න.', vLast4: 'අවසාන ඉලක්කම් හරියටම 4ක් විය යුතුය.',
  vLimit: 'ණය සීමාව 0 ට වඩා වැඩි විය යුතුය.', vBalanceNeg: 'වර්තමාන ශේෂය සෘණ විය නොහැක.',
  vBalanceHigh: 'වර්තමාන ශේෂය ණය සීමාවට වඩා වැඩි විය නොහැක.', vMinNeg: 'අවම ගෙවීම සෘණ විය නොහැක.',
  vMinHigh: 'අවම ගෙවීම වර්තමාන ශේෂයට වඩා වැඩි විය නොහැක.', vDue: 'කරුණාකර ගෙවීමේ නියමිත දිනය තෝරන්න.',
  bankNames: { 'Commercial Bank': 'වාණිජ බැංකුව', 'Sampath Bank': 'සම්පත් බැංකුව', 'HNB': 'හැටන් නැෂනල් බැංකුව', 'BOC': 'ලංකා බැංකුව', 'DFCC': 'DFCC බැංකුව', 'Nations Trust': 'නේෂන්ස් ට්‍රස්ට් බැංකුව' },
};

const ta: CreditCardsText = {
  loading: 'உங்கள் கடன் அட்டைகள் ஏற்றப்படுகின்றன...', yourCards: 'உங்கள் அட்டைகள்', cardsLinked: 'இணைக்கப்பட்டுள்ளன', cardOne: 'கடன் அட்டை', cardMany: 'கடன் அட்டைகள்', addCard: '+ அட்டையைச் சேர்',
  totalLimit: 'மொத்த கடன் வரம்பு', acrossAll: 'எல்லா அட்டைகளிலும்', totalBalance: 'மொத்த இருப்பு', utilization: '{n}% பயன்பாடு', noLimitYet: 'இன்னும் கடன் வரம்பு இல்லை',
  minPaymentDue: 'குறைந்தபட்ச செலுத்தல்', thisMonth: 'இந்த மாதம்',
  editCard: 'கடன் அட்டையைத் திருத்து', addNewCard: 'புதிய கடன் அட்டையைச் சேர்', trackSpending: 'செலவுகளையும் செலுத்தும் தேதிகளையும் கண்காணிக்கவும்',
  cardName: 'அட்டையின் பெயர்', cardNamePlaceholder: 'எ.கா., விசா பிளாட்டினம்', provider: 'வழங்குநர்', selectProvider: 'வழங்குநரைத் தேர்ந்தெடுக்கவும்',
  creditLimit: 'கடன் வரம்பு ({cur})', currentBalance: 'தற்போதைய இருப்பு ({cur})', minPaymentLabel: 'குறைந்தபட்ச செலுத்தல் ({cur})',
  paymentDueDate: 'செலுத்தும் நிலுவைத் தேதி', statementDate: 'அறிக்கைத் தேதி', last4: 'கடைசி 4 இலக்கங்கள் (விருப்பம்)',
  cancel: 'ரத்து செய்', saving: 'சேமிக்கப்படுகிறது...', saveChanges: 'மாற்றங்களைச் சேமி', addCardBtn: 'அட்டையைச் சேர்',
  currentBalanceVisual: 'தற்போதைய இருப்பு', creditUtilization: 'கடன் பயன்பாடு', minimumPayment: 'குறைந்தபட்ச செலுத்தல்', dueDate: 'நிலுவைத் தேதி',
  overdue: 'காலாவதி', dayOne: 'நாள்', dayMany: 'நாட்கள்',
  availablePrefix: 'கிடைக்கும் {amount}', limitPrefix: 'வரம்பு {amount}',
  viewTransactions: 'பரிவர்த்தனைகளைப் பார்', makePayment: 'செலுத்து', edit: 'திருத்து', delete: 'நீக்கு',
  noCards: 'கடன் அட்டைகள் இல்லை', noCardsSub: 'செலவுகளைக் கண்காணிக்கவும் செலுத்தல்களை நிர்வகிக்கவும் உங்கள் கடன் அட்டைகளைச் சேர்க்கவும்', addFirstCard: 'உங்கள் முதல் அட்டையைச் சேர்',
  txTitle: '{name} பரிவர்த்தனைகள்', close: 'மூடு', balancePrefix: 'இருப்பு {balance}', availablePrefixShort: 'கிடைக்கும் {amount}',
  noActivity: 'இன்னும் செலுத்தல்கள் அல்லது கட்டணங்கள் பதிவு செய்யப்படவில்லை.', colDate: 'தேதி', colType: 'வகை', colAmount: 'தொகை',
  typePayment: 'செலுத்தல்', typeCharge: 'கட்டணம்', addCharge: 'கட்டணத்தைச் சேர்',
  deleteTitle: 'கடன் அட்டையை நீக்கவா?', deleteMessage: '{name} ({provider}) மற்றும் அதன் செலுத்தல் வரலாறு நீக்கப்படும்.', deleteConfirm: 'நீக்கு',
  paymentTitle: 'செலுத்து', paymentMessage: '{name}: இருப்பு {balance}, குறைந்தபட்ச நிலுவை {minDue}.', paymentLabel: 'செலுத்தும் தொகை ({cur})', payConfirm: 'செலுத்து',
  chargeTitle: 'கட்டணத்தைச் சேர்', chargeMessage: '{name}: கிடைக்கும் வரம்பு {available}.', chargeLabel: 'கட்டணத் தொகை ({cur})', chargeConfirm: 'கட்டணத்தைச் சேர்',
  noBalance: '{name} இல் செலுத்த இருப்பு இல்லை.', updatedNote: '{name} புதுப்பிக்கப்பட்டது.', addedNote: '{name} சேர்க்கப்பட்டது.', deletedNote: '{name} நீக்கப்பட்டது.',
  paymentRecorded: '{name} க்கான {amount} செலுத்தல் பதிவு செய்யப்பட்டது.', chargeAdded: '{name} க்கு {amount} கட்டணம் சேர்க்கப்பட்டது.',
  amountInvalid: '0-ஐ விட அதிகமான தொகையை உள்ளிடவும்.',
  paymentTooHigh: 'செலுத்தல் இருப்பை ({amount}) விட அதிகமாக இருக்க முடியாது.',
  chargeTooHigh: 'கட்டணம் கிடைக்கும் வரம்பை ({amount}) விட அதிகமாக இருக்க முடியாது.',
  saveFailed: 'கடன் அட்டையைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', deleteFailed: 'கடன் அட்டையை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  paymentFailed: 'செலுத்தலைப் பதிவு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', chargeFailed: 'கட்டணத்தைச் சேர்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  vName: 'அட்டையின் பெயரை உள்ளிடவும்.', vProvider: 'வழங்குநரைத் தேர்ந்தெடுக்கவும்.', vLast4: 'கடைசி 4 இலக்கங்கள் சரியாக 4 எண்களாக இருக்க வேண்டும்.',
  vLimit: 'கடன் வரம்பு 0-ஐ விட அதிகமாக இருக்க வேண்டும்.', vBalanceNeg: 'தற்போதைய இருப்பு எதிர்மறையாக இருக்க முடியாது.',
  vBalanceHigh: 'தற்போதைய இருப்பு கடன் வரம்பை விட அதிகமாக இருக்க முடியாது.', vMinNeg: 'குறைந்தபட்ச செலுத்தல் எதிர்மறையாக இருக்க முடியாது.',
  vMinHigh: 'குறைந்தபட்ச செலுத்தல் தற்போதைய இருப்பை விட அதிகமாக இருக்க முடியாது.', vDue: 'செலுத்தும் நிலுவைத் தேதியைத் தேர்ந்தெடுக்கவும்.',
  bankNames: { 'Commercial Bank': 'வணிக வங்கி', 'Sampath Bank': 'சம்பத் வங்கி', 'HNB': 'ஹாட்டன் நேஷனல் வங்கி', 'BOC': 'இலங்கை வங்கி', 'DFCC': 'DFCC வங்கி', 'Nations Trust': 'நேஷன்ஸ் டிரஸ்ட் வங்கி' },
};

export const CC_T: Record<AdminLang, CreditCardsText> = { en, si, ta };
