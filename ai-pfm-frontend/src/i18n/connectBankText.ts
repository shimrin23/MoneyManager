// Text for the Connect Bank page, in English, Sinhala and Tamil.
// Bank names and app names (ComBank, HNB, FriMi, ...) stay in English.
// Placeholders in {braces} are filled in by the component.
import { type AdminLang } from './adminText';

export interface ConnectBankText {
  title: string; step1: string; step2: string; guide: Record<string, string>;
  dropActive: string; dropDefault: string; dropHint: string;
  processing: string; importBtn: string;
  successTitle: string; parsed: string; added: string; skippedDup: string; invalidRows: string; refreshed: string;
  skippedTitle: string; rowLabel: string;
  errNotCsv: string; errEmpty: string; errTooLarge: string; errHeaderOnly: string; errRead: string;
  errNoFile: string; errTooLargeImport: string; errImportDefault: string;
}

const en: ConnectBankText = {
  title: 'Connect Sri Lankan Bank', step1: 'Select Your Bank', step2: 'Upload Statement for {bank}',
  guide: {
    combank: 'Log in to ComBank Online -> Accounts -> Statement -> Download as CSV/Excel.',
    hnb: 'Log in to HNB Digital Banking -> Select Account -> Export Transactions (.csv).',
    sampath: 'Log in to Sampath Vishwa -> Accounts -> History -> Export Statement.',
    boc: 'Log in to BOC Internet Banking -> Statements -> Download CSV.',
    peoples: "Log in to People's Wave / Net -> Account Details -> Export Statement.",
    frimi: 'Open FriMi app -> Profile / History -> Request & export CSV Statement.',
  },
  dropActive: 'Drop the CSV file here', dropDefault: 'Click to upload or drag & drop CSV',
  dropHint: 'Supports Commercial Bank, HNB, Sampath, BOC, FriMi & generic CSV statements (up to 5 MB)',
  processing: 'Processing Statement…', importBtn: 'Import Statement',
  successTitle: '✓ Statement Imported Successfully!', parsed: 'Parsed transactions:', added: 'Added to your account:',
  skippedDup: 'Skipped duplicate records:', invalidRows: "Rows that couldn't be read:",
  refreshed: 'Your Dashboard, Transactions, and Spending Trends have now been refreshed with this data.',
  skippedTitle: 'These rows were not imported:', rowLabel: 'Row {n}: {reason}',
  errNotCsv: 'Please upload a valid .csv bank statement file.',
  errEmpty: 'This file is empty. Export the statement again from your bank and try once more.',
  errTooLarge: 'This file is larger than 5 MB. Export a shorter date range (for example one month) and import it in parts.',
  errHeaderOnly: 'This file only has a header row and no transactions.',
  errRead: 'Could not read this file. Please try again.',
  errNoFile: 'Please select a bank statement CSV file first.',
  errTooLargeImport: 'This statement is too large to import at once. Export a shorter date range and import it in parts.',
  errImportDefault: 'Could not process bank statement. Please verify the CSV format.',
};

const si: ConnectBankText = {
  title: 'ශ්‍රී ලාංකික බැංකුවක් සම්බන්ධ කරන්න', step1: 'ඔබේ බැංකුව තෝරන්න', step2: '{bank} සඳහා ප්‍රකාශය උඩුගත කරන්න',
  guide: {
    combank: 'ComBank Online වෙත ලොග් වන්න -> ගිණුම් -> ප්‍රකාශය -> CSV/Excel ලෙස බාගන්න.',
    hnb: 'HNB Digital Banking වෙත ලොග් වන්න -> ගිණුම තෝරන්න -> ගනුදෙනු අපනයනය කරන්න (.csv).',
    sampath: 'Sampath Vishwa වෙත ලොග් වන්න -> ගිණුම් -> ඉතිහාසය -> ප්‍රකාශය අපනයනය කරන්න.',
    boc: 'BOC Internet Banking වෙත ලොග් වන්න -> ප්‍රකාශ -> CSV බාගන්න.',
    peoples: "People's Wave / Net වෙත ලොග් වන්න -> ගිණුම් විස්තර -> ප්‍රකාශය අපනයනය කරන්න.",
    frimi: 'FriMi යෙදුම විවෘත කරන්න -> පැතිකඩ / ඉතිහාසය -> CSV ප්‍රකාශය ඉල්ලා අපනයනය කරන්න.',
  },
  dropActive: 'CSV ගොනුව මෙහි දමන්න', dropDefault: 'CSV උඩුගත කිරීමට ක්ලික් කරන්න හෝ ඇද දමන්න',
  dropHint: 'Commercial Bank, HNB, Sampath, BOC, FriMi සහ සාමාන්‍ය CSV ප්‍රකාශ (MB 5 දක්වා) සහාය දක්වයි',
  processing: 'ප්‍රකාශය සකසමින්…', importBtn: 'ප්‍රකාශය ආයාත කරන්න',
  successTitle: '✓ ප්‍රකාශය සාර්ථකව ආයාත කෙරින!', parsed: 'විශ්ලේෂණය කළ ගනුදෙනු:', added: 'ඔබේ ගිණුමට එකතු කළ:',
  skippedDup: 'අනුපිටපත් වාර්තා මඟ හැරිණි:', invalidRows: 'කියවිය නොහැකි පේළි:',
  refreshed: 'ඔබේ උපකරණ පුවරුව, ගනුදෙනු සහ වියදම් ප්‍රවණතා දැන් මෙම දත්ත සමඟ නැවුම් කර ඇත.',
  skippedTitle: 'මෙම පේළි ආයාත නොකෙරිණි:', rowLabel: 'පේළිය {n}: {reason}',
  errNotCsv: 'කරුණාකර වලංගු .csv බැංකු ප්‍රකාශ ගොනුවක් උඩුගත කරන්න.',
  errEmpty: 'මෙම ගොනුව හිස්ය. ඔබේ බැංකුවෙන් ප්‍රකාශය නැවත අපනයනය කර තවත් වරක් උත්සාහ කරන්න.',
  errTooLarge: 'මෙම ගොනුව MB 5 ට වඩා විශාලය. කෙටි දින පරාසයක් (උදා: එක් මාසයක්) අපනයනය කර කොටස් වශයෙන් ආයාත කරන්න.',
  errHeaderOnly: 'මෙම ගොනුවේ ශීර්ෂ පේළිය පමණක් ඇත, ගනුදෙනු නැත.',
  errRead: 'මෙම ගොනුව කියවිය නොහැක. නැවත උත්සාහ කරන්න.',
  errNoFile: 'කරුණාකර පළමුව බැංකු ප්‍රකාශ CSV ගොනුවක් තෝරන්න.',
  errTooLargeImport: 'මෙම ප්‍රකාශය එකවර ආයාත කිරීමට විශාලය. කෙටි දින පරාසයක් අපනයනය කර කොටස් වශයෙන් ආයාත කරන්න.',
  errImportDefault: 'බැංකු ප්‍රකාශය සැකසීම අසාර්ථකයි. CSV ආකෘතිය පරීක්ෂා කරන්න.',
};

const ta: ConnectBankText = {
  title: 'இலங்கை வங்கியை இணைக்கவும்', step1: 'உங்கள் வங்கியைத் தேர்ந்தெடுக்கவும்', step2: '{bank} க்கான அறிக்கையைப் பதிவேற்றவும்',
  guide: {
    combank: 'ComBank Online இல் உள்நுழையவும் -> கணக்குகள் -> அறிக்கை -> CSV/Excel ஆக பதிவிறக்கவும்.',
    hnb: 'HNB Digital Banking இல் உள்நுழையவும் -> கணக்கைத் தேர்ந்தெடுக்கவும் -> பரிவர்த்தனைகளை ஏற்றுமதி செய்யவும் (.csv).',
    sampath: 'Sampath Vishwa இல் உள்நுழையவும் -> கணக்குகள் -> வரலாறு -> அறிக்கையை ஏற்றுமதி செய்யவும்.',
    boc: 'BOC Internet Banking இல் உள்நுழையவும் -> அறிக்கைகள் -> CSV பதிவிறக்கவும்.',
    peoples: "People's Wave / Net இல் உள்நுழையவும் -> கணக்கு விவரங்கள் -> அறிக்கையை ஏற்றுமதி செய்யவும்.",
    frimi: 'FriMi செயலியைத் திறக்கவும் -> சுயவிவரம் / வரலாறு -> CSV அறிக்கையைக் கோரி ஏற்றுமதி செய்யவும்.',
  },
  dropActive: 'CSV கோப்பை இங்கே விடவும்', dropDefault: 'பதிவேற்ற கிளிக் செய்யவும் அல்லது இழுத்து விடவும்',
  dropHint: 'Commercial Bank, HNB, Sampath, BOC, FriMi மற்றும் பொதுவான CSV அறிக்கைகளை ஆதரிக்கிறது (5 MB வரை)',
  processing: 'அறிக்கை செயலாக்கப்படுகிறது…', importBtn: 'அறிக்கையை இறக்குமதி செய்',
  successTitle: '✓ அறிக்கை வெற்றிகரமாக இறக்குமதி செய்யப்பட்டது!', parsed: 'பகுக்கப்பட்ட பரிவர்த்தனைகள்:', added: 'உங்கள் கணக்கில் சேர்க்கப்பட்டவை:',
  skippedDup: 'தவிர்க்கப்பட்ட நகல் பதிவுகள்:', invalidRows: 'படிக்க முடியாத வரிசைகள்:',
  refreshed: 'உங்கள் டாஷ்போர்டு, பரிவர்த்தனைகள் மற்றும் செலவு போக்குகள் இந்தத் தரவுடன் இப்போது புதுப்பிக்கப்பட்டன.',
  skippedTitle: 'இந்த வரிசைகள் இறக்குமதி செய்யப்படவில்லை:', rowLabel: 'வரிசை {n}: {reason}',
  errNotCsv: 'சரியான .csv வங்கி அறிக்கைக் கோப்பைப் பதிவேற்றவும்.',
  errEmpty: 'இந்தக் கோப்பு காலியாக உள்ளது. உங்கள் வங்கியிலிருந்து அறிக்கையை மீண்டும் ஏற்றுமதி செய்து மீண்டும் முயற்சிக்கவும்.',
  errTooLarge: 'இந்தக் கோப்பு 5 MB ஐ விடப் பெரியது. குறுகிய தேதி வரம்பை (எ.கா. ஒரு மாதம்) ஏற்றுமதி செய்து பகுதிகளாக இறக்குமதி செய்யவும்.',
  errHeaderOnly: 'இந்தக் கோப்பில் தலைப்பு வரிசை மட்டுமே உள்ளது, பரிவர்த்தனைகள் இல்லை.',
  errRead: 'இந்தக் கோப்பைப் படிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  errNoFile: 'முதலில் வங்கி அறிக்கை CSV கோப்பைத் தேர்ந்தெடுக்கவும்.',
  errTooLargeImport: 'இந்த அறிக்கை ஒரே நேரத்தில் இறக்குமதி செய்ய மிகவும் பெரியது. குறுகிய தேதி வரம்பை ஏற்றுமதி செய்து பகுதிகளாக இறக்குமதி செய்யவும்.',
  errImportDefault: 'வங்கி அறிக்கையைச் செயலாக்க முடியவில்லை. CSV வடிவமைப்பைச் சரிபார்க்கவும்.',
};

export const BANK_T: Record<AdminLang, ConnectBankText> = { en, si, ta };
