import Link from 'next/link';
import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';
import { site } from '@/lib/site';

export function HomeSections() {
  return (
    <div>
      <section className="px-5 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">About Dentria</p>
            <p className="mt-4 max-w-2xl text-xl leading-8 text-brand-fg md:text-2xl md:leading-9">
              {site.intro}
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex rounded-button bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              More About Us
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {site.stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`rounded-[1.5rem] px-5 py-5 ${
                  index === 1 ? 'bg-brand text-white' : 'bg-brand-soft text-brand'
                }`}
              >
                <p className="font-display text-3xl font-semibold tracking-tight">{stat.value}</p>
                <p className={`mt-1 text-sm ${index === 1 ? 'text-white/75' : 'text-brand-muted'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-12 md:grid-rows-2">
            <div className="relative min-h-[220px] overflow-hidden rounded-[1.75rem] md:col-span-7 md:row-span-1 md:min-h-[260px]">
              <SiteImage
                src={unsplash('photo-1576091160399-112ba8d25d1d', 1200)}
                alt="Doctor reviewing a tablet with a patient"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>

            <article className="flex flex-col justify-between rounded-[1.75rem] bg-brand p-7 text-white md:col-span-5">
              <span className="font-display text-5xl font-semibold opacity-40">
                {site.highlights[0].number}
              </span>
              <div>
                <h3 className="text-xl font-semibold">{site.highlights[0].title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">{site.highlights[0].body}</p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[1.75rem] bg-brand p-7 text-white md:col-span-3">
              <span className="font-display text-5xl font-semibold opacity-40">
                {site.highlights[2].number}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{site.highlights[2].title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">{site.highlights[2].body}</p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[1.75rem] bg-brand-soft p-7 text-brand md:col-span-5">
              <span className="font-display text-5xl font-semibold text-brand/25">
                {site.highlights[1].number}
              </span>
              <div>
                <h3 className="text-xl font-semibold">{site.highlights[1].title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{site.highlights[1].body}</p>
              </div>
            </article>

            <div className="relative min-h-[200px] overflow-hidden rounded-[1.75rem] md:col-span-4 md:min-h-0">
              <SiteImage
                src={unsplash('photo-1516549655169-df83a0774514', 900)}
                alt="Clinic reception desk"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
              <span className="h-2 w-2 rounded-full bg-brand" />
              Why Choose Us
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-brand md:text-4xl">
              Why patients feel comfortable choosing {site.name}
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-stretch">
            <article className="flex flex-col justify-between rounded-[1.75rem] bg-brand p-8 text-white">
              <h3 className="font-display text-2xl font-semibold leading-snug">
                {site.whyChoose[0].title}
              </h3>
              <p className="mt-6 text-sm leading-7 text-white/80">{site.whyChoose[0].body}</p>
            </article>

            <div className="relative min-h-[320px] overflow-hidden rounded-[1.75rem] lg:min-h-0">
              <SiteImage
                src={unsplash('photo-1516841273335-e39b37888115', 900)}
                alt="Medical team in a clinic corridor"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>

            <article className="flex flex-col justify-between rounded-[1.75rem] bg-brand-soft p-8 text-brand">
              <h3 className="font-display text-2xl font-semibold leading-snug">
                {site.whyChoose[1].title}
              </h3>
              <p className="mt-6 text-sm leading-7 text-brand-muted">{site.whyChoose[1].body}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                Services
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Care for every smile stage
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-brand-muted">
                From quiet first visits to lasting restorations — each path starts with a clear plan, not a sales pitch.
              </p>
              <Link
                href="/treatments"
                className="mt-8 inline-flex items-center gap-2 rounded-button bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                View all treatments
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="relative hidden min-h-[220px] overflow-hidden rounded-[1.75rem] lg:block">
              <SiteImage
                src={unsplash('photo-1579684453423-f84349ef60b0', 1100)}
                alt="Clinician preparing for a procedure"
                fill
                className="object-cover"
                sizes="45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand/50 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-sm font-medium text-white">
                Modern rooms · Digital imaging · Calm pacing
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {site.features.map((feature, index) => {
              const featured = index === 0;
              return (
                <article
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-[1.75rem] p-7 transition duration-300 hover:-translate-y-1 ${
                    featured
                      ? 'bg-brand text-white md:row-span-1'
                      : index === 3
                        ? 'bg-brand-soft text-brand'
                        : 'bg-white text-brand ring-1 ring-brand/8'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`font-display text-4xl font-semibold tracking-tight ${
                        featured ? 'text-brand-accent' : 'text-brand/20'
                      }`}
                    >
                      0{index + 1}
                    </span>
                    <span
                      className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-sm transition group-hover:scale-110 ${
                        featured
                          ? 'bg-white/15 text-white'
                          : 'bg-brand/10 text-brand'
                      }`}
                      aria-hidden
                    >
                      {index === 0 ? '◎' : index === 1 ? '◇' : index === 2 ? '✧' : '○'}
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-xl font-semibold tracking-tight md:text-2xl">
                    {feature.title}
                  </h3>
                  <p
                    className={`mt-3 max-w-sm text-sm leading-7 ${
                      featured ? 'text-white/75' : 'text-brand-muted'
                    }`}
                  >
                    {feature.body}
                  </p>
                  <Link
                    href="/treatments"
                    className={`mt-6 inline-flex text-sm font-semibold underline-offset-4 transition hover:underline ${
                      featured ? 'text-brand-accent' : 'text-brand'
                    }`}
                  >
                    Learn more
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand px-6 py-12 md:px-12 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                Patient stories
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
                What people say after the chair
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/65">
              Real visits, real nerves, clearer next steps — rated 4.9★ on Google.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-12">
            <blockquote className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-white p-8 lg:col-span-7 lg:min-h-[320px]">
              <span className="font-display text-6xl leading-none text-brand/15" aria-hidden>
                “
              </span>
              <p className="mt-2 font-display text-xl font-medium leading-8 tracking-tight text-brand md:text-2xl md:leading-9">
                {site.testimonials[0].quote}
              </p>
              <footer className="mt-10 flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {site.testimonials[0].name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div>
                  <p className="font-semibold text-brand">{site.testimonials[0].name}</p>
                  <p className="text-sm text-brand-muted">{site.testimonials[0].role}</p>
                </div>
                <span className="ml-auto text-sm font-semibold text-brand-accent">★★★★★</span>
              </footer>
            </blockquote>

            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              {site.testimonials.slice(1).map((item, index) => (
                <blockquote
                  key={item.quote}
                  className={`flex flex-col justify-between rounded-[1.75rem] p-6 ${
                    index === 0
                      ? 'bg-white/10 text-white ring-1 ring-white/15'
                      : 'bg-brand-accent text-white'
                  }`}
                >
                  <p className="text-base leading-7 text-white/95">“{item.quote}”</p>
                  <footer className="mt-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      {item.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      {item.role ? <p className="text-xs text-white/75">{item.role}</p> : null}
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Pricing</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Straightforward starting fees
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {site.pricing.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[1.75rem] p-7 ${
                  plan.highlighted
                    ? 'bg-brand text-white shadow-float'
                    : 'bg-white ring-1 ring-brand/8'
                }`}
              >
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">{plan.name}</h3>
                <p className="mt-3 font-display text-4xl font-semibold">{plan.price}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className={plan.highlighted ? 'text-white/80' : 'text-brand-muted'}>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/appointment"
                  className={`mt-8 inline-flex rounded-button px-5 py-2.5 text-sm font-semibold ${
                    plan.highlighted
                      ? 'bg-brand-accent text-white'
                      : 'bg-brand text-white'
                  }`}
                >
                  Book
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">FAQ</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Questions before you book
            </h2>
            <div className="relative mt-8 hidden min-h-[280px] overflow-hidden rounded-[1.75rem] lg:block">
              <SiteImage
                src={unsplash('photo-1519494026892-80bbd2d6fd0d', 1000)}
                alt="Bright clinic corridor"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
          </div>
          <div className="space-y-3">
            {site.faq.map((item) => (
              <details
                key={item.title}
                className="group rounded-[1.25rem] bg-white p-5 ring-1 ring-brand/8 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-brand marker:content-none">
                  <span className="flex items-center justify-between gap-3">
                    {item.title}
                    <span className="text-brand-accent transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-brand-muted">{item.body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
