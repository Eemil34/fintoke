'use client';

import { useState } from 'react';

const NAV = [
  { href: '#home', label: 'Home', active: true },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services', chevron: true },
  { href: '#blog', label: 'Blog', chevron: true },
  { href: '#pages', label: 'Pages', chevron: true },
  { href: '#contact', label: 'Contact' },
];

function Logo() {
  return (
    <a href="#home" className="flex items-center gap-2.5">
      <span className="relative inline-flex h-9 w-9 items-center justify-center" aria-hidden="true">
        <svg viewBox="0 0 36 36" className="h-9 w-9">
          <path d="M4 20 L18 8 L32 20 V30 H4 Z" fill="#1F1F1F" />
          <path d="M4 20 L18 8 L32 20 L18 16 Z" fill="#9B2C2C" />
          <rect x="15" y="21" width="6" height="9" rx="1" fill="#F7F7F8" />
        </svg>
      </span>
      <span className="font-display text-[1.15rem] font-bold tracking-[0.04em] text-ink">
        ROOFTIX
      </span>
    </a>
  );
}

function Chevron() {
  return (
    <svg className="ml-1 h-3 w-3 opacity-60" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5 L6 7.5 L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ArrowCircle({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
        dark ? 'bg-ink text-white' : 'bg-white text-ink'
      }`}
    >
      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.5 8h9M8.5 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-mist-line/70 bg-white/95 backdrop-blur-md">
      <div className="section-pad mx-auto flex max-w-site items-center justify-between gap-4 py-4">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`inline-flex items-center text-[0.95rem] font-medium transition ${
                item.active
                  ? 'text-brand underline decoration-2 underline-offset-[10px]'
                  : 'text-ink/80 hover:text-brand'
              }`}
            >
              {item.label}
              {item.chevron ? <Chevron /> : null}
            </a>
          ))}
        </nav>

        <a href="#contact" className="btn-brand hidden sm:inline-flex">
          Get a Quote
          <ArrowCircle dark />
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-mist-line text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-mist-line bg-white px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-1 text-base font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a href="#contact" className="btn-brand mt-2 w-fit" onClick={() => setOpen(false)}>
              Get a Quote
              <ArrowCircle dark />
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
