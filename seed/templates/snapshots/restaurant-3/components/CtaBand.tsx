'use client';

import Link from 'next/link';
import { site } from '@/lib/site';
import { Reveal } from '@/components/Reveal';

export function CtaBand() {
  return (
    <section className="px-5 py-20 md:py-24">
      <Reveal className="mx-auto max-w-6xl border-y border-brand-fg/10 py-14 text-center">
        <h2 className="font-serif text-3xl tracking-tight md:text-4xl">{site.cta.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-brand-muted">{site.cta.subtitle}</p>
        <Link
          href="/reservation"
          className="mt-8 inline-flex rounded-button border border-brand-fg px-6 py-2.5 text-sm transition duration-300 hover:bg-brand-fg hover:text-brand-bg"
        >
          {site.cta.button}
        </Link>
      </Reveal>
    </section>
  );
}
