import React, { createContext, useContext, useState } from 'react';
import { en } from '../locales/en';
import { te } from '../locales/te';
import { hi } from '../locales/hi';
import { ta } from '../locales/ta';
import { kn } from '../locales/kn';
import { mr } from '../locales/mr';
import { pa } from '../locales/pa';
import { bn } from '../locales/bn';

export type LanguageCode = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'mr' | 'pa' | 'bn';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  localeTag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', localeTag: 'en-IN' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', localeTag: 'te-IN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', localeTag: 'hi-IN' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', localeTag: 'ta-IN' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', localeTag: 'kn-IN' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', localeTag: 'mr-IN' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', localeTag: 'pa-IN' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', localeTag: 'bn-IN' }
];

const dictionaries: Record<LanguageCode, typeof en> = {
  en,
  te: te as unknown as typeof en,
  hi: hi as unknown as typeof en,
  ta: ta as unknown as typeof en,
  kn: kn as unknown as typeof en,
  mr: mr as unknown as typeof en,
  pa: pa as unknown as typeof en,
  bn: bn as unknown as typeof en
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: typeof en;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('agrislot_lang') as LanguageCode) || 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('agrislot_lang', lang);
  };

  const t = dictionaries[language] || en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
