import { SiteImage } from '@/components/SiteImage';
import { Header } from '@/components/Header';
import { uploads } from '@/lib/site';

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 hero-stage" aria-hidden />
      <div className="pointer-events-none absolute inset-0 paper-grain opacity-[0.055] mix-blend-multiply" aria-hidden />
      <div className="pointer-events-none absolute inset-0 hero-vignette" aria-hidden />

      <div
        className="pointer-events-none absolute left-[8%] top-[12%] h-[42%] w-[28%] animate-glow-pulse rounded-full bg-[radial-gradient(circle,rgba(255,250,240,0.7)_0%,transparent_70%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[6%] top-[16%] h-[40%] w-[26%] animate-glow-pulse rounded-full bg-[radial-gradient(circle,rgba(212,188,148,0.35)_0%,transparent_70%)] blur-2xl"
        style={{ animationDelay: '2.5s' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-8%] left-1/2 h-[38%] w-[70%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse,rgba(42,27,20,0.22)_0%,transparent_68%)] blur-3xl"
        aria-hidden
      />

      <div className="relative z-30">
        <Header />
      </div>

      <div className="relative mx-auto w-full max-w-[1480px]">
        <div className="relative aspect-[1695/928] min-h-[340px] w-full sm:min-h-[440px]">
          <div
            className="pointer-events-none absolute bottom-[10%] left-[6%] z-[1] h-[18%] w-[28%] animate-shadow-breathe hero-cup-shadow md:left-[8%] md:w-[24%]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[10%] right-[6%] z-[1] h-[18%] w-[28%] animate-shadow-breathe hero-cup-shadow md:right-[8%] md:w-[24%]"
            style={{ animationDelay: '1.2s' }}
            aria-hidden
          />

          <div
            className="pointer-events-none absolute inset-[8%] z-[1] rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(255,252,246,0.55)_0%,transparent_68%)] blur-xl"
            aria-hidden
          />

          <div className="absolute inset-0 z-[2]">
            <SiteImage
              src={uploads.hero}
              alt="Two hands toasting iced Caffiora coffee"
              fill
              priority
              className="animate-fade-in object-contain object-center drop-shadow-[0_28px_50px_rgba(42,27,20,0.28)]"
              sizes="100vw"
            />
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[28%] bg-gradient-to-t from-[rgba(42,27,20,0.14)] via-[rgba(42,27,20,0.04)] to-transparent"
            aria-hidden
          />

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center sm:px-20 md:px-28 lg:px-36">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[48%] -translate-x-1/2 -translate-y-[46%] hero-text-glow"
              aria-hidden
            />

            <p
              className="relative animate-fade-up text-[13px] font-medium tracking-[0.06em] text-roast/75 md:text-[16px]"
              style={{ animationDelay: '60ms' }}
            >
              Elevate Your Day with
            </p>
            <h1
              className="relative animate-fade-up mt-3 max-w-[12ch] font-display text-[clamp(2.35rem,6.2vw,5.25rem)] font-semibold italic leading-[0.92] tracking-[-0.03em] text-roast [text-shadow:0_2px_24px_rgba(234,227,217,0.9),0_1px_0_rgba(255,255,255,0.45)]"
              style={{ animationDelay: '140ms' }}
            >
              RICH &amp; AROMATIC COFFEE
            </h1>

            <div
              className="relative animate-scale-in mt-7 md:mt-10"
              style={{ animationDelay: '280ms' }}
            >
              <div
                className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(42,27,20,0.18)_0%,transparent_68%)] blur-lg"
                aria-hidden
              />
              <a
                href="#about"
                className="group relative flex h-[6.5rem] w-[6.5rem] items-center justify-center md:h-[7.75rem] md:w-[7.75rem]"
                aria-label="Browse collection"
              >
                <span className="absolute inset-0 rounded-full bg-roast shadow-[0_18px_44px_rgba(42,27,20,0.32)] transition duration-300 group-hover:scale-[1.04] group-hover:shadow-[0_22px_52px_rgba(42,27,20,0.4)]" />
                <span className="absolute inset-[3px] rounded-full border border-parchment-soft/20" />
                <span className="absolute inset-0 animate-orbit">
                  <svg viewBox="0 0 120 120" className="h-full w-full">
                    <defs>
                      <path
                        id="browseRing"
                        d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                      />
                    </defs>
                    <text
                      className="fill-parchment-soft"
                      style={{ fontSize: '8.5px', letterSpacing: '0.28em', fontFamily: 'var(--font-sans)' }}
                    >
                      <textPath href="#browseRing" startOffset="0%">
                        BROWSE COLLECTION · BROWSE ·
                      </textPath>
                    </text>
                  </svg>
                </span>
                <span className="relative z-10 flex flex-col items-center text-parchment-soft">
                  <span className="font-display text-[1.05rem] italic leading-none md:text-[1.2rem]">
                    Shop
                  </span>
                  <span className="mt-1.5 animate-arrow-bounce text-lg leading-none" aria-hidden>
                    ↓
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
