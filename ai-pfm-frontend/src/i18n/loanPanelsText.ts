// Text for the loan cards and loan alerts on the Loans page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface LoanPanelsText {
  noActive: string; addFirst: string; activeLoans: string; loanSuffix: string; statusActive: string;
  monthlyEmi: string; remainingAmount: string; interestRate: string; nextDue: string; rateValue: string;
  progressLabel: string; paidLabel: string;
  payEmi: string; viewSchedule: string; recalculate: string; edit: string; delete: string;
  loadingAlerts: string; allGood: string; loanAlerts: string; actionRequired: string; dismiss: string;
  typeDueSoon: string; typeOverdue: string; typeHighEmi: string;
}

const en: LoanPanelsText = {
  noActive: 'No Active Loans', addFirst: 'Add your first loan to start tracking it.', activeLoans: 'Active Loans',
  loanSuffix: '{type} Loan', statusActive: 'Active',
  monthlyEmi: 'Monthly EMI', remainingAmount: 'Remaining Amount', interestRate: 'Interest Rate', nextDue: 'Next Due Date',
  rateValue: '{rate}% p.a.', progressLabel: '{pct}% of the loan paid', paidLabel: '{pct}% paid',
  payEmi: 'Pay EMI', viewSchedule: 'View Schedule', recalculate: 'Recalculate', edit: 'Edit', delete: 'Delete',
  loadingAlerts: 'Loading alerts...', allGood: 'All loans are in good standing.', loanAlerts: 'Loan Alerts',
  actionRequired: 'Action Required', dismiss: 'Dismiss',
  typeDueSoon: 'due soon', typeOverdue: 'overdue', typeHighEmi: 'high emi ratio',
};

const si: LoanPanelsText = {
  noActive: 'සක්‍රිය ණය නැත', addFirst: 'ලුහුබැඳීම ආරම්භ කිරීමට ඔබේ පළමු ණය එකතු කරන්න.', activeLoans: 'සක්‍රිය ණය',
  loanSuffix: '{type} ණය', statusActive: 'සක්‍රිය',
  monthlyEmi: 'මාසික EMI', remainingAmount: 'ඉතිරි මුදල', interestRate: 'පොලී අනුපාතය', nextDue: 'ඊළඟ ගෙවීම් දිනය',
  rateValue: '{rate}% වාර්ෂික', progressLabel: 'ණයෙන් {pct}% ගෙවා ඇත', paidLabel: '{pct}% ගෙවා ඇත',
  payEmi: 'EMI ගෙවන්න', viewSchedule: 'කාලසටහන බලන්න', recalculate: 'නැවත ගණනය කරන්න', edit: 'සංස්කරණය', delete: 'මකන්න',
  loadingAlerts: 'ඇඟවීම් පූරණය වෙමින්...', allGood: 'සියලු ණය හොඳ තත්ත්වයේ පවතී.', loanAlerts: 'ණය ඇඟවීම්',
  actionRequired: 'ක්‍රියාව අවශ්‍යයි', dismiss: 'ඉවත ලන්න',
  typeDueSoon: 'ළඟදී ගෙවිය යුතු', typeOverdue: 'ප්‍රමාද', typeHighEmi: 'ඉහළ EMI අනුපාතය',
};

const ta: LoanPanelsText = {
  noActive: 'செயலில் உள்ள கடன்கள் இல்லை', addFirst: 'கண்காணிக்கத் தொடங்க உங்கள் முதல் கடனைச் சேர்க்கவும்.', activeLoans: 'செயலில் உள்ள கடன்கள்',
  loanSuffix: '{type} கடன்', statusActive: 'செயலில்',
  monthlyEmi: 'மாதாந்திர EMI', remainingAmount: 'மீதமுள்ள தொகை', interestRate: 'வட்டி விகிதம்', nextDue: 'அடுத்த நிலுவை தேதி',
  rateValue: '{rate}% ஆண்டுக்கு', progressLabel: 'கடனில் {pct}% செலுத்தப்பட்டது', paidLabel: '{pct}% செலுத்தப்பட்டது',
  payEmi: 'EMI செலுத்து', viewSchedule: 'அட்டவணையைக் காண்', recalculate: 'மீண்டும் கணக்கிடு', edit: 'திருத்து', delete: 'நீக்கு',
  loadingAlerts: 'எச்சரிக்கைகள் ஏற்றப்படுகின்றன...', allGood: 'அனைத்துக் கடன்களும் நல்ல நிலையில் உள்ளன.', loanAlerts: 'கடன் எச்சரிக்கைகள்',
  actionRequired: 'நடவடிக்கை தேவை', dismiss: 'நிராகரி',
  typeDueSoon: 'விரைவில் நிலுவை', typeOverdue: 'தாமதம்', typeHighEmi: 'அதிக EMI விகிதம்',
};

export const LOAN_PANELS_T: Record<AdminLang, LoanPanelsText> = { en, si, ta };
