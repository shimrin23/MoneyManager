// Text for the Fixed Deposits page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface FixedDepositsText {
  loading: string; loadError: string; openNew: string;
  activeFds: string; totalPrincipal: string; maturityValue: string; maturing90: string;
  openNewTitle: string; bankName: string; bankPlaceholder: string; defaultBank: string;
  principalAmount: string; interestRate: string; tenure: string; months: string; years: string;
  startDate: string; fdType: string; typeStandard: string; typeGoal: string; typeTax: string;
  autoRenewalCheck: string; cancel: string; opening: string; openFd: string;
  noFds: string; noFdsSub: string;
  principal: string; atMaturity: string; interest: string; rate: string; tenureLabel: string;
  autoRenewal: string; maturity: string; on: string; off: string; elapsed: string;
  withdrawEarly: string; delete: string; renewFd: string; remove: string;
  stActive: string; stMatured: string; stClosed: string;
  matureToday: string; daysLeft: string; monthsLeft: string; maturedOn: string; withdrawnEarly: string;
  withdrawTitle: string; withdrawMessage: string; withdrawConfirm: string;
  renewTitle: string; renewMessage: string; renewConfirm: string;
  deleteTitle: string; deleteMessage: string; deleteConfirm: string;
  openedNote: string; withdrawnNote: string; renewedNote: string; deletedNote: string;
  createFailed: string; withdrawFailed: string; renewFailed: string; deleteFailed: string;
}

const en: FixedDepositsText = {
  loading: 'Loading fixed deposits...', loadError: 'Unable to load fixed deposits. Please try again.', openNew: '+ Open New FD',
  activeFds: 'Active FDs', totalPrincipal: 'Total Principal', maturityValue: 'Maturity Value', maturing90: 'Maturing in 90 Days',
  openNewTitle: 'Open New Fixed Deposit', bankName: 'Bank Name', bankPlaceholder: 'e.g. Commercial Bank', defaultBank: 'Your Bank',
  principalAmount: 'Principal Amount ({cur})', interestRate: 'Interest Rate (%)', tenure: 'Tenure', months: 'Months', years: 'Years',
  startDate: 'Start Date', fdType: 'FD Type', typeStandard: 'Standard', typeGoal: 'Goal-Linked', typeTax: 'Tax Saver',
  autoRenewalCheck: 'Enable Auto-Renewal at maturity', cancel: 'Cancel', opening: 'Opening...', openFd: 'Open FD',
  noFds: 'No Fixed Deposits Yet', noFdsSub: 'Open your first fixed deposit to start earning guaranteed returns.',
  principal: 'Principal', atMaturity: 'At Maturity', interest: 'Interest', rate: 'Rate', tenureLabel: 'Tenure',
  autoRenewal: 'Auto-Renewal', maturity: 'Maturity', on: 'On', off: 'Off', elapsed: '{n}% elapsed',
  withdrawEarly: 'Withdraw Early', delete: 'Delete', renewFd: 'Renew FD', remove: 'Remove',
  stActive: 'Active', stMatured: 'Matured', stClosed: 'Closed',
  matureToday: 'Matures today', daysLeft: '{n}d left', monthsLeft: '{n}mo left', maturedOn: 'Matured on {date}', withdrawnEarly: 'Withdrawn early',
  withdrawTitle: 'Withdraw early?',
  withdrawMessage: "Close {account} before its maturity date? This can't be undone, and banks usually pay less interest on early withdrawal.",
  withdrawConfirm: 'Withdraw Early',
  renewTitle: 'Renew fixed deposit?',
  renewMessage: 'Start a new {tenure} {unit} term from today at {rate}% with {amount} (principal plus interest).',
  renewConfirm: 'Renew',
  deleteTitle: 'Delete fixed deposit?', deleteMessage: 'Are you sure you want to delete this fixed deposit?', deleteConfirm: 'Delete',
  openedNote: 'Fixed deposit opened.', withdrawnNote: 'Fixed deposit withdrawn early.', renewedNote: 'Fixed deposit renewed.', deletedNote: 'Fixed deposit deleted.',
  createFailed: 'Failed to create fixed deposit. Please try again.', withdrawFailed: 'Failed to withdraw fixed deposit. Please try again.',
  renewFailed: 'Failed to renew fixed deposit. Please try again.', deleteFailed: 'Failed to delete fixed deposit. Please try again.',
};

const si: FixedDepositsText = {
  loading: 'ස්ථාවර තැන්පතු පූරණය වෙමින්...', loadError: 'ස්ථාවර තැන්පතු පූරණය කළ නොහැක. නැවත උත්සාහ කරන්න.', openNew: '+ නව FD විවෘත කරන්න',
  activeFds: 'සක්‍රිය FD', totalPrincipal: 'මුළු මූලධනය', maturityValue: 'කල්පිරීමේ වටිනාකම', maturing90: 'දින 90 තුළ කල්පිරේ',
  openNewTitle: 'නව ස්ථාවර තැන්පතුවක් විවෘත කරන්න', bankName: 'බැංකුවේ නම', bankPlaceholder: 'උදා: වාණිජ බැංකුව', defaultBank: 'ඔබේ බැංකුව',
  principalAmount: 'මූලධන මුදල ({cur})', interestRate: 'පොලී අනුපාතය (%)', tenure: 'කාලය', months: 'මාස', years: 'වසර',
  startDate: 'ආරම්භ දිනය', fdType: 'FD වර්ගය', typeStandard: 'සම්මත', typeGoal: 'ඉලක්ක-සම්බන්ධ', typeTax: 'බදු ඉතිරිකිරීම',
  autoRenewalCheck: 'කල්පිරීමේදී ස්වයංක්‍රීය අලුත් කිරීම සක්‍රිය කරන්න', cancel: 'අවලංගු කරන්න', opening: 'විවෘත කෙරෙමින්...', openFd: 'FD විවෘත කරන්න',
  noFds: 'තවම ස්ථාවර තැන්පතු නැත', noFdsSub: 'සහතික ප්‍රතිලාභ ලබා ගැනීමට ඔබේ පළමු ස්ථාවර තැන්පතුව විවෘත කරන්න.',
  principal: 'මූලධනය', atMaturity: 'කල්පිරීමේදී', interest: 'පොලිය', rate: 'අනුපාතය', tenureLabel: 'කාලය',
  autoRenewal: 'ස්වයංක්‍රීය අලුත් කිරීම', maturity: 'කල්පිරීම', on: 'ක්‍රියාත්මකයි', off: 'ක්‍රියාවිරහිතයි', elapsed: '{n}% ගත වී ඇත',
  withdrawEarly: 'කල් පෙර ආපසු ගන්න', delete: 'මකන්න', renewFd: 'FD අලුත් කරන්න', remove: 'ඉවත් කරන්න',
  stActive: 'සක්‍රිය', stMatured: 'කල්පිරුණු', stClosed: 'වසා ඇත',
  matureToday: 'අද කල්පිරේ', daysLeft: 'දින {n} ඉතිරියි', monthsLeft: 'මාස {n} ඉතිරියි', maturedOn: '{date} දින කල්පිරුණි', withdrawnEarly: 'කල් පෙර ආපසු ගන්නා ලදී',
  withdrawTitle: 'කල් පෙර ආපසු ගන්නද?',
  withdrawMessage: 'කල්පිරීමේ දිනට පෙර {account} වසන්නද? මෙය අහෝසි කළ නොහැක. කල් පෙර ආපසු ගැනීමේදී සාමාන්‍යයෙන් බැංකු අඩු පොලියක් ගෙවයි.',
  withdrawConfirm: 'කල් පෙර ආපසු ගන්න',
  renewTitle: 'ස්ථාවර තැන්පතුව අලුත් කරන්නද?',
  renewMessage: 'අද සිට {rate}% පොලියට {tenure} {unit} කාලයක් සඳහා {amount} (මූලධනය සහ පොලිය) සමඟ නව කාලයක් ආරම්භ කරන්න.',
  renewConfirm: 'අලුත් කරන්න',
  deleteTitle: 'ස්ථාවර තැන්පතුව මකන්නද?', deleteMessage: 'මෙම ස්ථාවර තැන්පතුව මකා දැමීමට ඔබට විශ්වාසද?', deleteConfirm: 'මකන්න',
  openedNote: 'ස්ථාවර තැන්පතුව විවෘත කරන ලදී.', withdrawnNote: 'ස්ථාවර තැන්පතුව කල් පෙර ආපසු ගන්නා ලදී.', renewedNote: 'ස්ථාවර තැන්පතුව අලුත් කරන ලදී.', deletedNote: 'ස්ථාවර තැන්පතුව මකා දමන ලදී.',
  createFailed: 'ස්ථාවර තැන්පතුව සෑදීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', withdrawFailed: 'ස්ථාවර තැන්පතුව ආපසු ගැනීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  renewFailed: 'ස්ථාවර තැන්පතුව අලුත් කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', deleteFailed: 'ස්ථාවර තැන්පතුව මැකීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
};

const ta: FixedDepositsText = {
  loading: 'நிலையான வைப்புகள் ஏற்றப்படுகின்றன...', loadError: 'நிலையான வைப்புகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', openNew: '+ புதிய FD ஐத் திற',
  activeFds: 'செயலில் உள்ள FD', totalPrincipal: 'மொத்த அசல்', maturityValue: 'முதிர்வு மதிப்பு', maturing90: '90 நாட்களில் முதிர்வு',
  openNewTitle: 'புதிய நிலையான வைப்பைத் திறக்கவும்', bankName: 'வங்கியின் பெயர்', bankPlaceholder: 'எ.கா. வணிக வங்கி', defaultBank: 'உங்கள் வங்கி',
  principalAmount: 'அசல் தொகை ({cur})', interestRate: 'வட்டி விகிதம் (%)', tenure: 'காலம்', months: 'மாதங்கள்', years: 'ஆண்டுகள்',
  startDate: 'தொடக்க தேதி', fdType: 'FD வகை', typeStandard: 'நிலையானது', typeGoal: 'இலக்கு-இணைக்கப்பட்டது', typeTax: 'வரி சேமிப்பு',
  autoRenewalCheck: 'முதிர்வில் தானியங்கி புதுப்பித்தலை இயக்கவும்', cancel: 'ரத்து செய்', opening: 'திறக்கப்படுகிறது...', openFd: 'FD ஐத் திற',
  noFds: 'இன்னும் நிலையான வைப்புகள் இல்லை', noFdsSub: 'உத்தரவாத வருமானம் பெற உங்கள் முதல் நிலையான வைப்பைத் திறக்கவும்.',
  principal: 'அசல்', atMaturity: 'முதிர்வில்', interest: 'வட்டி', rate: 'விகிதம்', tenureLabel: 'காலம்',
  autoRenewal: 'தானியங்கி புதுப்பித்தல்', maturity: 'முதிர்வு', on: 'இயக்கம்', off: 'நிறுத்தம்', elapsed: '{n}% கடந்துவிட்டது',
  withdrawEarly: 'முன்கூட்டியே எடு', delete: 'நீக்கு', renewFd: 'FD ஐப் புதுப்பி', remove: 'அகற்று',
  stActive: 'செயலில்', stMatured: 'முதிர்ந்தது', stClosed: 'மூடப்பட்டது',
  matureToday: 'இன்று முதிர்கிறது', daysLeft: '{n} நாட்கள் மீதம்', monthsLeft: '{n} மாதங்கள் மீதம்', maturedOn: '{date} அன்று முதிர்ந்தது', withdrawnEarly: 'முன்கூட்டியே எடுக்கப்பட்டது',
  withdrawTitle: 'முன்கூட்டியே எடுக்கவா?',
  withdrawMessage: 'முதிர்வு தேதிக்கு முன் {account} ஐ மூடவா? இதை மாற்ற முடியாது. முன்கூட்டிய திரும்பப் பெறுதலுக்கு வங்கிகள் பொதுவாக குறைந்த வட்டி தருகின்றன.',
  withdrawConfirm: 'முன்கூட்டியே எடு',
  renewTitle: 'நிலையான வைப்பைப் புதுப்பிக்கவா?',
  renewMessage: 'இன்று முதல் {rate}% வட்டியில் {tenure} {unit} காலத்திற்கு {amount} (அசல் மற்றும் வட்டி) உடன் புதிய காலத்தைத் தொடங்கவும்.',
  renewConfirm: 'புதுப்பி',
  deleteTitle: 'நிலையான வைப்பை நீக்கவா?', deleteMessage: 'இந்த நிலையான வைப்பை நீக்க விரும்புகிறீர்களா?', deleteConfirm: 'நீக்கு',
  openedNote: 'நிலையான வைப்பு திறக்கப்பட்டது.', withdrawnNote: 'நிலையான வைப்பு முன்கூட்டியே எடுக்கப்பட்டது.', renewedNote: 'நிலையான வைப்பு புதுப்பிக்கப்பட்டது.', deletedNote: 'நிலையான வைப்பு நீக்கப்பட்டது.',
  createFailed: 'நிலையான வைப்பை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', withdrawFailed: 'நிலையான வைப்பைத் திரும்பப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  renewFailed: 'நிலையான வைப்பைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', deleteFailed: 'நிலையான வைப்பை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
};

export const FD_T: Record<AdminLang, FixedDepositsText> = { en, si, ta };
