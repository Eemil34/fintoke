'use client';

import Link from 'next/link';
import { useState } from 'react';
import { reservationHref, site } from '@/lib/site';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-fg/10 bg-brand-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="group leading-tight">
          <span className="block text-base font-semibold tracking-tight">{site.name}</span>
          <span className="hidden text-xs text-brand-muted transition group-hover:text-brand/80 sm:block">
            {site.tagline}
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-brand-muted md:flex">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brand-fg">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href={reservationHref}
          className="hidden rounded-button bg-brand px-4 py-2 text-sm font-medium text-brand-bg transition hover:bg-brand-accent md:inline-flex"
        >
          {site.hero.cta}
        </Link>
        <button
          type="button"
          className="text-sm text-brand-muted md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open ? (
        <div className="space-y-1 border-t border-brand-fg/10 px-5 py-4 md:hidden">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={reservationHref}
            className="mt-2 block rounded-button bg-brand px-4 py-2.5 text-center text-sm font-medium text-brand-bg"
            onClick={() => setOpen(false)}
          >
            {site.hero.cta}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
