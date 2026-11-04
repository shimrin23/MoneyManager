// Text for the Recommendations page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface RecommendationsText {
  catBudget: string; catGoal: string; catDebt: string; catSubscription: string; catAlert: string; filterAll: string;
  linkGoals: string; linkBudgets: string; linkLoans: string; linkCards: string; linkOpen: string;
  execTitle: string; whatHappens: string; projImpact: string; execPath: string; executeNow: string; cancel: string;
  applying: string; applyingText: string; done: string; notApplied: string; tryAgain: string; close: string;
  failApply: string;
  closeTips: string; optimizeTitle: string; spentOf: string; loadingTips: string; couldNotTips: string;
  whereWent: string; howLess: string; backSB: string;
  totalRecs: string; pendingAction: string; accepted: string; plannedSavings: string;
  priorityCritical: string; priorityHigh: string; priorityMedium: string; priorityLow: string; priorityBadge: string;
  statusPending: string; statusAccepted: string; statusDeclined: string; statusSnoozed: string;
  loading: string; loadFailed: string;
  snoozedNote: string; declinedNote: string; backPendingNote: string; failUpdate: string;
  emptyNoData: string; emptyNeedData: string; emptyCategory: string;
  why: string; action: string; impact: string; how: string;
  acceptExecute: string; snooze: string; decline: string; restorePending: string;
}

const en: RecommendationsText = {
  catBudget: 'Budget', catGoal: 'Goal', catDebt: 'Debt', catSubscription: 'Subscription', catAlert: 'Alert', filterAll: 'All',
  linkGoals: 'Open Goals', linkBudgets: 'Open Smart Budgets', linkLoans: 'Open Loans', linkCards: 'Open Cards', linkOpen: 'Open',
  execTitle: 'Execute Recommendation', whatHappens: 'What will happen', projImpact: 'Projected impact', execPath: 'Execution path',
  executeNow: 'Execute Now', cancel: 'Cancel',
  applying: 'Applying...', applyingText: 'Applying your recommendation.', done: 'Done', notApplied: 'Not applied',
  tryAgain: 'Try Again', close: 'Close',
  failApply: 'Could not apply this recommendation. Please try again.',
  closeTips: 'Close tips', optimizeTitle: 'Optimize {cat}', spentOf: '{spent} of {alloc} spent this month ({pct}%)',
  loadingTips: 'Loading tips...', couldNotTips: 'Could not load tips for {cat}.',
  whereWent: 'Where it went this month', howLess: 'How to spend less', backSB: 'Back to Smart Budgets',
  totalRecs: 'Total Recommendations', pendingAction: 'Pending Action', accepted: 'Accepted', plannedSavings: 'Planned Monthly Savings',
  priorityCritical: 'Critical', priorityHigh: 'High', priorityMedium: 'Medium', priorityLow: 'Low', priorityBadge: '{p} Priority',
  statusPending: 'Pending', statusAccepted: 'Accepted', statusDeclined: 'Declined', statusSnoozed: 'Snoozed',
  loading: 'Loading recommendations...', loadFailed: 'Could not load recommendations. Please refresh the page.',
  snoozedNote: 'Snoozed for 7 days.', declinedNote: 'Recommendation declined.', backPendingNote: 'Moved back to pending.',
  failUpdate: 'Could not update the recommendation.',
  emptyNoData: 'No recommendations right now. Your finances look on track.',
  emptyNeedData: 'Add your income and expenses for the last 30 days to get personalised recommendations.',
  emptyCategory: 'No recommendations in this category.',
  why: 'Why', action: 'Action', impact: 'Impact', how: 'How',
  acceptExecute: 'Accept & Execute', snooze: 'Snooze', decline: 'Decline', restorePending: 'Restore to Pending',
};

const si: RecommendationsText = {
  catBudget: 'අයවැය', catGoal: 'ඉලක්කය', catDebt: 'ණය', catSubscription: 'දායකත්වය', catAlert: 'ඇඟවීම', filterAll: 'සියල්ල',
  linkGoals: 'ඉලක්ක විවෘත කරන්න', linkBudgets: 'බුද්ධිමත් අයවැය විවෘත කරන්න', linkLoans: 'ණය විවෘත කරන්න', linkCards: 'කාඩ්පත් විවෘත කරන්න', linkOpen: 'විවෘත කරන්න',
  execTitle: 'නිර්දේශය ක්‍රියාත්මක කරන්න', whatHappens: 'කුමක් සිදුවේද', projImpact: 'අපේක්ෂිත බලපෑම', execPath: 'ක්‍රියාත්මක කිරීමේ මාර්ගය',
  executeNow: 'දැන් ක්‍රියාත්මක කරන්න', cancel: 'අවලංගු කරන්න',
  applying: 'යොදමින්...', applyingText: 'ඔබේ නිර්දේශය යොදමින් සිටී.', done: 'සම්පූර්ණයි', notApplied: 'යොදා නැත',
  tryAgain: 'නැවත උත්සාහ කරන්න', close: 'වසන්න',
  failApply: 'මෙම නිර්දේශය යෙදිය නොහැක. නැවත උත්සාහ කරන්න.',
  closeTips: 'ඉඟි වසන්න', optimizeTitle: '{cat} ප්‍රශස්ත කරන්න', spentOf: 'මෙම මාසයේ {alloc} න් {spent} වියදම් කර ඇත ({pct}%)',
  loadingTips: 'ඉඟි පූරණය වෙමින්...', couldNotTips: '{cat} සඳහා ඉඟි පූරණය කළ නොහැක.',
  whereWent: 'මාසය තුළ මුදල ගිය තැන්', howLess: 'අඩුවෙන් වියදම් කරන ආකාරය', backSB: 'බුද්ධිමත් අයවැයට ආපසු',
  totalRecs: 'මුළු නිර්දේශ', pendingAction: 'ක්‍රියාව බලාපොරොත්තුවෙන්', accepted: 'පිළිගත්', plannedSavings: 'සැලසුම් කළ මාසික ඉතිරිය',
  priorityCritical: 'බරපතල', priorityHigh: 'ඉහළ', priorityMedium: 'මධ්‍යම', priorityLow: 'පහළ', priorityBadge: '{p} ප්‍රමුඛතාව',
  statusPending: 'බලාපොරොත්තුවෙන්', statusAccepted: 'පිළිගත්', statusDeclined: 'ප්‍රතික්ෂේප', statusSnoozed: 'නතර කළ',
  loading: 'නිර්දේශ පූරණය වෙමින්...', loadFailed: 'නිර්දේශ පූරණය කළ නොහැක. පිටුව නැවුම් කරන්න.',
  snoozedNote: 'දින 7 ක් සඳහා නතර කරන ලදී.', declinedNote: 'නිර්දේශය ප්‍රතික්ෂේප කරන ලදී.', backPendingNote: 'බලාපොරොත්තුවට ආපසු ගෙන ගියා.',
  failUpdate: 'නිර්දේශය යාවත්කාලීන කළ නොහැක.',
  emptyNoData: 'දැනට නිර්දේශ නැත. ඔබේ මූල්‍ය තත්ත්වය නියමිත පථයේ පවතී.',
  emptyNeedData: 'පුද්ගලික නිර්දේශ ලබා ගැනීමට පසුගිය දින 30 සඳහා ඔබේ ආදායම සහ වියදම් එකතු කරන්න.',
  emptyCategory: 'මෙම ප්‍රවර්ගයේ නිර්දේශ නැත.',
  why: 'ඇයි', action: 'ක්‍රියාව', impact: 'බලපෑම', how: 'කෙසේද',
  acceptExecute: 'පිළිගෙන ක්‍රියාත්මක කරන්න', snooze: 'නතර කරන්න', decline: 'ප්‍රතික්ෂේප කරන්න', restorePending: 'බලාපොරොත්තුවට ප්‍රත්‍යර්පණය කරන්න',
};

const ta: RecommendationsText = {
  catBudget: 'பட்ஜெட்', catGoal: 'இலக்கு', catDebt: 'கடன்', catSubscription: 'சந்தா', catAlert: 'எச்சரிக்கை', filterAll: 'அனைத்தும்',
  linkGoals: 'இலக்குகளைத் திற', linkBudgets: 'ஸ்மார்ட் பட்ஜெட்களைத் திற', linkLoans: 'கடன்களைத் திற', linkCards: 'அட்டைகளைத் திற', linkOpen: 'திற',
  execTitle: 'பரிந்துரையை செயல்படுத்து', whatHappens: 'என்ன நடக்கும்', projImpact: 'எதிர்பார்க்கப்படும் தாக்கம்', execPath: 'செயல்படுத்தும் வழி',
  executeNow: 'இப்போது செயல்படுத்து', cancel: 'ரத்து செய்',
  applying: 'பயன்படுத்தப்படுகிறது...', applyingText: 'உங்கள் பரிந்துரை பயன்படுத்தப்படுகிறது.', done: 'முடிந்தது', notApplied: 'பயன்படுத்தப்படவில்லை',
  tryAgain: 'மீண்டும் முயற்சி', close: 'மூடு',
  failApply: 'இந்தப் பரிந்துரையைப் பயன்படுத்த முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  closeTips: 'குறிப்புகளை மூடு', optimizeTitle: '{cat} ஐ மேம்படுத்து', spentOf: 'இந்த மாதம் {alloc} இல் {spent} செலவிடப்பட்டது ({pct}%)',
  loadingTips: 'குறிப்புகள் ஏற்றப்படுகின்றன...', couldNotTips: '{cat} க்கான குறிப்புகளை ஏற்ற முடியவில்லை.',
  whereWent: 'இந்த மாதம் பணம் எங்கே சென்றது', howLess: 'குறைவாகச் செலவிடுவது எப்படி', backSB: 'ஸ்மார்ட் பட்ஜெட்களுக்குத் திரும்பு',
  totalRecs: 'மொத்த பரிந்துரைகள்', pendingAction: 'நடவடிக்கைக்கு காத்திருப்பவை', accepted: 'ஏற்கப்பட்டவை', plannedSavings: 'திட்டமிட்ட மாதாந்திர சேமிப்பு',
  priorityCritical: 'முக்கியம்', priorityHigh: 'உயர்', priorityMedium: 'நடுத்தரம்', priorityLow: 'குறைவு', priorityBadge: '{p} முன்னுரிமை',
  statusPending: 'நிலுவையில்', statusAccepted: 'ஏற்கப்பட்டது', statusDeclined: 'நிராகரிக்கப்பட்டது', statusSnoozed: 'தள்ளிவைக்கப்பட்டது',
  loading: 'பரிந்துரைகள் ஏற்றப்படுகின்றன...', loadFailed: 'பரிந்துரைகளை ஏற்ற முடியவில்லை. பக்கத்தைப் புதுப்பிக்கவும்.',
  snoozedNote: '7 நாட்களுக்குத் தள்ளிவைக்கப்பட்டது.', declinedNote: 'பரிந்துரை நிராகரிக்கப்பட்டது.', backPendingNote: 'மீண்டும் நிலுவைக்கு நகர்த்தப்பட்டது.',
  failUpdate: 'பரிந்துரையைப் புதுப்பிக்க முடியவில்லை.',
  emptyNoData: 'தற்போது பரிந்துரைகள் இல்லை. உங்கள் நிதி நிலை சரியான பாதையில் உள்ளது.',
  emptyNeedData: 'தனிப்பயன் பரிந்துரைகளைப் பெற கடந்த 30 நாட்களின் வருமானம் மற்றும் செலவுகளைச் சேர்க்கவும்.',
  emptyCategory: 'இந்தப் பிரிவில் பரிந்துரைகள் இல்லை.',
  why: 'ஏன்', action: 'நடவடிக்கை', impact: 'தாக்கம்', how: 'எப்படி',
  acceptExecute: 'ஏற்று செயல்படுத்து', snooze: 'தள்ளிவை', decline: 'நிராகரி', restorePending: 'நிலுவைக்கு மீட்டெடு',
};

export const RECS_T: Record<AdminLang, RecommendationsText> = { en, si, ta };
