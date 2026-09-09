'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/lib/site';

function MokaIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 10h8l-.8 8.2a1.5 1.5 0 0 1-1.5 1.3H9.3a1.5 1.5 0 0 1-1.5-1.3L7 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 10V7.5A2.5 2.5 0 0 1 10.5 5h1A2.5 2.5 0 0 1 14 7.5V10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 12h2.2a1.8 1.8 0 0 0 0-3.6H15" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const [query, setQuery] = useState('');

  return (
    <header className="relative z-40 border-b border-[#2A1810]/08 bg-[#F5EEE3] shadow-[0_1px_0_rgba(42,24,16,0.04)]">
      <div className="mx-auto flex h-[68px] max-w-[1360px] items-center justify-between gap-6 px-5 md:h-[76px] md:px-8 lg:px-12">
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative px-3.5 py-2 text-[13px] font-medium tracking-[0.04em] text-[#2A1810]/70 transition hover:text-[#2A1810]"
            >
              {item.label}
              <span className="absolute inset-x-3.5 -bottom-0.5 h-px origin-left scale-x-0 bg-[#9B8C5E] transition duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <Link
          href="#home"
          className="flex items-center gap-2.5 md:hidden"
          aria-label={site.name}
        >
          <span className="flex h-9 w-9 items-center justify-center border border-[#2A1810]/20 bg-[#EDE4D4] text-[#2A1810]">
            <MokaIcon className="h-4 w-4" />
          </span>
          <span className="font-display text-[15px] font-semibold uppercase tracking-[0.06em] text-[#2A1810]">
            Coffee Crew
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-3 md:flex-none lg:gap-4">
          <label className="relative hidden w-[220px] sm:block lg:w-[280px]">
            <span className="sr-only">Search</span>
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2A1810]/35">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={site.searchPlaceholder}
              className="w-full rounded-full border border-[#2A1810]/12 bg-[#EDE4D4]/80 py-2.5 pl-10 pr-4 text-[12.5px] text-[#2A1810] shadow-inner outline-none transition placeholder:text-[#2A1810]/38 focus:border-[#9B8C5E] focus:bg-[#F5EEE3] focus:ring-2 focus:ring-[#9B8C5E]/25"
            />
          </label>

          <Link
            href="#home"
            className="group flex items-center gap-2.5 border border-[#2A1810]/15 bg-[#F5EEE3] py-1.5 pl-1.5 pr-3 text-[#2A1810] shadow-sm transition hover:border-[#9B8C5E] hover:shadow-md"
          >
            <span className="flex h-9 w-9 items-center justify-center border border-[#2A1810]/18 bg-[#EDE4D4] transition group-hover:border-[#9B8C5E] group-hover:bg-[#9B8C5E]/15">
              <MokaIcon className="h-[17px] w-[17px]" />
            </span>
            <span className="hidden max-w-[118px] font-display text-[10.5px] font-semibold uppercase leading-[1.25] tracking-[0.1em] sm:block">
              Coffee Crew
              <br />
              Brewing Co.
            </span>
          </Link>
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-[#2A1810]/08 px-3 py-1.5 md:hidden"
        aria-label="Mobile"
      >
        {site.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap px-3 py-2 text-[12px] font-medium tracking-[0.04em] text-[#2A1810]/70"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
