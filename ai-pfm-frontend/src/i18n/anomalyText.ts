// Text for the Anomaly Detection page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface AnomalyText {
  loading: string; loadFailed: string; updateFailed: string;
  riskHigh: string; riskMedium: string; riskLow: string;
  typeDuplicate: string; typeSpike: string; typeMerchant: string; typeTime: string; typeGeo: string;
  bannerOne: string; bannerMany: string; atTime: string;
  statTotal: string; statHighOpen: string; statAwaiting: string; statSafe: string;
  filterAll: string; filterOpen: string; filterSafe: string; filterFraud: string; filterDismissed: string;
  noAlerts: string; aiReason: string; txnId: string; category: string;
  thisSafe: string; reportFraud: string; dismiss: string;
  markedSafe: string; reportedFraud: string; dismissed: string; reopen: string;
}

const en: AnomalyText = {
  loading: 'Scanning for anomalies...', loadFailed: 'Could not load anomaly alerts. Please try again later.',
  updateFailed: 'Could not update the alert. Please try again.',
  riskHigh: 'High Risk', riskMedium: 'Medium Risk', riskLow: 'Low Risk',
  typeDuplicate: 'Duplicate Charge', typeSpike: 'Spending Spike', typeMerchant: 'Unknown Merchant',
  typeTime: 'Unusual Time', typeGeo: 'Location Mismatch',
  bannerOne: '{n} open alert needs your review', bannerMany: '{n} open alerts need your review', atTime: 'at {time}',
  statTotal: 'Total Flagged', statHighOpen: 'High Risk Open', statAwaiting: 'Awaiting Review', statSafe: 'Marked Safe',
  filterAll: 'All', filterOpen: 'Open', filterSafe: 'Safe', filterFraud: 'Fraud', filterDismissed: 'Dismissed',
  noAlerts: 'No alerts in this category.', aiReason: 'AI Reason', txnId: 'Transaction ID', category: 'Category',
  thisSafe: 'This is Safe', reportFraud: 'Report as Fraud', dismiss: 'Dismiss',
  markedSafe: 'Marked Safe', reportedFraud: 'Reported as Fraud', dismissed: 'Dismissed', reopen: 'Reopen',
};

const si: AnomalyText = {
  loading: 'අසාමාන්‍යතා සොයමින්...', loadFailed: 'අසාමාන්‍ය ඇඟවීම් පූරණය කළ නොහැක. පසුව නැවත උත්සාහ කරන්න.',
  updateFailed: 'ඇඟවීම යාවත්කාලීන කළ නොහැක. නැවත උත්සාහ කරන්න.',
  riskHigh: 'ඉහළ අවදානම', riskMedium: 'මධ්‍යම අවදානම', riskLow: 'අඩු අවදානම',
  typeDuplicate: 'අනුපිටපත් ගාස්තුව', typeSpike: 'වියදම් ඉහළ යාම', typeMerchant: 'නොදන්නා වෙළඳුන්',
  typeTime: 'අසාමාන්‍ය වේලාව', typeGeo: 'ස්ථාන නොගැලපීම',
  bannerOne: 'විවෘත ඇඟවීම් {n} ක් ඔබේ සමාලෝචනය අවශ්‍යයි', bannerMany: 'විවෘත ඇඟවීම් {n} ක් ඔබේ සමාලෝචනය අවශ්‍යයි', atTime: 'වේලාව {time}',
  statTotal: 'සලකුණු කළ මුළු', statHighOpen: 'විවෘත ඉහළ අවදානම', statAwaiting: 'සමාලෝචනය බලාපොරොත්තුවෙන්', statSafe: 'ආරක්ෂිත ලෙස සලකුණු',
  filterAll: 'සියල්ල', filterOpen: 'විවෘත', filterSafe: 'ආරක්ෂිත', filterFraud: 'වංචාව', filterDismissed: 'ඉවත් කළ',
  noAlerts: 'මෙම ප්‍රවර්ගයේ ඇඟවීම් නැත.', aiReason: 'AI හේතුව', txnId: 'ගනුදෙනු ID', category: 'ප්‍රවර්ගය',
  thisSafe: 'මෙය ආරක්ෂිතයි', reportFraud: 'වංචාව ලෙස වාර්තා කරන්න', dismiss: 'ඉවත ලන්න',
  markedSafe: 'ආරක්ෂිත ලෙස සලකුණු', reportedFraud: 'වංචාව ලෙස වාර්තා කළ', dismissed: 'ඉවත් කළ', reopen: 'නැවත විවෘත කරන්න',
};

const ta: AnomalyText = {
  loading: 'முரண்பாடுகள் தேடப்படுகின்றன...', loadFailed: 'முரண்பாட்டு எச்சரிக்கைகளை ஏற்ற முடியவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  updateFailed: 'எச்சரிக்கையைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  riskHigh: 'அதிக ஆபத்து', riskMedium: 'நடுத்தர ஆபத்து', riskLow: 'குறைந்த ஆபத்து',
  typeDuplicate: 'நகல் கட்டணம்', typeSpike: 'செலவு உயர்வு', typeMerchant: 'அறியப்படாத வணிகர்',
  typeTime: 'அசாதாரண நேரம்', typeGeo: 'இட முரண்பாடு',
  bannerOne: 'திறந்த எச்சரிக்கை {n} உங்கள் மதிப்பாய்வு தேவை', bannerMany: 'திறந்த எச்சரிக்கைகள் {n} உங்கள் மதிப்பாய்வு தேவை', atTime: '{time} மணிக்கு',
  statTotal: 'கொடியிடப்பட்ட மொத்தம்', statHighOpen: 'திறந்த அதிக ஆபத்து', statAwaiting: 'மதிப்பாய்வுக்குக் காத்திருப்பவை', statSafe: 'பாதுகாப்பானதாகக் குறிக்கப்பட்டவை',
  filterAll: 'அனைத்தும்', filterOpen: 'திறந்தவை', filterSafe: 'பாதுகாப்பானவை', filterFraud: 'மோசடி', filterDismissed: 'நிராகரிக்கப்பட்டவை',
  noAlerts: 'இந்தப் பிரிவில் எச்சரிக்கைகள் இல்லை.', aiReason: 'AI காரணம்', txnId: 'பரிவர்த்தனை ID', category: 'பிரிவு',
  thisSafe: 'இது பாதுகாப்பானது', reportFraud: 'மோசடியாகப் புகாரளி', dismiss: 'நிராகரி',
  markedSafe: 'பாதுகாப்பானதாகக் குறிக்கப்பட்டது', reportedFraud: 'மோசடியாகப் புகாரளிக்கப்பட்டது', dismissed: 'நிராகரிக்கப்பட்டது', reopen: 'மீண்டும் திற',
};

export const ANOMALY_T: Record<AdminLang, AnomalyText> = { en, si, ta };
