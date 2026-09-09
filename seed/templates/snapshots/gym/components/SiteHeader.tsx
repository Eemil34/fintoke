'use client';

import { useEffect, useState } from 'react';

const nav = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Classes', href: '#services' },
  { label: 'Membership', href: '#plans' },
  { label: 'Why FFL', href: '#why' },
  { label: 'Contact', href: '#contact' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition duration-500 ${
        scrolled
          ? 'border-b border-white/10 bg-ink/80 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent py-6'
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 md:px-10 lg:px-14 xl:px-20">
        <a href="#home" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border border-electric/40 bg-electric/10 text-electric transition group-hover:bg-electric group-hover:text-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7 3h3v5H7V3zm7 0h3v5h-3V3zM5 9h14v2.2c0 2.4-1.3 4.5-3.3 5.6V21H8.3v-4.2C6.3 15.7 5 13.6 5 11.2V9z" />
            </svg>
          </span>
          <span className="font-display text-2xl font-semibold tracking-[0.18em]">FFL</span>
        </a>

        <nav className="hidden items-center gap-8 text-[13px] text-white/70 lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="tracking-wide transition hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#plans" className="btn-skew hidden sm:inline-flex">
            Join Now
          </a>
        </div>
      </div>
    </header>
  );
}
