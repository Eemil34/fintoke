import { SiteHeader } from '../components/SiteHeader';
import { SiteImage } from '../components/SiteImage';

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const TRUST = [
  'Licensed & Insured',
  'Built for Real Homes',
  'Clear Estimates',
  'On-time Builds',
];

const SERVICES = [
  {
    title: 'Custom Decks',
    copy: 'Pressure-treated, composite, and hardwood decks sized for how you actually live outside.',
    src: img('photo-1500382017468-9049fed747ef', 900),
  },
  {
    title: 'Patios & Hardscape',
    copy: 'Stone, paver, and concrete patios that drain well, age well, and host every season.',
    src: img('photo-1517248135467-4c7edcad34c4', 900),
  },
  {
    title: 'Pergolas & Shade',
    copy: 'Covered structures that cut glare, add height, and make summer evenings usable.',
    src: img('photo-1470337458703-46ad1756a187', 900),
  },
  {
    title: 'Porches & Entries',
    copy: 'Welcoming front and rear porches with railings, steps, and lighting done right.',
    src: img('photo-1514933651103-005eec06c04b', 900),
  },
];

const PROJECTS = [
  {
    title: 'Cedar Lounge Deck',
    meta: 'Backyard · 420 sq ft',
    src: img('photo-1500382017468-9049fed747ef', 1100),
  },
  {
    title: 'Evening Patio Room',
    meta: 'Hardscape · String lights',
    src: img('photo-1517248135467-4c7edcad34c4', 1100),
  },
  {
    title: 'Family Gathering Yard',
    meta: 'Deck + lawn · Play zone',
    src: img('photo-1504674900247-0877df9cc836', 1100),
  },
];

const POSTS = [
  {
    title: 'How to size a deck for real entertaining',
    meta: 'Planning · 5 min read',
    src: img('photo-1556910103-1c02745aae4d', 800),
  },
  {
    title: 'Composite vs wood: a homeowner guide',
    meta: 'Materials · 7 min read',
    src: img('photo-1596040033229-a9821ebd058d', 800),
  },
  {
    title: 'Lighting that makes outdoor nights feel finished',
    meta: 'Design · 4 min read',
    src: img('photo-1544148103-0773bf10d330', 800),
  },
];

function ArrowRight({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8h9M8.5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 3.75h3.2l1.1 3.2-2 1.2a12.5 12.5 0 0 0 5.05 5.05l1.2-2 3.2 1.1v3.2a2 2 0 0 1-2.15 2A15.75 15.75 0 0 1 3.75 5.9a2 2 0 0 1 2-2.15z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white">
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.5 8.2 6.4 11l6.1-6.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-gold" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1.8l2.2 5.1 5.5.5-4.2 3.6 1.3 5.3L10 13.7 5.2 16.3l1.3-5.3L2.3 7.4l5.5-.5L10 1.8z" />
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main id="home" className="bg-mist-soft text-ink">
      <section className="relative min-h-[100svh] overflow-hidden text-white">
        <div className="absolute inset-0">
          <SiteImage
            src={img('photo-1470337458703-46ad1756a187', 2400)}
            alt="Warm outdoor lounge with string lights and crafted wood structures"
            fill
            priority
            className="object-cover object-[72%_center] scale-[1.04]"
            sizes="100vw"
          />
        </div>
        <div className="hero-overlay absolute inset-0" />
        <div className="hero-tint absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#0E1410]/40 to-transparent" />

        <SiteHeader />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end pb-8 pt-28 sm:justify-center sm:pb-14 sm:pt-32">
          <div className="section-pad mx-auto grid w-full max-w-site gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
            <div className="max-w-[34rem]">
              <p className="eyebrow animate-rise">Your Partner in Outdoor Living</p>
              <h1 className="mt-5 animate-rise-delay font-display text-[2.45rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.45rem]">
                Build Outdoor Space Made for Better Living
              </h1>
              <p className="mt-5 max-w-[28rem] animate-rise-delay-2 text-[15px] leading-relaxed text-white/80 sm:text-[1.02rem]">
                Deckora helps homeowners plan and build decks, patios, pergolas, porches, and outdoor
                spaces that feel useful, warm, and ready for everyday life.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 animate-rise-delay-2">
                <a href="#contact" className="btn-lime">
                  Schedule Service
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </a>
                <a href="tel:+15551234567" className="btn-outline-light">
                  <PhoneIcon />
                  Call Now
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-3.5 animate-rise-delay-3">
                <div className="flex -space-x-2.5">
                  {[
                    img('photo-1577219491135-ce391730fb2c', 120),
                    img('photo-1559339352-11d035aa65de', 120),
                    img('photo-1544025162-d76694265947', 120),
                    img('photo-1513475382585-d06e58bcb0e0', 120),
                  ].map((src, i) => (
                    <span
                      key={src}
                      className="relative h-10 w-10 overflow-hidden rounded-full border-[2.5px] border-ink ring-1 ring-white/10"
                      style={{ zIndex: 4 - i }}
                    >
                      <SiteImage
                        src={src}
                        alt={`Homeowner ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <Stars />
                  <p className="text-xs text-white/70 sm:text-sm">4.9 rating from local homeowners.</p>
                </div>
              </div>

              <ul className="mt-11 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-7 sm:gap-x-7">
                {TRUST.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[12px] text-white/90 sm:text-[13px]">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-start pb-2 lg:justify-end lg:pb-4">
              <a
                href="#projects"
                className="group animate-float relative w-full max-w-[17rem] overflow-hidden rounded-[1.35rem] bg-white p-2.5 text-ink shadow-lift"
              >
                <div className="relative aspect-[16/10.5] overflow-hidden rounded-[1rem]">
                  <SiteImage
                    src={img('photo-1500382017468-9049fed747ef', 800)}
                    alt="Finished backyard deck project with lawn"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="272px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-60" />
                </div>
                <div className="flex items-center justify-between gap-3 px-2.5 py-3.5">
                  <p className="text-[15px] font-semibold leading-snug tracking-tight">
                    320+ Projects
                    <span className="block text-[13px] font-medium text-ink-muted">completed</span>
                  </p>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink transition duration-300 group-hover:bg-lime">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                      <path
                        d="M4 12 L12 4 M6.5 4 H12 V9.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section-pad mx-auto max-w-site py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] sm:aspect-[5/4] lg:aspect-[4/5]">
            <SiteImage
              src={img('photo-1577219491135-ce391730fb2c', 1200)}
              alt="Deckora craftsman reviewing outdoor build details"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <p className="font-display text-2xl font-semibold">Built with care, not shortcuts.</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-muted">About Deckora</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Outdoor living partners for homes that get used
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              We plan around how your family moves through the yard—morning coffee, weekend cookouts,
              quiet evenings under the lights. Every estimate is clear, every schedule is shared, and
              every detail is finished for weather that does not wait.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-mist-line pt-8">
              {[
                ['12+', 'Years building'],
                ['320+', 'Homes finished'],
                ['98%', 'Would refer'],
              ].map(([stat, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl font-semibold text-ink sm:text-3xl">{stat}</dt>
                  <dd className="mt-1 text-xs text-ink-muted sm:text-sm">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section id="services" className="bg-ink text-white">
        <div className="section-pad mx-auto max-w-site py-20 sm:py-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Services</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything your outdoor space needs to feel finished
              </h2>
            </div>
            <a href="#contact" className="btn-lime w-fit shrink-0">
              Start a project
              <ArrowRight />
            </a>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <article key={service.title} className="group overflow-hidden rounded-[1.5rem] bg-ink-soft">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SiteImage
                    src={service.src}
                    alt={service.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="font-display text-xl font-semibold">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{service.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section-pad mx-auto max-w-site py-20 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-muted">Projects</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Recent outdoor builds across local neighborhoods
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <article key={project.title} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                <SiteImage
                  src={project.src}
                  alt={project.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/70">{project.meta}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold">{project.title}</h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad mx-auto max-w-site pb-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lime via-lime-soft to-lime-deep px-6 py-12 text-ink sm:px-10 sm:py-14">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-ember/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready for a clear estimate and a build timeline you can trust?
              </h2>
              <p className="mt-4 max-w-lg text-base text-ink/75">
                Tell us about your yard, your goals, and your season. We will walk the site, sketch
                options, and send a fixed-scope estimate—no pressure, no vague ranges.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-soft"
              >
                Get Free Estimate
                <ArrowRight />
              </a>
              <a
                href="tel:+15551234567"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white/40 px-5 py-3 text-sm font-semibold text-ink backdrop-blur-sm"
              >
                <PhoneIcon />
                (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="blog" className="section-pad mx-auto max-w-site py-20 sm:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-muted">Blog</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Practical notes from the build yard
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {POSTS.map((post) => (
            <article key={post.title} className="group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <SiteImage
                  src={post.src}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-ink-muted">{post.meta}</p>
              <h3 className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-ink-soft">
                {post.title}
              </h3>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="bg-ink text-white">
        <div className="section-pad mx-auto grid max-w-site gap-12 py-20 sm:py-28 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Contact</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Tell us about the space you want to live in
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
              Share a few details and we will follow up within one business day with next steps for
              a free on-site estimate.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/80">
              <li>hello@deckora.example</li>
              <li>(555) 123-4567</li>
              <li>Serving homeowners within 40 miles</li>
            </ul>
          </div>

          <form className="space-y-4 rounded-[1.5rem] bg-ink-soft p-6 sm:p-8" action="#contact">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/55">Name</span>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-white/10 bg-ink px-4 py-3 text-sm text-white outline-none ring-lime placeholder:text-white/35 focus:ring-2"
                placeholder="Alex Rivera"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/55">Email</span>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-xl border border-white/10 bg-ink px-4 py-3 text-sm text-white outline-none ring-lime placeholder:text-white/35 focus:ring-2"
                placeholder="you@email.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/55">
                Project notes
              </span>
              <textarea
                name="message"
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-ink px-4 py-3 text-sm text-white outline-none ring-lime placeholder:text-white/35 focus:ring-2"
                placeholder="Deck size, timeline, must-haves…"
              />
            </label>
            <button type="submit" className="btn-lime w-full justify-center sm:w-auto">
              Request Free Estimate
              <ArrowRight />
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-mist-line bg-mist-soft">
        <div className="section-pad mx-auto flex max-w-site flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-ember to-ember-deep">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M2 11.5 8 3l6 8.5H9.8L8 9.2 6.2 11.5H2zm3.4 1.5h5.2L8 9.8 5.4 13z"
                />
              </svg>
            </span>
            <span className="font-display text-lg font-semibold">Deckora</span>
          </div>
          <p className="text-sm text-ink-muted">© {new Date().getFullYear()} Deckora. Outdoor living, built properly.</p>
          <nav className="flex flex-wrap gap-5 text-sm text-ink-muted">
            <a href="#services" className="hover:text-ink">
              Services
            </a>
            <a href="#projects" className="hover:text-ink">
              Projects
            </a>
            <a href="#contact" className="hover:text-ink">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
