'use client';

import { useState, type ReactNode } from 'react';

const steps = [
  {
    n: '01',
    title: 'Connect your sources',
    body: 'Point Sift at your warehouse and tools. It profiles the schema, learns your metrics, and maps relationships in minutes.',
  },
  {
    n: '02',
    title: 'Ask, or let it watch',
    body: 'Query in natural language or set the metrics that matter. Sift monitors continuously and reasons over changes as they happen.',
  },
  {
    n: '03',
    title: 'Approve the action',
    body: 'Every insight arrives with a recommended next step. One click and the agent runs it across your stack — fully logged.',
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section id="how-it-works" className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="how-panel relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/[0.07] px-6 py-12 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-10 sm:py-14 lg:rounded-[2.5rem] lg:px-14 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_40%,rgba(212,255,69,0.08),transparent_55%),radial-gradient(ellipse_50%_45%_at_85%_60%,rgba(16,80,50,0.45),transparent_50%)]"
          aria-hidden
        />
        <div className="glow-orb left-[8%] top-[15%] h-72 w-72 bg-sift-lime/10" aria-hidden />
        <div className="glow-orb right-[10%] bottom-[5%] h-80 w-80 bg-emerald-700/30" aria-hidden />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sift-lime/20 bg-sift-lime/[0.06] px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sift-lime shadow-[0_0_8px_rgba(212,255,69,0.7)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sift-lime">
                How it works
              </span>
            </div>

            <h2 className="font-display max-w-md text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.7rem] lg:leading-[1.08]">
              From raw data to{' '}
              <span className="bg-gradient-to-r from-sift-lime to-[#9fd400] bg-clip-text text-transparent">
                done
              </span>{' '}
              in three moves.
            </h2>

            <ol className="relative mt-10 space-y-2">
              <div
                className="absolute bottom-4 left-[1.15rem] top-4 w-px bg-gradient-to-b from-sift-lime/50 via-white/10 to-transparent"
                aria-hidden
              />
              {steps.map((step, i) => {
                const isActive = active === i;
                return (
                  <li key={step.n}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      className={`group relative grid w-full grid-cols-[auto_1fr] gap-4 rounded-2xl border px-3 py-4 text-left transition duration-300 sm:px-4 ${
                        isActive
                          ? 'border-sift-lime/25 bg-sift-lime/[0.06] shadow-[0_0_32px_rgba(212,255,69,0.08),inset_0_1px_0_rgba(212,255,69,0.1)]'
                          : 'border-transparent bg-transparent opacity-55 hover:opacity-80'
                      }`}
                    >
                      <span
                        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-xl font-display text-[12px] font-bold transition ${
                          isActive
                            ? 'bg-sift-lime text-black shadow-[0_0_20px_rgba(212,255,69,0.45)]'
                            : 'bg-white/[0.06] text-sift-muted ring-1 ring-white/10'
                        }`}
                      >
                        {step.n}
                      </span>
                      <div>
                        <h3
                          className={`font-display text-[17px] font-semibold tracking-tight transition ${
                            isActive ? 'text-white' : 'text-white/70'
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`mt-1.5 text-[13px] leading-relaxed transition sm:text-sm ${
                            isActive ? 'text-sift-soft' : 'text-sift-muted'
                          }`}
                        >
                          {step.body}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sift-lime/10 via-transparent to-emerald-900/20 blur-2xl"
              aria-hidden
            />

            <div className="relative rounded-[1.6rem] border border-white/10 bg-[#0f1210]/95 p-5 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sift-muted">
                  Live pipeline
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sift-lime/10 px-2.5 py-1 text-[10px] font-semibold text-sift-lime">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sift-lime opacity-50" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-sift-lime" />
                  </span>
                  Running
                </span>
              </div>

              <div className="relative space-y-3 pl-1">
                <div
                  className="absolute bottom-8 left-[1.7rem] top-8 w-px bg-gradient-to-b from-amber-200/40 via-sift-lime/30 to-teal-400/50"
                  aria-hidden
                />

                <FlowNode
                  icon={<DbIcon />}
                  title="Snowflake · Stripe · HubSpot"
                  sub="312,904 rows synced"
                  badge="INPUT"
                  badgeClass="bg-amber-200 text-black shadow-[0_0_12px_rgba(253,230,138,0.35)]"
                  iconClass="bg-amber-200/15 text-amber-200"
                  active={active === 0}
                />
                <FlowNode
                  icon={<NodeIcon />}
                  title="Sift reasoning"
                  sub="connecting 6 signals…"
                  badge="ANALYZE"
                  badgeClass="bg-sift-lime/90 text-black shadow-[0_0_12px_rgba(212,255,69,0.35)]"
                  iconClass="bg-sift-lime/15 text-sift-lime"
                  active={active === 1}
                />
                <FlowNode
                  icon={<CheckIcon />}
                  title="Retention play launched"
                  sub="32 accounts · Slack notified"
                  badge="ACTION"
                  badgeClass="bg-teal-500 text-white shadow-[0_0_12px_rgba(20,184,166,0.4)]"
                  iconClass="bg-teal-500/20 text-teal-300"
                  active={active === 2}
                />
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/30 px-3.5 py-2.5">
                <p className="text-[11px] text-sift-muted">Latency</p>
                <p className="font-display text-[13px] font-semibold text-white">
                  1.4s <span className="font-sans text-[11px] font-normal text-sift-muted">end-to-end</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowNode({
  icon,
  title,
  sub,
  badge,
  badgeClass,
  iconClass,
  active,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  badge: string;
  badgeClass: string;
  iconClass: string;
  active: boolean;
}) {
  return (
    <div
      className={`relative flex items-center gap-3 rounded-2xl border p-3.5 transition duration-300 ${
        active
          ? 'scale-[1.02] border-white/15 bg-[#1c211e] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.9),0_0_0_1px_rgba(212,255,69,0.12)]'
          : 'border-white/[0.06] bg-[#161a17]/80 opacity-70'
      }`}
    >
      <span
        className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/5 transition ${iconClass} ${
          active ? 'shadow-[0_0_20px_rgba(212,255,69,0.15)]' : ''
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-white">{title}</p>
        <p className="truncate text-[11px] text-sift-muted">{sub}</p>
      </div>
      <span
        className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}
      >
        {badge}
      </span>
    </div>
  );
}

function DbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

function NodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
