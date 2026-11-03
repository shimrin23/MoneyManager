// Text for the loan tabs (schedule, payoff strategies, AI insights), in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface LoanTabsText {
  // Repayment schedule
  schedEmi: string; schedPaid: string; schedRemaining: string; schedTitle: string;
  filterAll: string; filterPaid: string; filterPending: string;
  colMonth: string; colDue: string; colPrincipal: string; colInterest: string; colEmi: string; colBalance: string; colStatus: string;
  statusPaid: string; statusPending: string;
  // Debt payoff strategies
  stratTitle: string; stratNone: string; stratLead: string; pillSnowball: string; pillAvalanche: string;
  timeToClear: string; monthsSuffix: string; interestSaved: string; paymentOrder: string; paymentLine: string;
  chooseBtn: string; snowTitle: string; snowText: string; avalTitle: string; avalText: string;
  // AI insights
  aiLoading: string; aiTitle: string; refresh: string; noInsights: string; aiNote: string;
}

const en: LoanTabsText = {
  schedEmi: 'Monthly EMI', schedPaid: 'Total Paid', schedRemaining: 'Remaining', schedTitle: 'Repayment Schedule - {type} Loan',
  filterAll: 'All', filterPaid: 'Paid', filterPending: 'Pending',
  colMonth: 'Month', colDue: 'Due Date', colPrincipal: 'Principal', colInterest: 'Interest', colEmi: 'EMI', colBalance: 'Balance', colStatus: 'Status',
  statusPaid: 'Paid', statusPending: 'Pending',
  stratTitle: 'Debt Payoff Strategies', stratNone: 'No active loans to compare strategies',
  stratLead: 'Compare different strategies to pay off your loans faster',
  pillSnowball: 'Snowball', pillAvalanche: 'Avalanche', timeToClear: 'Time to Clear Debt', monthsSuffix: 'months',
  interestSaved: 'Interest Saved', paymentOrder: 'Payment Order', paymentLine: '{type} - {amount}/month',
  chooseBtn: 'Choose {name}',
  snowTitle: 'Snowball Method', snowText: 'Pay off smallest debts first. Gives quick psychological wins and maintains motivation.',
  avalTitle: 'Avalanche Method', avalText: 'Pay off highest interest rates first. Saves the most money in interest over time.',
  aiLoading: 'Loading insights...', aiTitle: 'AI Loan Insights', refresh: 'Refresh', noInsights: 'No insights available yet',
  aiNote: 'These insights are powered by AI and based on your loan data. Check back regularly for updated recommendations.',
};

const si: LoanTabsText = {
  schedEmi: 'මාසික EMI', schedPaid: 'මුළු ගෙවූ', schedRemaining: 'ඉතිරි', schedTitle: 'ආපසු ගෙවීම් කාලසටහන - {type} ණය',
  filterAll: 'සියල්ල', filterPaid: 'ගෙවූ', filterPending: 'බලාපොරොත්තුවෙන්',
  colMonth: 'මාසය', colDue: 'නියමිත දිනය', colPrincipal: 'මූලික මුදල', colInterest: 'පොලිය', colEmi: 'EMI', colBalance: 'ශේෂය', colStatus: 'තත්ත්වය',
  statusPaid: 'ගෙවූ', statusPending: 'බලාපොරොත්තුවෙන්',
  stratTitle: 'ණය ගෙවීමේ උපාය මාර්ග', stratNone: 'උපාය මාර්ග සංසන්දනය කිරීමට සක්‍රිය ණය නැත',
  stratLead: 'ඔබේ ණය වේගයෙන් ගෙවීමට විවිධ උපාය මාර්ග සංසන්දනය කරන්න',
  pillSnowball: 'ස්නෝබෝල්', pillAvalanche: 'හිමපහර', timeToClear: 'ණය නිම කිරීමට ගතවන කාලය', monthsSuffix: 'මාස',
  interestSaved: 'ඉතිරි කළ පොලිය', paymentOrder: 'ගෙවීම් අනුපිළිවෙල', paymentLine: '{type} - {amount}/මාසික',
  chooseBtn: '{name} තෝරන්න',
  snowTitle: 'ස්නෝබෝල් ක්‍රමය', snowText: 'කුඩාම ණය පළමුව ගෙවන්න. ඉක්මන් මානසික ජයග්‍රහණ ලබාදී අභිප්‍රේරණය පවත්වා ගනී.',
  avalTitle: 'හිමපහර ක්‍රමය', avalText: 'වැඩිම පොලී අනුපාතය ඇති ඒවා පළමුව ගෙවන්න. කාලයත් සමඟ පොලියෙන් වැඩිම මුදල ඉතිරි කරයි.',
  aiLoading: 'අවබෝධයන් පූරණය වෙමින්...', aiTitle: 'AI ණය අවබෝධයන්', refresh: 'නැවුම් කරන්න', noInsights: 'තවම අවබෝධයන් නැත',
  aiNote: 'මෙම අවබෝධයන් AI මගින් ජනනය කර ඔබේ ණය දත්ත මත පදනම් වේ. යාවත්කාලීන නිර්දේශ සඳහා නිතර නැවත පරීක්ෂා කරන්න.',
};

const ta: LoanTabsText = {
  schedEmi: 'மாதாந்திர EMI', schedPaid: 'மொத்தம் செலுத்தியது', schedRemaining: 'மீதம்', schedTitle: 'திருப்பிச் செலுத்தும் அட்டவணை - {type} கடன்',
  filterAll: 'அனைத்தும்', filterPaid: 'செலுத்தியவை', filterPending: 'நிலுவையில்',
  colMonth: 'மாதம்', colDue: 'நிலுவை தேதி', colPrincipal: 'அசல்', colInterest: 'வட்டி', colEmi: 'EMI', colBalance: 'இருப்பு', colStatus: 'நிலை',
  statusPaid: 'செலுத்தப்பட்டது', statusPending: 'நிலுவையில்',
  stratTitle: 'கடன் அடைப்பு உத்திகள்', stratNone: 'ஒப்பிட செயலில் உள்ள கடன்கள் இல்லை',
  stratLead: 'உங்கள் கடன்களை விரைவாக அடைக்க வெவ்வேறு உத்திகளை ஒப்பிடுங்கள்',
  pillSnowball: 'ஸ்னோபால்', pillAvalanche: 'அவலாஞ்ச்', timeToClear: 'கடனை அடைக்கும் நேரம்', monthsSuffix: 'மாதங்கள்',
  interestSaved: 'சேமித்த வட்டி', paymentOrder: 'செலுத்தும் வரிசை', paymentLine: '{type} - {amount}/மாதம்',
  chooseBtn: '{name} ஐத் தேர்ந்தெடு',
  snowTitle: 'ஸ்னோபால் முறை', snowText: 'சிறிய கடன்களை முதலில் அடையுங்கள். விரைவான மனநிறைவைத் தந்து ஊக்கத்தைத் தக்கவைக்கும்.',
  avalTitle: 'அவலாஞ்ச் முறை', avalText: 'அதிக வட்டி விகிதம் உள்ளவற்றை முதலில் அடையுங்கள். நீண்ட காலத்தில் அதிக வட்டிப் பணத்தை சேமிக்கும்.',
  aiLoading: 'நுண்ணறிவுகள் ஏற்றப்படுகின்றன...', aiTitle: 'AI கடன் நுண்ணறிவு', refresh: 'புதுப்பி', noInsights: 'இன்னும் நுண்ணறிவுகள் இல்லை',
  aiNote: 'இந்த நுண்ணறிவுகள் AI மூலம் இயக்கப்பட்டு உங்கள் கடன் தரவை அடிப்படையாகக் கொண்டவை. புதுப்பிக்கப்பட்ட பரிந்துரைகளுக்கு அடிக்கடி மீண்டும் பார்க்கவும்.',
};

export const LOAN_TABS_T: Record<AdminLang, LoanTabsText> = { en, si, ta };
