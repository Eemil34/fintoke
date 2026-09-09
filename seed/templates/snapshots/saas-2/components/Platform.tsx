import type { ReactNode } from 'react';

export function Platform() {
  return (
    <section id="platform" className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            One analyst for the whole stack.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-sift-muted sm:text-base">
            Stop stitching dashboards together at midnight. Sift reads your data the way a senior
            operator would — with context, judgment, and a next step.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<PlugIcon />}
            title="Connect everything"
            body="Warehouses, CRMs, billing, product analytics — Sift maps your schema automatically, no pipelines to babysit."
          />
          <FeatureCard
            icon={<ChatIcon />}
            title="Ask in plain language"
            body={`"Why did NRR dip in EMEA?" Get a sourced, chart-backed answer you can trace to the row.`}
          />
          <FeatureCard
            icon={<BellIcon />}
            title="Anomalies find you"
            body="Sift watches your metrics and pings the right channel the moment something breaks pattern."
          />

          <div className="relative overflow-hidden rounded-[1.35rem] bg-sift-lime p-6 text-black sm:col-span-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/10">
              <LoopIcon />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold tracking-tight sm:text-2xl">
              Agents that close the loop
            </h3>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-black/75">
              Approve a recommendation and Sift executes it — updating records, drafting the email,
              opening the ticket. From insight to action without a handoff.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {['Draft outreach', 'Sync CRM', 'Open ticket', 'Notify Slack'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/10 px-3.5 py-1.5 text-[12px] font-semibold text-black/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <FeatureCard
            icon={<ShieldIcon />}
            title="Governed by default"
            body="Row-level permissions, full audit trail, and answers that always cite their source."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[1.35rem] border border-white/5 bg-sift-card p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sift-lime">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-sift-muted sm:text-sm">{body}</p>
    </article>
  );
}

function PlugIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a6 6 0 0 1-12 0V8Z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LoopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
