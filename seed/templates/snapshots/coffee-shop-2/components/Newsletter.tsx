'use client';

import { SiteImage } from '@/components/SiteImage';
import { cafe, navLinks } from '@/lib/site';

function SocialIcon({ kind }: { kind: 'instagram' | 'linkedin' | 'x' }) {
  if (kind === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (kind === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M6.5 9.5H9v9H6.5v-9zM7.8 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11 9.5h2.4v1.2h.03c.34-.64 1.16-1.32 2.4-1.32 2.56 0 3.03 1.68 3.03 3.87v5.25H16.5v-4.66c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.74H11v-9z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M17.5 4h2.2l-4.8 5.5L21 20h-5.2l-3.3-4.6L8 20H5.8l5.1-5.9L3.5 4H8.8l3 4.2L17.5 4zm-.8 14.4h1.2L7.9 5.5H6.6l10.1 12.9z" />
    </svg>
  );
}

export function Newsletter() {
  return (
    <section id="reviews" className="relative overflow-hidden border-t border-roast/10 bg-parchment-soft/40">
      <div className="pointer-events-none absolute inset-0 paper-grain opacity-[0.035]" aria-hidden />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 md:grid-cols-[1fr_1.05fr] md:gap-12 md:px-8 md:py-28">
        <div>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-roast/45">
            Newsletter
          </p>
          <h2 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] font-semibold italic leading-[0.92] text-roast">
            Stay Caffeinated
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-roast/65">
            Subscribe to our newsletter and get 20% off your first bag of freshly roasted beans.
          </p>
          <form
            className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              className="min-w-0 flex-1 border border-roast/15 bg-parchment-soft px-4 py-3.5 text-[14px] text-roast outline-none transition placeholder:text-roast/40 focus:border-roast/40"
            />
            <button
              type="submit"
              className="bg-roast px-7 py-3.5 font-display text-[1.1rem] italic text-parchment-soft transition hover:bg-roast-mid"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden shadow-[0_28px_70px_rgba(42,27,20,0.12)]">
          <SiteImage
            src={cafe.espresso}
            alt="Iced coffee swirl from above"
            fill
            className="object-cover transition duration-700 hover:scale-105"
            sizes="(max-width: 768px) 90vw, 460px"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-parchment/50 via-transparent to-parchment/15" />
        </div>
      </div>

      <div className="relative border-t border-roast/10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-5 py-9 sm:flex-row md:px-8">
          <a href="#top" className="font-display text-2xl font-semibold italic text-roast md:text-[1.85rem]">
            Caffiora
          </a>
          <nav className="flex flex-wrap justify-center gap-7" aria-label="Footer">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[12px] font-medium text-roast/60 transition hover:text-roast"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5 text-roast/70">
            <a href="#" aria-label="Instagram" className="transition hover:text-roast">
              <SocialIcon kind="instagram" />
            </a>
            <a href="#" aria-label="LinkedIn" className="transition hover:text-roast">
              <SocialIcon kind="linkedin" />
            </a>
            <a href="#" aria-label="X" className="transition hover:text-roast">
              <SocialIcon kind="x" />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-roast py-3.5 text-center text-[12px] tracking-wide text-parchment-soft/85">
        ©2028 Caffiora. All rights reserved.
      </div>
    </section>
  );
}
