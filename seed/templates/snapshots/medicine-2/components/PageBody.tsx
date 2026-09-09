import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';
import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';
import { site } from '@/lib/site';

export function PageBody({ slug }: { slug: string }) {
  const page = site.pages.find((item) => item.slug === slug);
  if (!page) notFound();

  const items = 'items' in page && page.items ? page.items : [];

  return (
    <main className="px-5 py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">{page.label}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-muted">{page.subtitle}</p>

        {page.kind === 'about' ? (
          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="relative min-h-[320px] overflow-hidden rounded-[1.75rem]">
              <SiteImage
                src={unsplash('photo-1551076805-e1869033e561', 1200)}
                alt="Modern clinic exterior"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-4 text-base leading-7 text-brand-muted">
              <p>{site.description}</p>
              <p>{page.subtitle}</p>
              <p>
                Visit us at {site.address}. Open {site.hours}. Call {site.phone} or email {site.email}.
              </p>
              <div className="grid gap-3 pt-4 sm:grid-cols-3">
                {site.stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-brand-soft px-4 py-4 text-brand">
                    <p className="font-display text-2xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-xs text-brand-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {page.kind === 'contact' ? (
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="max-w-xl">
              <ContactForm />
            </div>
            <div className="space-y-5">
              <div className="relative min-h-[240px] overflow-hidden rounded-[1.75rem]">
                <SiteImage
                  src={unsplash('photo-1576678927484-cc907957088c', 1000)}
                  alt="Nurse station in clinic"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="rounded-[1.5rem] bg-brand p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Clinic desk</p>
                <p className="mt-2 text-lg font-semibold">{site.phone}</p>
                <p className="mt-1 text-sm text-white/75">{site.email}</p>
                <p className="mt-4 text-sm text-white/75">
                  {site.address}
                  <br />
                  {site.hours}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {page.kind === 'team' ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {site.team.map((person) => (
              <article key={person.name} className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-brand/8">
                <div className="relative aspect-[4/5]">
                  <SiteImage
                    src={unsplash(person.image, 800)}
                    alt={person.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-semibold text-brand">{person.name}</h2>
                  <p className="text-sm font-medium text-brand-accent">{person.role}</p>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">{person.bio}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {page.kind === 'list' ? (
          <div className="mt-12 grid gap-4">
            {(items.length > 0 ? items : site.features).map((item, index) => (
              <article
                key={item.title}
                className="grid gap-4 rounded-[1.5rem] bg-white p-6 ring-1 ring-brand/8 md:grid-cols-[auto_1fr] md:items-start"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft font-display text-lg font-semibold text-brand">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-brand">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
