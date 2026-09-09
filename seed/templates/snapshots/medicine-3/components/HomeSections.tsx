import Link from 'next/link';
import { SiteImage } from '@/components/SiteImage';
import { FaqAccordion } from '@/components/FaqAccordion';
import { unsplash } from '@/lib/imageLibrary';
import { site } from '@/lib/site';

export function HomeSections() {
  return (
    <div>
      {/* Stats */}
      <section className="px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center text-sm text-brand-muted">{site.trustedBy}</p>
          <div className="mb-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {site.partners.map((partner) => (
              <span key={partner} className="text-sm font-semibold tracking-wide text-brand-fg/35">
                {partner}
              </span>
            ))}
          </div>
          <div className="grid gap-6 rounded-[1.75rem] bg-brand-surface px-6 py-8 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            {site.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-brand">{stat.value}</p>
                <p className="mt-1 text-sm text-brand-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-brand-soft/60 px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-semibold text-brand">{site.whyChoose.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{site.whyChoose.title}</h2>
            <p className="mt-4 text-brand-muted">{site.whyChoose.subtitle}</p>

            <div className="mt-10 space-y-5">
              {site.whyChoose.pillars.map((pillar, index) => (
                <div key={pillar.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-fg text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{pillar.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-brand-muted">{pillar.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[1.75rem]">
              <SiteImage
                src={unsplash('photo-1576091160399-112ba8d25d1d', 1200)}
                alt="Doctor reviewing patient information on a tablet"
                width={800}
                height={560}
                className="h-[320px] w-full object-cover md:h-[380px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark/90 to-transparent p-6 text-white">
                <h3 className="text-lg font-semibold">{site.whyChoose.highlights[0].title}</h3>
                <p className="mt-1 text-sm text-white/80">{site.whyChoose.highlights[0].body}</p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-button bg-brand px-4 py-2 text-xs font-semibold"
                >
                  View More
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {site.whyChoose.highlights.slice(1).map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-2xl bg-brand-surface px-5 py-4 shadow-sm"
                >
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-brand-muted">{item.body}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                    →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-3">
          {site.whyChoose.badges.map((badge) => (
            <article key={badge.title} className="rounded-2xl bg-brand-surface p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                <ShieldIcon />
              </div>
              <h3 className="font-semibold">{badge.title}</h3>
              <p className="mt-1 text-sm text-brand-muted">{badge.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand">Services</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Our Core Services</h2>
            </div>
            <Link href="/treatments" className="rounded-button bg-brand px-5 py-2.5 text-sm font-semibold text-white">
              View All
            </Link>
          </div>
          <div className="divide-y divide-brand-fg/10 border-y border-brand-fg/10">
            {site.services.map((service) => (
              <div key={service.number} className="flex items-center justify-between gap-6 py-6">
                <div className="flex items-start gap-6">
                  <span className="text-sm font-bold text-brand-muted">{service.number}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-brand-muted">{service.body}</p>
                  </div>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-fg/15 text-brand-fg">
                  →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{site.aiFeatures.title}</h2>
              <p className="mt-3 max-w-xl text-brand-muted">{site.aiFeatures.subtitle}</p>
            </div>
            <Link href="/appointment" className="rounded-button bg-brand px-5 py-2.5 text-sm font-semibold text-white">
              Find Job Now →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {site.aiFeatures.items.map((item, index) => (
              <article
                key={item.title}
                className="overflow-hidden rounded-[1.5rem] border border-brand-fg/10 bg-brand-surface"
              >
                <div className="relative h-44 bg-brand-soft">
                  <SiteImage
                    src={unsplash(
                      [
                        'photo-1576091160550-2173dba999ef',
                        'photo-1631217868264-e5b90bb7e133',
                        'photo-1516549655169-df83a0774514',
                        'photo-1576678927484-cc907957088c',
                      ][index],
                      900,
                    )}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-brand-surface px-6 py-14 shadow-sm md:px-10">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full bg-brand-fg px-3 py-1 text-xs font-semibold text-white">
              {site.howItWorks.eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{site.howItWorks.title}</h2>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr_1fr]">
            <div className="space-y-8">
              {site.howItWorks.steps.slice(0, 2).map((step) => (
                <div key={step.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <BriefcaseIcon />
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-brand-muted">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="relative overflow-hidden rounded-[1.75rem]">
                <SiteImage
                  src={unsplash('photo-1631217868264-e5b90bb7e133', 1000)}
                  alt="Medical professional in scrubs"
                  width={640}
                  height={720}
                  className="h-[420px] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-2 flex gap-2 md:-right-6">
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                  <SiteImage
                    src={unsplash('photo-1559839734-2b71ea197ec2', 400)}
                    alt="Female doctor"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                  <SiteImage
                    src={unsplash('photo-1612349317150-e413f6a5b16d', 400)}
                    alt="Male doctor in white coat"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {site.howItWorks.steps.slice(2).map((step) => (
                <div key={step.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <CheckIcon />
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-brand-muted">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hire smarter */}
      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            {[
              'photo-1519494026892-80bbd2d6fd0d',
              'photo-1538108149393-fbbd81895907',
              'photo-1551076805-e1869033e561',
              'photo-1504439904031-93ded9f93e4e',
            ].map((id) => (
              <div key={id} className="relative aspect-square overflow-hidden rounded-2xl">
                <SiteImage
                  src={unsplash(id, 700)}
                  alt="Hospital and clinical environment"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{site.hireSmarter.title}</h2>
            <p className="mt-4 text-brand-muted">{site.hireSmarter.body}</p>
            <ul className="mt-6 space-y-3">
              {site.hireSmarter.points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm font-medium">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-brand-dark px-5 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-brand-accent"># Testimonial</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">What Our Partners Say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {site.testimonials.map((item) => (
              <blockquote key={item.name} className="rounded-[1.5rem] bg-white/5 p-8 ring-1 ring-white/10">
                <div className="mb-4 flex items-center gap-2 text-amber-300">
                  {'★★★★★'}
                  <span className="text-sm text-white/70">{item.rating}/5.0</span>
                </div>
                <p className="text-lg leading-8 text-white/90">“{item.quote}”</p>
                <footer className="mt-6 flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <SiteImage
                      src={unsplash(
                        item.name.includes('Sarah')
                          ? 'photo-1559839734-2b71ea197ec2'
                          : 'photo-1579684453423-f84349ef60b0',
                        200,
                      )}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-white/60">{item.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Success Stories & Insights</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {site.insights.map((insight, index) => (
              <article key={insight.title} className="overflow-hidden rounded-[1.5rem] bg-brand-surface shadow-sm">
                <div className="relative h-44">
                  <SiteImage
                    src={unsplash(
                      [
                        'photo-1576091160399-112ba8d25d1d',
                        'photo-1576678927484-cc907957088c',
                        'photo-1516549655169-df83a0774514',
                      ][index],
                      800,
                    )}
                    alt={insight.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand">{insight.category}</span>
                  <h3 className="mt-2 text-lg font-semibold">{insight.title}</h3>
                  <p className="mt-2 text-sm text-brand-muted">{insight.body}</p>
                  <Link href="/about" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 pb-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Frequently Asked Questions</h2>
          <div className="mt-10">
            <FaqAccordion items={[...site.faqs]} />
          </div>
        </div>
      </section>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" strokeLinejoin="round" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
