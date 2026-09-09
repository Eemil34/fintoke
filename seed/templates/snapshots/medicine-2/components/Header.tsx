'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/lib/site';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand/10 bg-brand-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M12 2c-2.4 0-4.2 1.7-4.8 4.1C6.4 9.2 7.2 12 8.6 14.8c.9 1.8 2 3.4 3.4 5.2.2.2.5.2.7 0 1.4-1.8 2.5-3.4 3.4-5.2 1.4-2.8 2.2-5.6 1.4-8.7C16.2 3.7 14.4 2 12 2z" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-brand">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-brand-muted lg:flex">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/appointment"
          className="hidden rounded-button bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90 md:inline-flex"
        >
          Appointment
        </Link>

        <button
          type="button"
          className="rounded-button border border-brand/15 px-3 py-1.5 text-sm font-medium text-brand lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open ? (
        <div className="space-y-1 border-t border-brand/10 px-5 py-4 lg:hidden">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-brand hover:bg-brand-soft"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
