'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/lib/site';

function LogoMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 2c-.4 3.2-2.2 5.4-4.8 7.2 2.1.4 3.6 1.5 4.8 3.3 1.2-1.8 2.7-2.9 4.8-3.3C14.2 7.4 12.4 5.2 12 2zm0 10.2c-1.8 2.4-4.6 3.6-7.8 3.8 1.9 2.4 4.6 4 7.8 5.8 3.2-1.8 5.9-3.4 7.8-5.8-3.2-.2-6-1.4-7.8-3.8z" />
      </svg>
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const appointment = site.nav[site.nav.length - 1];

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2.5 text-xs md:text-sm">
          <div className="flex items-center gap-3 opacity-90">
            <span aria-hidden className="inline-flex gap-2">
              <SocialDot />
              <SocialDot />
              <SocialDot />
            </span>
            <span className="hidden sm:inline">{site.contact.hours}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 opacity-95">
            <a href={`mailto:${site.contact.email}`} className="hover:underline">
              {site.contact.email}
            </a>
            <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="hover:underline">
              {site.contact.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-brand-fg/8 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark />
            <span className="text-lg font-semibold tracking-tight text-brand">{site.name}</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-brand-muted lg:flex">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href={appointment?.href || '/appointment'}
            className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-deep md:inline-flex"
          >
            Make An Appointment
          </Link>

          <button
            type="button"
            className="rounded-full border border-brand-fg/10 px-3 py-1.5 text-sm lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
          >
            Menu
          </button>
        </div>

        {open ? (
          <div className="space-y-2 border-t border-brand-fg/8 px-5 py-4 lg:hidden">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-1.5 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function SocialDot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80" />;
}
