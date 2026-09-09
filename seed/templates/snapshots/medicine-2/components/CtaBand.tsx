import Link from 'next/link';
import { site } from '@/lib/site';

export function CtaBand() {
  return (
    <section className="px-5 py-16 md:py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand px-8 py-14 text-white md:px-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-accent/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{site.cta.title}</h2>
          <p className="mt-4 text-base leading-7 text-white/80">{site.cta.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/appointment"
              className="inline-flex rounded-button bg-brand-accent px-6 py-3 text-sm font-bold text-white transition hover:brightness-105"
            >
              {site.cta.button}
            </Link>
            <a
              href={`tel:${site.phone.replace(/\s/g, '')}`}
              className="inline-flex rounded-button border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {site.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
