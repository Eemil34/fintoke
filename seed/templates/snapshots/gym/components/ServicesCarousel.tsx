'use client';

import { useState } from 'react';
import { SiteImage } from './SiteImage';

type Service = {
  title: string;
  src: string;
  alt: string;
};

export function ServicesCarousel({ services }: { services: Service[] }) {
  const [index, setIndex] = useState(0);
  const pageSize = 3;
  const max = Math.max(0, services.length - pageSize);
  const visible = services.slice(index, index + pageSize);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-6">
        <p className="max-w-xl text-[15px] leading-relaxed text-mist">
          Personal coaching, dense group sessions, and dedicated strength / conditioning zones —
          programmed so every visit has a purpose.
        </p>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            aria-label="Previous"
            disabled={index === 0}
            className="grid h-11 w-11 place-items-center border border-ink-line text-white transition hover:border-electric disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(max, i + 1))}
            aria-label="Next"
            disabled={index >= max}
            className="grid h-11 w-11 place-items-center bg-electric text-ink transition hover:bg-electric-bright disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((service) => (
          <article key={service.title} className="group relative overflow-hidden">
            <div className="relative aspect-[4/5]">
              <SiteImage
                src={service.src}
                alt={service.alt}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <h3 className="font-display text-2xl font-semibold tracking-wide text-white">
                  {service.title}
                </h3>
                <span className="grid h-9 w-9 place-items-center bg-electric text-sm text-ink transition group-hover:bg-white">
                  ↗
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
