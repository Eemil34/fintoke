'use client';

import { useEffect, useRef, useState } from 'react';

function FingerprintIcon() {
  return (
    <span className="hero-icon relative inline-flex align-middle mx-1.5 sm:mx-2" aria-hidden>
      <span className="absolute inset-[-30%] rounded-full border border-hr-green/25 animate-[spin_12s_linear_infinite]" />
      <span className="absolute inset-[-12%] rounded-full bg-hr-green-bright/10 blur-md animate-pulse-glow" />
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        className="relative w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 drop-shadow-[0_0_22px_rgba(61,255,139,0.75)]"
      >
        <path
          d="M24 8c-6.5 0-11.5 4.4-11.5 11.2 0 2.2.5 4.3 1.4 6.1"
          stroke="#3dff8b"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M14.5 29.5c1.8 3.4 4.2 5.8 7.2 7.2"
          stroke="#3dff8b"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M24 8c6.5 0 11.5 4.4 11.5 11.2 0 3.4-1.2 6.4-3.2 8.7"
          stroke="#68e39d"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M18.2 14.2c1.5-1.4 3.5-2.2 5.8-2.2 4.3 0 7.6 2.8 7.6 7.4 0 5.8-2.4 9.6-6.4 13.4"
          stroke="#3dff8b"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M21.2 18.5c.7-.8 1.7-1.3 2.8-1.3 2.1 0 3.6 1.5 3.6 3.8 0 3.2-1 5.6-3.2 8.2"
          stroke="#68e39d"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M24 24.5v4.8" stroke="#3dff8b" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function SparkleIcon() {
  return (
    <span className="hero-icon relative inline-flex align-middle mx-1.5 sm:mx-2" aria-hidden>
      <span className="absolute inset-[-40%] animate-[spin_8s_linear_infinite]">
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-hr-green-bright shadow-[0_0_10px_#3dff8b]" />
        <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-hr-green/80" />
      </span>
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        className="relative w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 drop-shadow-[0_0_22px_rgba(61,255,139,0.8)] animate-pulse-glow"
      >
        <path
          d="M22 4l2.8 12.2L37 19l-12.2 2.8L22 34l-2.8-12.2L7 19l12.2-2.8L22 4z"
          fill="#3dff8b"
          opacity="0.95"
        />
        <path
          d="M34 6l1.2 4.6L40 12l-4.8 1.2L34 18l-1.2-4.8L28 12l4.8-1.4L34 6z"
          fill="#68e39d"
        />
      </svg>
    </span>
  );
}

const FLOATERS = [
  { label: 'map_skills()', x: '8%', y: '28%', delay: '0s' },
  { label: 'close_gaps()', x: '82%', y: '24%', delay: '0.8s' },
  { label: 'GenAI ready', x: '12%', y: '62%', delay: '1.4s' },
  { label: 'human + AI', x: '78%', y: '58%', delay: '2s' },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height * 0.85, 1);
      const raw = Math.min(Math.max(-rect.top / total, 0), 1);
      setProgress(raw);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMouse({ x, y });
    };

    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  const contentY = progress * 160;
  const contentOpacity = Math.max(0, 1 - progress * 1.35);
  const contentScale = 1 - progress * 0.18;
  const contentBlur = progress * 10;
  const contentRotate = progress * -2.5;
  const glowY = progress * -120;
  const glowScale = 1 + progress * 0.45;
  const glowOpacity = Math.max(0.15, 1 - progress * 0.7);
  const floaterSpread = progress * 140;
  const gridFade = Math.max(0, 1 - progress * 1.4);
  const mouseX = mouse.x * 18;
  const mouseY = mouse.y * 12;

  return (
    <section
      ref={sectionRef}
      className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-8 pb-48 pt-28 md:pt-36 md:pb-56 text-center min-h-[82vh]"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
        style={{
          transform: `translate3d(0, ${glowY}px, 0) scale(${glowScale})`,
          opacity: glowOpacity,
        }}
      >
        <div
          className="hero-grid absolute inset-0 opacity-[0.18]"
          style={{ opacity: 0.18 * gridFade, transform: `scale(${1 + progress * 0.25})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_70%,#000_100%)]" />

        <div
          className="absolute left-1/2 top-[16%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-hr-green-bright/[0.11] blur-[110px] transition-transform duration-300 ease-out"
          style={{ transform: `translate3d(calc(-50% + ${mouseX * 0.6}px), ${mouseY * 0.5}px, 0)` }}
        />
        <div
          className="absolute left-[8%] top-[36%] h-64 w-64 rounded-full bg-hr-green/15 blur-[90px] transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mouseX * -0.8}px, ${mouseY * 0.7}px, 0)` }}
        />
        <div
          className="absolute right-[6%] top-[22%] h-72 w-72 rounded-full bg-hr-green-bright/[0.12] blur-[100px] transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mouseX * 1.1}px, ${mouseY * -0.6}px, 0)` }}
        />

        <div
          className="absolute inset-x-0 top-[12%] h-px bg-gradient-to-r from-transparent via-hr-green/40 to-transparent"
          style={{ opacity: gridFade, transform: `scaleX(${1 - progress * 0.4})` }}
        />
        <div
          className="absolute inset-x-[18%] top-[12%] h-px bg-hr-green-bright/50 blur-[2px]"
          style={{ opacity: gridFade }}
        />

        {FLOATERS.map((item, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          return (
            <div
              key={item.label}
              className="absolute hidden md:block"
              style={{
                left: item.x,
                top: item.y,
                transform: `translate3d(${dir * floaterSpread}px, ${-floaterSpread * 0.45}px, 0) scale(${1 - progress * 0.35})`,
                opacity: Math.max(0, 0.9 - progress * 1.2),
              }}
            >
              <div
                className="hero-floater rounded-full border border-hr-green/20 bg-black/50 px-3 py-1.5 text-[11px] font-mono text-hr-green/80 backdrop-blur-sm shadow-[0_0_24px_rgba(61,255,139,0.12)]"
                style={{ animationDelay: item.delay }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="relative will-change-transform"
        style={{
          transform: `translate3d(${mouseX * 0.15}px, ${contentY + mouseY * 0.1}px, 0) scale(${contentScale}) rotate(${contentRotate}deg)`,
          opacity: contentOpacity,
          filter: contentBlur > 0.2 ? `blur(${contentBlur}px)` : undefined,
        }}
      >
        <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-hr-green/25 bg-hr-green/[0.06] px-3.5 py-1.5 text-[11px] sm:text-xs font-medium tracking-wide text-hr-green shadow-[0_0_28px_rgba(61,255,139,0.12)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-hr-green-bright animate-ping opacity-60" />
            <span className="relative rounded-full h-1.5 w-1.5 bg-hr-green-bright" />
          </span>
          Built for the GenAI era
        </div>

        <h1 className="animate-fade-up max-w-5xl text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-semibold tracking-tight [text-shadow:0_16px_50px_rgba(0,0,0,0.65)]">
          <span className="hero-muted hero-word" style={{ animationDelay: '0.05s' }}>
            The future
          </span>
          <br className="hidden sm:block" />{' '}
          <span className="hero-muted hero-word" style={{ animationDelay: '0.12s' }}>
            of development
          </span>{' '}
          <span className="text-white hero-word" style={{ animationDelay: '0.2s' }}>
            is
          </span>
          <FingerprintIcon />
          <span className="hero-shine hero-word" style={{ animationDelay: '0.28s' }}>
            human
          </span>{' '}
          <span className="text-white/90 hero-word" style={{ animationDelay: '0.34s' }}>
            +
          </span>
          <SparkleIcon />
          <span className="hero-shine hero-word" style={{ animationDelay: '0.4s' }}>
            AI
          </span>
        </h1>

        <p className="animate-fade-up-delay mt-8 max-w-xl mx-auto text-[0.95rem] sm:text-base leading-relaxed text-[#9a9a9a]">
          We help you map the skills you need, track the skills you have, and close your gaps to
          thrive in a GenAI world.
        </p>

        <div className="animate-fade-up-delay-2 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#community"
            className="group relative inline-flex items-center justify-center rounded-xl border border-hr-green/60 bg-[#0d0d0d] px-8 py-3.5 text-sm font-semibold text-white shadow-green-glow overflow-hidden hover:bg-[#121212] transition-[background,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(104,227,157,0.65),0_0_48px_rgba(61,255,139,0.5)]"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-hr-green/20 to-transparent transition-transform duration-700" />
            <span className="relative flex items-center gap-2">
              Join The Community
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              >
                <path
                  d="M2 7h9M7.5 3.5L11 7l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
          <a
            href="#demo"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-[#cfcfcf] hover:text-white hover:border-white/30 hover:bg-white/[0.06] transition-all duration-300"
          >
            Request a demo
          </a>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: Math.max(0, 1 - progress * 2.2) }}
        aria-hidden
      >
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">Scroll</span>
        <span className="hero-scroll-line relative h-10 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-hr-green-bright to-transparent" />
        </span>
      </div>
    </section>
  );
}
