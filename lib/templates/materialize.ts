import fs from 'fs/promises';
import path from 'path';
import { RUN_DEV_SCRIPT } from '@/lib/utils/runDevScript';
import { ISOLATED_NEXT_CONFIG } from './isolateNext';
import type { TemplateFont, WebsiteTemplate } from './types';

const FONT_STACK: Record<TemplateFont, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
  display: 'ui-sans-serif, system-ui, -apple-system, "Avenir Next", "Segoe UI", sans-serif',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  editorial: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  tech: 'ui-sans-serif, system-ui, -apple-system, "Avenir Next", "Segoe UI", sans-serif',
  luxury: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif',
};

async function writeFile(filePath: string, contents: string | Buffer) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  if (typeof contents === 'string') {
    await fs.writeFile(filePath, contents, 'utf8');
  } else {
    await fs.writeFile(filePath, contents);
  }
}

function radiusVars(radius: WebsiteTemplate['theme']['radius']) {
  if (radius === 'sharp') return { box: '2px', button: '2px' };
  if (radius === 'pill') return { box: '1.75rem', button: '999px' };
  return { box: '1.25rem', button: '999px' };
}

function buildSiteJson(template: WebsiteTemplate) {
  return {
    id: template.id,
    layout: template.layout,
    mode: template.theme.mode,
    name: template.brand.name,
    tagline: template.brand.tagline,
    description: template.brand.description,
    hero: template.hero,
    stats: template.stats,
    features: template.features,
    testimonials: template.testimonials,
    pricing: template.pricing,
    team: template.team,
    pages: template.pages,
    cta: template.cta,
    footer: template.footer,
    nav: [
      { href: '/', label: 'Home' },
      ...template.pages.map((page) => ({ href: `/${page.slug}`, label: page.label })),
    ],
  };
}

export async function materializeWebsiteTemplate(
  projectPath: string,
  template: WebsiteTemplate,
  projectId: string,
) {
  const { theme } = template;
  const fontStack = FONT_STACK[theme.font];
  const radius = radiusVars(theme.radius);
  const siteJson = JSON.stringify(buildSiteJson(template), null, 2);

  await writeFile(
    path.join(projectPath, 'package.json'),
    `${JSON.stringify(
      {
        name: projectId.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase() || 'site',
        private: true,
        version: '0.1.0',
        scripts: {
          dev: 'node scripts/run-dev.js',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '15.5.25',
          react: '19.0.0',
          'react-dom': '19.0.0',
        },
        overrides: {
          next: '15.5.25',
        },
        devDependencies: {
          typescript: '^5.7.2',
          '@types/react': '^19.0.0',
          '@types/node': '^22.10.0',
          tailwindcss: '^3.4.17',
          postcss: '^8.4.49',
          autoprefixer: '^10.4.20',
        },
      },
      null,
      2,
    )}\n`,
  );

  await writeFile(
    path.join(projectPath, 'tsconfig.json'),
    `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`,
  );

  await writeFile(
    path.join(projectPath, 'next.config.js'),
    ISOLATED_NEXT_CONFIG,
  );

  await writeFile(
    path.join(projectPath, 'vercel.json'),
    `{
  "framework": "nextjs",
  "installCommand": "npm install next@15.5.25 --save-exact && npm install",
  "buildCommand": "next build"
}
`,
  );

  await writeFile(
    path.join(projectPath, 'postcss.config.js'),
    `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
  );

  await writeFile(
    path.join(projectPath, 'tailwind.config.ts'),
    `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '${theme.primary}',
          accent: '${theme.accent}',
          bg: '${theme.background}',
          surface: '${theme.surface}',
          fg: '${theme.text}',
          muted: '${theme.muted}',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        box: '${radius.box}',
        button: '${radius.button}',
      },
    },
  },
  plugins: [],
};

export default config;
`,
  );

  await writeFile(
    path.join(projectPath, 'next-env.d.ts'),
    `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`,
  );

  await writeFile(path.join(projectPath, 'scripts/run-dev.js'), RUN_DEV_SCRIPT);

  await writeFile(
    path.join(projectPath, 'app/icon.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="${theme.primary}"/>
  <circle cx="16" cy="16" r="6" fill="${theme.accent}"/>
</svg>
`,
  );

  await writeFile(
    path.join(projectPath, 'public/favicon.ico'),
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    ),
  );

  await writeFile(
    path.join(projectPath, 'app/globals.css'),
    `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: ${theme.mode};
  --font-sans: ${fontStack};
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background: ${theme.background};
  color: ${theme.text};
  font-family: var(--font-sans);
}

::selection {
  background: ${theme.primary};
  color: ${theme.mode === 'dark' ? '#050505' : '#ffffff'};
}
`,
  );

  await writeFile(
    path.join(projectPath, 'lib/site.ts'),
    `export const site = ${siteJson} as const;

export type Site = typeof site;
`,
  );

  await writeFile(
    path.join(projectPath, 'app/layout.tsx'),
    `import type { ReactNode } from 'react';
import './globals.css';
import { site } from '@/lib/site';

export const metadata = {
  title: site.name,
  description: site.description,
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-brand-bg text-brand-fg">
        {children}
      </body>
    </html>
  );
}
`,
  );

  await writeFile(path.join(projectPath, 'components/Header.tsx'), HEADER_SOURCE);
  await writeFile(path.join(projectPath, 'components/Footer.tsx'), FOOTER_SOURCE);
  await writeFile(path.join(projectPath, 'components/Hero.tsx'), HERO_SOURCE);
  await writeFile(path.join(projectPath, 'components/HomeSections.tsx'), HOME_SECTIONS_SOURCE);
  await writeFile(path.join(projectPath, 'components/PageBody.tsx'), PAGE_BODY_SOURCE);
  await writeFile(path.join(projectPath, 'components/ContactForm.tsx'), CONTACT_FORM_SOURCE);
  await writeFile(path.join(projectPath, 'components/CtaBand.tsx'), CTA_BAND_SOURCE);

  await writeFile(
    path.join(projectPath, 'app/page.tsx'),
    `import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { HomeSections } from '@/components/HomeSections';
import { CtaBand } from '@/components/CtaBand';

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <HomeSections />
      <CtaBand />
      <Footer />
    </>
  );
}
`,
  );

  for (const page of template.pages) {
    await writeFile(
      path.join(projectPath, `app/${page.slug}/page.tsx`),
      `import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageBody } from '@/components/PageBody';
import { CtaBand } from '@/components/CtaBand';

export default function Page() {
  return (
    <>
      <Header />
      <PageBody slug="${page.slug}" />
      <CtaBand />
      <Footer />
    </>
  );
}
`,
    );
  }

  await writeFile(
    path.join(projectPath, 'README.md'),
    `# ${template.brand.name}

Starter template: **${template.name}** (${template.niche}).

This is a complete Next.js 15 + Tailwind CSS 3.4 site. Edit \`lib/site.ts\` for copy, \`tailwind.config.ts\` for colors, and the components for layout.

Keep Tailwind at v3.4 unless you intentionally migrate.
`,
  );
}

const HEADER_SOURCE = `'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/lib/site';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-fg/10 bg-brand-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {site.name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-brand-muted md:flex">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-fg">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href={site.nav[site.nav.length - 1]?.href || '/'}
          className="hidden rounded-button bg-brand px-4 py-2 text-sm font-medium text-brand-bg md:inline-flex"
        >
          {site.hero.cta}
        </Link>
        <button
          type="button"
          className="md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          Menu
        </button>
      </div>
      {open ? (
        <div className="space-y-2 border-t border-brand-fg/10 px-5 py-4 md:hidden">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-1 text-sm"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
`;

const FOOTER_SOURCE = `import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="border-t border-brand-fg/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">{site.name}</p>
          <p className="mt-2 max-w-md text-sm text-brand-muted">{site.footer}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-brand-muted">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-fg">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
`;

const CTA_BAND_SOURCE = `import Link from 'next/link';
import { site } from '@/lib/site';

export function CtaBand() {
  const last = site.nav[site.nav.length - 1];
  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl rounded-box bg-brand px-8 py-12 text-brand-bg">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">{site.cta.title}</h2>
        <p className="mt-3 max-w-2xl opacity-80">{site.cta.subtitle}</p>
        <Link
          href={last?.href || '/'}
          className="mt-8 inline-flex rounded-button bg-brand-bg px-5 py-3 text-sm font-medium text-brand-fg"
        >
          {site.cta.button}
        </Link>
      </div>
    </section>
  );
}
`;

const CONTACT_FORM_SOURCE = `'use client';

import { FormEvent, useState } from 'react';

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <p className="rounded-box border border-brand-fg/10 bg-brand-surface p-6">
        Thanks — this is a demo form. Connect a real backend or form service before launch.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Name
        <input required className="rounded-box border border-brand-fg/15 bg-brand-surface px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">
        Email
        <input type="email" required className="rounded-box border border-brand-fg/15 bg-brand-surface px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">
        Message
        <textarea required rows={5} className="rounded-box border border-brand-fg/15 bg-brand-surface px-3 py-2" />
      </label>
      <button type="submit" className="rounded-button bg-brand px-5 py-3 text-sm font-medium text-brand-bg">
        Send
      </button>
    </form>
  );
}
`;

const HERO_SOURCE = `import Link from 'next/link';
import { site } from '@/lib/site';

export function Hero() {
  const last = site.nav[site.nav.length - 1];
  const layout = site.layout;

  if (layout === 'agency') {
    return (
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-muted">{site.hero.eyebrow}</p>
          <h1 className="mt-6 max-w-5xl text-6xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
            {site.hero.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-brand-muted">{site.hero.subtitle}</p>
          <HeroActions href={last?.href || '/'} />
        </div>
      </section>
    );
  }

  if (layout === 'saas-dark' || layout === 'crypto' || layout === 'event') {
    return (
      <section className="relative overflow-hidden px-5 py-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-brand-accent">{site.hero.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">{site.hero.title}</h1>
            <p className="mt-5 text-lg text-brand-muted">{site.hero.subtitle}</p>
            <HeroActions href={last?.href || '/'} />
          </div>
          <div className="rounded-box border border-white/10 bg-brand-surface p-4 shadow-2xl">
            <div className="mb-4 flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>
            <div className="grid gap-3">
              {site.stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-box bg-black/20 px-4 py-3">
                  <span className="text-sm text-brand-muted">{stat.label}</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'editorial' || layout === 'luxury' || layout === 'cv') {
    return (
      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm tracking-[0.18em] uppercase text-brand-muted">{site.hero.eyebrow}</p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">{site.hero.title}</h1>
          <p className="mt-6 text-lg text-brand-muted">{site.hero.subtitle}</p>
          <div className="flex justify-center">
            <HeroActions href={last?.href || '/'} />
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'hospitality' || layout === 'medical') {
    return (
      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-box bg-brand-surface md:grid-cols-2">
          <div className="p-10 md:p-14">
            <p className="text-sm text-brand-muted">{site.hero.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{site.hero.title}</h1>
            <p className="mt-5 text-brand-muted">{site.hero.subtitle}</p>
            <HeroActions href={last?.href || '/'} />
          </div>
          <div className="min-h-[280px] bg-gradient-to-br from-brand to-brand-accent" />
        </div>
      </section>
    );
  }

  if (layout === 'fitness' || layout === 'industrial') {
    return (
      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl rounded-box bg-brand-surface px-8 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">{site.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold uppercase tracking-tight md:text-7xl">
            {site.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-muted">{site.hero.subtitle}</p>
          <HeroActions href={last?.href || '/'} />
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-brand">{site.hero.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">{site.hero.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-brand-muted">{site.hero.subtitle}</p>
        <HeroActions href={last?.href || '/'} />
      </div>
    </section>
  );
}

function HeroActions({ href }: { href: string }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
        <Link href={href} className="rounded-button bg-brand px-5 py-3 text-sm font-medium text-brand-bg">
        {site.hero.cta}
      </Link>
      {site.hero.ctaSecondary ? (
        <Link href={site.nav[1]?.href || '/'} className="rounded-button border border-brand-fg/15 px-5 py-3 text-sm">
          {site.hero.ctaSecondary}
        </Link>
      ) : null}
    </div>
  );
}
`;

const HOME_SECTIONS_SOURCE = `import { site } from '@/lib/site';

export function HomeSections() {
  return (
    <div>
      {site.stats.length > 0 ? (
        <section className="border-y border-brand-fg/10 px-5 py-10">
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
            {site.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-sm text-brand-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight">What you get</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {site.features.map((feature) => (
              <article key={feature.title} className="rounded-box border border-brand-fg/10 bg-brand-surface p-6">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {site.testimonials.length > 0 ? (
        <section className="px-5 pb-10">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            {site.testimonials.map((item) => (
              <blockquote key={item.quote} className="rounded-box bg-brand-surface p-6">
                <p className="text-lg leading-7">“{item.quote}”</p>
                <footer className="mt-4 text-sm text-brand-muted">
                  {item.name}
                  {item.role ? \` · \${item.role}\` : ''}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}

      {site.pricing.length > 0 ? (
        <section className="px-5 py-16">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {site.pricing.map((plan) => (
              <article
                key={plan.name}
                className={\`rounded-box border p-6 \${plan.highlighted ? 'border-brand bg-brand text-brand-bg' : 'border-brand-fg/10 bg-brand-surface'}\`}
              >
                <h3 className="text-sm uppercase tracking-wide">{plan.name}</h3>
                <p className="mt-3 text-3xl font-semibold">
                  {plan.price}
                  {plan.period ? <span className="text-base font-normal opacity-70">{plan.period}</span> : null}
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
`;

const PAGE_BODY_SOURCE = `import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';
import { site } from '@/lib/site';

export function PageBody({ slug }: { slug: string }) {
  const page = site.pages.find((item) => item.slug === slug);
  if (!page) notFound();

  const items = 'items' in page && page.items ? page.items : [];

  return (
    <main className="px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.16em] text-brand-muted">{page.label}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-muted">{page.subtitle}</p>

        {page.kind === 'features' ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {site.features.map((feature) => (
              <article key={feature.title} className="rounded-box border border-brand-fg/10 bg-brand-surface p-6">
                <h2 className="text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-brand-muted">{feature.body}</p>
              </article>
            ))}
          </div>
        ) : null}

        {page.kind === 'pricing' ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {site.pricing.map((plan) => (
              <article key={plan.name} className="rounded-box border border-brand-fg/10 bg-brand-surface p-6">
                <h2 className="font-semibold">{plan.name}</h2>
                <p className="mt-2 text-3xl">{plan.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-brand-muted">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : null}

        {page.kind === 'about' ? (
          <div className="mt-12 max-w-3xl space-y-4 text-base leading-7 text-brand-muted">
            <p>{site.description}</p>
            <p>{page.subtitle}</p>
          </div>
        ) : null}

        {page.kind === 'contact' ? (
          <div className="mt-12 max-w-xl">
            <ContactForm />
          </div>
        ) : null}

        {page.kind === 'team' ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {site.team.map((person) => (
              <article key={person.name} className="rounded-box bg-brand-surface p-6">
                <div className="mb-4 h-16 w-16 rounded-full bg-brand/30" />
                <h2 className="font-semibold">{person.name}</h2>
                <p className="text-sm text-brand">{person.role}</p>
                <p className="mt-3 text-sm text-brand-muted">{person.bio}</p>
              </article>
            ))}
          </div>
        ) : null}

        {page.kind === 'gallery' ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/5] rounded-box bg-gradient-to-br from-brand to-brand-accent opacity-80"
              />
            ))}
          </div>
        ) : null}

        {page.kind === 'list' || page.kind === 'faq' ? (
          <div className="mt-12 grid gap-4">
            {(items.length > 0 ? items : site.features).map((item) => (
              <article key={item.title} className="rounded-box border border-brand-fg/10 p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  {'meta' in item && item.meta ? (
                    <span className="text-sm text-brand-muted">{item.meta}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-brand-muted">{item.body}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
`;
