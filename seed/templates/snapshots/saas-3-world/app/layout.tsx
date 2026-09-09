import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ImageGuard } from '../components/ImageGuard';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Switch — Intelligence on your terms',
  description:
    'Dial in your exact requirements for speed, cost, and carbon footprint. Route every AI query with real-time energy and CO₂ readouts.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="bg-ink font-sans antialiased">
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
