import Link from 'next/link';
import { SiteImage } from '@/components/SiteImage';
import { site } from '@/lib/site';

export function Hero() {
  const appointment = site.nav[site.nav.length - 1];

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-brand-deep">
      <div className="absolute inset-0">
        <SiteImage
          src={site.images.hero}
          alt="Care team supporting a patient at Medwell Hospital"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep/92 via-brand-deep/72 to-brand-deep/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/80 via-transparent to-brand-deep/20" />
      </div>

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-5 pb-36 pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-100/90">
          {site.hero.eyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-6xl">
          {site.hero.titleBefore}
          <em className="font-serif text-[1.08em] italic text-teal-100">{site.hero.titleEmphasis}</em>
          {site.hero.titleAfter}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-teal-50/85 md:text-lg">
          {site.hero.subtitle}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href={appointment?.href || '/appointment'}
            className="rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-deep/30 transition hover:bg-teal-700"
          >
            {site.hero.cta}
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </span>
            {site.hero.ctaSecondary}
          </button>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[site.images.avatar1, site.images.avatar2, site.images.avatar3].map((src, index) => (
              <span
                key={src}
                className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white/90"
              >
                <SiteImage src={src} alt="" fill className="object-cover" sizes="44px" />
                <span className="sr-only">Patient review avatar {index + 1}</span>
              </span>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-300" aria-label="5 star rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                  <path d="M10 1.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 13.8 5.2 16.4l.9-5.4L2.2 7.2l5.4-.8L10 1.5z" />
                </svg>
              ))}
            </div>
            <p className="mt-1 text-sm font-medium text-white/90">{site.hero.reviewsLabel}</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto grid max-w-6xl gap-3 px-5 pb-6 md:grid-cols-3">
          {site.heroFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand">
                <FeatureIcon index={index} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="mt-1 text-xs leading-5 text-teal-50/80">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10h16v9H4z" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
