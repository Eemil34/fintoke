import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import './globals.css';
import { ImageGuard } from '@/components/ImageGuard';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

export const metadata = {
  title: 'Cue — AI Powered Customer Service',
  description:
    'Spend 10x less time responding to customer queries with Cue. Automate, manage and scale conversations across every channel.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${manrope.variable}`}>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="font-sans antialiased text-cue-ink">
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
