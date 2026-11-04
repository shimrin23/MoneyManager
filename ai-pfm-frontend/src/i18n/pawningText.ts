// Text for the Pawning page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface PawningText {
  typeGold: string; typeJewelry: string; typeElectronics: string; typeDocuments: string; typeOther: string;
  statusActive: string; statusRedeemed: string; statusAuctioned: string; statusRenewed: string;
  filterAll: string; filterActive: string; filterRedeemed: string;
  loading: string; loadFailed: string; addBtn: string;
  statActive: string; statLoan: string; statPledged: string; statUrgent: string;
  formTitle: string; itemDesc: string; itemType: string; pledgedLabel: string; loanLabel: string;
  interestLabel: string; branch: string; ticket: string; pledgeDate: string; redemptionDate: string;
  cancel: string; saving: string; save: string;
  phDesc: string; phPledged: string; phLoan: string; phInterest: string; phBranch: string; phTicket: string;
  emptyTitle: string; emptyText: string;
  kvLoan: string; kvDueNow: string; kvPledged: string; kvRate: string; kvRateValue: string;
  kvAccrued: string; kvRedemption: string; kvTimeLeft: string; overdueBy: string; daysLeft: string;
  redeemItem: string; delete: string;
  redeemTitle: string; redeemMsg: string; redeem: string;
  deleteTitle: string; deleteMsg: string;
  addedNote: string; redeemedNote: string; deletedNote: string;
  failCreate: string; failUpdate: string; failDelete: string;
}

const en: PawningText = {
  typeGold: 'Gold', typeJewelry: 'Jewelry', typeElectronics: 'Electronics', typeDocuments: 'Documents', typeOther: 'Other',
  statusActive: 'ACTIVE', statusRedeemed: 'REDEEMED', statusAuctioned: 'AUCTIONED', statusRenewed: 'RENEWED',
  filterAll: 'All', filterActive: 'Active', filterRedeemed: 'Redeemed',
  loading: 'Loading pawning items...', loadFailed: 'Unable to load pawning items. Please try again.', addBtn: '+ Add Pawn Item',
  statActive: 'Active Items', statLoan: 'Total Loan Taken', statPledged: 'Pledged Value', statUrgent: 'Overdue or Due in < 21 Days',
  formTitle: 'Add Pawn Item', itemDesc: 'Item Description', itemType: 'Item Type', pledgedLabel: 'Pledged Value ({cur})',
  loanLabel: 'Loan Amount ({cur})', interestLabel: 'Interest Rate (% p.a.)', branch: 'Branch', ticket: 'Ticket Number',
  pledgeDate: 'Pledge Date', redemptionDate: 'Redemption Date', cancel: 'Cancel', saving: 'Saving...', save: 'Save Pawn Item',
  phDesc: 'e.g. 22K Gold Chain', phPledged: 'e.g. 180000', phLoan: 'e.g. 126000', phInterest: 'e.g. 24',
  phBranch: 'e.g. Colombo 03', phTicket: 'e.g. PWN-1234',
  emptyTitle: 'No Pawning Items Added', emptyText: 'Track your pawned items, keep an eye on redemption dates, and never miss a payment.',
  kvLoan: 'Loan Amount', kvDueNow: 'Total Due Now', kvPledged: 'Pledged Value', kvRate: 'Interest Rate',
  kvRateValue: '{rate}% p.a. ({monthly}/mo)', kvAccrued: 'Accrued Interest', kvRedemption: 'Redemption Date',
  kvTimeLeft: 'Time Left', overdueBy: 'Overdue by {n} days', daysLeft: '{n} days',
  redeemItem: 'Redeem Item', delete: 'Delete',
  redeemTitle: 'Redeem item?', redeemMsg: 'Mark {desc} (#{ticket}) as redeemed? Total due now is {amount}. This can\'t be undone.', redeem: 'Redeem',
  deleteTitle: 'Delete pawning item?', deleteMsg: 'Are you sure you want to delete this pawning item?',
  addedNote: 'Pawn item added.', redeemedNote: 'Item marked as redeemed.', deletedNote: 'Pawning item deleted.',
  failCreate: 'Failed to create pawning item. Please try again.', failUpdate: 'Failed to update pawning item. Please try again.',
  failDelete: 'Failed to delete pawning item. Please try again.',
};

const si: PawningText = {
  typeGold: 'රන්', typeJewelry: 'ස්වර්ණාභරණ', typeElectronics: 'ඉලෙක්ට්‍රොනික', typeDocuments: 'ලේඛන', typeOther: 'වෙනත්',
  statusActive: 'සක්‍රිය', statusRedeemed: 'මුදාගත්', statusAuctioned: 'ඇවෑම්', statusRenewed: 'අලුත් කළ',
  filterAll: 'සියල්ල', filterActive: 'සක්‍රිය', filterRedeemed: 'මුදාගත්',
  loading: 'උකස් භාණ්ඩ පූරණය වෙමින්...', loadFailed: 'උකස් භාණ්ඩ පූරණය කළ නොහැක. නැවත උත්සාහ කරන්න.', addBtn: '+ උකස් භාණ්ඩයක් එකතු කරන්න',
  statActive: 'සක්‍රිය භාණ්ඩ', statLoan: 'ගත් මුළු ණය', statPledged: 'උකස් වටිනාකම', statUrgent: 'ප්‍රමාදව ඇති හෝ දින 21 ට අඩු',
  formTitle: 'උකස් භාණ්ඩයක් එකතු කරන්න', itemDesc: 'භාණ්ඩ විස්තරය', itemType: 'භාණ්ඩ වර්ගය', pledgedLabel: 'උකස් වටිනාකම ({cur})',
  loanLabel: 'ණය මුදල ({cur})', interestLabel: 'පොලී අනුපාතය (% වාර්ෂික)', branch: 'ශාඛාව', ticket: 'ටිකට් අංකය',
  pledgeDate: 'උකස් දිනය', redemptionDate: 'මුදාගැනීමේ දිනය', cancel: 'අවලංගු කරන්න', saving: 'සුරකිමින්...', save: 'උකස් භාණ්ඩය සුරකින්න',
  phDesc: 'උදා: 22K රන් දාමය', phPledged: 'උදා: 180000', phLoan: 'උදා: 126000', phInterest: 'උදා: 24',
  phBranch: 'උදා: කොළඹ 03', phTicket: 'උදා: PWN-1234',
  emptyTitle: 'උකස් භාණ්ඩ එකතු කර නැත', emptyText: 'ඔබේ උකස් භාණ්ඩ නිරීක්ෂණය කර, මුදාගැනීමේ දිනයන් සලකා බලා, ගෙවීමක් කිසිදා මග නොහරින්න.',
  kvLoan: 'ණය මුදල', kvDueNow: 'දැනට ගෙවිය යුතු මුළු', kvPledged: 'උකස් වටිනාකම', kvRate: 'පොලී අනුපාතය',
  kvRateValue: '{rate}% වාර්ෂික ({monthly}/මාසික)', kvAccrued: 'සමුච්චිත පොලිය', kvRedemption: 'මුදාගැනීමේ දිනය',
  kvTimeLeft: 'ඉතිරි කාලය', overdueBy: 'දින {n} කින් ප්‍රමාදයි', daysLeft: 'දින {n}',
  redeemItem: 'භාණ්ඩය මුදාගන්න', delete: 'මකන්න',
  redeemTitle: 'භාණ්ඩය මුදාගන්නද?', redeemMsg: '{desc} (#{ticket}) මුදාගත් ලෙස සලකුණු කරන්නද? දැනට ගෙවිය යුතු මුළු {amount} කි. මෙය අහෝසි කළ නොහැක.', redeem: 'මුදාගන්න',
  deleteTitle: 'උකස් භාණ්ඩය මකන්නද?', deleteMsg: 'මෙම උකස් භාණ්ඩය මකා දැමීමට ඔබට විශ්වාසද?',
  addedNote: 'උකස් භාණ්ඩය එකතු කරන ලදී.', redeemedNote: 'භාණ්ඩය මුදාගත් ලෙස සලකුණු කරන ලදී.', deletedNote: 'උකස් භාණ්ඩය මකා දමන ලදී.',
  failCreate: 'උකස් භාණ්ඩය සෑදීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', failUpdate: 'උකස් භාණ්ඩය යාවත්කාලීන කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  failDelete: 'උකස් භාණ්ඩය මැකීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
};

const ta: PawningText = {
  typeGold: 'தங்கம்', typeJewelry: 'நகை', typeElectronics: 'மின்னணு', typeDocuments: 'ஆவணங்கள்', typeOther: 'மற்றவை',
  statusActive: 'செயலில்', statusRedeemed: 'மீட்கப்பட்டது', statusAuctioned: 'ஏலம் விடப்பட்டது', statusRenewed: 'புதுப்பிக்கப்பட்டது',
  filterAll: 'அனைத்தும்', filterActive: 'செயலில்', filterRedeemed: 'மீட்கப்பட்டவை',
  loading: 'அடமானப் பொருட்கள் ஏற்றப்படுகின்றன...', loadFailed: 'அடமானப் பொருட்களை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', addBtn: '+ அடமானப் பொருளைச் சேர்',
  statActive: 'செயலில் உள்ள பொருட்கள்', statLoan: 'பெற்ற மொத்தக் கடன்', statPledged: 'அடமான மதிப்பு', statUrgent: 'தாமதமானவை அல்லது 21 நாட்களுக்குள் நிலுவை',
  formTitle: 'அடமானப் பொருளைச் சேர்', itemDesc: 'பொருள் விவரம்', itemType: 'பொருள் வகை', pledgedLabel: 'அடமான மதிப்பு ({cur})',
  loanLabel: 'கடன் தொகை ({cur})', interestLabel: 'வட்டி விகிதம் (% ஆண்டுக்கு)', branch: 'கிளை', ticket: 'டிக்கெட் எண்',
  pledgeDate: 'அடமான தேதி', redemptionDate: 'மீட்பு தேதி', cancel: 'ரத்து செய்', saving: 'சேமிக்கப்படுகிறது...', save: 'அடமானப் பொருளைச் சேமி',
  phDesc: 'எ.கா. 22K தங்கச் சங்கிலி', phPledged: 'எ.கா. 180000', phLoan: 'எ.கா. 126000', phInterest: 'எ.கா. 24',
  phBranch: 'எ.கா. கொழும்பு 03', phTicket: 'எ.கா. PWN-1234',
  emptyTitle: 'அடமானப் பொருட்கள் எதுவும் சேர்க்கப்படவில்லை', emptyText: 'அடமானம் வைத்த பொருட்களைக் கண்காணித்து, மீட்பு தேதிகளைக் கவனித்து, ஒரு செலுத்தலையும் தவறவிடாதீர்கள்.',
  kvLoan: 'கடன் தொகை', kvDueNow: 'தற்போது செலுத்த வேண்டிய மொத்தம்', kvPledged: 'அடமான மதிப்பு', kvRate: 'வட்டி விகிதம்',
  kvRateValue: '{rate}% ஆண்டுக்கு ({monthly}/மாதம்)', kvAccrued: 'திரண்ட வட்டி', kvRedemption: 'மீட்பு தேதி',
  kvTimeLeft: 'மீதமுள்ள நேரம்', overdueBy: '{n} நாட்கள் தாமதம்', daysLeft: '{n} நாட்கள்',
  redeemItem: 'பொருளை மீட்டெடு', delete: 'நீக்கு',
  redeemTitle: 'பொருளை மீட்கவா?', redeemMsg: '{desc} (#{ticket}) மீட்கப்பட்டதாகக் குறிக்கவா? தற்போது செலுத்த வேண்டிய மொத்தம் {amount}. இதை மாற்ற முடியாது.', redeem: 'மீட்டெடு',
  deleteTitle: 'அடமானப் பொருளை நீக்கவா?', deleteMsg: 'இந்த அடமானப் பொருளை நீக்க விரும்புகிறீர்களா?',
  addedNote: 'அடமானப் பொருள் சேர்க்கப்பட்டது.', redeemedNote: 'பொருள் மீட்கப்பட்டதாகக் குறிக்கப்பட்டது.', deletedNote: 'அடமானப் பொருள் நீக்கப்பட்டது.',
  failCreate: 'அடமானப் பொருளை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', failUpdate: 'அடமானப் பொருளைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  failDelete: 'அடமானப் பொருளை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
};

export const PAWN_T: Record<AdminLang, PawningText> = { en, si, ta };
