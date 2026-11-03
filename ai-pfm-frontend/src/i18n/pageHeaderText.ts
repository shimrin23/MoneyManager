// Top-bar title and subtitle for each customer page, in English, Sinhala and Tamil.
import { type AdminLang } from './adminText';

export interface PageHeader {
  title: string;
  subtitle: string;
}

export interface PageHeaderText {
  dashboard: PageHeader; financialHealth: PageHeader; recommendations: PageHeader; transactions: PageHeader;
  creditCards: PageHeader; anomalies: PageHeader; smartBudgets: PageHeader; goals: PageHeader;
  recurring: PageHeader; connectBank: PageHeader; fixedDeposits: PageHeader; loans: PageHeader;
  leases: PageHeader; pawning: PageHeader; notifications: PageHeader; subscriptionsSub: string;
}

const en: PageHeaderText = {
  dashboard: { title: 'Dashboard', subtitle: 'Your financial overview at a glance' },
  financialHealth: { title: 'Financial Health', subtitle: 'Detailed analysis of your metrics' },
  recommendations: { title: 'AI Recommendations', subtitle: 'Insights and suggestions' },
  transactions: { title: 'Transactions', subtitle: 'Your transaction history' },
  creditCards: { title: 'Credit Cards', subtitle: 'Manage your credit lines' },
  anomalies: { title: 'Anomaly Detection', subtitle: 'Unusual transaction alerts' },
  smartBudgets: { title: 'Smart Budgets', subtitle: 'AI-assisted budgeting' },
  goals: { title: 'Financial Goals', subtitle: 'Track your saving progress' },
  recurring: { title: 'Cash Flow', subtitle: 'Subscriptions and recurring payments' },
  connectBank: { title: 'Connect Bank Account', subtitle: 'Link external accounts' },
  fixedDeposits: { title: 'Fixed Deposits', subtitle: 'Manage term deposits' },
  loans: { title: 'Loans & Debt', subtitle: 'Track your liabilities' },
  leases: { title: 'Leases', subtitle: 'Vehicle and equipment leases' },
  pawning: { title: 'Pawning', subtitle: 'Gold and item pawning' },
  notifications: { title: 'Notifications', subtitle: 'Recent alerts and updates' },
  subscriptionsSub: 'Track costs, unused services and cheaper options',
};

const si: PageHeaderText = {
  dashboard: { title: 'උපකරණ පුවරුව', subtitle: 'ඔබේ මූල්‍ය දළ විශ්ලේෂණය එක බැල්මකින්' },
  financialHealth: { title: 'මූල්‍ය සෞඛ්‍යය', subtitle: 'ඔබේ මිනුම්වල විස්තරාත්මක විශ්ලේෂණය' },
  recommendations: { title: 'AI නිර්දේශ', subtitle: 'අවබෝධයන් සහ යෝජනා' },
  transactions: { title: 'ගනුදෙනු', subtitle: 'ඔබේ ගනුදෙනු ඉතිහාසය' },
  creditCards: { title: 'ණය කාඩ්පත්', subtitle: 'ඔබේ ණය සීමා කළමනාකරණය කරන්න' },
  anomalies: { title: 'අසාමාන්‍යතා හඳුනාගැනීම', subtitle: 'අසාමාන්‍ය ගනුදෙනු ඇඟවීම්' },
  smartBudgets: { title: 'බුද්ධිමත් අයවැය', subtitle: 'AI-සහාය සහිත අයවැය කිරීම' },
  goals: { title: 'මූල්‍ය ඉලක්ක', subtitle: 'ඔබේ ඉතිරි කිරීමේ ප්‍රගතිය ලුහුබඳින්න' },
  recurring: { title: 'මුදල් ප්‍රවාහය', subtitle: 'දායකත්ව සහ නැවත නැවත ගෙවීම්' },
  connectBank: { title: 'බැංකු ගිණුම සම්බන්ධ කරන්න', subtitle: 'බාහිර ගිණුම් සම්බන්ධ කරන්න' },
  fixedDeposits: { title: 'ස්ථාවර තැන්පතු', subtitle: 'කාලීන තැන්පතු කළමනාකරණය කරන්න' },
  loans: { title: 'ණය සහ ඍණ', subtitle: 'ඔබේ වගකීම් ලුහුබඳින්න' },
  leases: { title: 'කුලී ගිවිසුම්', subtitle: 'වාහන සහ උපකරණ කුලී ගිවිසුම්' },
  pawning: { title: 'උකස්', subtitle: 'රන් සහ භාණ්ඩ උකස් කිරීම' },
  notifications: { title: 'දැනුම්දීම්', subtitle: 'මෑත ඇඟවීම් සහ යාවත්කාලීන' },
  subscriptionsSub: 'පිරිවැය, භාවිත නොකරන සේවා සහ ලාභ විකල්ප ලුහුබඳින්න',
};

const ta: PageHeaderText = {
  dashboard: { title: 'டாஷ்போர்டு', subtitle: 'உங்கள் நிதி கண்ணோட்டம் ஒரே பார்வையில்' },
  financialHealth: { title: 'நிதி ஆரோக்கியம்', subtitle: 'உங்கள் அளவீடுகளின் விரிவான பகுப்பாய்வு' },
  recommendations: { title: 'AI பரிந்துரைகள்', subtitle: 'நுண்ணறிவுகளும் ஆலோசனைகளும்' },
  transactions: { title: 'பரிவர்த்தனைகள்', subtitle: 'உங்கள் பரிவர்த்தனை வரலாறு' },
  creditCards: { title: 'கடன் அட்டைகள்', subtitle: 'உங்கள் கடன் வரம்புகளை நிர்வகியுங்கள்' },
  anomalies: { title: 'முரண்பாடு கண்டறிதல்', subtitle: 'அசாதாரண பரிவர்த்தனை எச்சரிக்கைகள்' },
  smartBudgets: { title: 'ஸ்மார்ட் பட்ஜெட்கள்', subtitle: 'AI உதவியுடன் பட்ஜெட் திட்டமிடல்' },
  goals: { title: 'நிதி இலக்குகள்', subtitle: 'உங்கள் சேமிப்பு முன்னேற்றத்தைக் கண்காணியுங்கள்' },
  recurring: { title: 'பண ஓட்டம்', subtitle: 'சந்தாக்கள் மற்றும் தொடர் செலுத்தல்கள்' },
  connectBank: { title: 'வங்கிக் கணக்கை இணைக்கவும்', subtitle: 'வெளி கணக்குகளை இணைக்கவும்' },
  fixedDeposits: { title: 'நிலையான வைப்புகள்', subtitle: 'கால வைப்புகளை நிர்வகியுங்கள்' },
  loans: { title: 'கடன்கள் & கடமைகள்', subtitle: 'உங்கள் பொறுப்புகளைக் கண்காணியுங்கள்' },
  leases: { title: 'குத்தகைகள்', subtitle: 'வாகன மற்றும் உபகரண குத்தகைகள்' },
  pawning: { title: 'அடமானம்', subtitle: 'தங்கம் மற்றும் பொருட்களின் அடமானம்' },
  notifications: { title: 'அறிவிப்புகள்', subtitle: 'சமீபத்திய எச்சரிக்கைகள் மற்றும் புதுப்பிப்புகள்' },
  subscriptionsSub: 'செலவுகள், பயன்படுத்தாத சேவைகள் மற்றும் மலிவான விருப்பங்களைக் கண்காணியுங்கள்',
};

export const PAGE_HDR_T: Record<AdminLang, PageHeaderText> = { en, si, ta };
