import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';
import { PageHero } from '@/components/PageHero';
import { SiteImage } from '@/components/SiteImage';
import { site } from '@/lib/site';

export function PageBody({ slug }: { slug: string }) {
  const page = site.pages.find((item) => item.slug === slug);
  if (!page) notFound();

  const items = 'items' in page && page.items ? page.items : [];
  const kind: string = page.kind;

  return (
    <>
      <PageHero slug={slug} label={page.label} title={page.title} subtitle={page.subtitle} />

      <main className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          {kind === 'features' ? (
            <div className="grid gap-6 md:grid-cols-2">
              {site.features.map((feature) => (
                <article key={feature.title} className="rounded-box border border-brand-fg/10 bg-brand-surface/60 p-6">
                  <h2 className="text-lg font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{feature.body}</p>
                </article>
              ))}
            </div>
          ) : null}

          {kind === 'pricing' ? (
            <div className="grid gap-6 md:grid-cols-3">
              {site.pricing.map((plan) => (
                <article key={plan.name} className="rounded-box border border-brand-fg/10 bg-brand-surface/60 p-6">
                  <h2 className="font-semibold">{plan.name}</h2>
                  <p className="mt-2 text-3xl">{plan.price}</p>
                  <ul className="mt-4 space-y-2 text-sm text-brand-muted">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : null}

          {kind === 'about' ? (
            <div className="space-y-16">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <div className="space-y-5 text-base leading-8 text-brand-muted">
                  <p>{site.description}</p>
                  <p>
                    Säde opened in 2022 in a former bakery on Iso Roobertinkatu. The name means{' '}
                    <em className="text-brand-fg/90">ray</em> — a shaft of light through the room at dusk, the moment
                    before service when the kitchen goes quiet.
                  </p>
                  <p>
                    We work with a handful of farms within two hours of Helsinki. Nothing on the menu is permanent; when
                    the ingredients insist on something else, we listen.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {site.images.gallery.items.slice(0, 4).map((item, index) => (
                    <figure
                      key={`about-gallery-${index}`}
                      className={`relative overflow-hidden rounded-box ${item === site.images.gallery.items[0] ? 'col-span-2 aspect-[16/9]' : 'aspect-square'}`}
                    >
                      <SiteImage src={item.src} alt={item.alt} fill sizes="(max-width: 1024px) 50vw, 25vw" />
                    </figure>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">The kitchen</h2>
                <div className="mt-8 grid gap-8 sm:grid-cols-3">
                  {site.team.map((person) => (
                    <article key={person.name}>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-box">
                        {'image' in person && person.image ? (
                          <SiteImage src={person.image} alt={person.name} fill sizes="(max-width: 640px) 100vw, 33vw" />
                        ) : (
                          <div className="h-full w-full bg-brand-surface" />
                        )}
                      </div>
                      <h3 className="mt-4 font-semibold">{person.name}</h3>
                      <p className="text-sm text-brand">{person.role}</p>
                      <p className="mt-2 text-sm leading-6 text-brand-muted">{person.bio}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {kind === 'contact' ? (
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-8">
                <div className="relative aspect-[4/3] overflow-hidden rounded-box lg:hidden">
                  <SiteImage
                    src={site.images.pages[slug as keyof typeof site.images.pages]}
                    alt={site.name}
                    fill
                    sizes="100vw"
                  />
                </div>
                <div>
                  <h2 className="text-sm uppercase tracking-[0.14em] text-brand-muted">Address</h2>
                  <address className="mt-3 space-y-1 text-base not-italic leading-7">
                    <p>{site.contact.address}</p>
                    <p>{site.contact.city}</p>
                  </address>
                </div>
                <div>
                  <h2 className="text-sm uppercase tracking-[0.14em] text-brand-muted">Hours</h2>
                  <p className="mt-3 text-base leading-7 text-brand-muted">{site.contact.hours}</p>
                </div>
                <div>
                  <h2 className="text-sm uppercase tracking-[0.14em] text-brand-muted">Direct</h2>
                  <ul className="mt-3 space-y-2 text-base">
                    <li>
                      <a href={`mailto:${site.contact.email}`} className="text-brand transition hover:text-brand-accent">
                        {site.contact.email}
                      </a>
                    </li>
                    <li>
                      <a
                        href={`tel:${site.contact.phone.replace(/\s/g, '')}`}
                        className="text-brand-muted transition hover:text-brand-fg"
                      >
                        {site.contact.phone}
                      </a>
                    </li>
                    <li className="text-brand-muted">{site.contact.instagram}</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-box border border-brand-fg/10 bg-brand-surface/30 p-6 md:p-8">
                <ContactForm variant={slug === 'reservation' ? 'reservation' : 'contact'} />
              </div>
            </div>
          ) : null}

          {kind === 'team' ? (
            <div className="grid gap-6 md:grid-cols-3">
              {site.team.map((person) => (
                <article key={person.name} className="rounded-box bg-brand-surface/60 p-6">
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-box">
                    {'image' in person && person.image ? (
                      <SiteImage src={person.image} alt={person.name} fill sizes="33vw" />
                    ) : (
                      <div className="h-full w-full bg-brand/30" />
                    )}
                  </div>
                  <h2 className="font-semibold">{person.name}</h2>
                  <p className="text-sm text-brand">{person.role}</p>
                  <p className="mt-3 text-sm text-brand-muted">{person.bio}</p>
                </article>
              ))}
            </div>
          ) : null}

          {kind === 'gallery' ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {site.images.gallery.items.map((item, index) => (
                <figure key={`gallery-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-box">
                  <SiteImage src={item.src} alt={item.alt} fill sizes="33vw" />
                </figure>
              ))}
            </div>
          ) : null}

          {kind === 'list' || kind === 'faq' ? (
            <>
              {slug === 'menu' ? (
                <div className="mb-14 grid grid-cols-3 gap-3">
                  {site.images.gallery.items.slice(0, 3).map((item, index) => (
                    <figure key={`menu-gallery-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-box">
                      <SiteImage src={item.src} alt={item.alt} fill sizes="33vw" />
                      {'caption' in item && item.caption ? (
                        <figcaption className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2 text-[10px] uppercase tracking-wider text-brand-accent">
                          {item.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              ) : null}

              <div className="divide-y divide-brand-fg/10 border-y border-brand-fg/10">
                {(items.length > 0 ? items : site.features).map((item) => (
                  <article
                    key={item.title}
                    className="grid gap-4 py-7 md:grid-cols-[4rem_1fr] md:items-baseline"
                  >
                    {'meta' in item && item.meta ? (
                      <span className="text-sm font-medium text-brand">{item.meta}</span>
                    ) : (
                      <span className="hidden md:block" />
                    )}
                    <div>
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-brand-muted">{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
