import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_FONTS,
  TEMPLATE_LAYOUTS,
  TEMPLATE_PAGE_KINDS,
  TEMPLATE_RADIUS,
  type TemplateCategoryId,
  type TemplateFont,
  type TemplateLayout,
  type TemplatePageKind,
  type WebsiteTemplate,
} from './types';

const CATEGORY_IDS = new Set(
  TEMPLATE_CATEGORIES.map((item) => item.id).filter((id): id is TemplateCategoryId => id !== 'all'),
);
const LAYOUT_IDS = new Set(TEMPLATE_LAYOUTS.map((item) => item.id));
const FONT_IDS = new Set(TEMPLATE_FONTS.map((item) => item.id));
const RADIUS_IDS = new Set(TEMPLATE_RADIUS.map((item) => item.id));
const PAGE_KIND_IDS = new Set(TEMPLATE_PAGE_KINDS.map((item) => item.id));

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asHex(value: unknown, fallback: string): string {
  const text = asString(value, fallback);
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(text) ? text : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

function asCards(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    return {
      title: asString(row.title, 'Untitled'),
      body: asString(row.body),
      meta: asString(row.meta) || undefined,
    };
  });
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

export function slugifyTemplateId(name: string): string {
  return slugify(name, 'template');
}

export function sanitizeWebsiteTemplate(
  input: unknown,
  options: { id?: string; requireName?: boolean } = {},
): WebsiteTemplate {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const themeRaw = raw.theme && typeof raw.theme === 'object' ? (raw.theme as Record<string, unknown>) : {};
  const brandRaw = raw.brand && typeof raw.brand === 'object' ? (raw.brand as Record<string, unknown>) : {};
  const heroRaw = raw.hero && typeof raw.hero === 'object' ? (raw.hero as Record<string, unknown>) : {};
  const ctaRaw = raw.cta && typeof raw.cta === 'object' ? (raw.cta as Record<string, unknown>) : {};

  const name = asString(raw.name);
  if (options.requireName !== false && !name) {
    throw new Error('Name is required');
  }

  const category = CATEGORY_IDS.has(raw.category as TemplateCategoryId)
    ? (raw.category as TemplateCategoryId)
    : 'business-professional';
  const layout = LAYOUT_IDS.has(raw.layout as TemplateLayout)
    ? (raw.layout as TemplateLayout)
    : 'saas-light';
  const font = FONT_IDS.has(themeRaw.font as TemplateFont) ? (themeRaw.font as TemplateFont) : 'sans';
  const radius = RADIUS_IDS.has(themeRaw.radius as WebsiteTemplate['theme']['radius'])
    ? (themeRaw.radius as WebsiteTemplate['theme']['radius'])
    : 'rounded';

  const stats = Array.isArray(raw.stats)
    ? raw.stats.map((item) => {
        const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
        return { value: asString(row.value, '0'), label: asString(row.label, 'Stat') };
      })
    : [];

  const testimonials = Array.isArray(raw.testimonials)
    ? raw.testimonials.map((item) => {
        const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
        return {
          quote: asString(row.quote),
          name: asString(row.name, 'Customer'),
          role: asString(row.role) || undefined,
        };
      })
    : [];

  const pricing = Array.isArray(raw.pricing)
    ? raw.pricing.map((item) => {
        const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
        return {
          name: asString(row.name, 'Plan'),
          price: asString(row.price, '$0'),
          period: asString(row.period) || undefined,
          features: asStringArray(row.features),
          highlighted: asBoolean(row.highlighted),
        };
      })
    : [];

  const team = Array.isArray(raw.team)
    ? raw.team.map((item) => {
        const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
        return {
          name: asString(row.name, 'Team member'),
          role: asString(row.role, 'Role'),
          bio: asString(row.bio),
        };
      })
    : [];

  const pages = Array.isArray(raw.pages)
    ? raw.pages.map((item, index) => {
        const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
        const label = asString(row.label, `Page ${index + 1}`);
        const kind = PAGE_KIND_IDS.has(row.kind as TemplatePageKind)
          ? (row.kind as TemplatePageKind)
          : 'list';
        return {
          slug: slugify(asString(row.slug) || label, `page-${index + 1}`),
          label,
          kind,
          title: asString(row.title, label),
          subtitle: asString(row.subtitle),
          items: asCards(row.items),
        };
      })
    : [];

  return {
    id: options.id ?? asString(raw.id),
    name: name || 'Untitled template',
    niche: asString(raw.niche, 'Custom'),
    category,
    description: asString(raw.description),
    keywords: asStringArray(raw.keywords),
    layout,
    theme: {
      mode: themeRaw.mode === 'dark' ? 'dark' : 'light',
      primary: asHex(themeRaw.primary, '#DE7356'),
      accent: asHex(themeRaw.accent, '#111827'),
      background: asHex(themeRaw.background, '#f8fafc'),
      surface: asHex(themeRaw.surface, '#ffffff'),
      text: asHex(themeRaw.text, '#111827'),
      muted: asHex(themeRaw.muted, '#6b7280'),
      font,
      radius,
    },
    brand: {
      name: asString(brandRaw.name, name || 'Studio'),
      tagline: asString(brandRaw.tagline),
      description: asString(brandRaw.description),
    },
    hero: {
      eyebrow: asString(heroRaw.eyebrow),
      title: asString(heroRaw.title, name || 'Headline'),
      subtitle: asString(heroRaw.subtitle),
      cta: asString(heroRaw.cta, 'Get started'),
      ctaSecondary: asString(heroRaw.ctaSecondary) || undefined,
    },
    stats,
    features: asCards(raw.features),
    testimonials,
    pricing,
    team,
    pages,
    cta: {
      title: asString(ctaRaw.title, 'Let’s talk'),
      subtitle: asString(ctaRaw.subtitle),
      button: asString(ctaRaw.button, 'Contact'),
    },
    footer: asString(raw.footer),
  };
}
