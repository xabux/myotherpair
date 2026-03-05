import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Syne, DM_Sans } from 'next/font/google';
import CursorEffect from './components/CursorEffect';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  variable: '--font-jakarta',
  display:  'swap',
  weight:   ['400', '500', '600', '700', '800'],
});

const syne = Syne({
  subsets:  ['latin'],
  variable: '--font-syne',
  display:  'swap',
  weight:   ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dmsans',
  display:  'swap',
  weight:   ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MyOtherPair — Find your match.',
  description:
    'The peer-to-peer marketplace for individual shoes. Match with someone who needs exactly your complement — by brand, model, size, and foot side.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${syne.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('theme');
            document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
          } catch(e) {
            document.documentElement.setAttribute('data-theme', 'dark');
          }
        ` }} />
      </head>
      <body className="font-sans bg-dark-900 text-white antialiased">
        <CursorEffect />
        {children}
      </body>
    </html>
  );
}
