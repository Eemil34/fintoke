import type { ReactNode } from 'react';
import { Oswald, Outfit } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { ImageGuard } from '../components/ImageGuard';

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${outfit.variable}`}>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="font-sans antialiased bg-cream text-espresso">
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
