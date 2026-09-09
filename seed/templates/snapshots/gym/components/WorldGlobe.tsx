'use client';

import { SiteImage } from './SiteImage';

const CITIES = [
  { name: 'New York', top: '36%', left: '26%' },
  { name: 'Los Angeles', top: '42%', left: '15%' },
  { name: 'São Paulo', top: '68%', left: '32%' },
  { name: 'London', top: '30%', left: '48%' },
  { name: 'Berlin', top: '32%', left: '52%' },
  { name: 'Dubai', top: '46%', left: '63%' },
  { name: 'Cape Town', top: '74%', left: '53%' },
  { name: 'Tokyo', top: '38%', left: '84%' },
  { name: 'Singapore', top: '56%', left: '76%' },
  { name: 'Sydney', top: '72%', left: '87%' },
];

export function WorldGlobe() {
  return (
    <div className="relative overflow-hidden border border-ink-line bg-ink-soft">
      <div className="relative aspect-[950/620] w-full">
        <SiteImage
          src="/images/world-map.svg"
          alt="World map of FFL club cities"
          fill
          className="object-cover object-center opacity-95"
          sizes="(max-width: 1280px) 100vw, 1100px"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,9,14,0.35),transparent_30%,rgba(7,9,14,0.45))]" />

        {CITIES.map((city) => (
          <div
            key={city.name}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ top: city.top, left: city.left }}
          >
            <span className="relative block h-2 w-2 rounded-full bg-electric shadow-[0_0_0_3px_rgba(79,140,255,0.25)]" />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 whitespace-nowrap border border-ink-line bg-ink/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm sm:text-[11px]">
              {city.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
