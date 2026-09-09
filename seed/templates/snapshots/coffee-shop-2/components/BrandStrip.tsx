import { brands } from '@/lib/site';

export function BrandStrip() {
  const row = [...brands, ...brands];

  return (
    <section
      className="relative overflow-hidden border-y border-roast/10 bg-parchment-soft/70 py-7 md:py-9"
      aria-label="Partner brands"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-parchment-soft to-transparent md:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-parchment-soft to-transparent md:w-28" />

      <div className="flex w-max animate-marquee items-center gap-12 opacity-50 md:gap-20">
        {row.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="font-display text-xl font-semibold italic tracking-wide text-roast whitespace-nowrap md:text-2xl"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
