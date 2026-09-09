'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SiteImage } from '@/components/SiteImage';

const NAV = [
  { label: 'Models', href: '#models' },
  { label: 'Eco-routing', href: '#eco-routing' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Documentation', href: '#docs' },
];

const MARKERS = [
  {
    label: 'Eco-routing active',
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    className: 'left-[8%] top-[46%] sm:left-[12%] sm:top-[42%] animate-float-slow',
  },
  {
    label: 'Speed priority',
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
        <path
          d="M4 16a8 8 0 0 1 16 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path d="M12 16l5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
    className: 'left-1/2 top-[34%] -translate-x-1/2 sm:top-[30%] animate-float-mid',
  },
  {
    label: '0.4g CO₂ emitted',
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
        <path
          d="M12 20c4-3.5 6-6.4 6-9.2A6 6 0 0 0 6 10.8C6 13.6 8 16.5 12 20Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M10 11.5c.8-.8 2-.8 2.8 0"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
    className: 'right-[6%] top-[48%] sm:right-[10%] sm:top-[44%] animate-float-fast',
  },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight, 1);
      const raw = Math.min(Math.max(-rect.top / total, 0), 1);
      setProgress(raw);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Scroll down → Earth + copy travel together downward into the next section
  // (fixes prior opposite-direction parallax).
  const worldY = progress * 48;
  const worldScale = 1 + progress * 0.06;
  const contentOpacity = Math.max(1 - progress * 1.35, 0);
  const contentY = progress * 70;
  const markersOpacity = Math.max(1 - progress * 1.7, 0);
  const blurbOpacity = Math.max(0.15, 1 - progress * 0.85);
  const blurbY = progress * 55;

  return (
    <section ref={sectionRef} className="relative h-[200vh] bg-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.18),transparent_55%)]" />

        <header className="relative z-40 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5 text-white">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/5">
              <span className="h-2.5 w-2.5 rounded-full bg-glow-bright shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              <span className="absolute inset-[5px] rounded-full border border-white/40" />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight">Switch</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium text-white/75 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#login" className="text-[13px] font-medium text-white/80 transition hover:text-white">
              Log in
            </a>
            <a
              href="#start"
              className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:bg-frost"
            >
              Start routing
            </a>
          </div>
        </header>

        <div
          className="relative z-30 mx-auto flex max-w-3xl flex-col items-center px-5 pt-8 text-center sm:pt-12"
          style={{
            opacity: contentOpacity,
            transform: `translateY(${contentY}px)`,
            pointerEvents: contentOpacity < 0.05 ? 'none' : 'auto',
          }}
        >
          <div className="mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12px] font-medium tracking-wide text-white/80 backdrop-blur-md">
            Routing Control
          </div>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
            Intelligence on your terms.
          </h1>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 z-10 will-change-transform"
          style={{
            top: '18%',
            height: '120%',
            transform: `translate3d(0, ${worldY}vh, 0) scale(${worldScale})`,
            transformOrigin: 'center bottom',
          }}
        >
          <div className="absolute inset-0">
            <SiteImage
              src="/images/switch-earth.png"
              alt="Glowing Earth network from orbit"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_18%]"
            />
          </div>
          <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-ink via-ink/50 to-transparent" />
          <div className="absolute inset-x-[8%] top-[10%] h-24 rounded-full bg-glow/30 blur-3xl" />

          <div className="absolute inset-0" style={{ opacity: markersOpacity }}>
            {MARKERS.map((marker) => (
              <div key={marker.label} className={`absolute ${marker.className}`}>
                <div className="flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#0b1220]/92 px-3 py-1.5 text-[12px] font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
                    <span className="text-glow-bright">{marker.icon}</span>
                    {marker.label}
                  </div>
                  <span className="h-8 w-px bg-gradient-to-b from-white/70 to-transparent sm:h-12" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-pulse-dot" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="absolute left-1/2 z-30 w-[min(92%,34rem)] -translate-x-1/2 text-center text-[13px] leading-relaxed text-white/70 sm:text-[14px]"
          style={{
            bottom: `${10 - progress * 6}%`,
            opacity: blurbOpacity,
            transform: `translate(-50%, ${blurbY}px)`,
          }}
        >
          Dial in your exact requirements for speed, cost, and carbon footprint. Get real-time
          readouts on energy, water, and CO consumption for every query.
        </p>
      </div>
    </section>
  );
}

/** Full-bleed Earth that bridges hero → following sections */
export function EarthContinue({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate -mt-[35vh] overflow-hidden bg-ink pt-[35vh]">
      {/* Earth ball continues downward with the page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(75vh,700px)]">
        <SiteImage
          src="/images/switch-earth.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_8%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/50 to-ink" />
        <div className="absolute inset-x-[12%] top-[22%] h-28 rounded-full bg-glow/30 blur-3xl" />
      </div>

      <div className="relative z-10 px-5 pb-16 pt-6 sm:px-8 sm:pb-24 sm:pt-10">{children}</div>
    </section>
  );
}
