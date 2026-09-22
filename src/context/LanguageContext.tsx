/**
 * Language Context and Provider (Bangla & English)
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, TranslationKey } from '../i18n/translations';
import { formatCurrency, formatDate } from '../i18n/formatters';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  formatAmount: (amount: number) => string;
  formatDateValue: (dateString: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('skrp_language');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn'; // Default to Bangla as requested in master prompt
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('skrp_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  const formatAmount = (amount: number): string => {
    return formatCurrency(amount, language);
  };

  const formatDateValue = (dateString: string): string => {
    return formatDate(dateString, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatAmount,
        formatDateValue,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
