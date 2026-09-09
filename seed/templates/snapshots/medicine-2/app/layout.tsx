import type { ReactNode } from 'react';
import { Manrope, Outfit } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { ImageGuard } from '@/components/ImageGuard';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-brand-bg text-brand-fg">
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
