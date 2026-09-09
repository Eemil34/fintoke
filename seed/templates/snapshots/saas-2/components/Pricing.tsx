export function Pricing() {
  return (
    <section id="pricing" className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Priced to pay for itself.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-sift-muted sm:text-base">
            Start free. Scale when the answers start compounding. No seat games, no annual lock-in.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <PriceCard
            name="Starter"
            price="$0"
            period="/mo"
            desc="For small teams testing the waters."
            features={[
              '3 connected sources',
              '200 questions / month',
              'Daily anomaly digest',
              'Community support',
            ]}
            cta="Get started"
            variant="outline"
          />
          <PriceCard
            name="Growth"
            price="$390"
            period="/mo"
            desc="For operators who run on the data."
            features={[
              'Unlimited sources & questions',
              'Autonomous agent actions',
              'Real-time alerts to Slack & email',
              'Role-based permissions',
              'Priority support',
            ]}
            cta="Start 14-day trial"
            variant="featured"
            badge="Most popular"
          />
          <PriceCard
            name="Enterprise"
            price="Custom"
            desc="For scale, compliance, and control."
            features={[
              'SSO, SCIM & audit logs',
              'On-prem / VPC deployment',
              'Custom model governance',
              'Dedicated solutions engineer',
            ]}
            cta="Talk to sales"
            variant="lime-outline"
          />
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  name,
  price,
  period,
  desc,
  features,
  cta,
  variant,
  badge,
}: {
  name: string;
  price: string;
  period?: string;
  desc: string;
  features: string[];
  cta: string;
  variant: 'outline' | 'featured' | 'lime-outline';
  badge?: string;
}) {
  const featured = variant === 'featured';

  return (
    <article
      className={`relative flex flex-col rounded-[1.35rem] border p-6 sm:p-7 ${
        featured
          ? 'border-sift-lime bg-sift-card shadow-lime'
          : 'border-white/5 bg-sift-card'
      }`}
    >
      {badge ? (
        <span className="absolute right-5 top-5 rounded-full bg-sift-lime px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
          {badge}
        </span>
      ) : null}

      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
          featured ? 'text-sift-lime' : 'text-sift-muted'
        }`}
      >
        {name}
      </p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold tracking-tight text-white">{price}</span>
        {period ? <span className="text-sm text-sift-muted">{period}</span> : null}
      </div>
      <p className="mt-2 text-sm text-sift-muted">{desc}</p>

      <ul className="mt-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13px] text-sift-soft">
            <Check className="mt-0.5 shrink-0 text-sift-lime" />
            {f}
          </li>
        ))}
      </ul>

      <a
        href="#cta"
        className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3 text-[12px] font-bold uppercase tracking-wide transition ${
          featured
            ? 'bg-sift-lime text-black shadow-lime-sm hover:brightness-110'
            : variant === 'lime-outline'
              ? 'border border-sift-lime/50 text-sift-lime hover:bg-sift-lime/10'
              : 'border border-white/20 text-white hover:border-white/40'
        }`}
      >
        {cta}
      </a>
    </article>
  );
}

function Check({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
