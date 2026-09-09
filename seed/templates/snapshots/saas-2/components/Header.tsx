'use client';

import { useEffect, useState } from 'react';

const links = [
  { href: '#platform', label: 'Platform' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#customers', label: 'Customers' },
];

export function Header() {
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.1, 0.4] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition-all duration-300 sm:px-4 ${
          scrolled
            ? 'border-white/10 bg-[#0c0c0c]/85 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.85),0_0_0_1px_rgba(212,255,69,0.06)] backdrop-blur-xl'
            : 'border-white/[0.07] bg-[#0a0a0a]/55 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.6)] backdrop-blur-md'
        }`}
      >
        <a href="#top" className="flex shrink-0 items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sift-lime/10 ring-1 ring-sift-lime/25 shadow-[0_0_20px_rgba(212,255,69,0.2)] transition group-hover:bg-sift-lime/15">
            <SiftMark className="h-4 w-4 text-sift-lime" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">Sift</span>
        </a>

        <nav className="nav-pill hidden items-center gap-0.5 rounded-full px-1 py-1 md:flex">
          {links.map((link) => {
            const id = link.href.slice(1);
            const isActive = active === id;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'text-sift-muted hover:text-white/90'
                }`}
              >
                {isActive ? (
                  <span
                    className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-sift-lime/70 to-transparent"
                    aria-hidden
                  />
                ) : null}
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#pricing"
            className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-sift-soft transition hover:border-white/20 hover:text-white"
          >
            Log in
          </a>
          <a
            href="#pricing"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-sift-lime px-3.5 py-2 text-[12px] font-bold uppercase tracking-wide text-black shadow-[0_0_28px_rgba(212,255,69,0.45),0_8px_20px_-6px_rgba(212,255,69,0.35)] transition hover:brightness-110"
          >
            Start free
            <span aria-hidden className="text-sm leading-none">
              ↗
            </span>
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c]/95 p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-[13px] font-medium text-sift-soft hover:bg-white/[0.04] hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export function SiftMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="5.5" y="11" width="13" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="8" y="17" width="8" height="2.5" rx="1.25" fill="currentColor" />
    </svg>
  );
}
