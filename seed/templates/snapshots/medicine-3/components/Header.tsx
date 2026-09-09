'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/lib/site';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-fg/5 bg-brand-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M10.5 4.5h3v6h6v3h-6v6h-3v-6h-6v-3h6z" />
            </svg>
          </span>
          <span className="text-sm font-bold tracking-tight uppercase">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-brand-muted lg:flex">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brand-fg">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/appointment"
            className="rounded-button border border-brand/30 px-4 py-2 text-sm font-medium text-brand"
          >
            Hire Professionals
          </Link>
          <Link
            href="/treatments"
            className="rounded-button bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            Find Jobs
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg border border-brand-fg/10 px-3 py-1.5 text-sm md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="space-y-2 border-t border-brand-fg/10 px-5 py-4 md:hidden">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-1 text-sm"
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
