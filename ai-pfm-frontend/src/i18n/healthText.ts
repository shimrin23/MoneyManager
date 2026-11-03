// Financial health labels and descriptions, in English, Sinhala and Tamil.
import { type AdminLang } from './adminText';

export interface HealthText {
  excellent: string; good: string; needsWork: string; critical: string;
  low: string; medium: string; high: string; veryHigh: string;
  descExcellent: string; descGood: string; descNeedsWork: string; descCritical: string;
  noScoreIncome: string; noScoreDefault: string;
}

const en: HealthText = {
  excellent: 'Excellent', good: 'Good', needsWork: 'Needs Work', critical: 'Critical',
  low: 'Low', medium: 'Medium', high: 'High', veryHigh: 'Very High',
  descExcellent: 'Great financial habits. Keep it up.',
  descGood: 'A healthy profile with room to grow.',
  descNeedsWork: 'A few areas need attention.',
  descCritical: 'Immediate attention needed.',
  noScoreIncome: 'Add your income for the last 30 days (or your monthly income in Profile) to get a score.',
  noScoreDefault: 'Add your income and expenses for the last 30 days to get your financial health score.',
};

const si: HealthText = {
  excellent: 'විශිෂ්ට', good: 'හොඳ', needsWork: 'වැඩි දියුණු කළ යුතුයි', critical: 'අතිශය බරපතල',
  low: 'අඩු', medium: 'මධ්‍යම', high: 'ඉහළ', veryHigh: 'ඉතා ඉහළ',
  descExcellent: 'විශිෂ්ට මූල්‍ය පුරුදු. මෙසේම ඉදිරියට යන්න.',
  descGood: 'වර්ධනය සඳහා ඉඩ ඇති සෞඛ්‍ය සම්පන්න පැතිකඩකි.',
  descNeedsWork: 'කරුණු කිහිපයක් අවධානය අවශ්‍යයි.',
  descCritical: 'වහාම අවධානය අවශ්‍යයි.',
  noScoreIncome: 'ලකුණු ලබා ගැනීමට පසුගිය දින 30 සඳහා ඔබේ ආදායම එකතු කරන්න (හෝ පැතිකඩෙහි ඔබේ මාසික ආදායම).',
  noScoreDefault: 'ඔබේ මූල්‍ය සෞඛ්‍ය ලකුණු ලබා ගැනීමට පසුගිය දින 30 සඳහා ඔබේ ආදායම සහ වියදම් එකතු කරන්න.',
};

const ta: HealthText = {
  excellent: 'சிறந்தது', good: 'நல்லது', needsWork: 'மேம்பாடு தேவை', critical: 'மிக அபாயகரமானது',
  low: 'குறைவு', medium: 'நடுத்தரம்', high: 'அதிகம்', veryHigh: 'மிக அதிகம்',
  descExcellent: 'சிறந்த நிதிப் பழக்கங்கள். இதே நிலையைத் தொடருங்கள்.',
  descGood: 'வளர்ச்சிக்கு இடமுள்ள ஆரோக்கியமான நிலை.',
  descNeedsWork: 'சில பகுதிகளுக்கு கவனம் தேவை.',
  descCritical: 'உடனடி கவனம் தேவை.',
  noScoreIncome: 'மதிப்பெண் பெற கடந்த 30 நாட்களுக்கான உங்கள் வருமானத்தைச் சேர்க்கவும் (அல்லது சுயவிவரத்தில் மாதாந்திர வருமானம்).',
  noScoreDefault: 'உங்கள் நிதி ஆரோக்கிய மதிப்பெண் பெற கடந்த 30 நாட்களுக்கான உங்கள் வருமானம் மற்றும் செலவுகளைச் சேர்க்கவும்.',
};

export const HEALTH_T: Record<AdminLang, HealthText> = { en, si, ta };
