// Text for the Add / Edit Transaction form, in English, Sinhala and Tamil.
// Category values saved to the database stay in English; only the labels shown are translated.
import { type AdminLang } from './adminText';

export interface TxFormText {
  amountErr: string; amountInvalid: string; loginAgain: string; failAdd: string; errPrefix: string;
  addedOk: string; updatedOk: string; typeGroup: string; expense: string; income: string;
  amountLabel: string; category: string; selectCat: string; date: string; description: string; descPh: string;
  cancel: string; adding: string; updating: string; update: string; addExpense: string; addIncome: string;
  categories: Record<string, string>;
}

const en: TxFormText = {
  amountErr: 'Amount and category are required', amountInvalid: 'Please enter a valid amount',
  loginAgain: 'Please login again', failAdd: 'Failed to add transaction', errPrefix: 'Error: {msg}',
  addedOk: 'Transaction added successfully!', updatedOk: 'Transaction updated successfully!',
  typeGroup: 'Transaction type', expense: 'Expense', income: 'Income',
  amountLabel: 'Amount ({cur})', category: 'Category', selectCat: 'Select a category', date: 'Date',
  description: 'Description', descPh: 'What was this for?', cancel: 'Cancel',
  adding: 'Adding…', updating: 'Updating…', update: 'Update', addExpense: 'Add Expense', addIncome: 'Add Income',
  categories: {},
};

const si: TxFormText = {
  amountErr: 'මුදල සහ කාණ්ඩය අවශ්‍යයි', amountInvalid: 'වලංගු මුදලක් ඇතුළත් කරන්න', loginAgain: 'කරුණාකර නැවත පිවිසෙන්න',
  failAdd: 'ගනුදෙනුව එකතු කිරීම අසාර්ථකයි', errPrefix: 'දෝෂය: {msg}',
  addedOk: 'ගනුදෙනුව සාර්ථකව එකතු කරන ලදී!', updatedOk: 'ගනුදෙනුව සාර්ථකව යාවත්කාලීන කරන ලදී!',
  typeGroup: 'ගනුදෙනු වර්ගය', expense: 'වියදම', income: 'ආදායම',
  amountLabel: 'මුදල ({cur})', category: 'කාණ්ඩය', selectCat: 'කාණ්ඩයක් තෝරන්න', date: 'දිනය',
  description: 'විස්තරය', descPh: 'මෙය සඳහා කුමක්ද?', cancel: 'අවලංගු කරන්න',
  adding: 'එකතු කෙරෙමින්…', updating: 'යාවත්කාලීන කෙරෙමින්…', update: 'යාවත්කාලීන කරන්න', addExpense: 'වියදම එකතු කරන්න', addIncome: 'ආදායම එකතු කරන්න',
  categories: {
    'Food & Dining': 'ආහාර සහ ආහාරපාන', Shopping: 'සාප්පු සවාරි', Entertainment: 'විනෝදාස්වාදය', Transport: 'ප්‍රවාහනය',
    'Bills & Utilities': 'බිල්පත් සහ උපයෝගිතා', Healthcare: 'සෞඛ්‍ය සේවා', Education: 'අධ්‍යාපනය', Travel: 'සංචාරය', Other: 'වෙනත්',
    Salary: 'වැටුප', Freelance: 'නිදහස් වෘත්තිය', Business: 'ව්‍යාපාර', Investment: 'ආයෝජන', Gift: 'තෑගි',
  },
};

const ta: TxFormText = {
  amountErr: 'தொகையும் வகையும் தேவை', amountInvalid: 'சரியான தொகையை உள்ளிடவும்', loginAgain: 'மீண்டும் உள்நுழையவும்',
  failAdd: 'பரிவர்த்தனையைச் சேர்க்க முடியவில்லை', errPrefix: 'பிழை: {msg}',
  addedOk: 'பரிவர்த்தனை வெற்றிகரமாகச் சேர்க்கப்பட்டது!', updatedOk: 'பரிவர்த்தனை வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது!',
  typeGroup: 'பரிவர்த்தனை வகை', expense: 'செலவு', income: 'வருமானம்',
  amountLabel: 'தொகை ({cur})', category: 'பிரிவு', selectCat: 'ஒரு பிரிவைத் தேர்ந்தெடுக்கவும்', date: 'தேதி',
  description: 'விளக்கம்', descPh: 'இது எதற்காக?', cancel: 'ரத்து செய்',
  adding: 'சேர்க்கப்படுகிறது…', updating: 'புதுப்பிக்கப்படுகிறது…', update: 'புதுப்பி', addExpense: 'செலவைச் சேர்', addIncome: 'வருமானத்தைச் சேர்',
  categories: {
    'Food & Dining': 'உணவு & உணவகம்', Shopping: 'ஷாப்பிங்', Entertainment: 'பொழுதுபோக்கு', Transport: 'போக்குவரத்து',
    'Bills & Utilities': 'பில்கள் & பயன்பாடுகள்', Healthcare: 'சுகாதாரம்', Education: 'கல்வி', Travel: 'பயணம்', Other: 'மற்றவை',
    Salary: 'சம்பளம்', Freelance: 'சுயதொழில்', Business: 'வணிகம்', Investment: 'முதலீடு', Gift: 'பரிசு',
  },
};

export const TX_FORM_T: Record<AdminLang, TxFormText> = { en, si, ta };
