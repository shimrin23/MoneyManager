// Text for the Smart Budgets page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface SmartBudgetsText {
  loading: string; tabTracker: string; tabPlanner: string;
  statIncome: string; noIncome: string; statBudgeted: string; statIncomeAllocated: string; statOverCats: string;
  insightsTitle: string; alertTitle: string; alertBody: string;
  criticalTitle: string; fixNow: string; noCritTitle: string; noCritText: string;
  goodTitle: string; viewDetails: string;
  pillOver: string; pillAlmost: string; pillOnTrack: string;
  remaining: string; overBy: string; vsLastMonth: string; alertAt: string;
  aiRec: string; optimize: string; editAlert: string; setAlert: string;
  bigPicture: string; totalIncome: string; totalAllocated: string; unallocated: string;
  addNewCat: string; catName: string; catPh: string; budgetLimit: string; adding: string; addBudget: string;
  manage: string; limit: string; editLimit: string; delete: string;
  alertLabel: string; currentlyUsed: string; removeAlert: string; cancel: string; saveAlert: string; saving: string;
  editTitle: string; currentlySpent: string; saveLimit: string;
  warnAlertRange: string; alertRemoved: string; alertSet: string; failAlert: string;
  deleteTitle: string; deleteMsg: string; deleteBtn: string; deletedNote: string; failDelete: string;
  warnLimit: string; limitUpdated: string; failUpdate: string;
  warnCatName: string; addedNote: string; failAdd: string;
}

const en: SmartBudgetsText = {
  loading: 'Loading smart budgets...', tabTracker: 'Budget Tracker', tabPlanner: 'Budget Planner',
  statIncome: 'Monthly Income', noIncome: 'No income recorded this month', statBudgeted: 'Total Budgeted',
  statIncomeAllocated: 'Income Allocated', statOverCats: 'Over Budget Categories',
  insightsTitle: 'AI Budget Insights', alertTitle: 'Budget Alert: {cat}',
  alertBody: 'You have used {pct}% of your {cat} budget (alert set at {threshold}%).',
  criticalTitle: 'Critical: {cat} Overspend', fixNow: 'Fix Now',
  noCritTitle: 'No Critical Overspending', noCritText: 'You have no categories currently over budget. Great job!',
  goodTitle: 'Good: {cat} Control', viewDetails: 'View Details',
  pillOver: 'Over Budget', pillAlmost: 'Almost Full', pillOnTrack: 'On Track',
  remaining: 'Remaining', overBy: 'Over by', vsLastMonth: '{pct}% vs last month', alertAt: 'Alert at {n}%',
  aiRec: 'AI Recommendation:', optimize: 'Optimize', editAlert: 'Edit Alert', setAlert: 'Set Alert',
  bigPicture: 'The Big Picture', totalIncome: 'Total Income', totalAllocated: 'Total Allocated', unallocated: 'Unallocated Cash',
  addNewCat: 'Add New Category', catName: 'Category Name', catPh: 'e.g. Vacation, Gifts', budgetLimit: 'Budget Limit ({cur})',
  adding: 'Adding...', addBudget: 'Add Budget',
  manage: 'Manage Allocations', limit: 'Limit: {amount}', editLimit: 'Edit Limit', delete: 'Delete',
  alertLabel: 'Alert me when I have used (%)', currentlyUsed: 'Currently used: {pct}% ({spent} of {alloc})',
  removeAlert: 'Remove Alert', cancel: 'Cancel', saveAlert: 'Save Alert', saving: 'Saving...',
  editTitle: 'Edit Budget: {cat}', currentlySpent: 'Currently spent: {amount}', saveLimit: 'Save Limit',
  warnAlertRange: 'Please enter an alert level between 1 and 100 percent.', alertRemoved: 'Alert removed for {cat}.',
  alertSet: "Alert set: you'll be warned when {cat} reaches {level}%.", failAlert: 'Failed to set the alert. Please try again.',
  deleteTitle: 'Delete budget?', deleteMsg: 'The {cat} budget will be removed.', deleteBtn: 'Delete',
  deletedNote: '{cat} budget deleted.', failDelete: 'Failed to delete budget. Please try again.',
  warnLimit: 'Please enter a budget limit of 0 or more.', limitUpdated: '{cat} limit updated to {amount}.',
  failUpdate: 'Failed to update budget. Please try again.',
  warnCatName: 'Please enter a category name.', addedNote: '{cat} budget added.', failAdd: 'Failed to add category. Please try again.',
};

const si: SmartBudgetsText = {
  loading: 'බුද්ධිමත් අයවැය පූරණය වෙමින්...', tabTracker: 'අයවැය නිරීක්ෂකය', tabPlanner: 'අයවැය සැලසුම්කරු',
  statIncome: 'මාසික ආදායම', noIncome: 'මෙම මාසයේ ආදායමක් සටහන් කර නැත', statBudgeted: 'මුළු අයවැය කළ',
  statIncomeAllocated: 'ආදායමෙන් වෙන් කළ', statOverCats: 'අයවැයට වඩා වැඩි ප්‍රවර්ග',
  insightsTitle: 'AI අයවැය අවබෝධයන්', alertTitle: 'අයවැය ඇඟවීම: {cat}',
  alertBody: 'ඔබ {cat} අයවැයෙන් {pct}% ක් භාවිත කර ඇත (ඇඟවීම {threshold}% ට සකසා ඇත).',
  criticalTitle: 'බරපතල: {cat} අධික වියදම', fixNow: 'දැන් නිවැරදි කරන්න',
  noCritTitle: 'බරපතල අධික වියදමක් නැත', noCritText: 'දැනට අයවැයට වඩා වැඩි ප්‍රවර්ග නැත. විශිෂ්ටයි!',
  goodTitle: 'හොඳයි: {cat} පාලනය', viewDetails: 'විස්තර බලන්න',
  pillOver: 'අයවැයට වඩා වැඩි', pillAlmost: 'ඇත්තෙන්ම පිරී ඇත', pillOnTrack: 'නියමිත පථයේ',
  remaining: 'ඉතිරි', overBy: 'වැඩි', vsLastMonth: 'පසුගිය මාසයට සාපේක්ෂව {pct}%', alertAt: '{n}% දී ඇඟවීම',
  aiRec: 'AI නිර්දේශය:', optimize: 'ප්‍රශස්ත කරන්න', editAlert: 'ඇඟවීම සංස්කරණය', setAlert: 'ඇඟවීම සකසන්න',
  bigPicture: 'විශාල චිත්‍රය', totalIncome: 'මුළු ආදායම', totalAllocated: 'මුළු වෙන් කළ', unallocated: 'වෙන් නොකළ මුදල',
  addNewCat: 'නව ප්‍රවර්ගයක් එකතු කරන්න', catName: 'ප්‍රවර්ගයේ නම', catPh: 'උදා: නිවාඩු, තෑගි', budgetLimit: 'අයවැය සීමාව ({cur})',
  adding: 'එකතු කෙරෙමින්...', addBudget: 'අයවැයක් එකතු කරන්න',
  manage: 'වෙන්කිරීම් කළමනාකරණය', limit: 'සීමාව: {amount}', editLimit: 'සීමාව සංස්කරණය', delete: 'මකන්න',
  alertLabel: 'මා {pct}% ක් භාවිත කළ විට ඇඟවන්න', currentlyUsed: 'දැනට භාවිත: {pct}% ({spent} / {alloc})',
  removeAlert: 'ඇඟවීම ඉවත් කරන්න', cancel: 'අවලංගු කරන්න', saveAlert: 'ඇඟවීම සුරකින්න', saving: 'සුරකිමින්...',
  editTitle: 'අයවැය සංස්කරණය: {cat}', currentlySpent: 'දැනට වියදම් කළ: {amount}', saveLimit: 'සීමාව සුරකින්න',
  warnAlertRange: 'කරුණාකර ඇඟවීම් මට්ටම 1 සිට 100% දක්වා ඇතුළත් කරන්න.', alertRemoved: '{cat} සඳහා ඇඟවීම ඉවත් කරන ලදී.',
  alertSet: 'ඇඟවීම සකසන ලදී: {cat} {level}% ට ළඟා වූ විට ඔබට අනතුරු ඇඟවෙනු ඇත.', failAlert: 'ඇඟවීම සැකසීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  deleteTitle: 'අයවැය මකන්නද?', deleteMsg: '{cat} අයවැය ඉවත් කෙරෙනු ඇත.', deleteBtn: 'මකන්න',
  deletedNote: '{cat} අයවැය මකා දමන ලදී.', failDelete: 'අයවැය මැකීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  warnLimit: 'කරුණාකර 0 හෝ ඊට වැඩි අයවැය සීමාවක් ඇතුළත් කරන්න.', limitUpdated: '{cat} සීමාව {amount} ලෙස යාවත්කාලීන කරන ලදී.',
  failUpdate: 'අයවැය යාවත්කාලීන කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  warnCatName: 'කරුණාකර ප්‍රවර්ගයේ නමක් ඇතුළත් කරන්න.', addedNote: '{cat} අයවැය එකතු කරන ලදී.', failAdd: 'ප්‍රවර්ගය එකතු කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
};

const ta: SmartBudgetsText = {
  loading: 'ஸ்மார்ட் பட்ஜெட்கள் ஏற்றப்படுகின்றன...', tabTracker: 'பட்ஜெட் கண்காணிப்பு', tabPlanner: 'பட்ஜெட் திட்டமிடல்',
  statIncome: 'மாத வருமானம்', noIncome: 'இந்த மாதம் வருமானம் பதிவாகவில்லை', statBudgeted: 'மொத்த பட்ஜெட்',
  statIncomeAllocated: 'வருமானத்தில் ஒதுக்கீடு', statOverCats: 'பட்ஜெட்டை மீறிய பிரிவுகள்',
  insightsTitle: 'AI பட்ஜெட் நுண்ணறிவு', alertTitle: 'பட்ஜெட் எச்சரிக்கை: {cat}',
  alertBody: 'உங்கள் {cat} பட்ஜெட்டில் {pct}% பயன்படுத்தியுள்ளீர்கள் (எச்சரிக்கை {threshold}% இல் அமைக்கப்பட்டது).',
  criticalTitle: 'முக்கியம்: {cat} அதிக செலவு', fixNow: 'இப்போது சரிசெய்', noCritTitle: 'முக்கிய அதிக செலவு இல்லை',
  noCritText: 'தற்போது பட்ஜெட்டை மீறிய பிரிவுகள் எதுவும் இல்லை. சிறப்பு!',
  goodTitle: 'நல்லது: {cat} கட்டுப்பாடு', viewDetails: 'விவரங்களைக் காண்',
  pillOver: 'பட்ஜெட்டை மீறியது', pillAlmost: 'கிட்டத்தட்ட நிரம்பியது', pillOnTrack: 'சரியான பாதையில்',
  remaining: 'மீதம்', overBy: 'மீறியது', vsLastMonth: 'கடந்த மாதத்துடன் ஒப்பிடும்போது {pct}%', alertAt: '{n}% இல் எச்சரிக்கை',
  aiRec: 'AI பரிந்துரை:', optimize: 'மேம்படுத்து', editAlert: 'எச்சரிக்கையைத் திருத்து', setAlert: 'எச்சரிக்கையை அமை',
  bigPicture: 'முழு படம்', totalIncome: 'மொத்த வருமானம்', totalAllocated: 'மொத்த ஒதுக்கீடு', unallocated: 'ஒதுக்கப்படாத பணம்',
  addNewCat: 'புதிய பிரிவைச் சேர்', catName: 'பிரிவின் பெயர்', catPh: 'எ.கா. விடுமுறை, பரிசுகள்', budgetLimit: 'பட்ஜெட் வரம்பு ({cur})',
  adding: 'சேர்க்கப்படுகிறது...', addBudget: 'பட்ஜெட்டைச் சேர்',
  manage: 'ஒதுக்கீடுகளை நிர்வகி', limit: 'வரம்பு: {amount}', editLimit: 'வரம்பைத் திருத்து', delete: 'நீக்கு',
  alertLabel: 'நான் {pct}% பயன்படுத்தும்போது எனக்கு எச்சரி', currentlyUsed: 'தற்போது பயன்படுத்தியது: {pct}% ({spent} / {alloc})',
  removeAlert: 'எச்சரிக்கையை நீக்கு', cancel: 'ரத்து செய்', saveAlert: 'எச்சரிக்கையைச் சேமி', saving: 'சேமிக்கப்படுகிறது...',
  editTitle: 'பட்ஜெட்டைத் திருத்து: {cat}', currentlySpent: 'தற்போது செலவிட்டது: {amount}', saveLimit: 'வரம்பைச் சேமி',
  warnAlertRange: 'எச்சரிக்கை நிலை 1 முதல் 100% வரை உள்ளிடவும்.', alertRemoved: '{cat} க்கான எச்சரிக்கை நீக்கப்பட்டது.',
  alertSet: 'எச்சரிக்கை அமைக்கப்பட்டது: {cat} {level}% ஐ அடையும்போது உங்களுக்கு எச்சரிக்கப்படும்.', failAlert: 'எச்சரிக்கையை அமைக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  deleteTitle: 'பட்ஜெட்டை நீக்கவா?', deleteMsg: '{cat} பட்ஜெட் அகற்றப்படும்.', deleteBtn: 'நீக்கு',
  deletedNote: '{cat} பட்ஜெட் நீக்கப்பட்டது.', failDelete: 'பட்ஜெட்டை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  warnLimit: '0 அல்லது அதற்கு மேல் பட்ஜெட் வரம்பை உள்ளிடவும்.', limitUpdated: '{cat} வரம்பு {amount} ஆகப் புதுப்பிக்கப்பட்டது.',
  failUpdate: 'பட்ஜெட்டைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  warnCatName: 'பிரிவின் பெயரை உள்ளிடவும்.', addedNote: '{cat} பட்ஜெட் சேர்க்கப்பட்டது.', failAdd: 'பிரிவைச் சேர்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
};

export const SB_T: Record<AdminLang, SmartBudgetsText> = { en, si, ta };
