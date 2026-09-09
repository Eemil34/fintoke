'use client';

import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';

function TaskCard({
  title,
  assignee,
  dates,
  avatar,
  highlight,
}: {
  title: string;
  assignee: string;
  dates: string;
  avatar: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 transition-shadow ${
        highlight
          ? 'bg-[#1e2430] border-hr-green/30 shadow-[0_0_24px_rgba(61,255,139,0.12)]'
          : 'bg-[#22262f] border-white/5'
      }`}
    >
      <p className="text-sm text-white/95 leading-snug">{title}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#9aa0ad]">
        <span className="inline-flex items-center gap-1 text-hr-green">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
            <path d="M6 0l1.5 3.9L12 4.5 9 7.2l.9 4.8L6 9.6 2.1 12 3 7.2 0 4.5l4.5-.6L6 0z" />
          </svg>
          AI Help
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="relative h-4 w-4 overflow-hidden rounded-full">
            <SiteImage src={avatar} alt={assignee} fill className="object-cover" sizes="16px" />
          </span>
          {assignee}
        </span>
        <span>{dates}</span>
      </div>
    </div>
  );
}

export function GenAiMundane() {
  const maria = unsplash('photo-1494790108377-be9c29b29330', 80);
  const andreas = unsplash('photo-1472099645785-5658abf4ff4e', 80);

  return (
    <section className="relative z-10 -mt-16 md:-mt-24 bg-black text-white px-4 sm:px-8 lg:px-12 pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden rounded-t-[2.5rem] md:rounded-t-[3.5rem] shadow-[0_-24px_70px_rgba(0,0,0,0.25)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_70%_30%,rgba(61,255,139,0.1),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 star-field opacity-30" aria-hidden />

      <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-10 items-center relative">
        <div className="relative z-10 max-w-lg">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-hr-green/25 bg-hr-green/[0.07] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-hr-green">
            <span className="h-1.5 w-1.5 rounded-full bg-hr-green-bright animate-pulse" />
            Work reimagined
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-[2.7rem] font-semibold leading-tight tracking-tight">
            <span className="text-hr-green">GenAI</span> will execute more mundane development
            tasks.
          </h2>
          <p className="mt-5 text-sm sm:text-base text-[#9ca3af] leading-relaxed">
            Developers will orchestrate the work of AI agents while focusing on higher-level problem
            solving.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              'Delegate boilerplate and busywork to agents',
              'Keep humans on architecture and judgment',
              'Ship faster without lowering the bar',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/85">
                <span className="mt-0.5 text-hr-green font-bold" aria-hidden>
                  +
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-[440px] sm:min-h-[520px]">
          <div className="absolute right-0 top-0 h-[90%] w-[74%] sm:w-[70%] overflow-hidden rounded-[2rem] ring-1 ring-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <SiteImage
              src={unsplash('photo-1497366216548-37526070297c', 1100)}
              alt="Open office"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 80vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          </div>

          <div className="absolute left-0 top-14 sm:top-16 w-[60%] sm:w-[50%] rounded-2xl bg-[#1a1d26]/95 backdrop-blur-md border border-white/10 p-3.5 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">Backlog</p>
              <span className="text-white/40 text-lg leading-none">⋯</span>
            </div>
            <TaskCard
              title="Making API requests and handling responses"
              assignee="Maria P."
              dates="May 24 — July 1"
              avatar={maria}
            />
          </div>

          <div className="absolute left-[26%] sm:left-[32%] bottom-0 sm:bottom-4 w-[66%] sm:w-[54%] rounded-2xl bg-[#1a1d26]/95 backdrop-blur-md border border-hr-green/20 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_40px_rgba(61,255,139,0.08)] z-30">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white flex items-center gap-2">
                AI delegated
                <span className="rounded-full bg-hr-green/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-hr-green">
                  Live
                </span>
              </p>
              <span className="text-white/40 text-lg leading-none">⋯</span>
            </div>
            <div className="space-y-2.5">
              <TaskCard
                title="Making API requests and handling responses"
                assignee="Maria P."
                dates="May 24 — July 1"
                avatar={maria}
                highlight
              />
              <TaskCard
                title="Writing README files"
                assignee="Andreas H."
                dates="May 12 — June 5"
                avatar={andreas}
              />
            </div>
          </div>

          <div className="absolute left-[16%] top-[40%] z-40 pointer-events-none hidden sm:block">
            <svg width="150" height="74" viewBox="0 0 150 74" fill="none" aria-hidden>
              <path
                d="M10 58 C 42 12, 95 10, 132 38"
                stroke="#68e39d"
                strokeWidth="1.8"
                fill="none"
                className="drop-shadow-[0_0_6px_rgba(104,227,157,0.8)]"
              />
              <path d="M124 30 l12 9 -14 1" fill="#68e39d" />
              <text
                x="46"
                y="18"
                fill="white"
                fontSize="11"
                fontFamily="var(--font-sans), system-ui, sans-serif"
                fontWeight="600"
              >
                AI Delegated
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
