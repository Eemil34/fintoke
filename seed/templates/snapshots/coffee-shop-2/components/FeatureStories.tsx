import { SiteImage } from '@/components/SiteImage';
import { cafe, uploads } from '@/lib/site';

function ScallopBadge({ n }: { n: string }) {
  return (
    <div
      className="relative mb-6 flex h-12 w-12 items-center justify-center text-parchment-soft"
      aria-hidden
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full text-roast" fill="currentColor">
        <path d="M24 2c2.2 2.2 4.8 2.2 7 0 1.4 2.8 3.8 3.8 6.6 3.4 0 2.9 1.6 5.2 4.2 6.6-1.4 2.6-1.4 5.4 0 8-2.6 1.4-4.2 3.7-4.2 6.6-2.8-.4-5.2.6-6.6 3.4-2.2-2.2-4.8-2.2-7 0-1.4-2.8-3.8-3.8-6.6-3.4 0-2.9-1.6-5.2-4.2-6.6 1.4-2.6 1.4-5.4 0-8 2.6-1.4 4.2-3.7 4.2-6.6 2.8.4 5.2-.6 6.6-3.4z" />
      </svg>
      <span className="relative font-display text-base italic leading-none">{n}</span>
    </div>
  );
}

export function FeatureStories() {
  return (
    <section id="features" className="relative overflow-hidden px-5 py-14 md:px-8 md:py-20">
      <div className="pointer-events-none absolute -left-20 top-32 h-64 w-64 rounded-full bg-gold/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-72 w-72 rounded-full bg-roast/[0.04] blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-[1200px] space-y-24 md:space-y-32">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="order-2 md:order-1">
            <ScallopBadge n="01" />
            <h2 className="font-display text-[clamp(2.35rem,5vw,3.6rem)] font-semibold italic leading-[1.02] text-roast">
              Quality Craftsmanship
            </h2>
            <div className="mt-5 h-px w-16 bg-roast/25" />
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-roast/65 md:text-[16px]">
              Every batch is roasted by hand with precision timing and careful heat control. We chase balance —
              bright aromatics, a silky body, and a clean finish that lingers without bitterness.
            </p>
            <a
              href="#products"
              className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-roast transition hover:gap-3"
            >
              Taste the difference <span aria-hidden>→</span>
            </a>
          </div>
          <div className="relative order-1 aspect-[4/5] overflow-hidden bg-parchment-card p-8 shadow-[0_24px_60px_rgba(42,27,20,0.08)] md:order-2 md:aspect-[5/6] md:p-10">
            <div className="relative h-full w-full">
              <SiteImage
                src={uploads.hero}
                alt="Crafted iced Caffiora coffee"
                fill
                className="object-contain object-center transition duration-700 hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
          </div>
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden bg-parchment-card shadow-[0_24px_60px_rgba(42,27,20,0.08)] md:aspect-[5/6]">
            <SiteImage
              src={cafe.pour}
              alt="Freshly poured specialty coffee"
              fill
              className="object-cover transition duration-700 hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-roast/25 via-transparent to-transparent" />
          </div>
          <div>
            <ScallopBadge n="02" />
            <h2 className="font-display text-[clamp(2.35rem,5vw,3.6rem)] font-semibold italic leading-[1.02] text-roast">
              Style for Every Sip
            </h2>
            <div className="mt-5 h-px w-16 bg-roast/25" />
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-roast/65 md:text-[16px]">
              From cold brew to espresso-forward classics, our collection is designed for the way you actually drink —
              at home, on the move, or shared across the table.
            </p>
            <a
              href="#products"
              className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-roast transition hover:gap-3"
            >
              Explore styles <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
