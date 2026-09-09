'use client';

import { useState } from 'react';

const NAV = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#projects', label: 'Projects' },
  { href: '#blog', label: 'Blog' },
  { href: '#contact', label: 'Contact' },
];

function LogoMark() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-ember to-ember-deep shadow-sm">
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" aria-hidden="true">
        <path
          fill="currentColor"
          d="M2 11.5 8 3l6 8.5H9.8L8 9.2 6.2 11.5H2zm3.4 1.5h5.2L8 9.8 5.4 13z"
        />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="section-pad mx-auto flex max-w-site items-center justify-between gap-4 py-5">
        <a href="#home" className="flex items-center gap-2.5 text-white">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-tight">Deckora</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/85 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="btn-lime hidden sm:inline-flex">
          Get Free Estimate
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
              <path
                d="M3.5 8h9M8.5 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white lg:hidden"
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
        <div
          id="mobile-nav"
          className="section-pad border-t border-white/10 bg-ink/95 pb-5 pt-3 backdrop-blur-md lg:hidden"
        >
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm uppercase tracking-[0.16em] text-white/90"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a href="#contact" className="btn-lime mt-2 w-fit" onClick={() => setOpen(false)}>
              Get Free Estimate
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
