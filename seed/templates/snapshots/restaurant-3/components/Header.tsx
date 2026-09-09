'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site } from '@/lib/site';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const onHero = pathname === '/';

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = !onHero || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        solid
          ? 'border-b border-brand-fg/10 bg-brand-bg/90 backdrop-blur'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <Link
          href="/"
          className={`font-serif text-lg tracking-tight transition-colors duration-300 md:text-xl ${
            solid ? 'text-brand-fg' : 'text-white'
          }`}
        >
          {site.name}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/reservation"
            className={`hidden rounded-button border px-5 py-2 text-sm transition-all duration-300 md:inline-flex ${
              solid
                ? 'border-brand-fg text-brand-fg hover:bg-brand-fg hover:text-brand-bg'
                : 'border-white/80 text-white hover:bg-white hover:text-brand-fg'
            }`}
          >
            Reservation
          </Link>
          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center transition-colors duration-300 ${
              solid ? 'text-brand-fg' : 'text-white'
            }`}
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="flex flex-col gap-1.5">
              <span
                className={`block h-px w-5 bg-current transition duration-300 ${
                  open ? 'translate-y-[3.5px] rotate-45' : ''
                }`}
              />
              <span
                className={`block h-px w-5 bg-current transition duration-300 ${open ? 'opacity-0' : ''}`}
              />
              <span
                className={`block h-px w-5 bg-current transition duration-300 ${
                  open ? '-translate-y-[3.5px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <div
          className={`menu-panel border-t px-5 py-6 backdrop-blur ${
            solid ? 'border-brand-fg/10 bg-brand-bg' : 'border-white/15 bg-brand-fg/95'
          }`}
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-4">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-serif text-2xl transition-opacity duration-300 hover:opacity-70 ${
                  solid ? 'text-brand-fg' : 'text-white'
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
