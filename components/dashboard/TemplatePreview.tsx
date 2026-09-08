import type { WebsiteTemplate } from '@/lib/templates';

export default function TemplatePreview({ template }: { template: WebsiteTemplate }) {
  const { theme, brand, hero, stats, features, testimonials, pricing, team, pages, cta, footer } = template;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
      style={{ background: theme.background, color: theme.text }}
    >
      <div className="flex items-center justify-between px-5 py-3 text-xs" style={{ background: theme.surface }}>
        <span className="font-semibold">{brand.name}</span>
        <div className="flex gap-3 opacity-70">
          {pages.slice(0, 4).map((page) => (
            <span key={page.slug}>{page.label}</span>
          ))}
        </div>
      </div>

      <div className="px-5 py-8">
        {hero.eyebrow ? (
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: theme.primary }}>
            {hero.eyebrow}
          </p>
        ) : null}
        <h2 className="max-w-xl text-2xl font-semibold leading-tight">{hero.title}</h2>
        {hero.subtitle ? (
          <p className="mt-3 max-w-lg text-sm" style={{ color: theme.muted }}>
            {hero.subtitle}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <span
            className="px-3 py-1.5 text-xs font-medium text-white"
            style={{
              background: theme.primary,
              borderRadius: theme.radius === 'sharp' ? 2 : theme.radius === 'pill' ? 999 : 12,
            }}
          >
            {hero.cta}
          </span>
          {hero.ctaSecondary ? (
            <span
              className="px-3 py-1.5 text-xs font-medium"
              style={{
                color: theme.text,
                border: `1px solid ${theme.muted}55`,
                borderRadius: theme.radius === 'sharp' ? 2 : theme.radius === 'pill' ? 999 : 12,
              }}
            >
              {hero.ctaSecondary}
            </span>
          ) : null}
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 px-5 pb-6">
          {stats.slice(0, 3).map((stat) => (
            <div key={`${stat.value}-${stat.label}`} className="rounded-xl px-3 py-3" style={{ background: theme.surface }}>
              <p className="text-lg font-semibold">{stat.value}</p>
              <p className="text-[11px]" style={{ color: theme.muted }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {features.length > 0 ? (
        <div className="grid gap-3 px-5 pb-6 sm:grid-cols-2">
          {features.slice(0, 4).map((feature) => (
            <div key={feature.title} className="rounded-xl px-3 py-3" style={{ background: theme.surface }}>
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {testimonials[0] ? (
        <div className="px-5 pb-6">
          <blockquote className="rounded-xl px-4 py-4 text-sm leading-relaxed" style={{ background: theme.surface }}>
            “{testimonials[0].quote}”
            <footer className="mt-2 text-xs" style={{ color: theme.muted }}>
              {testimonials[0].name}
              {testimonials[0].role ? ` · ${testimonials[0].role}` : ''}
            </footer>
          </blockquote>
        </div>
      ) : null}

      {pricing.length > 0 ? (
        <div className="grid gap-3 px-5 pb-6 sm:grid-cols-3">
          {pricing.slice(0, 3).map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl px-3 py-3"
              style={{
                background: theme.surface,
                outline: plan.highlighted ? `2px solid ${theme.primary}` : undefined,
              }}
            >
              <p className="text-xs" style={{ color: theme.muted }}>
                {plan.name}
              </p>
              <p className="text-lg font-semibold">
                {plan.price}
                <span className="text-xs font-normal" style={{ color: theme.muted }}>
                  {plan.period}
                </span>
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {team.length > 0 ? (
        <div className="px-5 pb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: theme.muted }}>
            Team
          </p>
          <div className="flex flex-wrap gap-3">
            {team.slice(0, 4).map((person) => (
              <div key={person.name} className="min-w-[140px] rounded-xl px-3 py-2" style={{ background: theme.surface }}>
                <p className="text-sm font-medium">{person.name}</p>
                <p className="text-xs" style={{ color: theme.muted }}>
                  {person.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="px-5 pb-6">
        <div
          className="rounded-xl px-4 py-5"
          style={{ background: theme.primary, color: theme.mode === 'dark' ? theme.background : '#fff' }}
        >
          <p className="text-sm font-semibold">{cta.title}</p>
          {cta.subtitle ? <p className="mt-1 text-xs opacity-90">{cta.subtitle}</p> : null}
          <p className="mt-3 inline-block rounded-full bg-black/20 px-3 py-1 text-xs">{cta.button}</p>
        </div>
      </div>

      {footer ? (
        <p className="px-5 pb-4 text-[11px]" style={{ color: theme.muted }}>
          {footer}
        </p>
      ) : null}
    </div>
  );
}
