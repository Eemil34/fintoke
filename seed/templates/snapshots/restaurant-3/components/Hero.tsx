import { site } from '@/lib/site';
import { SiteImage } from '@/components/SiteImage';

export function Hero() {
  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden bg-brand-fg">
      <div className="hero-media absolute inset-0">
        <SiteImage
          src={site.hero.image}
          alt={site.hero.imageAlt}
          fill
          priority
          className="object-cover opacity-80"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40" />
      <div className="hero-copy relative z-10 flex min-h-[88vh] flex-col items-center justify-center px-5 pb-20 pt-28 text-center text-white">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/65 md:text-xs">
          {site.hero.eyebrow}
        </p>
        <h1 className="mt-5 font-serif text-5xl font-medium tracking-[-0.02em] md:text-7xl lg:text-[5.75rem] lg:leading-[1.05]">
          {site.hero.title}
        </h1>
        <div className="mt-6 h-px w-14 bg-white/35" aria-hidden />
        <p className="mt-6 max-w-xl font-serif text-[1.15rem] italic leading-8 text-white/90 md:text-2xl md:leading-9">
          {site.hero.subtitle}
        </p>
      </div>
    </section>
  );
}
