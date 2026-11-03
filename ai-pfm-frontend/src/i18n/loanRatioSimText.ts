// Text for the Loan-to-Income Ratio and What-If Simulation loan tabs, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface LoanRatioSimText {
  // Loan-to-income ratio
  loading: string; failedData: string; ratioTitle: string;
  emiIs: string; incomeHint: string; addIncome: string; refresh: string; currentDti: string;
  statEmi: string; statIncome: string; statRisk: string; aiRec: string; riskGuide: string;
  riskLow: string; riskMedium: string; riskHigh: string; riskCritical: string;
  // What-if simulation
  simLead: string; tabEmi: string; tabLump: string; tabRefi: string; simulating: string; simulate: string;
  emiTitle: string; emiLead: string; newEmi: string; currentEmi: string;
  lumpTitle: string; lumpLead: string; lumpAmount: string; maxAvail: string; applyMonth: string; totalTenure: string;
  refiTitle: string; refiLead: string; newRate: string; currentRate: string;
  resultsTitle: string; monthlyEmi: string; totalInterest: string; timeToPayoff: string; monthsSuffix: string;
  potentialSavings: string; interestSavedLabel: string; timeSavedLabel: string; timeSaved: string;
}

const en: LoanRatioSimText = {
  loading: 'Loading...', failedData: 'Failed to load data', ratioTitle: 'Loan-to-Income Ratio',
  emiIs: 'Your total monthly EMI is', incomeHint: 'To see how much of your income goes to loans, add your monthly income in your Profile.',
  addIncome: 'Add monthly income', refresh: 'Refresh', currentDti: 'Current Debt-to-Income Ratio',
  statEmi: 'Total Monthly EMI', statIncome: 'Monthly Income', statRisk: 'Risk Level', aiRec: 'AI Recommendation', riskGuide: 'Risk Scale Guide',
  riskLow: 'Low', riskMedium: 'Medium', riskHigh: 'High', riskCritical: 'Critical',
  simLead: 'Explore different scenarios to optimize your loan repayment',
  tabEmi: 'Increase EMI', tabLump: 'Lump Sum', tabRefi: 'Refinance', simulating: 'Simulating...', simulate: 'Simulate',
  emiTitle: 'Increase Monthly EMI', emiLead: 'See how increasing your EMI can help you pay off the loan faster and save interest.',
  newEmi: 'New Monthly EMI: {amount}', currentEmi: 'Current EMI: {amount}',
  lumpTitle: 'Lump Sum Payment', lumpLead: 'Make an extra payment to reduce your loan balance and interest.',
  lumpAmount: 'Lump Sum Amount ({cur})', maxAvail: 'Max available: {amount}', applyMonth: 'Apply in Month: {n}',
  totalTenure: 'Total tenure: {n} months',
  refiTitle: 'Refinance Loan', refiLead: 'See potential savings if you refinance at a lower interest rate.',
  newRate: 'New Interest Rate: {rate}% p.a.', currentRate: 'Current rate: {rate}% p.a.',
  resultsTitle: 'Simulation Results', monthlyEmi: 'Monthly EMI', totalInterest: 'Total Interest', timeToPayoff: 'Time to Payoff',
  monthsSuffix: 'months', potentialSavings: 'Potential Savings', interestSavedLabel: 'Interest Saved:', timeSavedLabel: 'Time Saved:',
  timeSaved: '{n} months',
};

const si: LoanRatioSimText = {
  loading: 'පූරණය වෙමින්...', failedData: 'දත්ත පූරණය කළ නොහැක', ratioTitle: 'ණය-ආදායම් අනුපාතය',
  emiIs: 'ඔබේ මුළු මාසික EMI වන්නේ', incomeHint: 'ඔබේ ආදායමෙන් කොපමණ ණයට යන්නේදැයි බැලීමට, ඔබේ පැතිකඩේ මාසික ආදායම එකතු කරන්න.',
  addIncome: 'මාසික ආදායම එකතු කරන්න', refresh: 'නැවුම් කරන්න', currentDti: 'වර්තමාන ණය-ආදායම් අනුපාතය',
  statEmi: 'මුළු මාසික EMI', statIncome: 'මාසික ආදායම', statRisk: 'අවදානම් මට්ටම', aiRec: 'AI නිර්දේශය', riskGuide: 'අවදානම් පරිමාණ මාර්ගෝපදේශය',
  riskLow: 'අඩු', riskMedium: 'මධ්‍යම', riskHigh: 'ඉහළ', riskCritical: 'බරපතල',
  simLead: 'ඔබේ ණය ආපසු ගෙවීම ප්‍රශස්ත කිරීමට විවිධ අවස්ථා ගවේෂණය කරන්න',
  tabEmi: 'EMI වැඩි කරන්න', tabLump: 'එක්වර ගෙවීම', tabRefi: 'නැවත මූල්‍යකරණය', simulating: 'අනුකරණය වෙමින්...', simulate: 'අනුකරණය කරන්න',
  emiTitle: 'මාසික EMI වැඩි කරන්න', emiLead: 'ඔබේ EMI වැඩි කිරීම ණය වේගයෙන් ගෙවීමට සහ පොලිය ඉතිරි කිරීමට උපකාරී වන ආකාරය බලන්න.',
  newEmi: 'නව මාසික EMI: {amount}', currentEmi: 'වර්තමාන EMI: {amount}',
  lumpTitle: 'එක්වර ගෙවීම', lumpLead: 'ණය ශේෂය සහ පොලිය අඩු කිරීමට අමතර ගෙවීමක් කරන්න.',
  lumpAmount: 'එක්වර ගෙවන මුදල ({cur})', maxAvail: 'උපරිම ලබා ගත හැකි: {amount}', applyMonth: 'මාසයේ යොදන්න: {n}',
  totalTenure: 'මුළු කාලය: මාස {n}',
  refiTitle: 'ණය නැවත මූල්‍යකරණය', refiLead: 'අඩු පොලී අනුපාතයකට නැවත මූල්‍යකරණය කළහොත් ඉතිරි විය හැකි මුදල බලන්න.',
  newRate: 'නව පොලී අනුපාතය: {rate}% වාර්ෂික', currentRate: 'වර්තමාන අනුපාතය: {rate}% වාර්ෂික',
  resultsTitle: 'අනුකරණ ප්‍රතිඵල', monthlyEmi: 'මාසික EMI', totalInterest: 'මුළු පොලිය', timeToPayoff: 'ගෙවා අවසන් වීමට කාලය',
  monthsSuffix: 'මාස', potentialSavings: 'විභව ඉතිරිකිරීම්', interestSavedLabel: 'ඉතිරි කළ පොලිය:', timeSavedLabel: 'ඉතිරි කළ කාලය:',
  timeSaved: 'මාස {n}',
};

const ta: LoanRatioSimText = {
  loading: 'ஏற்றப்படுகிறது...', failedData: 'தரவை ஏற்ற முடியவில்லை', ratioTitle: 'கடன்-வருமான விகிதம்',
  emiIs: 'உங்கள் மொத்த மாதாந்திர EMI', incomeHint: 'உங்கள் வருமானத்தில் எவ்வளவு கடனுக்குச் செல்கிறது என்று பார்க்க, உங்கள் சுயவிவரத்தில் மாத வருமானத்தைச் சேர்க்கவும்.',
  addIncome: 'மாத வருமானத்தைச் சேர்', refresh: 'புதுப்பி', currentDti: 'தற்போதைய கடன்-வருமான விகிதம்',
  statEmi: 'மொத்த மாதாந்திர EMI', statIncome: 'மாத வருமானம்', statRisk: 'ஆபத்து நிலை', aiRec: 'AI பரிந்துரை', riskGuide: 'ஆபத்து அளவு வழிகாட்டி',
  riskLow: 'குறைவு', riskMedium: 'நடுத்தரம்', riskHigh: 'அதிகம்', riskCritical: 'மிக அதிகம்',
  simLead: 'உங்கள் கடன் திருப்பிச் செலுத்துதலை மேம்படுத்த வெவ்வேறு சூழ்நிலைகளை ஆராயுங்கள்',
  tabEmi: 'EMI ஐ உயர்த்து', tabLump: 'ஒரேயடித் தொகை', tabRefi: 'மறுநிதியளிப்பு', simulating: 'உருவகப்படுத்தப்படுகிறது...', simulate: 'உருவகப்படுத்து',
  emiTitle: 'மாதாந்திர EMI ஐ உயர்த்து', emiLead: 'உங்கள் EMI ஐ உயர்த்துவது கடனை விரைவாக அடைக்கவும் வட்டியைச் சேமிக்கவும் எவ்வாறு உதவும் என்று பாருங்கள்.',
  newEmi: 'புதிய மாதாந்திர EMI: {amount}', currentEmi: 'தற்போதைய EMI: {amount}',
  lumpTitle: 'ஒரேயடித் தொகை செலுத்தல்', lumpLead: 'கடன் இருப்பையும் வட்டியையும் குறைக்க கூடுதல் செலுத்தல் செய்யுங்கள்.',
  lumpAmount: 'ஒரேயடித் தொகை ({cur})', maxAvail: 'அதிகபட்சம் கிடைப்பது: {amount}', applyMonth: 'மாதத்தில் பயன்படுத்து: {n}',
  totalTenure: 'மொத்த காலம்: {n} மாதங்கள்',
  refiTitle: 'கடனை மறுநிதியளி', refiLead: 'குறைந்த வட்டி விகிதத்தில் மறுநிதியளித்தால் சாத்தியமான சேமிப்பைப் பாருங்கள்.',
  newRate: 'புதிய வட்டி விகிதம்: {rate}% ஆண்டுக்கு', currentRate: 'தற்போதைய விகிதம்: {rate}% ஆண்டுக்கு',
  resultsTitle: 'உருவகப்படுத்தல் முடிவுகள்', monthlyEmi: 'மாதாந்திர EMI', totalInterest: 'மொத்த வட்டி', timeToPayoff: 'அடைக்கும் நேரம்',
  monthsSuffix: 'மாதங்கள்', potentialSavings: 'சாத்தியமான சேமிப்பு', interestSavedLabel: 'சேமித்த வட்டி:', timeSavedLabel: 'சேமித்த நேரம்:',
  timeSaved: '{n} மாதங்கள்',
};

export const LOAN_RS_T: Record<AdminLang, LoanRatioSimText> = { en, si, ta };
