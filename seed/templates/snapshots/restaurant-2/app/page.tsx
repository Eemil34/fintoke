import { ReservationForm } from '../components/ReservationForm';
import { SiteHeader } from '../components/SiteHeader';
import { SiteImage } from '../components/SiteImage';

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const FEATURES = [
  {
    title: 'Live Lounge Experience',
    src: img('photo-1470337458703-46ad1756a187', 800),
  },
  {
    title: 'Fine Dining Cuisine',
    src: img('photo-1414235077428-338989a2e8c0', 800),
  },
  {
    title: 'Signature Cocktails',
    src: img('photo-1551538827-9c037cb4f32a', 800),
  },
  {
    title: 'Private Dining Rooms',
    src: img('photo-1517248135467-4c7edcad34c4', 800),
  },
  {
    title: 'Wine & Spirits Selection',
    src: img('photo-1514933651103-005eec06c04b', 800),
  },
];

const BEST_SELLERS = [
  {
    meta: 'Red Wine • 750ml',
    name: 'Château Margaux 2015',
    src: img('photo-1544148103-0773bf10d330', 900),
  },
  {
    meta: 'Dry-Aged Wagyu Ribeye • 350g',
    name: 'Veloura Steak',
    src: img('photo-1600891964092-4316c288032e', 900),
  },
  {
    meta: 'Handmade Pasta • 300g',
    name: 'Black Truffle',
    src: img('photo-1504674900247-0877df9cc836', 900),
  },
];

function ArrowIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 12 L12 4 M6.5 4 H12 V9.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars() {
  return (
    <div className="flex gap-1 text-ink" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1.8l2.2 5.1 5.5.5-4.2 3.6 1.3 5.3L10 13.7 5.2 16.3l1.3-5.3L2.3 7.4l5.5-.5L10 1.8z" />
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main id="top" className="bg-cream text-ink">
      <SiteHeader />

      {/* Hero */}
      <section className="relative min-h-[100svh] overflow-hidden text-cream-soft">
        <div className="absolute inset-0 hero-media">
          <SiteImage
            src={img('photo-1514933651103-005eec06c04b', 2400)}
            alt="Veloura bar interior with warm pendant lights"
            fill
            priority
            className="object-cover brightness-[0.78]"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.62)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/65" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-center section-pad pb-28 pt-32">
          <div className="mx-auto max-w-5xl text-center">
            <p className="hero-rise hero-rise-delay-1 text-[11px] uppercase tracking-[0.42em] text-white/70">
              Dining · Lounge · Cocktails
            </p>
            <div className="hero-rule mx-auto mt-6 h-px w-16 bg-white/50" />
            <h1 className="hero-rise hero-rise-delay-2 mt-7 font-display text-[clamp(3.5rem,12vw,8.5rem)] leading-[0.9] tracking-[0.04em] text-white">
              SAVOR
              <br />
              LUXURY
            </h1>
            <p className="hero-rise hero-rise-delay-3 mx-auto mt-8 max-w-xl text-sm md:text-base leading-relaxed text-white/80 font-display">
              An exquisite dining journey where culinary artistry meets world-class cocktails in an
              atmosphere of timeless elegance.
            </p>
            <div className="hero-rise hero-rise-delay-4 mt-10 flex flex-wrap items-center justify-center gap-6">
              <a
                href="#reservations"
                className="inline-flex items-center gap-2 border border-white/40 bg-white/5 px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white backdrop-blur-sm transition hover:bg-white hover:text-ink"
              >
                Reserve a Table <ArrowIcon />
              </a>
              <a href="#menu" className="link-arrow text-white/90">
                Explore the Menu <ArrowIcon />
              </a>
            </div>
          </div>
        </div>

        <a
          href="#experience"
          className="hero-scroll absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-white/70"
          aria-label="Scroll to experience"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 5v12M7 12l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      {/* Statement + Features */}
      <section id="experience" className="bg-cream section-pad py-20 md:py-28">
        <h2 className="mx-auto max-w-4xl text-center font-display text-[clamp(1.85rem,4.8vw,3.75rem)] leading-[1.15] tracking-[0.06em] text-ink">
          WHERE EVERY FLAVOR ELEVATED BY ELEGANCE
        </h2>

        <div
          id="menu"
          className="mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5"
        >
          {FEATURES.map((feature) => (
            <article key={feature.title} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-ink/10">
                <SiteImage
                  src={feature.src}
                  alt={feature.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </div>
              <p className="mt-3 font-display text-sm md:text-[0.95rem] tracking-wide text-ink">
                {feature.title}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Signature dishes */}
      <section id="bar" className="bg-cream-soft">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-16 md:px-14 lg:px-20 md:py-24 text-center">
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-[0.14em] uppercase">
              Wagyu Risotto
            </h3>
            <p className="mt-3 text-xs uppercase tracking-[0.28em] text-ink-muted">Signature Dish</p>
            <p className="mx-auto mt-8 max-w-md font-display text-base leading-relaxed text-ink-soft">
              Arborio rice slowly stirred with black truffle butter, finished with seared A5 wagyu and
              aged Parmigiano — a composition of earth, richness, and quiet precision.
            </p>
            <a href="#menu" className="link-arrow mt-10 justify-center text-ink">
              Taste the Signature <ArrowIcon />
            </a>
          </div>
          <div className="relative min-h-[320px] md:min-h-[520px]">
            <SiteImage
              src={img('photo-1600891964092-4316c288032e', 1400)}
              alt="Plated wagyu dish"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="relative min-h-[320px] md:min-h-[520px] order-3 md:order-none">
            <SiteImage
              src={img('photo-1566417713940-fe7c737a9ef2', 1400)}
              alt="Midnight Velvet cocktail"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-8 py-16 md:px-14 lg:px-20 md:py-24 text-center order-4 md:order-none">
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-[0.14em] uppercase">
              Midnight Velvet
            </h3>
            <p className="mt-3 text-xs uppercase tracking-[0.28em] text-ink-muted">
              Signature Cocktail
            </p>
            <p className="mx-auto mt-8 max-w-md font-display text-base leading-relaxed text-ink-soft">
              Premium vodka shaken with espresso, dark cacao liqueur, and a whisper of vanilla — served
              ice-cold with a satin crema finish.
            </p>
            <a href="#bar" className="link-arrow mt-10 justify-center text-ink">
              Sip the Elegance <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-cream section-pad py-20 md:py-28">
        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="font-display text-3xl md:text-4xl tracking-[0.18em] uppercase">
              Best Sellers
            </h2>
            <p className="mt-5 max-w-sm font-display text-base leading-relaxed text-ink-soft">
              Our Most Loved Dishes &amp; Drinks, Crafted For Every Luxurious Moment.
            </p>
            <a href="#menu" className="link-arrow mt-8 text-ink">
              View Full Menu <ArrowIcon />
            </a>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
            {BEST_SELLERS.map((item) => (
              <article key={item.name} className="group relative aspect-[3/4] overflow-hidden bg-ink">
                <SiteImage
                  src={item.src}
                  alt={item.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-cream-soft">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">{item.meta}</p>
                  <h3 className="mt-2 font-display text-xl tracking-wide uppercase">{item.name}</h3>
                  <button type="button" className="link-arrow mt-4 text-white text-xs">
                    Add to Bag
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Visit / Hours */}
      <section className="relative overflow-hidden bg-ink text-cream-soft section-pad py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(168,137,104,0.16), transparent 60%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="text-center text-[11px] uppercase tracking-[0.32em] text-bronze-soft">
            Visit
          </p>
          <h2 className="mt-4 text-center font-display text-[clamp(2rem,4.5vw,3.5rem)] tracking-[0.08em] text-cream-soft">
            Evenings at Veloura
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center font-display text-base leading-relaxed text-white/70">
            A quieter pace after dusk — dinner service, live lounge sets, and cocktails crafted for
            lingering nights.
          </p>

          <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div className="border-t border-white/15 pt-6 text-center sm:text-left">
              <p className="text-[11px] uppercase tracking-[0.22em] text-bronze-soft">Hours</p>
              <ul className="mt-4 space-y-2 font-display text-cream-soft/90">
                <li>Tue – Thu · 5 PM – 11 PM</li>
                <li>Fri – Sat · 5 PM – 1 AM</li>
                <li>Sunday · 5 PM – 10 PM</li>
                <li className="text-white/45">Closed Mondays</li>
              </ul>
            </div>
            <div className="border-t border-white/15 pt-6 text-center">
              <p className="text-[11px] uppercase tracking-[0.22em] text-bronze-soft">Dress</p>
              <p className="mt-4 font-display text-cream-soft/90 leading-relaxed">
                Smart elegant. Jackets welcome; sneakers and athletic wear kindly declined.
              </p>
            </div>
            <div className="border-t border-white/15 pt-6 text-center sm:text-right">
              <p className="text-[11px] uppercase tracking-[0.22em] text-bronze-soft">Private</p>
              <p className="mt-4 font-display text-cream-soft/90 leading-relaxed">
                Two private rooms for 8–20 guests. Inquire when you reserve.
              </p>
              <a href="#reservations" className="link-arrow mt-5 inline-flex text-cream-soft">
                Reserve a Table <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-cream section-pad py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <Stars key={i} />
          ))}
        </div>
      </section>

      {/* Reservations */}
      <section id="reservations" className="bg-cream-deep section-pad py-20 md:py-28">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-center">
          <div className="text-ink">
            <p className="text-[11px] uppercase tracking-[0.32em] text-bronze">Join us</p>
            <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-[0.06em]">
              Reserve your evening
            </h2>
            <p className="mt-5 max-w-md font-display text-base leading-relaxed text-ink-soft">
              Secure a table for dinner, the lounge, or a private room. We hold seating for 15
              minutes past your reservation time.
            </p>
            <div className="mt-8 space-y-2 text-sm text-ink-muted">
              <p>12 Orchard Lane · Downtown</p>
              <p>+1 (212) 555-0198</p>
              <p>hello@veloura.dining</p>
            </div>
          </div>

          <ReservationForm />
        </div>
      </section>

      <footer className="bg-ink text-cream-soft section-pad py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-white/70">
          <p className="font-display text-xl tracking-[0.12em] text-cream-soft">Veloura</p>
          <p>© {new Date().getFullYear()} Veloura Dining &amp; Lounge</p>
        </div>
      </footer>
    </main>
  );
}
