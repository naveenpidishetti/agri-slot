import React, { createContext, useContext, useState } from 'react';
import { en } from '../locales/en';
import { te } from '../locales/te';
import { hi } from '../locales/hi';

export type LanguageCode = 'en' | 'te' | 'hi';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  localeTag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', localeTag: 'en-IN' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', localeTag: 'te-IN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', localeTag: 'hi-IN' }
];

const dictionaries: Record<LanguageCode, typeof en> = {
  en,
  te: te as unknown as typeof en,
  hi: hi as unknown as typeof en
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
    const saved = localStorage.getItem('agrislot_lang') as LanguageCode;
    return (saved === 'en' || saved === 'te' || saved === 'hi') ? saved : 'en';
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
