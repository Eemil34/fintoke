import type { ReactNode } from 'react';
import './globals.css';
import { site } from '@/lib/site';
import { ImageGuard } from '../components/ImageGuard';

export const metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
