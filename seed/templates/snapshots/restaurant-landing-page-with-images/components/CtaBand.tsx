import Link from 'next/link';
import { reservationHref, site } from '@/lib/site';
import { SiteImage } from '@/components/SiteImage';

export function CtaBand() {
  return (
    <section className="px-5 py-16 md:py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-box border border-brand-fg/10">
        <div className="absolute inset-0">
          <SiteImage
            src={site.images.gallery.items[1].src}
            alt=""
            fill
            sizes="100vw"
            className="brightness-[0.25]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/95 via-brand-bg/80 to-brand-bg/50" />
        <div className="relative px-8 py-14 md:px-12 md:py-16">
          <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{site.cta.title}</h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-brand-muted">{site.cta.subtitle}</p>
          <Link
            href={reservationHref}
            className="mt-8 inline-flex rounded-button bg-brand px-6 py-3 text-sm font-medium text-brand-bg transition hover:bg-brand-accent"
          >
            {site.cta.button}
          </Link>
        </div>
      </div>
    </section>
  );
}
