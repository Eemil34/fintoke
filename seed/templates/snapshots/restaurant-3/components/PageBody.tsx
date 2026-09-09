import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';
import { SiteImage } from '@/components/SiteImage';
import { site } from '@/lib/site';

export function PageBody({ slug }: { slug: string }) {
  const page = site.pages.find((item) => item.slug === slug);
  if (!page) notFound();

  const items = 'items' in page && page.items ? page.items : [];

  return (
    <main className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.16em] text-brand-muted">{page.label}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl tracking-tight md:text-5xl">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-brand-muted">{page.subtitle}</p>

        {page.kind === 'about' ? (
          <div className="mt-12 space-y-10">
            <div className="relative aspect-[16/9] overflow-hidden md:aspect-[21/9]">
              <SiteImage
                src={site.about.image}
                alt={site.about.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1152px"
              />
            </div>
            <div className="grid gap-8 md:grid-cols-2 md:gap-16">
              {site.about.columns.map((text) => (
                <p key={text.slice(0, 24)} className="text-sm leading-7 text-brand-muted md:text-[15px]">
                  {text}
                </p>
              ))}
            </div>
            <div className="grid gap-8 border-t border-brand-fg/10 pt-10 md:grid-cols-2">
              {site.team.map((person) => (
                <article key={person.name}>
                  <h2 className="font-serif text-2xl">{person.name}</h2>
                  <p className="mt-1 text-sm italic text-brand-muted">{person.role}</p>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">{person.bio}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {page.kind === 'contact' ? (
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            <div className="space-y-4 text-sm leading-7 text-brand-muted">
              <p>{site.contact.address}</p>
              <p>{site.contact.phone}</p>
              <p>{site.contact.email}</p>
              <p className="pt-4">Dinner Tue–Sun · 5–11 PM<br />Raw bar opens at 4:30 PM</p>
            </div>
            <ContactForm />
          </div>
        ) : null}

        {page.kind === 'gallery' ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {site.galleryImages.map((image) => (
              <div key={image.src} className="relative aspect-[4/5] overflow-hidden">
                <SiteImage src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
            ))}
          </div>
        ) : null}

        {page.kind === 'list' ? (
          <div className="mt-12 grid gap-0">
            {items.map((item) => (
              <article key={item.title} className="border-t border-brand-fg/10 py-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-xl md:text-2xl">{item.title}</h2>
                  {item.meta ? <span className="text-sm text-brand-muted">${item.meta}</span> : null}
                </div>
                <p className="mt-2 text-sm text-brand-muted">{item.body}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
