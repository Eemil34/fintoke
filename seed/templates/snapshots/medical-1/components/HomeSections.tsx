import Link from 'next/link';
import { SiteImage } from '@/components/SiteImage';
import { site } from '@/lib/site';

export function HomeSections() {
  return (
    <div>
      {/* About */}
      <section className="bg-brand-soft px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{site.about.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-fg md:text-4xl">
              {site.about.title}
            </h2>
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-brand">{site.about.visionTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{site.about.vision}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand">{site.about.missionTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{site.about.mission}</p>
              </div>
            </div>
            <Link
              href="/about"
              className="mt-8 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
            >
              {site.about.cta}
            </Link>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-xl shadow-brand/10">
            <SiteImage
              src={site.images.about}
              alt="Medwell care team with patients"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>

          <div className="space-y-8 lg:pl-2">
            {site.stats.map((stat) => (
              <div key={stat.label} className="border-l-2 border-brand/30 pl-5">
                <p className="text-4xl font-semibold tracking-tight text-brand md:text-5xl">{stat.value}</p>
                <p className="mt-1 text-sm text-brand-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-brand px-5 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Comprehensive Care For{' '}
              <em className="font-serif italic text-teal-100">Everyday</em> Hospital Needs
            </h2>
            <p className="mt-4 text-sm leading-6 text-teal-50/80">
              Specialist departments coordinated around one patient journey — from triage to recovery.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {site.features.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-2xl bg-white p-6 text-brand-fg shadow-lg shadow-brand-deep/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <ServiceIcon index={index} />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{feature.body}</p>
                <Link href="/treatments" className="mt-5 inline-flex text-sm font-semibold text-brand">
                  Learn More →
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/treatments"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl">
              <SiteImage
                src={site.images.why1}
                alt="Calm hospital care environment"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <SiteImage
                src={site.images.why2}
                alt="Supportive clinical setting"
                fill
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <SiteImage
                src={site.images.why3}
                alt="Recovery and wellbeing space"
                fill
                className="object-cover"
                sizes="25vw"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Why Choose Us</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {site.whyChoose.titleBefore}
              <em className="font-serif italic text-brand">{site.whyChoose.titleEmphasis}</em>
              {site.whyChoose.titleAfter}
            </h2>
            <ul className="mt-8 space-y-6">
              {site.whyChoose.items.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <WhyIcon index={index} />
                  </span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-brand-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/about"
              className="mt-8 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
            >
              {site.whyChoose.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="relative overflow-hidden bg-brand-deep px-5 py-24 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 12% 18%, rgba(255,255,255,0.16), transparent 42%), radial-gradient(ellipse at 88% 72%, rgba(94,234,212,0.12), transparent 38%), radial-gradient(circle at 50% 100%, rgba(255,255,255,0.06), transparent 45%)',
          }}
        />
        <svg
          className="pointer-events-none absolute -bottom-1 left-0 w-full text-brand-soft"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,48 C240,90 480,0 720,28 C960,56 1200,96 1440,40 L1440,90 L0,90 Z"
          />
        </svg>

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-teal-100 backdrop-blur">
              {site.process.eyebrow}
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
              {site.process.titleBefore}
              <em className="font-serif italic text-teal-100">{site.process.titleEmphasis}</em>
              {site.process.titleAfter}
            </h2>
            <p className="mt-4 text-sm leading-7 text-teal-50/80 md:text-base">
              {site.process.subtitle}
            </p>
          </div>

          <div className="relative mt-16">
            <div
              className="pointer-events-none absolute left-[16%] right-[16%] top-[7.25rem] hidden h-px bg-gradient-to-r from-transparent via-teal-200/50 to-transparent md:block"
              aria-hidden
            />

            <div className="grid gap-6 md:grid-cols-3 md:gap-7">
              {site.process.steps.map((step, index) => (
                <article
                  key={step.number}
                  className="group relative overflow-hidden rounded-[1.75rem] bg-white text-brand-fg shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_70px_-24px_rgba(0,0,0,0.6)]"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <SiteImage
                      src={step.image}
                      alt={step.imageAlt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/55 via-brand-deep/10 to-transparent" />
                    <span className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-bold tracking-wide text-brand shadow-lg">
                      {step.number}
                    </span>
                    {index < site.process.steps.length - 1 ? (
                      <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-teal-100 text-brand-deep md:flex">
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                          <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4z" />
                        </svg>
                      </span>
                    ) : null}
                  </div>

                  <div className="p-7">
                    <div className="mb-4 h-1 w-10 rounded-full bg-brand/25 transition group-hover:w-16 group-hover:bg-brand" />
                    <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-brand-muted">{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-brand-soft px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Trusted By Families, Valued By{' '}
              <em className="font-serif italic text-brand">Patients</em>.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {site.testimonials.map((item, index) => {
              const avatars = [site.images.avatar1, site.images.avatar2, site.images.avatar3];
              return (
                <blockquote
                  key={item.quote}
                  className="rounded-2xl border border-brand-fg/5 bg-white p-7 shadow-sm"
                >
                  <p className="text-base leading-7 text-brand-fg">“{item.quote}”</p>
                  <footer className="mt-6 flex items-center gap-3">
                    <span className="relative h-11 w-11 overflow-hidden rounded-full">
                      <SiteImage
                        src={avatars[index % avatars.length]}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-brand-muted">{item.role}</p>
                    </div>
                  </footer>
                </blockquote>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceIcon({ index }: { index: number }) {
  const paths = [
    'M12 3v18M4 12h16',
    'M4 7h16v10H4zM8 7V5h8v2M9 12h6',
    'M8 4l4 4 4-4M12 8v12M7 16h10',
    'M9 4h6v6l4 8H5l4-8V4z',
    'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    'M6 18V8m0 0a3 3 0 1 1 6 0v4m6 6V9a3 3 0 0 0-6 0',
  ];
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[index % paths.length]} />
    </svg>
  );
}

function WhyIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 19a7 7 0 0 1 14 0" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 11h16v8H4z" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
