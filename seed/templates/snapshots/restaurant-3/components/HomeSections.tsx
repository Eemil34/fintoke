'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { site } from '@/lib/site';
import { SiteImage } from '@/components/SiteImage';
import { Reveal } from '@/components/Reveal';

export function HomeSections() {
  const scroller = useRef<HTMLDivElement>(null);

  function scrollMenu(dir: -1 | 1) {
    scroller.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  }

  return (
    <div>
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-serif text-4xl tracking-tight md:text-5xl">
              {site.about.title}{' '}
              <em className="italic font-normal">{site.about.titleAccent}</em>
            </h2>
          </Reveal>
          <Reveal delay={120} className="relative mt-10 aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
            <SiteImage
              src={site.about.image}
              alt={site.about.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1152px"
            />
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-16">
            {site.about.columns.map((text, index) => (
              <Reveal key={text.slice(0, 24)} delay={index * 100}>
                <p className="text-sm leading-7 text-brand-muted md:text-[15px]">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-4xl tracking-tight md:text-5xl">Our Menu</h2>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous dishes"
                onClick={() => scrollMenu(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-fg/25 text-sm transition duration-300 hover:bg-brand-fg hover:text-brand-bg"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next dishes"
                onClick={() => scrollMenu(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-fg/25 text-sm transition duration-300 hover:bg-brand-fg hover:text-brand-bg"
              >
                →
              </button>
            </div>
          </Reveal>
          <div
            ref={scroller}
            className="mt-10 flex gap-5 overflow-x-auto pb-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {site.menuHighlights.map((item, index) => (
              <Reveal key={item.title} delay={index * 80} as="article" className="group w-[220px] shrink-0 md:w-[260px]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <SiteImage
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="img-zoom object-cover"
                    sizes="260px"
                  />
                </div>
                <p className="mt-3 text-sm italic text-brand-muted">{item.category}</p>
                <h3 className="mt-1 font-serif text-lg transition-colors duration-300 group-hover:text-brand-accent">
                  {item.title}
                </h3>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200} className="mt-8">
            <Link
              href="/menu"
              className="inline-flex rounded-button border border-brand-fg px-6 py-2.5 text-sm transition duration-300 hover:bg-brand-fg hover:text-brand-bg"
            >
              View full menu
            </Link>
          </Reveal>
        </div>
      </section>

      <section id="events" className="px-5 pb-20 md:pb-28">
        <div className="mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <Reveal className="relative aspect-[3/4] overflow-hidden">
            <SiteImage
              src={site.events.image}
              alt={site.events.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </Reveal>
          <div>
            <Reveal>
              <h2 className="font-serif text-4xl tracking-tight md:text-5xl">
                {site.events.title}{' '}
                <em className="italic font-normal">{site.events.titleAccent}</em>
              </h2>
            </Reveal>
            <ul className="mt-10 space-y-8">
              {site.events.items.map((event, index) => (
                <Reveal key={event.title} as="li" delay={index * 100} className="border-t border-brand-fg/10 pt-6">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                    <span className="font-medium tracking-wide">{event.date}</span>
                    <span className="text-brand-muted">/</span>
                    <span>{event.title}</span>
                    <span className="text-brand-muted">/</span>
                    <span>{event.price}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{event.body}</p>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={280}>
              <Link
                href="/reservation"
                className="mt-10 inline-flex rounded-button border border-brand-fg px-6 py-2.5 text-sm transition duration-300 hover:bg-brand-fg hover:text-brand-bg"
              >
                {site.events.cta}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {site.testimonials.length > 0 ? (
        <section className="border-t border-brand-fg/10 px-5 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
            {site.testimonials.map((item, index) => (
              <Reveal key={item.quote} as="blockquote" delay={index * 120}>
                <p className="font-serif text-2xl leading-snug tracking-tight md:text-3xl">
                  “{item.quote}”
                </p>
                <footer className="mt-5 text-sm text-brand-muted">
                  {item.name}
                  {item.role ? ` · ${item.role}` : ''}
                </footer>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
