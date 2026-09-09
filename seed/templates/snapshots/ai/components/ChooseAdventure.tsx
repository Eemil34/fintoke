'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';

function PlusItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-white/90">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-hr-green/15 text-hr-green text-xs font-bold"
        aria-hidden
      >
        +
      </span>
      <span>{children}</span>
    </li>
  );
}

function DeveloperVisual() {
  return (
    <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-2xl">
      <SiteImage
        src={unsplash('photo-1519389950473-47ba0277781c', 900)}
        alt="People working on laptops"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 40vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
      <div className="absolute inset-y-5 right-0 w-[82%] rounded-l-2xl bg-[#0f0f0f]/92 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.55)] overflow-hidden backdrop-blur-sm">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-3.5 py-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-hr-green/40">
            <SiteImage
              src={unsplash('photo-1507003211169-0a1dd7228f2d', 120)}
              alt="Developer avatar"
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Python Dev</p>
            <p className="text-[10px] text-hr-green flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-hr-green-bright animate-pulse" />
              HackerRank AI Enabled
            </p>
          </div>
        </div>
        <pre className="p-3.5 text-[10px] leading-relaxed text-[#9ae6b4] font-mono overflow-hidden">
{`def solve(n):
  skills = map_gap(n)
  return close(skills)

# GenAI ready ✓`}
        </pre>
      </div>
    </div>
  );
}

function BusinessVisual() {
  return (
    <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-2xl">
      <SiteImage
        src={unsplash('photo-1600880292203-757bb62b4baf', 900)}
        alt="Meeting around a table"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 40vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-hr-green/20" />
      <div className="absolute inset-0 star-field opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative adventure-orb">
          <div className="h-28 w-28 rounded-2xl bg-hr-green-bright shadow-[0_0_50px_rgba(61,255,139,0.55)] flex items-center justify-center rotate-3">
            <span className="text-black font-bold text-lg tracking-tight">GenAI</span>
          </div>
          <div className="absolute -inset-6 rounded-[1.75rem] border border-hr-green/30 rotate-12" />
          <div className="absolute -inset-10 rounded-[2rem] border border-hr-green/15 -rotate-6" />
        </div>
      </div>
    </div>
  );
}

export function ChooseAdventure() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<'dev' | 'biz' | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.18 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="community"
      className="relative z-10 -mt-16 md:-mt-24 bg-white text-[#1a1a1a] px-4 sm:px-8 lg:px-12 pt-20 pb-8 md:pt-28 md:pb-10 overflow-hidden rounded-t-[2.5rem] md:rounded-t-[3.5rem]"
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-16 rounded-t-[2.5rem] md:rounded-t-[3.5rem] bg-white"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-hr-green/[0.07] blur-[90px]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl text-center relative">
        <div
          className={`transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-hr-green-deep">
            Two paths. One platform.
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-[2.85rem] font-semibold tracking-tight">
            Choose Your <span className="text-hr-green-deep">Adventure</span>
          </h2>
          <p className="mt-3 mx-auto max-w-xl text-sm sm:text-base text-[#6b7280]">
            We build elite tech teams for companies and enhance candidates&apos; tech skills and job
            prospects
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article
            id="developers"
            onMouseEnter={() => setHovered('dev')}
            onMouseLeave={() => setHovered(null)}
            className={`adventure-card group relative rounded-[1.35rem] bg-[#0e0e0e] text-left text-white p-6 sm:p-7 grid sm:grid-cols-[1.05fr_0.95fr] gap-5 overflow-hidden border border-white/5 transition-all duration-500 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${hovered === 'biz' ? 'opacity-70 scale-[0.985]' : 'opacity-100 scale-100'} ${
              hovered === 'dev' ? 'shadow-[0_28px_80px_rgba(0,0,0,0.35),0_0_0_1px_rgba(61,255,139,0.25)] -translate-y-1' : 'shadow-[0_18px_50px_rgba(0,0,0,0.18)]'
            }`}
            style={{ transitionDelay: visible ? '120ms' : '0ms' }}
          >
            <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-hr-green/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-col relative z-10">
              <span className="mb-3 inline-flex w-fit items-center rounded-full border border-hr-green/25 bg-hr-green/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-hr-green">
                Developers
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold">For developers</h3>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">
                HackerRank helps you hone your developer skills and become GenAI-ready.
              </p>
              <ul className="mt-5 space-y-3">
                <PlusItem>Track your skill proficiency</PlusItem>
                <PlusItem>Prepare for technical interviews</PlusItem>
                <PlusItem>Learn the latest GenAI skills</PlusItem>
              </ul>
              <a
                href="#signup"
                className="mt-auto pt-8 inline-flex w-fit items-center gap-2 justify-center rounded-xl bg-hr-green px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_28px_rgba(104,227,157,0.25)] hover:brightness-105 hover:shadow-[0_0_36px_rgba(104,227,157,0.4)] transition-all"
              >
                Explore HackerRank Community
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
            <DeveloperVisual />
          </article>

          <article
            onMouseEnter={() => setHovered('biz')}
            onMouseLeave={() => setHovered(null)}
            className={`adventure-card group relative rounded-[1.35rem] bg-[#0e0e0e] text-left text-white p-6 sm:p-7 grid sm:grid-cols-[1.05fr_0.95fr] gap-5 overflow-hidden border border-white/5 transition-all duration-500 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${hovered === 'dev' ? 'opacity-70 scale-[0.985]' : 'opacity-100 scale-100'} ${
              hovered === 'biz' ? 'shadow-[0_28px_80px_rgba(0,0,0,0.35),0_0_0_1px_rgba(61,255,139,0.25)] -translate-y-1' : 'shadow-[0_18px_50px_rgba(0,0,0,0.18)]'
            }`}
            style={{ transitionDelay: visible ? '260ms' : '0ms' }}
          >
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-hr-green/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-col relative z-10">
              <span className="mb-3 inline-flex w-fit items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                Business
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold">For business</h3>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">Get your company GenAI ready</p>
              <ul className="mt-5 space-y-3">
                <PlusItem>Attract and hire the right developers</PlusItem>
                <PlusItem>Upskill your team with the latest GenAI skills</PlusItem>
                <PlusItem>Build out your AI platform team</PlusItem>
              </ul>
              <a
                href="#demo"
                className="mt-auto pt-8 inline-flex w-fit items-center gap-2 justify-center rounded-xl bg-[#252525] border border-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#303030] hover:border-hr-green/30 transition-all"
              >
                Explore HackerRank Community
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
            <BusinessVisual />
          </article>
        </div>
      </div>
    </section>
  );
}
