import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getLanguage, setLanguage as setI18nLanguage, t as translateFn, type Language } from '../i18n';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageState(getLanguage());
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    console.log('I18nContext: Setting language to', lang);
    setI18nLanguage(lang);
    setLanguageState(lang);
    console.log('I18nContext: Language state updated to', lang);
  }, []);

  const t = (key: string) => {
    return translateFn(key);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
