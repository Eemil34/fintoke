import type { ReactNode } from 'react';
import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { ImageGuard } from '../components/ImageGuard';

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  title: `${site.name} Hospital`,
  description: site.description,
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased bg-brand-bg text-brand-fg`}>
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
