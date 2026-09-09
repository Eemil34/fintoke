import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, Sora } from 'next/font/google';
import { ImageGuard } from '../components/ImageGuard';
import './globals.css';

const display = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Deckora — Outdoor Living Built for Everyday Life',
  description:
    'Deckora helps homeowners plan and build decks, patios, pergolas, porches, and outdoor spaces that feel useful, warm, and ready for everyday life.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
