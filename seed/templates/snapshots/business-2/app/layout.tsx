import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import { ImageGuard } from '../components/ImageGuard';
import './globals.css';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rooftix — Effective Roofing Solutions',
  description:
    'Rooftix delivers trusted roofing repairs, replacements, and inspections with quality craftsmanship and lasting client satisfaction.',
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
