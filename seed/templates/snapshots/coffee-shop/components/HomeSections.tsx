import Link from 'next/link';
import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';
import { site } from '@/lib/site';

const roasts = [
  {
    name: 'Crew House Blend',
    note: 'Chocolate · Hazelnut · Smooth',
    price: '$18',
    id: 'photo-1495474472287-4d71bcdd2085',
    alt: 'Coffee being poured',
  },
  {
    name: 'Sunrise Espresso',
    note: 'Caramel · Citrus · Bold',
    price: '$20',
    id: 'photo-1497935586351-b67a49e012bf',
    alt: 'Espresso cups',
  },
  {
    name: "Baker's Single Origin",
    note: 'Berry · Honey · Bright',
    price: '$24',
    id: 'photo-1501339847302-ac426a4a7cbb',
    alt: 'Cafe counter',
  },
];

const pastries = [
  {
    name: 'Butter Croissants',
    id: 'photo-1555507036-ab1f4038808a',
    alt: 'Croissants',
  },
  {
    name: 'Fresh Country Loaf',
    id: 'photo-1509440159596-0249088772ff',
    alt: 'Fresh bread',
  },
  {
    name: 'Morning Spiced Bun',
    id: 'photo-1596040033229-a9821ebd058d',
    alt: 'Spices and ingredients',
  },
];

export function HomeSections() {
  return (
    <>
      <section id="shop" className="bg-cream-soft py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="max-w-xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-olive-dark">
              Shop roasts
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none tracking-tight text-espresso md:text-5xl">
              Small-batch beans for every brew
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-espresso/70">
              From house espresso to single-origin pour-overs — roasted weekly and packed for peak flavor.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {roasts.map((roast, index) => (
              <article key={roast.name} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-espresso-mid">
                  <SiteImage
                    src={unsplash(roast.id, 900)}
                    alt={roast.alt}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={index === 0}
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-espresso">
                      {roast.name}
                    </h3>
                    <p className="mt-1 text-sm text-espresso/60">{roast.note}</p>
                  </div>
                  <p className="font-display text-lg text-olive-dark">{roast.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative overflow-hidden bg-espresso-deep py-20 text-cream md:py-28">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden">
              <SiteImage
                src={unsplash('photo-1517433670267-08bbd4be890f', 1200)}
                alt="Bakery interior"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden w-[46%] overflow-hidden border-[6px] border-espresso-deep md:block">
              <div className="relative aspect-square">
                <SiteImage
                  src={unsplash('photo-1556910103-1c02745aae4d', 700)}
                  alt="Home kitchen cooking"
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-olive-soft">
              Our craft
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl">
              From bean to brew, layered with care
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-cream/75">
              Coffee Crew began as a neighborhood roasting bench. Today we still cup every lot by hand,
              chase clarity in every pour, and serve drinks built for lingering mornings and late-day resets.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-cream/80">
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-olive" />
                Ethically sourced lots roasted in small weekly batches
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-olive" />
                Barista-trained team focused on texture and balance
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-olive" />
                Fresh pastries baked beside the espresso bar each dawn
              </li>
            </ul>
            <Link
              href="#contact"
              className="mt-9 inline-flex bg-olive px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-espresso-deep transition hover:bg-olive-soft"
            >
              Visit the shop
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-olive-dark">
                Bakery case
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none tracking-tight text-espresso md:text-5xl">
                Warm breads &amp; morning pastry
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-espresso/65">
              Pair your cup with croissants, country loaves, and spice-kissed bakes made for the coffee bar.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {pastries.map((item) => (
              <figure key={item.name} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-espresso-mid">
                  <SiteImage
                    src={unsplash(item.id, 800)}
                    alt={item.alt}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <figcaption className="mt-3 font-display text-lg uppercase tracking-wide text-espresso">
                  {item.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-espresso/10 bg-cream-soft py-20 md:py-24">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:gap-16">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-olive-dark">
              Visit us
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none tracking-tight text-espresso md:text-5xl">
              Pull up a stool
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-espresso/70">
              Come for the layered latte, stay for the roast notes and the quiet corner by the window.
            </p>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="font-display text-xs uppercase tracking-[0.2em] text-olive-dark">Address</dt>
                <dd className="mt-1 text-espresso/80">{site.address}</dd>
              </div>
              <div>
                <dt className="font-display text-xs uppercase tracking-[0.2em] text-olive-dark">Hours</dt>
                <dd className="mt-1 text-espresso/80">{site.hours}</dd>
              </div>
              <div>
                <dt className="font-display text-xs uppercase tracking-[0.2em] text-olive-dark">Contact</dt>
                <dd className="mt-1 text-espresso/80">
                  {site.phone}
                  <br />
                  {site.email}
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative min-h-[320px] overflow-hidden bg-espresso">
            <SiteImage
              src={unsplash('photo-1501339847302-ac426a4a7cbb', 1100)}
              alt="Cafe counter"
              fill
              className="object-cover opacity-90"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-deep/80 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 font-display text-2xl uppercase leading-tight text-cream">
              Walk-ins welcome · Online pickup ready
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
