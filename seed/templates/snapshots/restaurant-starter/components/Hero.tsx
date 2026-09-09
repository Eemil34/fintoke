import Link from 'next/link';
import { reservationHref, site } from '@/lib/site';
import { SiteImage } from '@/components/SiteImage';

export function Hero() {
  const layout: string = site.layout;

  if (layout === 'agency') {
    return (
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-muted">{site.hero.eyebrow}</p>
          <h1 className="mt-6 max-w-5xl text-6xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
            {site.hero.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-brand-muted">{site.hero.subtitle}</p>
          <HeroActions />
        </div>
      </section>
    );
  }

  if (layout === 'saas-dark' || layout === 'crypto' || layout === 'event') {
    return (
      <section className="relative overflow-hidden px-5 py-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-brand-accent">{site.hero.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">{site.hero.title}</h1>
            <p className="mt-5 text-lg text-brand-muted">{site.hero.subtitle}</p>
            <HeroActions />
          </div>
          <div className="rounded-box border border-white/10 bg-brand-surface p-4 shadow-2xl">
            <div className="mb-4 flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>
            <div className="grid gap-3">
              {site.stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-box bg-black/20 px-4 py-3">
                  <span className="text-sm text-brand-muted">{stat.label}</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'editorial' || layout === 'luxury' || layout === 'cv') {
    return (
      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm tracking-[0.18em] uppercase text-brand-muted">{site.hero.eyebrow}</p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">{site.hero.title}</h1>
          <p className="mt-6 text-lg text-brand-muted">{site.hero.subtitle}</p>
          <div className="flex justify-center">
            <HeroActions />
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'hospitality' || layout === 'medical') {
    return (
      <section className="px-5 py-8 md:py-12">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-box border border-brand-fg/10">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
              <p className="text-xs uppercase tracking-[0.2em] text-brand">{site.hero.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">
                {site.hero.title}
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-brand-muted">{site.hero.subtitle}</p>
              <HeroActions />
              <div className="mt-10 hidden gap-6 border-t border-brand-fg/10 pt-8 sm:grid sm:grid-cols-3">
                {site.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-semibold text-brand">{stat.value}</p>
                    <p className="mt-1 text-xs leading-snug text-brand-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[320px] md:min-h-[480px]">
              {'image' in site.hero && site.hero.image ? (
                <>
                  <SiteImage
                    src={site.hero.image}
                    alt={`${site.name} tasting room`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="brightness-[0.55]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-brand-bg/20 to-transparent md:bg-gradient-to-r md:from-brand-bg/80 md:via-transparent md:to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-hero-warm">
                  <div className="absolute inset-0 bg-hero-glow" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:hidden">
                <div className="grid grid-cols-3 gap-3 rounded-box border border-brand-fg/10 bg-brand-bg/80 p-4 backdrop-blur-sm">
                  {site.stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-xl font-semibold">{stat.value}</p>
                      <p className="mt-0.5 text-[10px] leading-snug text-brand-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'fitness' || layout === 'industrial') {
    return (
      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl rounded-box bg-brand-surface px-8 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">{site.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold uppercase tracking-tight md:text-7xl">
            {site.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-muted">{site.hero.subtitle}</p>
          <HeroActions />
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-brand">{site.hero.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">{site.hero.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-brand-muted">{site.hero.subtitle}</p>
        <HeroActions />
      </div>
    </section>
  );
}

function HeroActions() {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href={reservationHref}
        className="rounded-button bg-brand px-5 py-3 text-sm font-medium text-brand-bg transition hover:bg-brand-accent hover:text-brand-bg"
      >
        {site.hero.cta}
      </Link>
      {site.hero.ctaSecondary ? (
        <Link
          href={site.nav.find((item) => item.href === '/menu')?.href ?? '/menu'}
          className="rounded-button border border-brand-fg/15 px-5 py-3 text-sm transition hover:border-brand/50 hover:text-brand-accent"
        >
          {site.hero.ctaSecondary}
        </Link>
      ) : null}
    </div>
  );
}
