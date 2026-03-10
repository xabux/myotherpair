'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale, LOCALES } from '../../lib/locale';

const GROUPS = [
  { key: 'US', label: 'Americas' },
  { key: 'UK', label: 'UK & Oceania' },
  { key: 'EU', label: 'Europe' },
] as const;

interface Props {
  /** 'compact' = flag + chevron only (for nav), 'full' = flag + label + chevron */
  variant?: 'compact' | 'full';
}

export default function LanguageSelector({ variant = 'compact' }: Props) {
  const { locale, setLocale, localeOption } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        aria-label="Select language"
      >
        <span>{localeOption?.flag ?? '🌐'}</span>
        {variant === 'full' && (
          <span className="text-[13px] font-medium tracking-[0.06em]">{localeOption?.label ?? locale}</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-card border border-border/50 shadow-elevated z-50 overflow-hidden">
          {GROUPS.map(group => {
            const items = LOCALES.filter(l => l.group === group.key);
            return (
              <div key={group.key}>
                <p className="px-3 pt-2.5 pb-1 text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/50">
                  {group.label}
                </p>
                {items.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLocale(l.code); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-accent/10 transition-colors text-left ${
                      locale === l.code ? 'text-accent font-semibold' : 'text-foreground'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
