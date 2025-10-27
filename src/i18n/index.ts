import ruTranslations from './ru.json';
import enTranslations from './en.json';

export type Language = 'ru' | 'en';
export type TranslationKeys = typeof ruTranslations;

const translations: Record<Language, TranslationKeys> = {
  ru: ruTranslations,
  en: enTranslations,
};

let currentLanguage: Language = 'ru';

export function setLanguage(lang: Language): void {
  console.log('i18n: Setting language to', lang);
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
    console.log('i18n: Language saved to localStorage:', lang);
    window.dispatchEvent(new Event('languagechange'));
    console.log('i18n: languagechange event dispatched');
  }
}

export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language') as Language | null;
    if (stored && (stored === 'ru' || stored === 'en')) {
      return stored;
    }
  }
  return currentLanguage;
}

export function t(key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[getLanguage()];

  for (const k of keys) {
    if (value && typeof value === 'object' && value !== null) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function useTranslation() {
  return { t, setLanguage, currentLanguage: getLanguage() };
}
