// Text for the Goals page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface GoalsText {
  loading: string; yourGoals: string;
  goalsTracked: string; goalTracked: string; addNewGoal: string;
  createTitle: string; goalTitle: string; titlePlaceholder: string;
  targetAmount: string; targetPlaceholder: string;
  currentSavings: string; targetDeadline: string; selectDate: string;
  cancel: string; createGoal: string; saveChanges: string;
  editTitle: string; close: string; edit: string; addContribution: string;
  delete: string; category: string; priority: string; status: string; description: string;
  descriptionPlaceholder: string;
  catPersonal: string; catTravel: string; catEducation: string; catEmergency: string;
  catHome: string; catInvestment: string; catVehicle: string; catRetirement: string;
  prioHigh: string; prioMedium: string; prioLow: string; prioLabel: string;
  stInProgress: string; stPaused: string; stCompleted: string;
  monthlyRequired: string; daysLeft: string; overdue: string;
  noGoals: string; noGoalsSub: string; createFirstGoal: string;
  aiInsights: string; monthlySavingsRequired: string;
  aiReached: string; aiOnTrack: string; aiBehind: string; aiHighRisk: string;
  created: string; updated: string; deleted: string; reached: string; progressAdded: string;
  createFailed: string; updateFailed: string; deleteFailed: string; progressFailed: string;
  deleteTitle: string; deleteMessage: string; confirmDelete: string;
  contributionTitle: string; contributionMessage: string; amountLabel: string; addBtn: string;
  amountInvalid: string;
}

const en: GoalsText = {
  loading: 'Loading your goals...', yourGoals: 'Your goals',
  goalsTracked: 'goals tracked', goalTracked: 'goal tracked', addNewGoal: '+ Add New Goal',
  createTitle: 'Create New Financial Goal', goalTitle: 'Goal Title', titlePlaceholder: 'e.g., Buy a House',
  targetAmount: 'Target Amount ({cur})', targetPlaceholder: '500000',
  currentSavings: 'Current Savings ({cur})', targetDeadline: 'Target Deadline', selectDate: 'Select target date',
  cancel: 'Cancel', createGoal: 'Create Goal', saveChanges: 'Save Changes',
  editTitle: 'Edit Goal Details', close: 'Close', edit: 'Edit', addContribution: 'Add Contribution',
  delete: 'Delete', category: 'Category', priority: 'Priority', status: 'Status', description: 'Description',
  descriptionPlaceholder: 'Why is this goal important to you?',
  catPersonal: 'Personal', catTravel: 'Travel', catEducation: 'Education', catEmergency: 'Emergency',
  catHome: 'Home', catInvestment: 'Investment', catVehicle: 'Vehicle', catRetirement: 'Retirement',
  prioHigh: 'High', prioMedium: 'Medium', prioLow: 'Low', prioLabel: 'Priority:',
  stInProgress: 'In Progress', stPaused: 'Paused', stCompleted: 'Completed',
  monthlyRequired: 'Monthly Required:', daysLeft: '{n} days left', overdue: 'Overdue',
  noGoals: 'No Goals Yet', noGoalsSub: 'Start by creating your first financial goal to track your progress!',
  createFirstGoal: 'Create Your First Goal',
  aiInsights: 'AI Insights', monthlySavingsRequired: 'Monthly Savings Required:',
  aiReached: 'Goal reached! You saved {amount}.',
  aiOnTrack: "You're on track! Continue saving {amount} monthly.",
  aiBehind: "You're slightly behind. Increase monthly savings to {amount} to stay on track.",
  aiHighRisk: 'High risk! Try to save {amount} monthly to catch up.',
  created: 'Goal "{title}" created.', updated: 'Goal updated successfully.', deleted: 'Goal deleted.',
  reached: 'Goal "{title}" reached. Well done!', progressAdded: '{amount} added to "{title}".',
  createFailed: 'Failed to create goal. Please try again.', updateFailed: 'Failed to update goal. Please try again.',
  deleteFailed: 'Failed to delete goal. Please try again.', progressFailed: 'Failed to add progress. Please try again.',
  deleteTitle: 'Delete goal?', deleteMessage: 'This goal and its saved progress will be removed. This cannot be undone.',
  confirmDelete: 'Delete',
  contributionTitle: 'Add contribution',
  contributionMessage: '{title}: {current} of {target} saved. Monthly needed: {monthly}.',
  amountLabel: 'Amount ({cur})', addBtn: 'Add',
  amountInvalid: 'Please enter an amount greater than 0.',
};

const si: GoalsText = {
  loading: 'ඔබේ ඉලක්ක පූරණය වෙමින්...', yourGoals: 'ඔබේ ඉලක්ක',
  goalsTracked: 'ඉලක්ක නිරීක්ෂණය වෙමින්', goalTracked: 'ඉලක්කයක් නිරීක්ෂණය වෙමින්', addNewGoal: '+ නව ඉලක්කයක් එකතු කරන්න',
  createTitle: 'නව මූල්‍ය ඉලක්කයක් සාදන්න', goalTitle: 'ඉලක්කයේ නම', titlePlaceholder: 'උදා: නිවසක් ගැනීම',
  targetAmount: 'ඉලක්ක මුදල ({cur})', targetPlaceholder: '500000',
  currentSavings: 'වර්තමාන ඉතිරිය ({cur})', targetDeadline: 'ඉලක්ක දිනය', selectDate: 'ඉලක්ක දිනය තෝරන්න',
  cancel: 'අවලංගු කරන්න', createGoal: 'ඉලක්කය සාදන්න', saveChanges: 'වෙනස්කම් සුරකින්න',
  editTitle: 'ඉලක්ක විස්තර සංස්කරණය', close: 'වසන්න', edit: 'සංස්කරණය', addContribution: 'දායකත්වය එකතු කරන්න',
  delete: 'මකන්න', category: 'කාණ්ඩය', priority: 'ප්‍රමුඛතාව', status: 'තත්ත්වය', description: 'විස්තරය',
  descriptionPlaceholder: 'මෙම ඉලක්කය ඔබට වැදගත් වන්නේ ඇයි?',
  catPersonal: 'පෞද්ගලික', catTravel: 'සංචාරය', catEducation: 'අධ්‍යාපනය', catEmergency: 'හදිසි අවස්ථාව',
  catHome: 'නිවස', catInvestment: 'ආයෝජනය', catVehicle: 'වාහනය', catRetirement: 'විශ්‍රාම ගැනීම',
  prioHigh: 'ඉහළ', prioMedium: 'මධ්‍යම', prioLow: 'පහළ', prioLabel: 'ප්‍රමුඛතාව:',
  stInProgress: 'ප්‍රගතියේ', stPaused: 'විරාම ගන්වා ඇත', stCompleted: 'සම්පූර්ණයි',
  monthlyRequired: 'මාසිකව අවශ්‍ය:', daysLeft: 'දින {n} ඉතිරියි', overdue: 'කල්ඉකුත්',
  noGoals: 'තවම ඉලක්ක නැත', noGoalsSub: 'ඔබේ ප්‍රගතිය නිරීක්ෂණය කිරීමට ඔබේ පළමු මූල්‍ය ඉලක්කය සාදා ආරම්භ කරන්න!',
  createFirstGoal: 'ඔබේ පළමු ඉලක්කය සාදන්න',
  aiInsights: 'AI අවබෝධයන්', monthlySavingsRequired: 'අවශ්‍ය මාසික ඉතිරිය:',
  aiReached: 'ඉලක්කයට ළඟා වුණා! ඔබ {amount} ඉතිරි කළා.',
  aiOnTrack: 'ඔබ නිවැරදි මාර්ගයේයි! මාසිකව {amount} ඉතිරි කිරීම දිගටම කරන්න.',
  aiBehind: 'ඔබ මදක් පසුපසයි. නිවැරදි මාර්ගයේ රැඳී සිටීමට මාසික ඉතිරිය {amount} දක්වා වැඩි කරන්න.',
  aiHighRisk: 'ඉහළ අවදානමකි! ඉක්මන් වීමට මාසිකව {amount} ඉතිරි කිරීමට උත්සාහ කරන්න.',
  created: 'ඉලක්කය "{title}" සාදන ලදී.', updated: 'ඉලක්කය සාර්ථකව යාවත්කාලීන කරන ලදී.', deleted: 'ඉලක්කය මකා දමන ලදී.',
  reached: 'ඉලක්කය "{title}" වෙත ළඟා වුණා. සුබ පැතුම්!', progressAdded: '{amount} "{title}" වෙත එකතු කරන ලදී.',
  createFailed: 'ඉලක්කය සෑදීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', updateFailed: 'ඉලක්කය යාවත්කාලීන කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  deleteFailed: 'ඉලක්කය මැකීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.', progressFailed: 'ප්‍රගතිය එකතු කිරීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  deleteTitle: 'ඉලක්කය මකන්නද?', deleteMessage: 'මෙම ඉලක්කය සහ එහි සුරකින ලද ප්‍රගතිය ඉවත් කෙරේ. මෙය අහෝසි කළ නොහැක.',
  confirmDelete: 'මකන්න',
  contributionTitle: 'දායකත්වය එකතු කරන්න',
  contributionMessage: '{title}: {target} න් {current} සුරකින ලදී. අවශ්‍ය මාසික මුදල: {monthly}.',
  amountLabel: 'මුදල ({cur})', addBtn: 'එකතු කරන්න',
  amountInvalid: 'කරුණාකර 0 ට වැඩි මුදලක් ඇතුළත් කරන්න.',
};

const ta: GoalsText = {
  loading: 'உங்கள் இலக்குகள் ஏற்றப்படுகின்றன...', yourGoals: 'உங்கள் இலக்குகள்',
  goalsTracked: 'இலக்குகள் கண்காணிக்கப்படுகின்றன', goalTracked: 'இலக்கு கண்காணிக்கப்படுகிறது', addNewGoal: '+ புதிய இலக்கைச் சேர்க்கவும்',
  createTitle: 'புதிய நிதி இலக்கை உருவாக்கவும்', goalTitle: 'இலக்கின் பெயர்', titlePlaceholder: 'எ.கா., வீடு வாங்குதல்',
  targetAmount: 'இலக்குத் தொகை ({cur})', targetPlaceholder: '500000',
  currentSavings: 'தற்போதைய சேமிப்பு ({cur})', targetDeadline: 'இலக்கு நாள்', selectDate: 'இலக்கு நாளைத் தேர்ந்தெடுக்கவும்',
  cancel: 'ரத்து செய்', createGoal: 'இலக்கை உருவாக்கு', saveChanges: 'மாற்றங்களைச் சேமி',
  editTitle: 'இலக்கு விவரங்களைத் திருத்து', close: 'மூடு', edit: 'திருத்து', addContribution: 'பங்களிப்பைச் சேர்க்கவும்',
  delete: 'நீக்கு', category: 'பிரிவு', priority: 'முன்னுரிமை', status: 'நிலை', description: 'விளக்கம்',
  descriptionPlaceholder: 'இந்த இலக்கு ஏன் உங்களுக்கு முக்கியம்?',
  catPersonal: 'தனிப்பட்ட', catTravel: 'பயணம்', catEducation: 'கல்வி', catEmergency: 'அவசரம்',
  catHome: 'வீடு', catInvestment: 'முதலீடு', catVehicle: 'வாகனம்', catRetirement: 'ஓய்வூதியம்',
  prioHigh: 'அதிகம்', prioMedium: 'நடுத்தரம்', prioLow: 'குறைவு', prioLabel: 'முன்னுரிமை:',
  stInProgress: 'நடைபெறுகிறது', stPaused: 'இடைநிறுத்தப்பட்டது', stCompleted: 'முடிந்தது',
  monthlyRequired: 'மாதாந்திரத் தேவை:', daysLeft: '{n} நாட்கள் மீதம்', overdue: 'காலாவதியானது',
  noGoals: 'இன்னும் இலக்குகள் இல்லை', noGoalsSub: 'உங்கள் முன்னேற்றத்தைக் கண்காணிக்க உங்கள் முதல் நிதி இலக்கை உருவாக்கித் தொடங்குங்கள்!',
  createFirstGoal: 'உங்கள் முதல் இலக்கை உருவாக்கவும்',
  aiInsights: 'AI நுண்ணறிவுகள்', monthlySavingsRequired: 'தேவையான மாதச் சேமிப்பு:',
  aiReached: 'இலக்கை அடைந்துவிட்டீர்கள்! நீங்கள் {amount} சேமித்துள்ளீர்கள்.',
  aiOnTrack: 'நீங்கள் சரியான பாதையில் உள்ளீர்கள்! மாதந்தோறும் {amount} சேமிப்பைத் தொடருங்கள்.',
  aiBehind: 'நீங்கள் சற்று பின்தங்கியுள்ளீர்கள். சரியான பாதையில் இருக்க மாதச் சேமிப்பை {amount} ஆக உயர்த்துங்கள்.',
  aiHighRisk: 'அதிக ஆபத்து! பின்தங்கியதை ஈடுசெய்ய மாதந்தோறும் {amount} சேமிக்க முயலுங்கள்.',
  created: 'இலக்கு "{title}" உருவாக்கப்பட்டது.', updated: 'இலக்கு வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது.', deleted: 'இலக்கு நீக்கப்பட்டது.',
  reached: 'இலக்கு "{title}" அடையப்பட்டது. வாழ்த்துகள்!', progressAdded: '"{title}" இலக்கில் {amount} சேர்க்கப்பட்டது.',
  createFailed: 'இலக்கை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', updateFailed: 'இலக்கைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  deleteFailed: 'இலக்கை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', progressFailed: 'முன்னேற்றத்தைச் சேர்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  deleteTitle: 'இலக்கை நீக்கவா?', deleteMessage: 'இந்த இலக்கும் அதன் சேமித்த முன்னேற்றமும் நீக்கப்படும். இதை மாற்ற முடியாது.',
  confirmDelete: 'நீக்கு',
  contributionTitle: 'பங்களிப்பைச் சேர்க்கவும்',
  contributionMessage: '{title}: {target} இல் {current} சேமிக்கப்பட்டது. தேவையான மாதத் தொகை: {monthly}.',
  amountLabel: 'தொகை ({cur})', addBtn: 'சேர்',
  amountInvalid: '0-ஐ விட அதிகமான தொகையை உள்ளிடவும்.',
};

export const GOALS_T: Record<AdminLang, GoalsText> = { en, si, ta };
