export const BLANK_TEMPLATE_ID = 'blank';

export type TemplateCategoryId =
  | 'saas-tech'
  | 'agency-portfolio'
  | 'food-hospitality'
  | 'health-wellness'
  | 'business-professional'
  | 'education-content'
  | 'ecommerce-events'
  | 'emerging-tech';

export type TemplateLayout =
  | 'saas-dark'
  | 'saas-light'
  | 'agency'
  | 'editorial'
  | 'hospitality'
  | 'luxury'
  | 'fitness'
  | 'medical'
  | 'commerce'
  | 'legal'
  | 'crypto'
  | 'cv'
  | 'app-promo'
  | 'event'
  | 'industrial';

export type TemplateFont = 'sans' | 'display' | 'serif' | 'editorial' | 'tech' | 'luxury';

export type TemplatePageKind =
  | 'features'
  | 'pricing'
  | 'about'
  | 'contact'
  | 'list'
  | 'team'
  | 'gallery'
  | 'faq';

export interface TemplateNavItem {
  href: string;
  label: string;
}

export interface TemplateCard {
  title: string;
  body: string;
  meta?: string;
}

export interface TemplatePerson {
  name: string;
  role: string;
  bio: string;
}

export interface TemplatePrice {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
}

export interface TemplatePage {
  slug: string;
  label: string;
  kind: TemplatePageKind;
  title: string;
  subtitle: string;
  items?: TemplateCard[];
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  niche: string;
  category: TemplateCategoryId;
  description: string;
  keywords: string[];
  layout: TemplateLayout;
  theme: {
    mode: 'light' | 'dark';
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    font: TemplateFont;
    radius: 'sharp' | 'rounded' | 'pill';
  };
  brand: {
    name: string;
    tagline: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaSecondary?: string;
  };
  stats: { value: string; label: string }[];
  features: TemplateCard[];
  testimonials: { quote: string; name: string; role?: string }[];
  pricing: TemplatePrice[];
  team: TemplatePerson[];
  pages: TemplatePage[];
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: string;
}

export const TEMPLATE_CATEGORIES: { id: TemplateCategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'saas-tech', label: 'SaaS & Tech' },
  { id: 'agency-portfolio', label: 'Agency & Portfolio' },
  { id: 'food-hospitality', label: 'Food & Hospitality' },
  { id: 'health-wellness', label: 'Health & Wellness' },
  { id: 'business-professional', label: 'Business' },
  { id: 'education-content', label: 'Education' },
  { id: 'ecommerce-events', label: 'Commerce & Events' },
  { id: 'emerging-tech', label: 'Web3' },
];

export const TEMPLATE_LAYOUTS: { id: TemplateLayout; label: string }[] = [
  { id: 'saas-dark', label: 'SaaS dark' },
  { id: 'saas-light', label: 'SaaS light' },
  { id: 'agency', label: 'Agency' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'medical', label: 'Medical' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'legal', label: 'Legal' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'cv', label: 'CV' },
  { id: 'app-promo', label: 'App promo' },
  { id: 'event', label: 'Event' },
  { id: 'industrial', label: 'Industrial' },
];

export const TEMPLATE_FONTS: { id: TemplateFont; label: string }[] = [
  { id: 'sans', label: 'Sans' },
  { id: 'display', label: 'Display' },
  { id: 'serif', label: 'Serif' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'tech', label: 'Tech' },
  { id: 'luxury', label: 'Luxury' },
];

export const TEMPLATE_RADIUS: { id: WebsiteTemplate['theme']['radius']; label: string }[] = [
  { id: 'sharp', label: 'Sharp' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'pill', label: 'Pill' },
];

export const TEMPLATE_PAGE_KINDS: { id: TemplatePageKind; label: string }[] = [
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
  { id: 'list', label: 'List' },
  { id: 'team', label: 'Team' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'faq', label: 'FAQ' },
];

export type TemplateSource = 'builtin' | 'custom';

export type TemplateKind = 'catalog' | 'snapshot';

export interface ManagedTemplate extends WebsiteTemplate {
  source: TemplateSource;
  overridden: boolean;
  kind: TemplateKind;
  sourceProjectId?: string | null;
  sourceUrl?: string | null;
  hasSnapshot: boolean;
  origin?: 'user' | 'pack';
  savedAt?: string | null;
}
