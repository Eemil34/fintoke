'use client';

import { useEffect, useState } from 'react';

const links = ['Products', 'Solutions', 'Resources', 'Pricing'];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
      <div
        className={`nav-shell mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl px-3.5 sm:px-5 py-2.5 sm:py-3 transition-all duration-500 ${
          scrolled
            ? 'bg-black/70 border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(61,255,139,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl'
            : 'bg-white/[0.04] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md'
        } border`}
      >
        <a href="#" className="group flex items-center gap-2 shrink-0 relative">
          <span className="absolute -inset-2 rounded-xl bg-hr-green-bright/0 group-hover:bg-hr-green-bright/[0.06] transition-colors duration-300" />
          <span className="relative text-[1.1rem] sm:text-[1.15rem] font-bold tracking-tight text-white">
            HackerRank
          </span>
          <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inset-0 rounded-[3px] bg-hr-green-bright/40 blur-[6px] animate-pulse" />
            <span className="relative h-3.5 w-3.5 rounded-[3px] bg-hr-green-bright shadow-[0_0_12px_rgba(61,255,139,0.8)] group-hover:scale-110 transition-transform duration-300" />
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1 text-[0.9rem] font-medium">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="nav-link relative px-3.5 py-2 text-[#c8c8c8] hover:text-white transition-colors duration-200 rounded-lg"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <a
            href="#developers"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#c8c8c8] hover:text-white hover:bg-white/[0.06] transition-all duration-200"
          >
            For Developers
            <svg
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className="opacity-70"
            >
              <path
                d="M3.5 1.5H10.5V8.5M10.2 1.8L1.5 10.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="#demo"
            className="rounded-lg border border-white/20 bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-white hover:border-hr-green/50 hover:bg-hr-green/[0.06] hover:shadow-[0_0_20px_rgba(61,255,139,0.15)] transition-all duration-300"
          >
            Request Demo
          </a>
          <a
            href="#signup"
            className="group/cta relative overflow-hidden rounded-lg bg-hr-green-bright px-3.5 py-2 text-sm font-semibold text-black shadow-[0_0_24px_rgba(61,255,139,0.35)] hover:shadow-[0_0_36px_rgba(61,255,139,0.55)] transition-shadow duration-300"
          >
            <span className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700" />
            <span className="relative">Sign Up</span>
          </a>
        </div>

        <button
          type="button"
          className="md:hidden relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white hover:border-hr-green/40 hover:bg-hr-green/[0.08] transition-colors"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-[5px]">
            <span
              className={`block h-[1.5px] w-4 rounded-full bg-current transition-transform duration-300 origin-center ${
                open ? 'translate-y-[6.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-[1.5px] w-4 rounded-full bg-current transition-opacity duration-200 ${
                open ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-[1.5px] w-4 rounded-full bg-current transition-transform duration-300 origin-center ${
                open ? '-translate-y-[6.5px] -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          open ? 'max-h-80 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className="rounded-2xl border border-white/12 bg-black/80 backdrop-blur-xl p-3 space-y-1 shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(61,255,139,0.08)]">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3.5 py-2.5 text-sm text-[#cfcfcf] hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
          <div className="pt-2 mt-1 border-t border-white/10 grid gap-2">
            <a
              href="#demo"
              onClick={() => setOpen(false)}
              className="block rounded-xl border border-white/15 px-3.5 py-2.5 text-center text-sm text-white"
            >
              Request Demo
            </a>
            <a
              href="#signup"
              onClick={() => setOpen(false)}
              className="block rounded-xl bg-hr-green-bright px-3.5 py-2.5 text-center text-sm font-semibold text-black shadow-[0_0_24px_rgba(61,255,139,0.3)]"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
