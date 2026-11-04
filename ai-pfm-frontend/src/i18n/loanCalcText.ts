// Text for the Loan Calculator (EMI calculator, schedule and create steps), in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface LoanCalcText {
  errProvider: string; errPrincipal: string; errRate: string; errTenure: string; loanCreated: string;
  recalcIntro: string; recalcEditHint: string; editWord: string; recalcEditTail: string;
  calcTitle: string; loanType: string; providerBank: string; providerPh: string; principalLabel: string;
  rateLabel: string; tenureLabel: string; startDate: string; notes: string; notesPh: string;
  calculating: string; calcBtn: string;
  monthlyEmi: string; totalInterest: string; totalPayable: string; preview6: string; viewFull: string;
  back: string; creating: string; createLoan: string; fullSchedule: string;
  colMonth: string; colDue: string; colPrincipal: string; colInterest: string; colEmi: string; colBalance: string;
  typePersonal: string; typeHome: string; typeVehicle: string; typeEducation: string;
}

const en: LoanCalcText = {
  errProvider: 'Enter the provider / bank name', errPrincipal: 'Enter valid principal amount',
  errRate: 'Enter valid interest rate', errTenure: 'Enter valid tenure (months)', loanCreated: 'Loan created.',
  recalcIntro: 'Recalculating {type} loan from {provider}. Change the values to compare.',
  recalcEditHint: 'To change the loan itself, use', editWord: 'Edit', recalcEditTail: 'on the loan card.',
  calcTitle: 'EMI Calculator', loanType: 'Loan Type', providerBank: 'Provider/Bank', providerPh: 'e.g., ICICI Bank',
  principalLabel: 'Principal Amount ({cur})', rateLabel: 'Interest Rate (% p.a.)', tenureLabel: 'Tenure (Months)',
  startDate: 'Start Date', notes: 'Notes (Optional)', notesPh: 'Any notes about this loan...',
  calculating: 'Calculating...', calcBtn: 'Calculate EMI',
  monthlyEmi: 'Monthly EMI', totalInterest: 'Total Interest', totalPayable: 'Total Payable',
  preview6: 'First 6 Months Preview', viewFull: 'View Full Schedule', back: 'Back',
  creating: 'Creating...', createLoan: 'Create Loan', fullSchedule: 'Complete Repayment Schedule',
  colMonth: 'Month', colDue: 'Due Date', colPrincipal: 'Principal', colInterest: 'Interest', colEmi: 'EMI', colBalance: 'Balance',
  typePersonal: 'Personal', typeHome: 'Home', typeVehicle: 'Vehicle', typeEducation: 'Education',
};

const si: LoanCalcText = {
  errProvider: 'සපයන්නා / බැංකුවේ නම ඇතුළත් කරන්න', errPrincipal: 'වලංගු මූලික මුදලක් ඇතුළත් කරන්න',
  errRate: 'වලංගු පොලී අනුපාතයක් ඇතුළත් කරන්න', errTenure: 'වලංගු කාලයක් (මාස) ඇතුළත් කරන්න', loanCreated: 'ණය නිර්මාණය කරන ලදී.',
  recalcIntro: '{provider} වෙතින් {type} ණය නැවත ගණනය කෙරේ. සංසන්දනය කිරීමට අගයන් වෙනස් කරන්න.',
  recalcEditHint: 'ණයම වෙනස් කිරීමට, ණය කාඩ්පතෙහි', editWord: 'සංස්කරණය', recalcEditTail: 'භාවිත කරන්න.',
  calcTitle: 'EMI ගණකය', loanType: 'ණය වර්ගය', providerBank: 'සපයන්නා/බැංකුව', providerPh: 'උදා: ICICI Bank',
  principalLabel: 'මූලික මුදල ({cur})', rateLabel: 'පොලී අනුපාතය (% වාර්ෂික)', tenureLabel: 'කාලය (මාස)',
  startDate: 'ආරම්භ දිනය', notes: 'සටහන් (විකල්ප)', notesPh: 'මෙම ණය ගැන ඕනෑම සටහනක්...',
  calculating: 'ගණනය කෙරෙමින්...', calcBtn: 'EMI ගණනය කරන්න',
  monthlyEmi: 'මාසික EMI', totalInterest: 'මුළු පොලිය', totalPayable: 'ගෙවිය යුතු මුළු',
  preview6: 'මුල් මාස 6 පෙරදසුන', viewFull: 'සම්පූර්ණ කාලසටහන බලන්න', back: 'ආපසු',
  creating: 'සාදමින්...', createLoan: 'ණය සාදන්න', fullSchedule: 'සම්පූර්ණ ආපසු ගෙවීම් කාලසටහන',
  colMonth: 'මාසය', colDue: 'නියමිත දිනය', colPrincipal: 'මූලික මුදල', colInterest: 'පොලිය', colEmi: 'EMI', colBalance: 'ශේෂය',
  typePersonal: 'පෞද්ගලික', typeHome: 'නිවාස', typeVehicle: 'වාහන', typeEducation: 'අධ්‍යාපන',
};

const ta: LoanCalcText = {
  errProvider: 'வழங்குநர் / வங்கியின் பெயரை உள்ளிடவும்', errPrincipal: 'சரியான அசல் தொகையை உள்ளிடவும்',
  errRate: 'சரியான வட்டி விகிதத்தை உள்ளிடவும்', errTenure: 'சரியான காலத்தை (மாதங்கள்) உள்ளிடவும்', loanCreated: 'கடன் உருவாக்கப்பட்டது.',
  recalcIntro: '{provider} இலிருந்து {type} கடனை மீண்டும் கணக்கிடுகிறது. ஒப்பிட மதிப்புகளை மாற்றுங்கள்.',
  recalcEditHint: 'கடனையே மாற்ற, கடன் அட்டையில்', editWord: 'திருத்து', recalcEditTail: 'ஐப் பயன்படுத்துங்கள்.',
  calcTitle: 'EMI கணிப்பான்', loanType: 'கடன் வகை', providerBank: 'வழங்குநர்/வங்கி', providerPh: 'எ.கா. ICICI Bank',
  principalLabel: 'அசல் தொகை ({cur})', rateLabel: 'வட்டி விகிதம் (% ஆண்டுக்கு)', tenureLabel: 'காலம் (மாதங்கள்)',
  startDate: 'தொடக்க தேதி', notes: 'குறிப்புகள் (விருப்பம்)', notesPh: 'இந்தக் கடனைப் பற்றிய குறிப்புகள்...',
  calculating: 'கணக்கிடப்படுகிறது...', calcBtn: 'EMI ஐக் கணக்கிடு',
  monthlyEmi: 'மாதாந்திர EMI', totalInterest: 'மொத்த வட்டி', totalPayable: 'மொத்தம் செலுத்த வேண்டியது',
  preview6: 'முதல் 6 மாதங்களின் முன்னோட்டம்', viewFull: 'முழு அட்டவணையைக் காண்', back: 'பின்செல்',
  creating: 'உருவாக்கப்படுகிறது...', createLoan: 'கடனை உருவாக்கு', fullSchedule: 'முழு திருப்பிச் செலுத்தும் அட்டவணை',
  colMonth: 'மாதம்', colDue: 'நிலுவை தேதி', colPrincipal: 'அசல்', colInterest: 'வட்டி', colEmi: 'EMI', colBalance: 'இருப்பு',
  typePersonal: 'தனிப்பட்ட', typeHome: 'வீடு', typeVehicle: 'வாகனம்', typeEducation: 'கல்வி',
};

export const LOAN_CALC_T: Record<AdminLang, LoanCalcText> = { en, si, ta };
