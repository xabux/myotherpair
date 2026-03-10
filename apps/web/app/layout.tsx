import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  display:  'swap',
  weight:   ['600', '700'],
});

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dmsans',
  display:  'swap',
  weight:   ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MyOtherPair — Find your match.',
  description:
    'The peer-to-peer marketplace for individual shoes. Match with someone who needs exactly your complement — by brand, model, size, and foot side.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
