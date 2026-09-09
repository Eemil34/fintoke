import Link from 'next/link';
import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';
import { site } from '@/lib/site';

const avatarIds = [
  'photo-1559839734-2b71ea197ec2',
  'photo-1612349317150-e413f6a5b16d',
  'photo-1631217868264-e5b90bb7e133',
] as const;

export function Hero() {
  return (
    <section className="relative bg-brand-bg">
      <div className="relative mx-auto max-w-[1440px]">
        {/* Photo block */}
        <div className="relative h-[560px] overflow-hidden md:h-[680px]">
          <SiteImage
            src={unsplash('photo-1631217868264-e5b90bb7e133', 2000)}
            alt="Healthcare professional in surgical scrubs"
            fill
            priority
            className="object-cover object-[center_22%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />

          {/* Centered hero copy */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-24 pt-10 text-center text-white md:pb-32">
            <h1 className="max-w-[920px] text-[1.85rem] font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[3.25rem]">
              {site.hero.title}
            </h1>
            <p className="mt-5 max-w-[640px] text-sm leading-relaxed text-white/90 md:text-lg">
              {site.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/appointment"
                className="inline-flex items-center gap-3 rounded-full bg-[#8B2C82] py-2.5 pl-6 pr-2 text-sm font-semibold text-white shadow-lg shadow-[#8B2C82]/40"
              >
                {site.hero.cta}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25">
                  <ArrowIcon />
                </span>
              </Link>
              <Link
                href="/treatments"
                className="inline-flex items-center gap-3 rounded-full bg-white py-2.5 pl-6 pr-2 text-sm font-semibold text-gray-900 shadow-lg"
              >
                {site.hero.ctaSecondary}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-900">
                  <ArrowIcon />
                </span>
              </Link>
            </div>
          </div>

          {/* Wave cutout at bottom of photo */}
          <svg
            className="pointer-events-none absolute bottom-0 left-0 z-20 h-[140px] w-full text-brand-bg md:h-[180px]"
            viewBox="0 0 1440 180"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M0,110 C160,30 280,170 460,130 C640,90 740,20 900,50 C1060,80 1200,140 1440,70 L1440,180 L0,180 Z"
            />
          </svg>

          {/* Soft white ribbon under left cards */}
          <div className="pointer-events-none absolute bottom-0 left-0 z-20 hidden w-[52%] md:block">
            <svg viewBox="0 0 700 200" className="h-[160px] w-full" preserveAspectRatio="none" aria-hidden>
              <path
                d="M0 130 C140 20 240 180 380 90 S600 20 700 110 L700 200 L0 200 Z"
                fill="white"
                opacity="0.95"
              />
            </svg>
          </div>
        </div>

        {/* Floating cards sit on the wave */}
        <div className="pointer-events-none absolute bottom-6 left-4 z-30 sm:left-8 md:bottom-10 md:left-14">
          <div className="pointer-events-auto flex w-[240px] flex-col gap-3 sm:w-[270px]">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
              <p className="flex-1 text-[15px] font-bold leading-snug text-gray-900">
                5,000+ Jobs Filled This Month
              </p>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3E8F2] text-[#8B2C82]">
                <SearchIcon />
              </span>
            </div>
            <div className="ml-8 flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_20px_50px_rgba(15,23,42,0.16)] sm:ml-12">
              <div className="flex-1">
                <p className="text-[15px] font-bold leading-snug text-gray-900">98%</p>
                <p className="text-xs text-gray-500">Placement Satisfaction Rate</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3E8F2] text-[#8B2C82]">
                <PinIcon />
              </span>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-10 right-4 z-30 hidden sm:block md:bottom-16 md:right-14">
          <div className="pointer-events-auto w-[250px] rounded-2xl border border-white/45 bg-white/20 p-5 text-white shadow-2xl backdrop-blur-md">
            <p className="text-[15px] font-bold">Diversity-Centric Hires</p>
            <p className="mt-1 text-sm text-white/85">As easy as a click away.</p>
            <div className="mt-4 flex items-end justify-between">
              <div className="flex -space-x-2.5">
                {avatarIds.map((id) => (
                  <span
                    key={id}
                    className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white"
                  >
                    <SiteImage
                      src={unsplash(id, 120)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </span>
                ))}
              </div>
              <span className="text-lg font-bold">+50%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M4 10h11M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="9" r="5.5" />
      <path d="M14 14l3.5 3.5" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M10 2a5 5 0 00-5 5c0 3.5 5 11 5 11s5-7.5 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}
