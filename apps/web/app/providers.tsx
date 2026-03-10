'use client';

import { ThemeProvider } from '../lib/theme';
import { LocaleProvider } from '../lib/locale';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        {children}
      </LocaleProvider>
    </ThemeProvider>
  );
}
