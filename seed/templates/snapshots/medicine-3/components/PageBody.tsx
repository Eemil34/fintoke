import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';
import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';
import { site } from '@/lib/site';

const teamPhotos = [
  'photo-1559839734-2b71ea197ec2',
  'photo-1612349317150-e413f6a5b16d',
  'photo-1631217868264-e5b90bb7e133',
] as const;

export function PageBody({ slug }: { slug: string }) {
  const page = site.pages.find((item) => item.slug === slug);
  if (!page) notFound();

  const items = 'items' in page && page.items ? page.items : [];
  const kind = page.kind as string;

  return (
    <main className="px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">{page.label}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-muted">{page.subtitle}</p>

        {kind === 'about' ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-[1.75rem]">
              <SiteImage
                src={unsplash('photo-1551076805-e1869033e561', 1200)}
                alt="Modern hospital exterior"
                width={800}
                height={560}
                className="h-[360px] w-full object-cover"
              />
            </div>
            <div className="space-y-4 text-base leading-7 text-brand-muted">
              <p>{site.description}</p>
              <p>{page.subtitle}</p>
              <p>{site.contact.hours}</p>
              <p>
                {site.contact.address}
                <br />
                {site.contact.phone} · {site.contact.email}
              </p>
            </div>
          </div>
        ) : null}

        {kind === 'contact' ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div className="max-w-xl">
              <ContactForm />
            </div>
            <div className="relative overflow-hidden rounded-[1.75rem]">
              <SiteImage
                src={unsplash('photo-1516549655169-df83a0774514', 1000)}
                alt="Hospital reception desk"
                width={700}
                height={520}
                className="h-full min-h-[320px] w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        {kind === 'team' ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {site.team.map((person, index) => (
              <article key={person.name} className="overflow-hidden rounded-box bg-brand-surface shadow-sm">
                <div className="relative h-56">
                  <SiteImage
                    src={unsplash(teamPhotos[index % teamPhotos.length], 700)}
                    alt={person.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-semibold">{person.name}</h2>
                  <p className="text-sm text-brand">{person.role}</p>
                  <p className="mt-3 text-sm text-brand-muted">{person.bio}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {kind === 'list' || kind === 'faq' ? (
          <div className="mt-12 grid gap-4">
            {(items.length > 0 ? items : site.features).map((item, index) => (
              <article
                key={item.title}
                className="flex items-center justify-between gap-6 rounded-box border border-brand-fg/10 bg-brand-surface p-6"
              >
                <div className="flex items-start gap-5">
                  <span className="text-sm font-bold text-brand-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm text-brand-muted">{item.body}</p>
                  </div>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-fg/15">
                  →
                </span>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
