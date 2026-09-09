import Link from 'next/link';
import { site } from '@/lib/site';

export function CtaBand() {
  const last = site.nav[site.nav.length - 1];
  return (
    <section className="bg-brand-soft px-5 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[1.75rem] bg-brand px-8 py-12 text-white md:flex-row md:items-center md:px-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">{site.cta.title}</h2>
          <p className="mt-3 text-sm leading-6 text-teal-50/85 md:text-base">{site.cta.subtitle}</p>
        </div>
        <Link
          href={last?.href || '/'}
          className="shrink-0 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand shadow-lg transition hover:bg-teal-50"
        >
          {site.cta.button}
        </Link>
      </div>
    </section>
  );
}
