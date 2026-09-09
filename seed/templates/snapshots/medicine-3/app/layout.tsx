import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { ImageGuard } from '../components/ImageGuard';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="font-sans antialiased bg-brand-bg text-brand-fg">
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
