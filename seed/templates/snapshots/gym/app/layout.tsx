import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Barlow_Condensed, Outfit } from 'next/font/google';
import './globals.css';
import { ImageGuard } from '../components/ImageGuard';

const display = Barlow_Condensed({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FFL Fitness — Strength Clubs',
  description:
    'FFL is a global network of performance gyms — elite coaching, serious floors, and memberships that travel with you.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="bg-ink font-sans text-white antialiased">
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
