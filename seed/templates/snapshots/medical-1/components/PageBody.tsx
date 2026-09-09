import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';
import { SiteImage } from '@/components/SiteImage';
import { site } from '@/lib/site';

export function PageBody({ slug }: { slug: string }) {
  const page = site.pages.find((item) => item.slug === slug);
  if (!page) notFound();

  const items = 'items' in page && page.items ? page.items : [];

  return (
    <main className="bg-brand-soft px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{page.label}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-brand-fg md:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-muted">{page.subtitle}</p>

        {page.kind === 'about' ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div className="space-y-4 text-base leading-7 text-brand-muted">
              <p>{site.description}</p>
              <p>{page.subtitle}</p>
              <p>{site.about.vision}</p>
              <p>{site.about.mission}</p>
              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                {site.stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-2xl font-semibold text-brand">{stat.value}</p>
                    <p className="mt-1 text-xs text-brand-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem]">
              <SiteImage
                src={site.images.about}
                alt="Medwell hospital team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        ) : null}

        {page.kind === 'contact' ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <ContactForm />
            </div>
            <div className="rounded-2xl bg-brand p-8 text-white">
              <h2 className="text-xl font-semibold">Visit or call</h2>
              <p className="mt-4 text-sm leading-6 text-teal-50/85">{site.contact.address}</p>
              <p className="mt-3 text-sm">{site.contact.phone}</p>
              <p className="mt-1 text-sm">{site.contact.email}</p>
              <p className="mt-6 text-sm text-teal-50/85">{site.contact.hours}</p>
            </div>
          </div>
        ) : null}

        {page.kind === 'team' ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {site.team.map((person, index) => {
              const avatars = [site.images.avatar1, site.images.avatar2, site.images.avatar3, site.images.about];
              return (
                <article key={person.name} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="relative aspect-[4/3]">
                    <SiteImage
                      src={avatars[index % avatars.length]}
                      alt={person.name}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="font-semibold">{person.name}</h2>
                    <p className="text-sm text-brand">{person.role}</p>
                    <p className="mt-3 text-sm leading-6 text-brand-muted">{person.bio}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {page.kind === 'list' ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {(items.length > 0 ? items : site.features).map((item) => (
              <article key={item.title} className="rounded-2xl border border-brand-fg/5 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{item.body}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
