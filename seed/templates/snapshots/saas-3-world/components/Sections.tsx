import { SiteImage } from '@/components/SiteImage';
import { unsplash } from '@/lib/imageLibrary';

function PrivacyGraphic() {
  return (
    <div className="relative mx-auto mb-6 h-32 w-full max-w-[220px] sm:mb-8 sm:h-36">
      <div className="absolute inset-x-4 top-4 rounded-2xl border border-white/10 bg-[#101828]/95 p-3 shadow-card">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/40">
          <span>Client info</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold tracking-normal text-emerald-300">
            Local
          </span>
        </div>
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between gap-3">
            <span className="text-white/45">Card</span>
            <span className="font-medium tracking-wider text-white/80 blur-[3px] select-none">
              4532 •••• 9912
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/45">Name</span>
            <span className="font-medium text-white/80 blur-[3px] select-none">Jordan Hale</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/45">API key</span>
            <span className="font-medium text-white/80 blur-[3px] select-none">sk-live-••••</span>
          </div>
        </div>
      </div>
      <div className="absolute -right-1 top-0 h-16 w-16 rounded-full bg-glow/20 blur-2xl" />
    </div>
  );
}

function ConsensusGraphic() {
  return (
    <div className="relative mx-auto mb-6 flex h-32 w-full max-w-[240px] items-center justify-center sm:mb-8 sm:h-36">
      <div className="absolute h-24 w-24 rounded-full bg-glow/25 blur-2xl" />
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-glow-bright/40 bg-[#0d1a33] shadow-glow">
        <div
          className="h-8 w-8 opacity-90"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(96,165,250,0.95) 1.2px, transparent 1.3px)',
            backgroundSize: '5px 5px',
          }}
        />
      </div>
      {['left-2 top-6', 'left-4 bottom-6', 'right-2 top-6', 'right-4 bottom-6'].map((pos) => (
        <span
          key={pos}
          className={`absolute ${pos} h-8 w-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm`}
        />
      ))}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 144" fill="none" aria-hidden>
        <path d="M48 40 L96 72" stroke="rgba(96,165,250,0.45)" strokeWidth="1" />
        <path d="M52 108 L96 80" stroke="rgba(96,165,250,0.45)" strokeWidth="1" />
        <path d="M192 40 L144 72" stroke="rgba(96,165,250,0.45)" strokeWidth="1" />
        <path d="M188 108 L144 80" stroke="rgba(96,165,250,0.45)" strokeWidth="1" />
      </svg>
    </div>
  );
}

function AuditGraphic() {
  const rows = [
    ['14:02:11', 'Prompt routed', 'Claude 3.5', 'Eco'],
    ['14:02:12', 'Consensus ok', 'GPT-4o', 'Fast'],
    ['14:02:13', 'Tokens billed', 'Gemini', '0.4g'],
  ];

  return (
    <div className="relative mx-auto mb-6 w-full max-w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-[#101828]/95 shadow-card sm:mb-8">
      <div className="grid grid-cols-4 gap-1 border-b border-white/10 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-white/40">
        <span>Time</span>
        <span>Event</span>
        <span>Model</span>
        <span>Details</span>
      </div>
      <div className="divide-y divide-white/5">
        {rows.map((row) => (
          <div key={row.join('-')} className="grid grid-cols-4 gap-1 px-3 py-2 text-[10px] text-white/70">
            {row.map((cell) => (
              <span key={cell} className="truncate">
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: 'Zero-trust privacy.',
    body: 'Sensitive data is automatically detected and redacted locally. AI models never see your PII or API keys.',
    graphic: <PrivacyGraphic />,
  },
  {
    title: 'Consensus engine.',
    body: 'Route complex tasks through three different models simultaneously to verify accuracy and eliminate hallucinations.',
    graphic: <ConsensusGraphic />,
  },
  {
    title: 'Audit-ready logs.',
    body: 'Track token usage, model choices, and security events across your entire workspace in real time.',
    graphic: <AuditGraphic />,
  },
];

export function FeatureCards() {
  return (
    <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3 md:gap-5">
      {FEATURES.map((feature) => (
        <article
          key={feature.title}
          className="rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#121c33]/95 to-[#0a1224]/95 p-5 shadow-card backdrop-blur-md sm:rounded-[1.75rem] sm:p-7"
        >
          {feature.graphic}
          <h3 className="font-display text-[1.2rem] font-semibold tracking-tight text-white sm:text-[1.35rem]">
            {feature.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-mist sm:mt-3 sm:text-[14px]">
            {feature.body}
          </p>
        </article>
      ))}
    </div>
  );
}

/** Shared Earth rim that continues through lower sections */
function EarthBand({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden ${className}`}>
      <div className="relative mx-auto h-48 w-full max-w-5xl sm:h-64">
        <SiteImage
          src="/images/switch-earth.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_0%] opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink" />
        <div className="absolute inset-x-[15%] top-8 h-16 rounded-full bg-glow/25 blur-3xl" />
      </div>
    </div>
  );
}

export function EcoRoutingSection() {
  return (
    <section id="eco-routing" className="relative overflow-hidden bg-ink px-5 py-24 sm:px-8">
      <EarthBand />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/40 to-transparent" />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-glow-bright">
            Eco-routing
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white">
            Route every query for speed, cost, or carbon.
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-mist">
            Switch watches live energy and water signals across providers, then steers traffic to the
            cleanest endpoint that still meets your latency budget.
          </p>
          <ul className="mt-8 space-y-3 text-[14px] text-white/80">
            {[
              'Per-query CO₂, energy, and water readouts',
              'Policy dials for speed, price, and footprint',
              'Automatic fallbacks when green capacity dips',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-glow-bright" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10">
          <SiteImage
            src={unsplash('photo-1497366216548-37526070297c', 1200)}
            alt="Open office"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/80 via-ink/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-[12px] text-white/70">
              <span>Current route</span>
              <span className="text-emerald-300">0.4g CO₂</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-glow to-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ModelsSection() {
  const models = [
    {
      name: 'Claude 3.5 Sonnet',
      focus: 'Deep reasoning',
      latency: '420ms',
      photo: 'photo-1522071820081-009f0129c71c',
      alt: 'Team collaborating',
    },
    {
      name: 'GPT-4o',
      focus: 'Balanced speed',
      latency: '310ms',
      photo: 'photo-1600880292203-757bb62b4baf',
      alt: 'Meeting around a table',
    },
    {
      name: 'Gemini 1.5 Pro',
      focus: 'Long context',
      latency: '380ms',
      photo: 'photo-1519389950473-47ba0277781c',
      alt: 'People working on laptops',
    },
  ];

  return (
    <section id="models" className="relative overflow-hidden bg-navy/40 px-5 py-24 sm:px-8">
      <EarthBand className="opacity-70" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-glow-bright">
            Models
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.1rem)] font-semibold tracking-[-0.03em] text-white">
            One control plane for every frontier model.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-mist">
            Keep providers interchangeable. Switch scores quality, cost, and carbon — then picks the
            right model for the moment.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {models.map((model) => (
            <article
              key={model.name}
              className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink/70"
            >
              <div className="relative h-40">
                <SiteImage
                  src={unsplash(model.photo, 900)}
                  alt={model.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-white">{model.name}</h3>
                <p className="mt-2 text-[13px] text-mist">{model.focus}</p>
                <p className="mt-4 text-[12px] uppercase tracking-[0.14em] text-white/45">
                  Avg latency {model.latency}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden px-5 py-24 sm:px-8">
      <EarthBand className="opacity-60" />
      <div className="relative z-10 mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#13203a] via-[#0b1224] to-ink px-6 py-14 sm:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-glow-bright">
              Pricing
            </p>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] text-white">
              Start routing. Pay for intelligence, not waste.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mist">
              Free for the first 10k routed requests. Then usage-based pricing with carbon and cost
              caps you can enforce from the dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                id="start"
                href="#start"
                className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-ink transition hover:bg-frost"
              >
                Start routing
              </a>
              <a
                id="docs"
                href="#docs"
                className="rounded-full border border-white/20 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:border-white/40"
              >
                Read documentation
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10">
            <SiteImage
              src={unsplash('photo-1551434678-e076c223a692', 1000)}
              alt="Office conversation"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-ink/35" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/5">
            <span className="h-2.5 w-2.5 rounded-full bg-glow-bright" />
          </span>
          <span className="font-display text-sm font-semibold">Switch</span>
        </div>
        <p className="text-[13px] text-white/45">
          © {new Date().getFullYear()} Switch. Intelligence on your terms.
        </p>
        <a id="login" href="#login" className="text-[13px] text-white/70 transition hover:text-white">
          Log in
        </a>
      </div>
    </footer>
  );
}
