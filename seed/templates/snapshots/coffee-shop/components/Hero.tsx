import Link from 'next/link';
import { SiteImage } from '@/components/SiteImage';
import { site } from '@/lib/site';

/** Previous brown hero field — matches the warmer cup studio tone */
const HERO_BG = '#3c2014';

function QrBlock() {
  const cells = [
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  ];

  return (
    <div
      className="grid h-[78px] w-[78px] shrink-0 gap-[1.5px] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
      style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
      aria-hidden
    >
      {cells.flat().map((on, i) => (
        <span key={i} className={on ? 'bg-[#1A0F0A]' : 'bg-white'} />
      ))}
    </div>
  );
}

function SocialIcon({ kind }: { kind: 'facebook' | 'instagram' }) {
  if (kind === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden" style={{ backgroundColor: HERO_BG }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 55% 50% at 18% 35%, rgba(120,72,42,0.55), transparent 60%), radial-gradient(ellipse 45% 55% at 78% 48%, rgba(90,52,30,0.5), transparent 55%), radial-gradient(ellipse 70% 40% at 50% 100%, rgba(0,0,0,0.35), transparent 55%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative mx-auto grid min-h-[min(880px,94vh)] max-w-[1360px] items-center lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 px-5 py-16 md:px-10 lg:px-12 lg:py-20">
          <p
            className="animate-fade-up font-display text-[11px] font-semibold uppercase tracking-[0.34em] text-[#B5A875]"
            style={{ animationDelay: '40ms' }}
          >
            Specialty coffee · Portland
          </p>

          <h1
            className="animate-fade-up mt-4 font-display text-[clamp(3.25rem,9.5vw,6.35rem)] font-bold uppercase leading-[0.88] tracking-[-0.03em] text-[#F5EEE3]"
            style={{
              animationDelay: '100ms',
              textShadow: '0 12px 40px rgba(0,0,0,0.28)',
            }}
          >
            Brewed
            <br />
            with care
          </h1>

          <div
            className="animate-fade-up mt-5 h-px w-16 bg-gradient-to-r from-[#9B8C5E] to-transparent"
            style={{ animationDelay: '160ms' }}
          />

          <p
            className="animate-fade-up mt-5 max-w-[27rem] text-[15px] leading-[1.7] text-[#E8DFD0]/82 md:text-[16.5px]"
            style={{ animationDelay: '200ms' }}
          >
            {site.hero.subtitle}
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-wrap items-stretch gap-3.5"
            style={{ animationDelay: '280ms' }}
          >
            <QrBlock />
            <div className="flex min-w-[200px] flex-1 flex-col justify-center gap-2.5 sm:max-w-[280px]">
              <Link
                href="#shop"
                className="inline-flex items-center justify-center bg-[#9B8C5E] px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1A0F0A] shadow-[0_10px_28px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-[#B5A875] hover:shadow-[0_14px_32px_rgba(0,0,0,0.3)]"
              >
                {site.hero.cta}
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center justify-center border border-[#F0E6D6]/15 bg-[#F0E6D6] px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1A0F0A] transition hover:-translate-y-0.5 hover:bg-white"
              >
                {site.hero.ctaSecondary}
              </Link>
            </div>
          </div>

          <div
            className="animate-fade-up mt-12 flex items-center gap-4 border-t border-[#F3EAD9]/12 pt-7 text-[#E8DFD0]/72"
            style={{ animationDelay: '360ms' }}
          >
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8DFD0]/22 transition hover:border-[#B5A875] hover:bg-[#B5A875]/15 hover:text-[#F5EEE3]"
              >
                <SocialIcon kind="facebook" />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8DFD0]/22 transition hover:border-[#B5A875] hover:bg-[#B5A875]/15 hover:text-[#F5EEE3]"
              >
                <SocialIcon kind="instagram" />
              </a>
            </div>
            <div className="h-8 w-px bg-[#F3EAD9]/15" aria-hidden />
            <p className="text-[12.5px] tracking-[0.02em] md:text-[13.5px]">
              <span className="font-medium text-[#F5EEE3]">{site.hero.trust.split(' ').slice(0, 3).join(' ')}</span>{' '}
              {site.hero.trust.split(' ').slice(3).join(' ')}
            </p>
          </div>
        </div>

        <div
          className="relative min-h-[440px] animate-fade-up lg:min-h-full"
          style={{ animationDelay: '180ms' }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-[16%] z-0 h-[58%] w-[58%] -translate-x-1/2 rounded-full opacity-80 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(196,140,82,0.38) 0%, rgba(90,50,28,0.14) 48%, transparent 72%)',
            }}
          />
          <div
            className="pointer-events-none absolute bottom-[7%] left-1/2 z-0 h-[72px] w-[58%] -translate-x-1/2 rounded-[100%] bg-black/55 blur-2xl"
            aria-hidden
          />

          <div className="relative z-[1] mx-auto h-[480px] w-full max-w-[500px] animate-float sm:h-[560px] lg:absolute lg:inset-0 lg:mx-0 lg:h-full lg:max-w-none">
            <SiteImage
              src="/uploads/a8108f00-b9ff-423f-9e10-dbc9c297b459.png"
              alt="Layered specialty coffee with foam and roasted beans"
              fill
              priority
              className="object-contain object-center mix-blend-lighten drop-shadow-[0_32px_60px_rgba(0,0,0,0.6)]"
              sizes="(max-width: 1024px) 90vw, 50vw"
            />
          </div>

          <div className="absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex xl:right-10">
            <span className="flex h-9 w-9 items-center justify-center border border-[#F3EAD9]/25 text-[#F3EAD9]/90">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                <path
                  d="M7 10h8l-.8 8.2a1.5 1.5 0 0 1-1.5 1.3H9.3a1.5 1.5 0 0 1-1.5-1.3L7 10Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M8 10V7.5A2.5 2.5 0 0 1 10.5 5h1A2.5 2.5 0 0 1 14 7.5V10"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path d="M15 12h2.2a1.8 1.8 0 0 0 0-3.6H15" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <div className="h-10 w-px bg-gradient-to-b from-[#F3EAD9]/40 to-transparent" aria-hidden />
            <p
              className="font-display text-[11px] font-medium uppercase tracking-[0.32em] text-[#F3EAD9]/78"
              style={{ writingMode: 'vertical-rl' }}
            >
              Small batch. Big flavor.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
