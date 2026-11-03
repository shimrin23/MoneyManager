// Text for the Leases page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface LeasesText {
  typeVehicle: string; typeEquipment: string; typeProperty: string; typeOther: string;
  pillActive: string; pillCompleted: string; pillDefaulted: string;
  filterAll: string; filterActive: string; filterCompleted: string;
  loading: string; loadFailed: string; addBtn: string;
  statActive: string; statMonthly: string; statOutstanding: string; statCompleted: string;
  formTitle: string; assetName: string; lessor: string; assetType: string; principalLabel: string;
  monthlyLabel: string; interestLabel: string; tenureLabel: string; startDate: string;
  cancel: string; saving: string; save: string;
  phAsset: string; phLessor: string; phPrincipal: string; phMonthly: string; phInterest: string; phTenure: string;
  emptyTitle: string; emptyText: string;
  kvMonthly: string; kvOutstanding: string; kvRemaining: string; kvMonths: string; kvRate: string; kvRateValue: string;
  kvTenure: string; kvNext: string; overdueDue: string; inDays: string; paidOff: string;
  recordPayment: string; markCompleted: string; delete: string;
  mismatchTitle: string; mismatchMsg: string; saveAnyway: string; goBack: string;
  markCompletedTitle: string; markCompletedMsg: string; markCompletedBtn: string;
  recordTitle: string; recordMsg: string; amountLabel: string; recordBtn: string; amountInvalid: string;
  deleteTitle: string; deleteMsg: string; deleteBtn: string;
  addedNote: string; completedNote: string; finalNote: string; paymentNote: string; deletedNote: string;
  failCreate: string; failUpdate: string; failPayment: string; failDelete: string;
}

const en: LeasesText = {
  typeVehicle: 'Vehicle', typeEquipment: 'Equipment', typeProperty: 'Property', typeOther: 'Other',
  pillActive: 'Active', pillCompleted: 'Completed', pillDefaulted: 'Defaulted',
  filterAll: 'All', filterActive: 'Active', filterCompleted: 'Completed',
  loading: 'Loading leases...', loadFailed: 'Unable to load leases. Please try again.', addBtn: '+ Add New Lease',
  statActive: 'Active Leases', statMonthly: 'Monthly Payment', statOutstanding: 'Total Outstanding', statCompleted: 'Completed',
  formTitle: 'Add New Lease', assetName: 'Asset Name', lessor: 'Lessor / Finance Company', assetType: 'Asset Type',
  principalLabel: 'Principal Amount ({cur})', monthlyLabel: 'Monthly Payment ({cur})', interestLabel: 'Interest Rate (% p.a.)',
  tenureLabel: 'Tenure (Months)', startDate: 'Start Date',
  cancel: 'Cancel', saving: 'Saving...', save: 'Save Lease',
  phAsset: 'e.g. Toyota Aqua 2022', phLessor: 'e.g. Commercial Leasing', phPrincipal: 'e.g. 4500000', phMonthly: 'e.g. 95000',
  phInterest: 'e.g. 14.5', phTenure: 'e.g. 60',
  emptyTitle: 'No Leases Added', emptyText: 'Keep track of your vehicle and equipment leases, outstanding balances, and monthly payments.',
  kvMonthly: 'Monthly Payment', kvOutstanding: 'Outstanding', kvRemaining: 'Remaining', kvMonths: '{n} months',
  kvRate: 'Rate', kvRateValue: '{rate}% p.a.', kvTenure: 'Tenure', kvNext: 'Next Payment',
  overdueDue: 'Overdue by {n}d (due {date})', inDays: 'In {n}d ({date})', paidOff: '{n}% paid off',
  recordPayment: 'Record Payment', markCompleted: 'Mark Completed', delete: 'Delete',
  mismatchTitle: "Payments don't cover the principal",
  mismatchMsg: '{tenure} payments of {monthly} add up to {total}, which is less than the principal of {principal}. Check the monthly payment and tenure. Save anyway?',
  saveAnyway: 'Save Anyway', goBack: 'Go Back',
  markCompletedTitle: 'Mark lease as completed?',
  markCompletedMsg: "This sets {asset} as fully paid ({outstanding} outstanding, {months} months left) and can't be undone.",
  markCompletedBtn: 'Mark Completed',
  recordTitle: 'Record lease payment', recordMsg: 'Record one monthly payment for {asset}.', amountLabel: 'Amount paid ({cur})',
  recordBtn: 'Record Payment', amountInvalid: 'Enter an amount greater than 0',
  deleteTitle: 'Delete lease?', deleteMsg: 'Are you sure you want to delete this lease?', deleteBtn: 'Delete',
  addedNote: 'Lease added.', completedNote: 'Lease marked as completed.',
  finalNote: 'Final payment recorded. Lease completed.', paymentNote: 'Payment recorded. {n} months remaining.', deletedNote: 'Lease deleted.',
  failCreate: 'Failed to create lease. Please try again.', failUpdate: 'Failed to update lease. Please try again.',
  failPayment: 'Failed to record payment. Please try again.', failDelete: 'Failed to delete lease. Please try again.',
};

const si: LeasesText = {
  typeVehicle: 'වාහන', typeEquipment: 'උපකරණ', typeProperty: 'දේපල', typeOther: 'වෙනත්',
  pillActive: 'සක්‍රිය', pillCompleted: 'සම්පූර්ණ', pillDefaulted: 'පැහැර හැරියා',
  filterAll: 'සියල්ල', filterActive: 'සක්‍රිය', filterCompleted: 'සම්පූර්ණ',
  loading: 'කුලී ගිවිසුම් පූරණය වෙමින්...', loadFailed: 'කුලී ගිවිසුම් පූරණය කළ නොහැක. නැවත උත්සාහ කරන්න.', addBtn: '+ නව කුලී ගිවිසුමක් එකතු කරන්න',
  statActive: 'සක්‍රිය කුලී ගිවිසුම්', statMonthly: 'මාසික ගෙවීම', statOutstanding: 'මුළු හිඟ මුදල', statCompleted: 'සම්පූර්ණ',
  formTitle: 'නව කුලී ගිවිසුමක් එකතු කරන්න', assetName: 'වත්කමේ නම', lessor: 'බදු දෙන්නා / මූල්‍ය සමාගම', assetType: 'වත්කම් වර්ගය',
  principalLabel: 'මූලික මුදල ({cur})', monthlyLabel: 'මාසික ගෙවීම ({cur})', interestLabel: 'පොලී අනුපාතය (% වාර්ෂික)',
  tenureLabel: 'කාලය (මාස)', startDate: 'ආරම්භ දිනය',
  cancel: 'අවලංගු කරන්න', saving: 'සුරකිමින්...', save: 'කුලී ගිවිසුම සුරකින්න',
  phAsset: 'උදා: Toyota Aqua 2022', phLessor: 'උදා: Commercial Leasing', phPrincipal: 'උදා: 4500000', phMonthly: 'උදා: 95000',
  phInterest: 'උදා: 14.5', phTenure: 'උදා: 60',
  emptyTitle: 'කුලී ගිවිසුම් එකතු කර නැත', emptyText: 'ඔබේ වාහන හා උපකරණ කුලී ගිවිසුම්, හිඟ ශේෂ සහ මාසික ගෙවීම් නිරීක්ෂණය කරන්න.',
  kvMonthly: 'මාසික ගෙවීම', kvOutstanding: 'හිඟ මුදල', kvRemaining: 'ඉතිරි', kvMonths: 'මාස {n}',
  kvRate: 'අනුපාතය', kvRateValue: '{rate}% වාර්ෂික', kvTenure: 'කාලය', kvNext: 'ඊළඟ ගෙවීම',
  overdueDue: 'දින {n} කින් ප්‍රමාදයි (නියමිත දිනය {date})', inDays: 'දින {n} කින් ({date})', paidOff: '{n}% ගෙවා ඇත',
  recordPayment: 'ගෙවීම සටහන් කරන්න', markCompleted: 'සම්පූර්ණ ලෙස සලකුණු කරන්න', delete: 'මකන්න',
  mismatchTitle: 'ගෙවීම් මූලික මුදල ආවරණය නොකරයි',
  mismatchMsg: 'ගෙවීම් {tenure} ක් {monthly} බැගින් මුළු {total} වේ, එය මූලික මුදල {principal} ට වඩා අඩුය. මාසික ගෙවීම සහ කාලය පරීක්ෂා කරන්න. කෙසේ හෝ සුරකිනවාද?',
  saveAnyway: 'කෙසේ හෝ සුරකින්න', goBack: 'ආපසු යන්න',
  markCompletedTitle: 'කුලී ගිවිසුම සම්පූර්ණ ලෙස සලකුණු කරන්නද?',
  markCompletedMsg: 'මෙය {asset} සම්පූර්ණයෙන් ගෙවා ඇති ලෙස සකසයි ({outstanding} හිඟයි, මාස {months} ඉතිරියි) සහ මෙය අහෝසි කළ නොහැක.',
  markCompletedBtn: 'සම්පූර්ණ ලෙස සලකුණු කරන්න',
  recordTitle: 'කුලී ගෙවීම සටහන් කරන්න', recordMsg: '{asset} සඳහා එක් මාසික ගෙවීමක් සටහන් කරන්න.', amountLabel: 'ගෙවූ මුදල ({cur})',
  recordBtn: 'ගෙවීම සටහන් කරන්න', amountInvalid: '0 ට වඩා වැඩි මුදලක් ඇතුළත් කරන්න',
  deleteTitle: 'කුලී ගිවිසුම මකන්නද?', deleteMsg: 'මෙම කුලී ගිවිසුම මකා දැමීමට ඔබට විශ්වාසද?', deleteBtn: 'මකන්න',
  addedNote: 'කුලී ගිවිසුම එකතු කරන ලදී.', completedNote: 'කුලී ගිවිසුම සම්පූර්ණ ලෙස සලකුණු කරන ලදී.',
  finalNote: 'අවසාන ගෙවීම සටහන් කරන ලදී. කුලී ගිවිසුම සම්පූර්ණයි.', paymentNote: 'ගෙවීම සටහන් කරන ලදී. මාස {n} ඉතිරියි.', deletedNote: 'කුලී ගිවිසුම මකා දමන ලදී.',
  failCreate: 'කුලී ගිවිසුම සෑදීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', failUpdate: 'කුලී ගිවිසුම යාවත්කාලීන කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  failPayment: 'ගෙවීම සටහන් කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', failDelete: 'කුලී ගිවිසුම මැකීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
};

const ta: LeasesText = {
  typeVehicle: 'வாகனம்', typeEquipment: 'உபகரணம்', typeProperty: 'சொத்து', typeOther: 'மற்றவை',
  pillActive: 'செயலில்', pillCompleted: 'முடிந்தது', pillDefaulted: 'தவறியது',
  filterAll: 'அனைத்தும்', filterActive: 'செயலில்', filterCompleted: 'முடிந்தவை',
  loading: 'குத்தகைகள் ஏற்றப்படுகின்றன...', loadFailed: 'குத்தகைகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', addBtn: '+ புதிய குத்தகையைச் சேர்',
  statActive: 'செயலில் உள்ள குத்தகைகள்', statMonthly: 'மாதாந்திர செலுத்தல்', statOutstanding: 'மொத்த நிலுவை', statCompleted: 'முடிந்தவை',
  formTitle: 'புதிய குத்தகையைச் சேர்', assetName: 'சொத்தின் பெயர்', lessor: 'குத்தகை வழங்குநர் / நிதி நிறுவனம்', assetType: 'சொத்து வகை',
  principalLabel: 'அசல் தொகை ({cur})', monthlyLabel: 'மாதாந்திர செலுத்தல் ({cur})', interestLabel: 'வட்டி விகிதம் (% ஆண்டுக்கு)',
  tenureLabel: 'காலம் (மாதங்கள்)', startDate: 'தொடக்க தேதி',
  cancel: 'ரத்து செய்', saving: 'சேமிக்கப்படுகிறது...', save: 'குத்தகையைச் சேமி',
  phAsset: 'எ.கா. Toyota Aqua 2022', phLessor: 'எ.கா. Commercial Leasing', phPrincipal: 'எ.கா. 4500000', phMonthly: 'எ.கா. 95000',
  phInterest: 'எ.கா. 14.5', phTenure: 'எ.கா. 60',
  emptyTitle: 'குத்தகைகள் எதுவும் சேர்க்கப்படவில்லை', emptyText: 'உங்கள் வாகன மற்றும் உபகரண குத்தகைகள், மீதமுள்ள நிலுவைகள் மற்றும் மாதாந்திர செலுத்தல்களைக் கண்காணியுங்கள்.',
  kvMonthly: 'மாதாந்திர செலுத்தல்', kvOutstanding: 'நிலுவை', kvRemaining: 'மீதம்', kvMonths: '{n} மாதங்கள்',
  kvRate: 'விகிதம்', kvRateValue: '{rate}% ஆண்டுக்கு', kvTenure: 'காலம்', kvNext: 'அடுத்த செலுத்தல்',
  overdueDue: '{n} நாட்கள் தாமதம் (நிலுவை {date})', inDays: '{n} நாட்களில் ({date})', paidOff: '{n}% செலுத்தப்பட்டது',
  recordPayment: 'செலுத்தலைப் பதிவு செய்', markCompleted: 'முடிந்ததாகக் குறி', delete: 'நீக்கு',
  mismatchTitle: 'செலுத்தல்கள் அசல் தொகையை ஈடுசெய்யவில்லை',
  mismatchMsg: '{monthly} வீதம் {tenure} செலுத்தல்கள் மொத்தம் {total} ஆகும், இது அசல் தொகை {principal} ஐ விடக் குறைவு. மாதாந்திர செலுத்தல் மற்றும் காலத்தைச் சரிபார்க்கவும். எப்படியும் சேமிக்கவா?',
  saveAnyway: 'எப்படியும் சேமி', goBack: 'திரும்பிச் செல்',
  markCompletedTitle: 'குத்தகையை முடிந்ததாகக் குறிக்கவா?',
  markCompletedMsg: 'இது {asset} முழுமையாகச் செலுத்தப்பட்டதாக அமைக்கும் ({outstanding} நிலுவை, {months} மாதங்கள் மீதம்). இதை மாற்ற முடியாது.',
  markCompletedBtn: 'முடிந்ததாகக் குறி',
  recordTitle: 'குத்தகைச் செலுத்தலைப் பதிவு செய்', recordMsg: '{asset} க்கான ஒரு மாதாந்திர செலுத்தலைப் பதிவு செய்யவும்.', amountLabel: 'செலுத்திய தொகை ({cur})',
  recordBtn: 'செலுத்தலைப் பதிவு செய்', amountInvalid: '0 ஐ விடப் பெரிய தொகையை உள்ளிடவும்',
  deleteTitle: 'குத்தகையை நீக்கவா?', deleteMsg: 'இந்தக் குத்தகையை நீக்க விரும்புகிறீர்களா?', deleteBtn: 'நீக்கு',
  addedNote: 'குத்தகை சேர்க்கப்பட்டது.', completedNote: 'குத்தகை முடிந்ததாகக் குறிக்கப்பட்டது.',
  finalNote: 'இறுதிச் செலுத்தல் பதிவு செய்யப்பட்டது. குத்தகை முடிந்தது.', paymentNote: 'செலுத்தல் பதிவு செய்யப்பட்டது. {n} மாதங்கள் மீதம்.', deletedNote: 'குத்தகை நீக்கப்பட்டது.',
  failCreate: 'குத்தகையை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', failUpdate: 'குத்தகையைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  failPayment: 'செலுத்தலைப் பதிவு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', failDelete: 'குத்தகையை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
};

export const LEASES_T: Record<AdminLang, LeasesText> = { en, si, ta };
