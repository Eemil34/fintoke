import { SiteImage } from '@/components/SiteImage';
import { products } from '@/lib/site';

const tabs = ['Popular', 'Espresso', 'Cold Brew', 'Light Roast', 'Dark Roast'] as const;

export function Collection() {
  return (
    <section id="products" className="relative mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-28">
      <div className="mb-12 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-roast/45">
            Shop
          </p>
          <h2 className="font-display text-[clamp(2.5rem,5.5vw,4rem)] font-semibold italic leading-[0.95] text-roast">
            Explore our collection
          </h2>
        </div>
        <p className="max-w-xs text-[14px] leading-relaxed text-roast/60 md:text-right">
          Curated roasts and cold drinks selected for aroma, texture, and everyday ritual.
        </p>
      </div>

      <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-roast/15 pb-5">
        <div className="flex flex-wrap gap-5 md:gap-8">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`text-[13px] transition ${
                i === 0
                  ? 'font-semibold text-roast underline decoration-roast/50 underline-offset-8'
                  : 'text-roast/45 hover:text-roast'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <a href="#products" className="group text-[13px] font-medium text-roast/70 hover:text-roast">
          Shop All
          <span className="inline-block transition group-hover:translate-x-1"> →</span>
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {products.map((product) => (
          <article
            key={product.name}
            className="group rounded-sm border border-roast/10 bg-parchment-card px-5 pb-6 pt-5 transition duration-500 hover:-translate-y-1.5 hover:border-roast/20 hover:shadow-[0_22px_48px_rgba(42,27,20,0.1)]"
          >
            <div className="mb-2 flex justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-parchment-soft px-2.5 py-1 text-[12px] text-roast/75">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-gold" fill="currentColor" aria-hidden>
                  <path d="M8 1.2l1.8 3.7 4 .6-2.9 2.8.7 4.1L8 10.6 4.4 12.4l.7-4.1L2.2 5.5l4-.6L8 1.2z" />
                </svg>
                {product.rating}
              </span>
            </div>

            <div className="relative mx-auto aspect-square max-w-[260px] overflow-hidden">
              <SiteImage
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 80vw, 280px"
              />
            </div>

            <button
              type="button"
              className="mt-6 text-[13px] font-semibold text-roast underline decoration-roast/25 underline-offset-4 transition hover:decoration-roast"
            >
              Add to Cart →
            </button>

            <h3 className="mt-3 font-display text-[1.7rem] font-semibold italic leading-tight text-roast md:text-[1.9rem]">
              {product.name}
            </h3>

            <div className="mt-5 flex items-center justify-between border-t border-roast/15 pt-4 text-[13px] text-roast/65">
              <span>{product.note}</span>
              <span className="font-display text-lg italic text-roast">{product.price}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
