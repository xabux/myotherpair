'use client';

import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features',     href: '#features'     },
  { label: 'About',        href: '#about'         },
  { label: 'Download',     href: '#download'      },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-900/90 backdrop-blur-2xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between" aria-label="Main navigation">

        {/* Logo */}
        <a href="/" className="flex items-center select-none" aria-label="MyOtherPair home">
          <span className="text-xl font-extrabold tracking-tight leading-none">
            <span className="text-white">myother</span><span className="text-brand-500">pair</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a href={href} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <a href="/login" className="text-sm font-semibold text-white/70 hover:text-white transition-colors px-4 py-2">
            Log in
          </a>
          <a
            href="/signup"
            className="text-sm font-bold bg-tinder text-white px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-glow-sm"
          >
            Get Started
          </a>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu — full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-dark-900/97 backdrop-blur-2xl flex flex-col px-6 pt-20 pb-10 gap-1 overflow-y-auto">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className="text-lg font-semibold text-white/70 py-4 border-b border-white/5 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
              {label}
            </a>
          ))}
          <div className="pt-8 flex flex-col gap-3">
            <a href="/login" className="text-center text-base font-semibold text-white/70 py-3.5 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Log in</a>
            <a href="/signup" className="text-center text-base font-bold bg-tinder text-white py-3.5 rounded-full shadow-glow-sm" onClick={() => setMobileOpen(false)}>Get Started</a>
          </div>
        </div>
      )}
    </header>
  );
}
