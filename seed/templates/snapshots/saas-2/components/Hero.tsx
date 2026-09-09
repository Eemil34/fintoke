export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pb-32 lg:pt-36"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,255,69,0.12),transparent_55%)]" />
        <div className="glow-orb left-[-12%] top-16 h-[460px] w-[460px] bg-sift-lime/18" />
        <div className="glow-orb right-[-4%] top-28 h-[520px] w-[520px] bg-sift-lime/12" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sift-lime/20 bg-sift-lime/[0.07] px-3 py-1 shadow-[0_0_24px_rgba(212,255,69,0.12)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sift-lime opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sift-lime" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sift-lime">
              AI operations analyst
            </span>
          </div>

          <h1 className="font-display text-[2.85rem] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.65rem]">
            <span className="block drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">Decisions,</span>
            <span className="mt-1 block bg-gradient-to-r from-sift-lime via-[#e8ff7a] to-sift-lime bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(212,255,69,0.35)]">
              not dashboards.
            </span>
          </h1>

          <p className="mt-6 max-w-[28rem] text-[15px] leading-[1.7] text-sift-soft sm:text-[16px]">
            Sift reads every tool in your stack, surfaces what actually moved the numbers, and
            drafts the next move — so your team ships answers, not another report.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 rounded-xl bg-sift-lime px-5 py-3.5 text-[13px] font-bold uppercase tracking-wide text-black shadow-[0_0_40px_rgba(212,255,69,0.4),0_12px_28px_-8px_rgba(212,255,69,0.45),0_4px_12px_rgba(0,0,0,0.4)] transition hover:brightness-110"
            >
              Start for free
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3.5 text-[13px] font-semibold uppercase tracking-wide text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm transition hover:border-white/30 hover:bg-white/[0.06]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <PlayIcon />
              </span>
              Watch the 2-min tour
            </a>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-[0_16px_48px_-24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.04)]">
            {[
              { value: '11 hrs', label: 'saved / week, per operator' },
              { value: '40+', label: 'native integrations' },
              { value: 'SOC 2', label: 'Type II certified' },
            ].map((stat, i) => (
              <div
                key={stat.value}
                className={`px-4 py-4 ${i > 0 ? 'border-l border-white/[0.08]' : ''}`}
              >
                <p className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[10px] leading-snug text-sift-muted sm:text-[11px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:140ms]">
          <div
            className="glow-orb -right-6 top-8 h-80 w-80 bg-sift-lime/30"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-sift-lime/10 via-transparent to-transparent blur-2xl"
            aria-hidden
          />

          <div className="absolute -left-1 top-4 z-20 animate-float sm:-left-8 sm:top-6">
            <div className="rounded-2xl border border-white/10 bg-[#141414]/95 px-3.5 py-2.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(212,255,69,0.12),0_0_32px_rgba(212,255,69,0.08)] backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sift-lime/15 text-sift-lime shadow-[inset_0_1px_0_rgba(212,255,69,0.2)]">
                  <BellIcon />
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-white">Anomaly caught</p>
                  <p className="text-[10px] text-sift-muted">EMEA churn · 04:12</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-gradient-to-b from-[#1e1e1e] to-[#101010] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06),0_0_80px_-20px_rgba(212,255,69,0.25)]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/20 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.5)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.4)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.4)]" />
              <p className="ml-3 rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-sift-muted">
                app.sift.io / pulse
              </p>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold tracking-tight text-white">Revenue Pulse</h3>
                <div className="flex rounded-lg border border-white/5 bg-black/50 p-0.5 text-[10px] font-semibold shadow-inner">
                  <span className="rounded-md bg-sift-lime px-2.5 py-1 text-black shadow-[0_0_12px_rgba(212,255,69,0.35)]">
                    30D
                  </span>
                  <span className="px-2.5 py-1 text-sift-muted">QTD</span>
                  <span className="px-2.5 py-1 text-sift-muted">YTD</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Net revenue · Q3" value="$284.6k" delta="+18.4%" />
                <MetricCard label="Churn rate" value="2.1%" delta="-0.6%" />
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/40 px-3 pb-2 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <BarChart />
              </div>

              <div className="flex gap-3 rounded-xl border border-sift-lime/25 bg-gradient-to-br from-sift-lime/[0.1] to-transparent p-3.5 shadow-[0_0_28px_rgba(212,255,69,0.08),inset_0_1px_0_rgba(212,255,69,0.12)]">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sift-lime text-black shadow-[0_4px_14px_rgba(212,255,69,0.4)]">
                  <PencilIcon />
                </span>
                <p className="text-[12px] leading-relaxed text-sift-soft">
                  Growth is led by{' '}
                  <span className="font-semibold text-white">Enterprise renewals (+31%)</span>.
                  I&apos;ve drafted outreach for 12 at-risk mid-market accounts — approve to send.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-black/40 p-3.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          {value}
        </p>
        <span className="rounded-full bg-sift-lime/15 px-2 py-0.5 text-[10px] font-semibold text-sift-lime shadow-[0_0_12px_rgba(212,255,69,0.2)]">
          {delta}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-sift-muted">{label}</p>
    </div>
  );
}

function BarChart() {
  const heights = [38, 52, 44, 68, 55, 72, 48, 90, 62, 58, 70, 46];
  return (
    <div className="flex h-28 items-end justify-between gap-1.5 px-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-full rounded-t-sm transition-all ${
            i === 7
              ? 'bg-sift-lime shadow-[0_0_16px_rgba(212,255,69,0.55)]'
              : 'bg-white/15'
          }`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
