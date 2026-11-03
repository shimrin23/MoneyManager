// Text for the Financial Health page, in English, Sinhala and Tamil.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface FinancialHealthText {
  loading: string; unavailableTitle: string; loadFailedDefault: string; retrying: string; retry: string;
  noScore: string; refreshing: string; loadErrorSuffix: string;
  scoreTitle: string; basedOn: string; scoreLabel: string; riskLabel: string;
  metricsTitle: string; savingsRate: string; debtRatio: string; liquidityRatio: string; creditUtil: string;
  emergencyFund: string; emergencyTitle: string; netWorth: string; discretionaryRatio: string;
  recsTitle: string; recsSub: string;
  peerTitle: string; peerSubCompared: string; peerSubNotEnough: string; peerSubNone: string;
  pillBetter: string; pillBelow: string; pillAverage: string;
  standingAbove: string; standingBelow: string; standingOn: string;
  higherBetter: string; lowerBetter: string; peerAvg: string; betterThan: string; topHalf: string; growthArea: string;
  yourValue: string; peerAverage: string; standing: string; monthsSuffix: string;
  keyFinding: string; keyAllAbove: string; keyAllBelow: string; keyMixed: string;
  catScore: string; catSavings: string; catDti: string; catLiquidity: string; catCredit: string;
  catEmergency: string; catNetWorth: string; catDiscretionary: string;
}

const en: FinancialHealthText = {
  loading: 'Analyzing your financial health...', unavailableTitle: 'Financial health is unavailable',
  loadFailedDefault: 'Could not load your financial health right now.', retrying: 'Retrying...', retry: 'Retry',
  noScore: 'No score yet', refreshing: 'Refreshing live health data...', loadErrorSuffix: ' Showing your last loaded numbers.',
  scoreTitle: 'Your Financial Health Score', basedOn: 'Based on the last 30 days', scoreLabel: 'Score', riskLabel: 'Risk:',
  metricsTitle: 'Key Financial Metrics', savingsRate: 'Savings Rate', debtRatio: 'Debt Ratio', liquidityRatio: 'Liquidity Ratio',
  creditUtil: 'Credit Util.', emergencyFund: 'Emergency Fund',
  emergencyTitle: 'Saved in emergency goals: {amount}, divided by the last 30 days of expenses',
  netWorth: 'Net Worth', discretionaryRatio: 'Discretionary Ratio',
  recsTitle: 'Personalized Recommendations', recsSub: 'Actionable steps to improve your score',
  peerTitle: 'How You Compare to Peers',
  peerSubCompared: 'Compared with {n} other MoneyManager users who have a score',
  peerSubNotEnough: 'The comparison appears once at least {min} other users have a score ({n} so far).',
  peerSubNone: 'Get your own score first to compare with other users.',
  pillBetter: 'Better than avg', pillBelow: 'Below avg', pillAverage: 'Average',
  standingAbove: 'Above peer average', standingBelow: 'Below peer average', standingOn: 'On par with peers',
  higherBetter: 'Higher is better', lowerBetter: 'Lower is better', peerAvg: 'Peer Avg: {value}',
  betterThan: 'Better than {n}% of users', topHalf: 'Top half', growthArea: 'Growth area',
  yourValue: 'Your Value:', peerAverage: 'Peer Average:', standing: 'Standing:', monthsSuffix: 'months',
  keyFinding: 'Key Finding',
  keyAllAbove: 'You are at or above the average of other users on every measure. Keep it up.',
  keyAllBelow: 'You are behind the average on every measure. Start with {first}.',
  keyMixed: 'You are ahead of other users on {better}. Focus next on {worse}.',
  catScore: 'Financial Health Score', catSavings: 'Savings Rate', catDti: 'Debt-to-Income Ratio', catLiquidity: 'Liquidity Ratio',
  catCredit: 'Credit Utilization', catEmergency: 'Emergency Fund Health', catNetWorth: 'Net Worth', catDiscretionary: 'Discretionary Ratio',
};

const si: FinancialHealthText = {
  loading: 'ඔබේ මූල්‍ය සෞඛ්‍යය විශ්ලේෂණය කෙරෙමින්...', unavailableTitle: 'මූල්‍ය සෞඛ්‍යය ලබා ගත නොහැක',
  loadFailedDefault: 'දැන් ඔබේ මූල්‍ය සෞඛ්‍යය පූරණය කළ නොහැක.', retrying: 'නැවත උත්සාහ කෙරෙමින්...', retry: 'නැවත උත්සාහ කරන්න',
  noScore: 'තවම ලකුණු නැත', refreshing: 'සජීවී සෞඛ්‍ය දත්ත නැවුම් කෙරෙමින්...', loadErrorSuffix: ' ඔබේ අවසානයට පූරණය කළ සංඛ්‍යා පෙන්වමින්.',
  scoreTitle: 'ඔබේ මූල්‍ය සෞඛ්‍ය ලකුණු', basedOn: 'පසුගිය දින 30 මත පදනම්ව', scoreLabel: 'ලකුණු', riskLabel: 'අවදානම:',
  metricsTitle: 'ප්‍රධාන මූල්‍ය මිනුම්', savingsRate: 'ඉතිරි කිරීමේ අනුපාතය', debtRatio: 'ණය අනුපාතය', liquidityRatio: 'ද්‍රවශීලතා අනුපාතය',
  creditUtil: 'ණය භාවිතය', emergencyFund: 'හදිසි අරමුදල',
  emergencyTitle: 'හදිසි ඉලක්කවල ඉතිරි: {amount}, පසුගිය දින 30 ක වියදම් වලින් බෙදා ඇත',
  netWorth: 'ශුද්ධ වත්කම්', discretionaryRatio: 'අභිමත වියදම් අනුපාතය',
  recsTitle: 'පුද්ගලික නිර්දේශ', recsSub: 'ඔබේ ලකුණු වැඩි දියුණු කිරීමට ක්‍රියාත්මක කළ හැකි පියවර',
  peerTitle: 'අනෙකුත් අය හා ඔබ සංසන්දනය',
  peerSubCompared: 'ලකුණු ඇති තවත් MoneyManager පරිශීලකයන් {n} දෙනෙකු සමඟ සංසන්දනය කර ඇත',
  peerSubNotEnough: 'ලකුණු ඇති තවත් පරිශීලකයන් අවම වශයෙන් {min} දෙනෙකු ලැබුණු පසු සංසන්දනය දිස් වේ ({n} තවමත්).',
  peerSubNone: 'අන් අය සමඟ සංසන්දනය කිරීමට පළමුව ඔබේම ලකුණු ලබා ගන්න.',
  pillBetter: 'සාමාන්‍යට වඩා හොඳයි', pillBelow: 'සාමාන්‍යට වඩා අඩුයි', pillAverage: 'සාමාන්‍ය',
  standingAbove: 'සහකරු සාමාන්‍යයට වඩා ඉහළයි', standingBelow: 'සහකරු සාමාන්‍යයට වඩා පහළයි', standingOn: 'සහකරුවන්ට සමානයි',
  higherBetter: 'ඉහළ වීම හොඳයි', lowerBetter: 'පහළ වීම හොඳයි', peerAvg: 'සහකර සාමාන්‍යය: {value}', betterThan: 'පරිශීලකයන්ගෙන් {n}% ට වඩා හොඳයි',
  topHalf: 'ඉහළ අර්ධය', growthArea: 'වර්ධන ක්ෂේත්‍රය',
  yourValue: 'ඔබේ අගය:', peerAverage: 'සහකර සාමාන්‍යය:', standing: 'තත්ත්වය:', monthsSuffix: 'මාස',
  keyFinding: 'ප්‍රධාන නිගමනය',
  keyAllAbove: 'සෑම මිනුමකදීම ඔබ අන් පරිශීලකයන්ගේ සාමාන්‍යයට සමාන හෝ ඊට වැඩියෙන් සිටී. මෙසේම ඉදිරියට යන්න.',
  keyAllBelow: 'සෑම මිනුමකදීම ඔබ සාමාන්‍යට පිටුපසින් සිටී. {first} සමඟ ආරම්භ කරන්න.',
  keyMixed: 'ඔබ {better} හිදී අන් පරිශීලකයන්ට වඩා ඉදිරියෙන් සිටී. ඊළඟට {worse} කෙරෙහි අවධානය යොමු කරන්න.',
  catScore: 'මූල්‍ය සෞඛ්‍ය ලකුණු', catSavings: 'ඉතිරි කිරීමේ අනුපාතය', catDti: 'ආදායම-ණය අනුපාතය', catLiquidity: 'ද්‍රවශීලතා අනුපාතය',
  catCredit: 'ණය භාවිත අනුපාතය', catEmergency: 'හදිසි අරමුදල් සෞඛ්‍යය', catNetWorth: 'ශුද්ධ වත්කම්', catDiscretionary: 'අභිමත වියදම් අනුපාතය',
};

const ta: FinancialHealthText = {
  loading: 'உங்கள் நிதி ஆரோக்கியம் பகுப்பாய்வு செய்யப்படுகிறது...', unavailableTitle: 'நிதி ஆரோக்கியம் கிடைக்கவில்லை',
  loadFailedDefault: 'இப்போது உங்கள் நிதி ஆரோக்கியத்தை ஏற்ற முடியவில்லை.', retrying: 'மீண்டும் முயற்சிக்கப்படுகிறது...', retry: 'மீண்டும் முயற்சி',
  noScore: 'மதிப்பெண் இன்னும் இல்லை', refreshing: 'நேரடி ஆரோக்கியத் தரவு புதுப்பிக்கப்படுகிறது...', loadErrorSuffix: ' கடைசியாக ஏற்றிய எண்களைக் காட்டுகிறது.',
  scoreTitle: 'உங்கள் நிதி ஆரோக்கிய மதிப்பெண்', basedOn: 'கடந்த 30 நாட்களின் அடிப்படையில்', scoreLabel: 'மதிப்பெண்', riskLabel: 'ஆபத்து:',
  metricsTitle: 'முக்கிய நிதி அளவீடுகள்', savingsRate: 'சேமிப்பு விகிதம்', debtRatio: 'கடன் விகிதம்', liquidityRatio: 'பணப்புழக்க விகிதம்',
  creditUtil: 'கடன் பயன்பாடு', emergencyFund: 'அவசர நிதி',
  emergencyTitle: 'அவசர இலக்குகளில் சேமிப்பு: {amount}, கடந்த 30 நாள் செலவுகளால் வகுக்கப்பட்டது',
  netWorth: 'நிகர மதிப்பு', discretionaryRatio: 'விருப்பச் செலவு விகிதம்',
  recsTitle: 'தனிப்பயன் பரிந்துரைகள்', recsSub: 'உங்கள் மதிப்பெண்ணை மேம்படுத்த செயல்படுத்தக்கூடிய படிகள்',
  peerTitle: 'மற்றவர்களுடன் ஒப்பீடு',
  peerSubCompared: 'மதிப்பெண் உள்ள {n} பிற MoneyManager பயனர்களுடன் ஒப்பிடப்பட்டது',
  peerSubNotEnough: 'மதிப்பெண் உள்ள குறைந்தது {min} பிற பயனர்கள் இருந்தால் ஒப்பீடு தோன்றும் ({n} இதுவரை).',
  peerSubNone: 'மற்ற பயனர்களுடன் ஒப்பிட முதலில் உங்கள் மதிப்பெண்ணைப் பெறுங்கள்.',
  pillBetter: 'சராசரியை விட நல்லது', pillBelow: 'சராசரிக்குக் கீழ்', pillAverage: 'சராசரி',
  standingAbove: 'சக பயனர் சராசரியை விட மேல்', standingBelow: 'சக பயனர் சராசரிக்குக் கீழ்', standingOn: 'சக பயனர்களுக்கு இணை',
  higherBetter: 'அதிகமாக இருப்பது நல்லது', lowerBetter: 'குறைவாக இருப்பது நல்லது', peerAvg: 'சக பயனர் சராசரி: {value}', betterThan: 'பயனர்களில் {n}% பேரை விட சிறந்தது',
  topHalf: 'மேல் பாதி', growthArea: 'வளர்ச்சிப் பகுதி',
  yourValue: 'உங்கள் மதிப்பு:', peerAverage: 'சக பயனர் சராசரி:', standing: 'நிலை:', monthsSuffix: 'மாதங்கள்',
  keyFinding: 'முக்கிய கண்டறிதல்',
  keyAllAbove: 'ஒவ்வொரு அளவீட்டிலும் நீங்கள் பிற பயனர்களின் சராசரிக்கு சமமாக அல்லது மேலாக இருக்கிறீர்கள். இதே நிலையைத் தொடருங்கள்.',
  keyAllBelow: 'ஒவ்வொரு அளவீட்டிலும் நீங்கள் சராசரிக்குப் பின்தங்கியுள்ளீர்கள். {first} இலிருந்து தொடங்குங்கள்.',
  keyMixed: '{better} இல் நீங்கள் பிற பயனர்களை விட முன்னிலையில் இருக்கிறீர்கள். அடுத்து {worse} மீது கவனம் செலுத்துங்கள்.',
  catScore: 'நிதி ஆரோக்கிய மதிப்பெண்', catSavings: 'சேமிப்பு விகிதம்', catDti: 'வருமான-கடன் விகிதம்', catLiquidity: 'பணப்புழக்க விகிதம்',
  catCredit: 'கடன் பயன்பாட்டு விகிதம்', catEmergency: 'அவசர நிதி ஆரோக்கியம்', catNetWorth: 'நிகர மதிப்பு', catDiscretionary: 'விருப்பச் செலவு விகிதம்',
};

export const FH_T: Record<AdminLang, FinancialHealthText> = { en, si, ta };
