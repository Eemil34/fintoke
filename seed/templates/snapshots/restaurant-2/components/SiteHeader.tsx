'use client';

import { useEffect, useState } from 'react';

const NAV_LEFT = [
  { href: '#menu', label: 'Menu' },
  { href: '#bar', label: 'Bar' },
  { href: '#experience', label: 'Experience' },
  { href: '#reservations', label: 'Reservations' },
];

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16.2 16.2 L20 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const ink = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 section-pad transition-[background,box-shadow,backdrop-filter,color] duration-500 ${
        ink
          ? 'bg-cream/90 text-ink shadow-[0_1px_0_rgba(26,20,16,0.08)] backdrop-blur-xl'
          : 'bg-transparent text-white'
      }`}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4 md:py-5">
        <nav className="hidden items-center gap-1 lg:gap-2 md:flex">
          {NAV_LEFT.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`group relative px-2.5 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
                ink ? 'text-ink/75 hover:text-ink' : 'text-white/85 hover:text-white'
              }`}
            >
              {link.label}
              <span
                className={`pointer-events-none absolute inset-x-2.5 -bottom-0.5 h-px origin-left scale-x-0 transition duration-300 group-hover:scale-x-100 ${
                  ink ? 'bg-ink' : 'bg-white'
                }`}
              />
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden justify-self-start inline-flex h-10 w-10 items-center justify-center"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 top-0 block h-px w-full transition duration-300 ${
                ink ? 'bg-ink' : 'bg-white'
              } ${open ? 'translate-y-[7px] rotate-45' : ''}`}
            />
            <span
              className={`absolute left-0 top-[7px] block h-px w-full transition duration-300 ${
                ink ? 'bg-ink' : 'bg-white'
              } ${open ? 'opacity-0' : ''}`}
            />
            <span
              className={`absolute left-0 top-[14px] block h-px w-full transition duration-300 ${
                ink ? 'bg-ink' : 'bg-white'
              } ${open ? '-translate-y-[7px] -rotate-45' : ''}`}
            />
          </span>
        </button>

        <a
          href="#top"
          className="font-display text-[1.85rem] md:text-[2.15rem] leading-none tracking-[0.1em] justify-self-center"
          onClick={() => setOpen(false)}
        >
          Veloura
        </a>

        <div
          className={`flex items-center justify-end gap-4 md:gap-6 text-[11px] uppercase tracking-[0.22em] ${
            ink ? 'text-ink/80' : 'text-white/90'
          }`}
        >
          <a
            href="#login"
            className={`hidden sm:inline transition ${ink ? 'hover:text-ink' : 'hover:text-white'}`}
          >
            Login
          </a>
          <button
            type="button"
            aria-label="Search"
            className={`transition ${ink ? 'hover:text-ink' : 'hover:text-white'}`}
          >
            <SearchIcon />
          </button>
          <a
            href="#bag"
            className={`relative transition ${ink ? 'hover:text-ink' : 'hover:text-white'}`}
          >
            Bag
            <span
              className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] tracking-normal ${
                ink ? 'bg-ink text-cream' : 'bg-white/15 text-white ring-1 ring-white/30'
              }`}
            >
              0
            </span>
          </a>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-500 ${
          open ? 'max-h-80 opacity-100 pb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-1 border-t border-current/10 pt-4">
          {NAV_LEFT.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-1 py-3 font-display text-2xl tracking-[0.06em]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
