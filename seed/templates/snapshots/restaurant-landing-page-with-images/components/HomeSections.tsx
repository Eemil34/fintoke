import Link from 'next/link';
import { reservationHref, site } from '@/lib/site';
import { SiteImage } from '@/components/SiteImage';

export function HomeSections() {
  const sections = site.sections;
  const [featuredTestimonial, ...otherTestimonials] = site.testimonials;

  return (
    <div>
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-brand">The experience</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{sections.features.title}</h2>
            <p className="mt-3 text-brand-muted">{sections.features.subtitle}</p>
          </div>

          <div className="mt-14 space-y-16">
            {site.features.map((feature, index) => {
              const image = 'image' in feature ? feature.image : null;
              const reversed = index % 2 === 1;

              return (
                <article
                  key={feature.title}
                  className={`grid items-center gap-8 md:grid-cols-2 md:gap-12 ${reversed ? 'md:[direction:rtl]' : ''}`}
                >
                  {image ? (
                    <div className={`relative aspect-[4/3] overflow-hidden rounded-box ${reversed ? 'md:[direction:ltr]' : ''}`}>
                      <SiteImage src={image} alt={feature.title} fill sizes="(max-width: 768px) 100vw, 50vw" />
                      <div className="absolute inset-0 ring-1 ring-inset ring-brand-fg/10" />
                    </div>
                  ) : null}
                  <div className={reversed ? 'md:[direction:ltr]' : ''}>
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-brand/70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-3 text-2xl font-semibold">{feature.title}</h3>
                    <p className="mt-3 text-base leading-7 text-brand-muted">{feature.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {site.testimonials.length > 0 ? (
        <section className="bg-brand-surface/40 px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-semibold tracking-tight">{sections.testimonials.title}</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <blockquote className="relative overflow-hidden rounded-box md:col-span-2 md:row-span-2 md:min-h-[320px]">
                <SiteImage
                  src={site.images.testimonialFeatured}
                  alt="Guest experience at Säde"
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="brightness-[0.4]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <p className="max-w-lg text-xl leading-8 text-brand-fg">“{featuredTestimonial.quote}”</p>
                  <footer className="mt-5 text-sm">
                    <p className="font-medium text-brand-accent">{featuredTestimonial.name}</p>
                    {featuredTestimonial.role ? (
                      <p className="mt-0.5 text-brand-muted">{featuredTestimonial.role}</p>
                    ) : null}
                  </footer>
                </div>
              </blockquote>

              {otherTestimonials.map((item) => (
                <blockquote
                  key={item.quote}
                  className="flex flex-col justify-between rounded-box border border-brand-fg/10 bg-brand-bg/60 p-6 backdrop-blur-sm"
                >
                  <p className="text-sm leading-7 text-brand-fg/90">“{item.quote}”</p>
                  <footer className="mt-5 border-t border-brand-fg/10 pt-4 text-sm">
                    <p className="font-medium">{item.name}</p>
                    {item.role ? <p className="mt-0.5 text-brand-muted">{item.role}</p> : null}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {site.pricing.length > 0 ? (
        <section className="px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <p className="text-xs uppercase tracking-[0.18em] text-brand">Rates</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">{sections.pricing.title}</h2>
                <p className="mt-3 text-brand-muted">{sections.pricing.subtitle}</p>
                <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-box">
                  <SiteImage
                    src={site.images.pricing}
                    alt="Wine pairing at Säde"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/60 to-transparent" />
                </div>
              </div>

              <div className="space-y-4">
                {site.pricing.map((plan) => {
                  const highlighted = 'highlighted' in plan && plan.highlighted;
                  return (
                    <article
                      key={plan.name}
                      className={`flex flex-col rounded-box border p-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 ${
                        highlighted
                          ? 'border-brand bg-brand text-brand-bg'
                          : 'border-brand-fg/10 bg-brand-surface/40'
                      }`}
                    >
                      <div>
                        <h3 className="text-sm uppercase tracking-[0.14em]">{plan.name}</h3>
                        <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
                        <ul className="mt-4 space-y-1.5 text-sm leading-6">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex gap-2">
                              <span className={highlighted ? 'opacity-60' : 'text-brand'}>·</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link
                        href={reservationHref}
                        className={`shrink-0 rounded-button px-5 py-2.5 text-sm font-medium transition ${
                          highlighted
                            ? 'bg-brand-bg text-brand-fg hover:bg-brand-surface'
                            : 'border border-brand-fg/15 hover:border-brand/50 hover:text-brand-accent'
                        }`}
                      >
                        Book
                      </Link>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {site.team.length > 0 ? (
        <section className="border-t border-brand-fg/10 px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-brand">People</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">{sections.team.title}</h2>
                <p className="mt-3 text-brand-muted">{sections.team.subtitle}</p>
              </div>
              <Link href="/about" className="text-sm text-brand hover:text-brand-accent">
                Read our story →
              </Link>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {site.team.map((person) => (
                <article key={person.name} className="group text-center sm:text-left">
                  <div className="relative mx-auto aspect-[3/4] max-w-[220px] overflow-hidden rounded-box sm:mx-0 sm:max-w-none">
                    {'image' in person && person.image ? (
                      <SiteImage
                        src={person.image}
                        alt={person.name}
                        fill
                        sizes="(max-width: 640px) 220px, 33vw"
                        className="transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-brand/50 to-brand-accent/30" />
                    )}
                    <div className="absolute inset-0 ring-1 ring-inset ring-brand-fg/10" />
                  </div>
                  <h3 className="mt-5 font-semibold">{person.name}</h3>
                  <p className="text-sm text-brand">{person.role}</p>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{person.bio}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
