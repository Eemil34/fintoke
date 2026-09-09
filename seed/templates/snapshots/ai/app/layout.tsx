import type { ReactNode } from 'react';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { ImageGuard } from '@/components/ImageGuard';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'HackerRank — The future of development is human + AI',
  description:
    'We help you map the skills you need, track the skills you have, and close your gaps to thrive in a GenAI world.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans antialiased bg-black text-white">
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
