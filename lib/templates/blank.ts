import type { WebsiteTemplate } from './types';

export function createBlankTemplate(overrides: Partial<WebsiteTemplate> = {}): WebsiteTemplate {
  return {
    id: '',
    name: 'Untitled template',
    niche: 'Custom',
    category: 'business-professional',
    description: 'A custom starting layout you can fill with real copy.',
    keywords: ['custom'],
    layout: 'saas-light',
    theme: {
      mode: 'light',
      primary: '#DE7356',
      accent: '#111827',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      muted: '#6b7280',
      font: 'sans',
      radius: 'rounded',
    },
    brand: {
      name: 'Studio',
      tagline: 'A short line about the business',
      description: 'Say what the company does, who it is for, and why someone should stay on the page.',
    },
    hero: {
      eyebrow: 'Welcome',
      title: 'Your headline goes here.',
      subtitle: 'One or two sentences that explain the offer without filler.',
      cta: 'Get started',
      ctaSecondary: 'See the work',
    },
    stats: [
      { value: '10+', label: 'Years' },
      { value: '120', label: 'Projects' },
      { value: '4.9', label: 'Rating' },
    ],
    features: [
      { title: 'Clear offer', body: 'What you actually sell, in plain language.' },
      { title: 'Proof', body: 'A result, a number, or a reason to believe it.' },
      { title: 'Next step', body: 'What happens after someone clicks the button.' },
    ],
    testimonials: [
      { quote: 'Replace this with a real customer sentence.', name: 'Alex Rivera', role: 'Founder' },
    ],
    pricing: [
      { name: 'Starter', price: '$0', period: '', features: ['One page', 'Contact form'], highlighted: false },
      { name: 'Studio', price: '$49', period: '/mo', features: ['Multi-page', 'Booking', 'Support'], highlighted: true },
    ],
    team: [
      { name: 'Jordan Lee', role: 'Lead', bio: 'A short bio for the person visitors will actually meet.' },
    ],
    pages: [
      { slug: 'about', label: 'About', kind: 'about', title: 'About the studio', subtitle: 'Who you are and how you work.' },
      { slug: 'work', label: 'Work', kind: 'list', title: 'Selected work', subtitle: 'A few projects worth showing.', items: [
        { title: 'Project one', body: 'What you shipped and who it was for.' },
        { title: 'Project two', body: 'The outcome in one sentence.' },
      ] },
      { slug: 'contact', label: 'Contact', kind: 'contact', title: 'Get in touch', subtitle: 'A form, an email, or a booking link.' },
    ],
    cta: {
      title: 'Ready when you are.',
      subtitle: 'Invite the next action without sounding like a banner ad.',
      button: 'Start a project',
    },
    footer: 'Replace this footer with your legal name and city.',
    ...overrides,
  };
}

export function cloneTemplate(template: WebsiteTemplate, name?: string): WebsiteTemplate {
  const copy = structuredClone(template);
  copy.id = '';
  copy.name = name?.trim() || `${template.name} copy`;
  return copy;
}
