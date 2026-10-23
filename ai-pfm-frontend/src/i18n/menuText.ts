// Account menu labels (sidebar user card) in English, Sinhala and Tamil.
import { type AdminLang } from './adminText';

export interface MenuText {
  online: string;
  editProfile: string;
  settings: string;
  lightMode: string;
  darkMode: string;
  helpSupport: string;
  signOut: string;
}

const en: MenuText = {
  online: 'Online',
  editProfile: 'Edit Profile',
  settings: 'Settings',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  helpSupport: 'Help & Support',
  signOut: 'Sign Out',
};

const si: MenuText = {
  online: 'මාර්ගගතයි',
  editProfile: 'පැතිකඩ සංස්කරණය',
  settings: 'සැකසුම්',
  lightMode: 'ආලෝක ප්‍රකාරය',
  darkMode: 'අඳුරු ප්‍රකාරය',
  helpSupport: 'උදව් සහ සහාය',
  signOut: 'පිටවන්න',
};

const ta: MenuText = {
  online: 'இணைப்பில் உள்ளது',
  editProfile: 'சுயவிவரத்தைத் திருத்து',
  settings: 'அமைப்புகள்',
  lightMode: 'ஒளி பயன்முறை',
  darkMode: 'இருள் பயன்முறை',
  helpSupport: 'உதவி & ஆதரவு',
  signOut: 'வெளியேறு',
};

export const MENU_T: Record<AdminLang, MenuText> = { en, si, ta };
