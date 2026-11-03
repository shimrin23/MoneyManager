// Text for the Loans page (its own labels, tabs and messages), in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface LoansText {
  loading: string; refresh: string; addLoan: string;
  tabOverview: string; tabCalculator: string; tabSchedule: string; tabStrategies: string;
  tabSimulation: string; tabInsights: string; tabRatio: string;
  payEmiTitle: string; paymentAmount: string; payButton: string; amountInvalid: string;
  paymentTooHigh: string; loanClosed: string; paymentRecorded: string; paymentFailed: string;
  loanUpdated: string; updateFailed: string;
  deleteLoanTitle: string; deleteLoanMessage: string; deleteConfirm: string;
  loanDeleted: string; deleteFailed: string;
  loanLabel: string; selectLoan: string;
  selectLoanSchedule: string; comparingStrategies: string; selectLoanSimulation: string;
  editLoanTitle: string; close: string; provider: string; interestRate: string; tenureMonths: string;
  monthlyEmi: string; emiNote: string; status: string; nextDueDate: string;
  stActive: string; stClosed: string; stOverdue: string;
  cancel: string; saveChanges: string;
}

const en: LoansText = {
  loading: 'Loading loans...', refresh: 'Refresh', addLoan: 'Add Loan',
  tabOverview: 'Overview', tabCalculator: 'Calculator', tabSchedule: 'Schedule', tabStrategies: 'Strategies',
  tabSimulation: 'Simulation', tabInsights: 'Insights', tabRatio: 'Debt-to-Income',
  payEmiTitle: 'Pay EMI',
  paymentAmount: 'Payment amount ({cur})', payButton: 'Pay',
  amountInvalid: 'Please enter an amount greater than 0.',
  paymentTooHigh: 'Payment cannot be more than the remaining {amount}.',
  loanClosed: 'Loan fully paid and closed. Well done!',
  paymentRecorded: 'Payment of {amount} recorded.',
  paymentFailed: 'Failed to record payment.',
  loanUpdated: 'Loan updated.', updateFailed: 'Failed to update loan',
  deleteLoanTitle: 'Delete loan?', deleteLoanMessage: 'This loan will be removed. This cannot be undone.', deleteConfirm: 'Delete',
  loanDeleted: 'Loan deleted.', deleteFailed: 'Failed to delete loan.',
  loanLabel: 'Loan', selectLoan: 'Select a loan…',
  selectLoanSchedule: 'Select a loan to view its schedule',
  comparingStrategies: 'Comparing payoff strategies…',
  selectLoanSimulation: 'Select a loan to run simulations',
  editLoanTitle: 'Edit Loan', close: 'Close', provider: 'Provider', interestRate: 'Interest Rate (%)',
  tenureMonths: 'Tenure (Months)', monthlyEmi: 'Monthly EMI ({cur})',
  emiNote: 'Recalculated automatically when you change the rate or tenure.',
  status: 'Status', nextDueDate: 'Next Due Date',
  stActive: 'Active', stClosed: 'Closed', stOverdue: 'Overdue',
  cancel: 'Cancel', saveChanges: 'Save Changes',
};

const si: LoansText = {
  loading: 'ණය පූරණය වෙමින්...', refresh: 'නැවුම් කරන්න', addLoan: 'ණයක් එකතු කරන්න',
  tabOverview: 'සාරාංශය', tabCalculator: 'ගණකය', tabSchedule: 'කාලසටහන', tabStrategies: 'උපාය මාර්ග',
  tabSimulation: 'අනුකරණය', tabInsights: 'අවබෝධයන්', tabRatio: 'ණය-ආදායම් අනුපාතය',
  payEmiTitle: 'EMI ගෙවන්න',
  paymentAmount: 'ගෙවන මුදල ({cur})', payButton: 'ගෙවන්න',
  amountInvalid: 'කරුණාකර 0 ට වැඩි මුදලක් ඇතුළත් කරන්න.',
  paymentTooHigh: 'ගෙවීම ඉතිරි {amount} ට වඩා වැඩි විය නොහැක.',
  loanClosed: 'ණය සම්පූර්ණයෙන් ගෙවා වසා ඇත. සුබ පැතුම්!',
  paymentRecorded: 'ගෙවීම {amount} සටහන් කරන ලදී.',
  paymentFailed: 'ගෙවීම සටහන් කිරීම අසාර්ථකයි.',
  loanUpdated: 'ණය යාවත්කාලීන කරන ලදී.', updateFailed: 'ණය යාවත්කාලීන කිරීම අසාර්ථකයි',
  deleteLoanTitle: 'ණය මකන්නද?', deleteLoanMessage: 'මෙම ණය ඉවත් කෙරේ. මෙය අහෝසි කළ නොහැක.', deleteConfirm: 'මකන්න',
  loanDeleted: 'ණය මකා දමන ලදී.', deleteFailed: 'ණය මැකීම අසාර්ථකයි.',
  loanLabel: 'ණය', selectLoan: 'ණයක් තෝරන්න…',
  selectLoanSchedule: 'එහි කාලසටහන බැලීමට ණයක් තෝරන්න',
  comparingStrategies: 'ගෙවීම් උපාය මාර්ග සසඳමින්…',
  selectLoanSimulation: 'අනුකරණ ධාවනය කිරීමට ණයක් තෝරන්න',
  editLoanTitle: 'ණය සංස්කරණය', close: 'වසන්න', provider: 'ණය සපයන්නා', interestRate: 'පොලී අනුපාතය (%)',
  tenureMonths: 'කාලය (මාස)', monthlyEmi: 'මාසික EMI ({cur})',
  emiNote: 'අනුපාතය හෝ කාලය වෙනස් කළ විට ස්වයංක්‍රීයව නැවත ගණනය කෙරේ.',
  status: 'තත්ත්වය', nextDueDate: 'ඊළඟ නියමිත දිනය',
  stActive: 'සක්‍රිය', stClosed: 'වසා ඇත', stOverdue: 'කල්ඉකුත්',
  cancel: 'අවලංගු කරන්න', saveChanges: 'වෙනස්කම් සුරකින්න',
};

const ta: LoansText = {
  loading: 'கடன்கள் ஏற்றப்படுகின்றன...', refresh: 'புதுப்பி', addLoan: 'கடனைச் சேர்',
  tabOverview: 'மேலோட்டம்', tabCalculator: 'கணிப்பான்', tabSchedule: 'அட்டவணை', tabStrategies: 'உத்திகள்',
  tabSimulation: 'உருவகப்படுத்தல்', tabInsights: 'நுண்ணறிவுகள்', tabRatio: 'கடன்-வருமான விகிதம்',
  payEmiTitle: 'EMI செலுத்து',
  paymentAmount: 'செலுத்தும் தொகை ({cur})', payButton: 'செலுத்து',
  amountInvalid: '0-ஐ விட அதிகமான தொகையை உள்ளிடவும்.',
  paymentTooHigh: 'செலுத்தும் தொகை மீதமுள்ள {amount} ஐ விட அதிகமாக இருக்க முடியாது.',
  loanClosed: 'கடன் முழுமையாகச் செலுத்தப்பட்டு மூடப்பட்டது. வாழ்த்துகள்!',
  paymentRecorded: '{amount} செலுத்தல் பதிவு செய்யப்பட்டது.',
  paymentFailed: 'செலுத்தலைப் பதிவு செய்ய முடியவில்லை.',
  loanUpdated: 'கடன் புதுப்பிக்கப்பட்டது.', updateFailed: 'கடனைப் புதுப்பிக்க முடியவில்லை',
  deleteLoanTitle: 'கடனை நீக்கவா?', deleteLoanMessage: 'இந்தக் கடன் நீக்கப்படும். இதை மாற்ற முடியாது.', deleteConfirm: 'நீக்கு',
  loanDeleted: 'கடன் நீக்கப்பட்டது.', deleteFailed: 'கடனை நீக்க முடியவில்லை.',
  loanLabel: 'கடன்', selectLoan: 'கடனைத் தேர்ந்தெடுக்கவும்…',
  selectLoanSchedule: 'அட்டவணையைப் பார்க்க ஒரு கடனைத் தேர்ந்தெடுக்கவும்',
  comparingStrategies: 'செலுத்தும் உத்திகள் ஒப்பிடப்படுகின்றன…',
  selectLoanSimulation: 'உருவகப்படுத்தலை இயக்க ஒரு கடனைத் தேர்ந்தெடுக்கவும்',
  editLoanTitle: 'கடனைத் திருத்து', close: 'மூடு', provider: 'கடன் வழங்குநர்', interestRate: 'வட்டி விகிதம் (%)',
  tenureMonths: 'காலம் (மாதங்கள்)', monthlyEmi: 'மாதாந்திர EMI ({cur})',
  emiNote: 'விகிதம் அல்லது காலத்தை மாற்றும்போது தானாகவே மீண்டும் கணக்கிடப்படும்.',
  status: 'நிலை', nextDueDate: 'அடுத்த செலுத்தும் தேதி',
  stActive: 'செயலில்', stClosed: 'மூடப்பட்டது', stOverdue: 'காலாவதியானது',
  cancel: 'ரத்து செய்', saveChanges: 'மாற்றங்களைச் சேமி',
};

export const LOANS_T: Record<AdminLang, LoansText> = { en, si, ta };
