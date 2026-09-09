import { SiteHeader } from '../components/SiteHeader';
import { SiteImage } from '../components/SiteImage';

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const STATS = [
  { value: '200+', label: 'Completed Projects' },
  { value: '20+', label: 'Years Experience' },
  { value: '80+', label: 'Expert Crews' },
  { value: '10%', label: 'Repeat Callbacks' },
];

const SERVICES = [
  {
    title: 'Roof Installation',
    copy: 'New roofs built with premium materials, precise flashing, and warranties that protect your home for decades.',
    src: '/images/service-roof.svg',
  },
  {
    title: 'Roof Repair',
    copy: 'Fast leak detection, shingle replacement, and structural fixes that stop damage before it spreads indoors.',
    src: img('photo-1500382017468-9049fed747ef', 900),
  },
  {
    title: 'Inspection & Maintenance',
    copy: 'Seasonal inspections, gutter clearing, and preventive care that keep your roof storm-ready year-round.',
    src: img('photo-1517248135467-4c7edcad34c4', 900),
  },
  {
    title: 'Emergency Response',
    copy: 'Storm damage triage and temporary protection when weather hits, followed by lasting permanent repairs.',
    src: img('photo-1577219491135-ce391730fb2c', 900),
  },
];

const PROCESS = [
  { step: '01', title: 'Free Estimate', copy: 'We visit your property, assess the roof, and deliver a clear written estimate.' },
  { step: '02', title: 'Material Planning', copy: 'Choose finishes and systems matched to your climate, budget, and style.' },
  { step: '03', title: 'Expert Install', copy: 'Licensed crews complete the work with daily cleanup and progress updates.' },
  { step: '04', title: 'Final Walkthrough', copy: 'We inspect every detail with you and stand behind the finished result.' },
];

const PROJECTS = [
  {
    title: 'Modern Slate Replacement',
    meta: 'Residential · Full Tear-Off',
    src: '/images/service-roof.svg',
  },
  {
    title: 'Commercial Flat Roof',
    meta: 'Warehouse · Membrane System',
    src: img('photo-1514933651103-005eec06c04b', 1100),
  },
  {
    title: 'Heritage Home Restore',
    meta: 'Victorian · Custom Flashing',
    src: img('photo-1544148103-0773bf10d330', 1100),
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Rooftix replaced our entire roof in four days. The crew was tidy, communicative, and the estimate matched the final invoice exactly.',
    name: 'Sarah Mitchell',
    role: 'Homeowner, Austin',
  },
  {
    quote:
      'After a hail storm they boarded us up the same evening and scheduled permanent repairs within a week. Truly reliable partners.',
    name: 'James Ortega',
    role: 'Property Manager',
  },
  {
    quote:
      'Professional from the first call. Their inspection caught issues other companies missed, and the new roof looks fantastic.',
    name: 'Elena Park',
    role: 'Homeowner, Dallas',
  },
];

const POSTS = [
  {
    title: 'How to spot early warning signs of roof failure',
    meta: 'Guides · 5 min read',
    src: img('photo-1556910103-1c02745aae4d', 800),
  },
  {
    title: 'Metal vs asphalt: choosing the right system',
    meta: 'Materials · 7 min read',
    src: img('photo-1596040033229-a9821ebd058d', 800),
  },
  {
    title: 'Preparing your roof for storm season',
    meta: 'Maintenance · 4 min read',
    src: img('photo-1504674900247-0877df9cc836', 800),
  },
];

function Stars() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#F5C542]" aria-label="5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 0.7 4.3L8 11.6l-3.8 2 0.7-4.3-3.1-3 4.3-.6L8 1.6z" />
        </svg>
      ))}
    </span>
  );
}

function ArrowCircle({ tone = 'dark' }: { tone?: 'dark' | 'brand' | 'light' }) {
  const styles =
    tone === 'brand'
      ? 'bg-brand text-white'
      : tone === 'light'
        ? 'bg-white text-ink'
        : 'bg-ink text-white';

  return (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${styles}`}>
      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.5 8h9M8.5 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function CheckIcon() {
  return (
    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      {/* Hero */}
      <section id="home" className="relative isolate min-h-[78vh] overflow-hidden lg:min-h-[86vh]">
        <SiteImage
          src="/uploads/d7ca8957-0412-4546-ba10-aa07b8c74d57.png"
          alt="Roofer installing dark roof tiles on a residential home"
          fill
          priority
          className="object-cover object-[78%_42%]"
          sizes="100vw"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="section-pad relative z-10 mx-auto flex max-w-site items-center pb-24 pt-16 lg:pb-28 lg:pt-24">
          <div className="max-w-2xl animate-rise">
            <p className="mb-5 flex flex-wrap items-center gap-2 text-sm text-white/90">
              <span className="font-semibold">5</span>
              <Stars />
              <span className="text-white/50">|</span>
              <span>Based on 100+ Reviews</span>
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
              We Provide Effective{' '}
              <span className="italic">Roofing Solutions</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Our team is dedicated to delivering top-tier roofing solutions. We focus on quality
              craftsmanship and client satisfaction for every project.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#contact" className="btn-brand animate-rise-delay">
                Get Your Estimate
                <ArrowCircle tone="dark" />
              </a>
              <a href="#services" className="btn-outline-light animate-rise-delay-2">
                View Services
                <ArrowCircle tone="brand" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-mist-line bg-white" aria-label="Company statistics">
        <div className="section-pad mx-auto grid max-w-site grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`animate-rise px-2 py-10 text-center sm:px-6 ${
                index > 0 ? 'border-mist-line lg:border-l' : ''
              } ${index % 2 === 1 ? 'border-l lg:border-l' : ''} ${index > 1 ? 'border-t lg:border-t-0' : ''}`}
            >
              <p className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="section-pad mx-auto max-w-site py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative animate-rise">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-mist">
              <SiteImage
                src="/uploads/d7ca8957-0412-4546-ba10-aa07b8c74d57.png"
                alt="Rooftix crew member ready for an on-site roof inspection"
                fill
                className="object-cover object-[82%_35%]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-brand px-6 py-5 text-white shadow-lift sm:left-auto sm:right-[-1.25rem] sm:w-64">
              <p className="font-display text-3xl font-extrabold">20+</p>
              <p className="mt-1 text-sm text-white/85">Years protecting homes with lasting craftsmanship</p>
            </div>
          </div>

          <div className="animate-rise-delay">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              About Us
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
              Trusted Roofing Experts with a Proven Track Record
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
              From storm repairs to full replacements, Rooftix combines licensed crews, premium
              materials, and transparent communication. Homeowners and property managers trust us
              because we treat every roof like it protects our own family.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Licensed, bonded, and fully insured crews',
                'Clear timelines and no surprise change orders',
                'Manufacturer-backed materials and workmanship warranties',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.95rem] text-ink">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a href="#contact" className="btn-brand mt-9">
              Learn More About Us
              <ArrowCircle tone="dark" />
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-mist py-20 lg:py-28">
        <div className="section-pad mx-auto max-w-site">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Our Services
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Roofing Solutions Built for Longevity
            </h2>
            <p className="mt-4 text-ink-muted">
              Comprehensive residential and commercial services delivered with the same precision on every job.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {SERVICES.map((service, index) => (
              <article
                key={service.title}
                className="group overflow-hidden rounded-[1.35rem] bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SiteImage
                    src={service.src}
                    alt={service.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{service.copy}</p>
                  <a href="#contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                    Request Service
                    <ArrowCircle tone="brand" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="pages" className="section-pad mx-auto max-w-site py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              How It Works
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              A Clear Path From Estimate to Completion
            </h2>
          </div>
          <p className="max-w-xl text-ink-muted lg:justify-self-end">
            No guesswork and no pressure. Every Rooftix project follows a transparent process so you always know what happens next.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {PROCESS.map((item) => (
            <div key={item.step} className="rounded-[1.25rem] border border-mist-line bg-white p-6 transition hover:border-brand/30 hover:shadow-soft">
              <p className="font-display text-sm font-bold tracking-[0.18em] text-brand">{item.step}</p>
              <h3 className="mt-4 font-display text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="bg-ink py-20 text-white lg:py-28">
        <div className="section-pad mx-auto max-w-site">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Recent Projects
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Craftsmanship You Can See From the Curb
              </h2>
            </div>
            <a href="#contact" className="btn-brand w-fit">
              Start Your Project
              <ArrowCircle tone="dark" />
            </a>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PROJECTS.map((project) => (
              <article key={project.title} className="group overflow-hidden rounded-[1.35rem] bg-ink-soft">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <SiteImage
                    src={project.src}
                    alt={project.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm text-white/55">{project.meta}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{project.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-pad mx-auto max-w-site py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Testimonials
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Homeowners Who Trust Rooftix
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <blockquote key={item.name} className="rounded-[1.35rem] border border-mist-line bg-mist p-7">
              <Stars />
              <p className="mt-5 text-[0.98rem] leading-relaxed text-ink/90">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-6">
                <p className="font-display font-bold text-ink">{item.name}</p>
                <p className="mt-1 text-sm text-ink-muted">{item.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section id="blog" className="bg-mist py-20 lg:py-28">
        <div className="section-pad mx-auto max-w-site">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                From the Blog
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Practical Roofing Advice
              </h2>
            </div>
            <a href="#contact" className="text-sm font-semibold text-brand">
              View all articles →
            </a>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {POSTS.map((post) => (
              <article key={post.title} className="overflow-hidden rounded-[1.35rem] bg-white shadow-soft">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SiteImage
                    src={post.src}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{post.meta}</p>
                  <h3 className="mt-3 font-display text-xl font-bold leading-snug">{post.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="section-pad mx-auto max-w-site py-20 lg:py-24">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-brand px-8 py-14 text-white sm:px-12 lg:px-16">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-black/10" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready for a Roof That Lasts?
              </h2>
              <p className="mt-4 max-w-xl text-white/85">
                Tell us about your project and we&apos;ll schedule a free on-site estimate with a clear, written proposal.
              </p>
            </div>
            <form className="space-y-3 rounded-[1.25rem] bg-white p-5 text-ink shadow-lift">
              <label className="block">
                <span className="sr-only">Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-mist-line bg-mist px-4 py-3 text-sm outline-none ring-brand/30 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  className="w-full rounded-xl border border-mist-line bg-mist px-4 py-3 text-sm outline-none ring-brand/30 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="sr-only">Message</span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Tell us about your roof"
                  className="w-full resize-none rounded-xl border border-mist-line bg-mist px-4 py-3 text-sm outline-none ring-brand/30 focus:ring-2"
                />
              </label>
              <button type="submit" className="btn-brand w-full justify-center">
                Get a Free Quote
                <ArrowCircle tone="dark" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-mist-line bg-white">
        <div className="section-pad mx-auto grid max-w-site gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold tracking-[0.04em]">ROOFTIX</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              Effective roofing solutions for homes and businesses—built on craftsmanship, clarity, and care.
            </p>
          </div>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-ink">Explore</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              <li><a href="#about" className="hover:text-brand">About</a></li>
              <li><a href="#services" className="hover:text-brand">Services</a></li>
              <li><a href="#blog" className="hover:text-brand">Blog</a></li>
              <li><a href="#contact" className="hover:text-brand">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-ink">Services</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              <li>Roof Installation</li>
              <li>Roof Repair</li>
              <li>Inspections</li>
              <li>Emergency Response</li>
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-ink">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              <li>(512) 555-0148</li>
              <li>hello@rooftix.example</li>
              <li>Mon–Sat · 7am–6pm</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-mist-line">
          <div className="section-pad mx-auto flex max-w-site flex-col gap-2 py-5 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Rooftix. All rights reserved.</p>
            <p>Licensed &amp; Insured Roofing Contractor</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
