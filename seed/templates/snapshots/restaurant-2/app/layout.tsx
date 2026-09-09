import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import { ImageGuard } from '../components/ImageGuard';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Veloura — Savor Luxury',
  description:
    'An exquisite dining journey where culinary artistry meets world-class cocktails in an atmosphere of timeless elegance.',
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
