'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getTranslations, type Translations } from './i18n';

export interface LocaleOption {
  code: string;
  label: string;
  flag: string;
  group: 'US' | 'UK' | 'EU';
}

export const LOCALES: LocaleOption[] = [
  // US
  { code: 'en-US', label: 'English (US)',     flag: '🇺🇸', group: 'US' },
  { code: 'en-CA', label: 'English (Canada)', flag: '🇨🇦', group: 'US' },
  // UK
  { code: 'en-GB', label: 'English (UK)',      flag: '🇬🇧', group: 'UK' },
  { code: 'en-AU', label: 'English (Australia)',flag: '🇦🇺', group: 'UK' },
  { code: 'en-IE', label: 'English (Ireland)', flag: '🇮🇪', group: 'UK' },
  // EU
  { code: 'fr',    label: 'Français',          flag: '🇫🇷', group: 'EU' },
  { code: 'de',    label: 'Deutsch',           flag: '🇩🇪', group: 'EU' },
  { code: 'es',    label: 'Español',           flag: '🇪🇸', group: 'EU' },
  { code: 'it',    label: 'Italiano',          flag: '🇮🇹', group: 'EU' },
  { code: 'nl',    label: 'Nederlands',        flag: '🇳🇱', group: 'EU' },
  { code: 'pt',    label: 'Português',         flag: '🇵🇹', group: 'EU' },
  { code: 'pl',    label: 'Polski',            flag: '🇵🇱', group: 'EU' },
  { code: 'sv',    label: 'Svenska',           flag: '🇸🇪', group: 'EU' },
];

interface LocaleCtx {
  locale: string;
  setLocale: (code: string) => void;
  localeOption: LocaleOption | undefined;
}

const LocaleContext = createContext<LocaleCtx>({
  locale: 'en-GB',
  setLocale: () => {},
  localeOption: LOCALES[2],
});

function detectBrowserLocale(): string {
  if (typeof navigator === 'undefined') return 'en-GB';
  const lang = navigator.language ?? 'en-GB';
  // Exact match first
  const exact = LOCALES.find(l => l.code.toLowerCase() === lang.toLowerCase());
  if (exact) return exact.code;
  // Prefix match (e.g. 'en-NZ' → 'en-GB')
  const prefix = lang.split('-')[0];
  const prefixMatch = LOCALES.find(l => l.code.startsWith(prefix));
  if (prefixMatch) return prefixMatch.code;
  return 'en-GB';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState('en-GB');

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    setLocaleState(saved ?? detectBrowserLocale());
  }, []);

  function setLocale(code: string) {
    setLocaleState(code);
    localStorage.setItem('locale', code);
  }

  return (
    <LocaleContext.Provider value={{
      locale,
      setLocale,
      localeOption: LOCALES.find(l => l.code === locale),
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useTranslations(): Translations {
  const { locale } = useLocale();
  return getTranslations(locale);
}
