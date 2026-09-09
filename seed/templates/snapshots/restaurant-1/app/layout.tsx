import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ImageGuard } from '../components/ImageGuard';

export const metadata: Metadata = {
  title: 'Hearth & Vale — Contemporary Dining',
  description:
    'Seasonal plates, a warm dining room, and reservations online. A restaurant website inspired by modern Squarespace templates.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
