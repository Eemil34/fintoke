import { site } from '@/lib/site';
import { SiteImage } from '@/components/SiteImage';

type PageHeroProps = {
  slug: string;
  label: string;
  title: string;
  subtitle: string;
};

export function PageHero({ slug, label, title, subtitle }: PageHeroProps) {
  const image = site.images.pages[slug as keyof typeof site.images.pages];

  return (
    <section className="relative overflow-hidden">
      {image ? (
        <>
          <div className="absolute inset-0">
            <SiteImage src={image} alt={title} fill priority sizes="100vw" className="brightness-[0.35]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/70 to-brand-bg/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-brand-surface/40" />
      )}

      <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="text-xs uppercase tracking-[0.18em] text-brand">{label}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-muted">{subtitle}</p>
      </div>
    </section>
  );
}
