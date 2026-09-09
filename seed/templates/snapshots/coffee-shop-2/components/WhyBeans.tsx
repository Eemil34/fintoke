import { SiteImage } from '@/components/SiteImage';
import { reasons } from '@/lib/site';

function ReasonIcon({ kind }: { kind: (typeof reasons)[number]['icon'] }) {
  if (kind === 'roast') {
    return (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M16 6v4M16 22v4M6 16h4M22 16h4M9.2 9.2l2.8 2.8M20 20l2.8 2.8M9.2 22.8l2.8-2.8M20 12l2.8-2.8" />
        <circle cx="16" cy="16" r="4.5" />
      </svg>
    );
  }
  if (kind === 'sprout') {
    return (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M16 26V14" />
        <path d="M16 18c-4-1-7-4-8-8 5 0 8 3 8 8z" />
        <path d="M16 16c4-1 7-4 8-8-5 0-8 3-8 8z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M16 25s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 24 14c0 5.8-8 11-8 11z" />
      <path d="M11 15.5c1.2 2.2 2.8 3.6 5 4.5" />
    </svg>
  );
}

export function WhyBeans() {
  return (
    <section id="about" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-roast/[0.05] blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mb-14 grid gap-6 md:mb-16 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-roast/45">
              Our promise
            </p>
            <h2 className="max-w-[14ch] font-display text-[clamp(2.75rem,6vw,4.5rem)] font-semibold italic leading-[0.92] text-roast">
              Why our beans are best
            </h2>
          </div>
          <div className="md:pb-2 md:text-right">
            <p className="mx-auto max-w-sm text-[14px] leading-relaxed text-roast/60 md:ml-auto md:mr-0">
              Three reasons every bag tastes intentional — from the farm partnership to the final roast curve.
            </p>
            <a
              href="#products"
              className="group mt-5 inline-flex items-center gap-2 border-b border-roast/30 pb-1 text-[13px] font-semibold text-roast transition hover:border-roast"
            >
              See Brands
              <span className="transition group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </a>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {reasons.map((item, index) => (
            <article
              key={item.title}
              className={`group relative flex flex-col overflow-hidden bg-parchment-card transition duration-500 hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(42,27,20,0.14)] ${
                index === 1 ? 'md:-mt-6 md:mb-6' : ''
              }`}
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <SiteImage
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-roast/55 via-roast/10 to-transparent" />
                <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-parchment-soft/95 text-roast shadow-[0_8px_24px_rgba(42,27,20,0.2)]">
                  <ReasonIcon kind={item.icon} />
                </div>
                <span className="absolute bottom-4 left-4 font-display text-4xl italic text-parchment-soft/90 md:text-5xl">
                  0{index + 1}
                </span>
              </div>

              <div className="flex flex-1 flex-col px-6 py-7 md:px-7 md:py-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-roast/45">
                  {item.note}
                </p>
                <h3 className="mt-2 font-display text-[1.85rem] font-semibold italic leading-tight text-roast md:text-[2rem]">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-roast/65 md:text-[15px]">
                  {item.body}
                </p>
                <div className="mt-6 h-px w-full bg-roast/10" />
                <a
                  href="#products"
                  className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-roast/70 transition group-hover:text-roast"
                >
                  Discover more
                  <span className="transition group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
