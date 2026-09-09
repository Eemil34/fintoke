import { site } from '@/lib/site';
import { SiteImage } from '@/components/SiteImage';

export function GalleryStrip() {
  const { gallery } = site.images;

  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand">Inside the room</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{gallery.title}</h2>
          </div>
          <p className="max-w-sm text-sm text-brand-muted">{gallery.subtitle}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-12 md:grid-rows-2 md:gap-4">
          <figure className="relative aspect-[4/3] overflow-hidden rounded-box md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[420px]">
            <SiteImage src={gallery.items[0].src} alt={gallery.items[0].alt} fill sizes="(max-width: 768px) 100vw, 58vw" />
            {'caption' in gallery.items[0] && gallery.items[0].caption ? (
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-xs text-brand-accent">
                {gallery.items[0].caption}
              </figcaption>
            ) : null}
          </figure>

          {gallery.items.slice(1, 3).map((item, index) => (
            <figure key={`gallery-${index + 1}`} className="relative aspect-[4/3] overflow-hidden rounded-box md:col-span-5">
              <SiteImage src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 50vw, 42vw" />
            </figure>
          ))}

          {gallery.items.slice(3).map((item, index) => (
            <figure key={`gallery-${index + 3}`} className="relative aspect-[3/2] overflow-hidden rounded-box md:col-span-4">
              <SiteImage src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 50vw, 33vw" />
              {'caption' in item && item.caption ? (
                <figcaption className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2 text-[10px] uppercase tracking-wider text-brand-accent/90">
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
