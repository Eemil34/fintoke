import fs from 'fs/promises';
import path from 'path';
import { IMAGE_LIBRARY, unsplashUrl } from './imageLibrary';

export const FAST_COPY_FILE = '.fintoke-copy.json';

export type FastCopyItem = { title: string; body: string };
export type FastCopyFile = {
  name: string;
  tagline: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  address: string;
  phone: string;
  email: string;
  aboutColumns: string[];
  menu: FastCopyItem[];
  features: FastCopyItem[];
  events: FastCopyItem[];
  testimonials: { quote: string; name: string; role: string }[];
  team: { name: string; role: string; bio: string }[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  footer: string;
  images: string[];
  mapsQuery: string;
  mapsUrl: string;
  templateId?: string;
  source?: {
    name?: string;
    tagline?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    description?: string;
  };
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function restaurantFallbackImages(): string[] {
  const photos = IMAGE_LIBRARY.find((item) => item.id === 'restaurant')?.photos || [];
  return photos.slice(0, 8).map((photo) => unsplashUrl(photo.id, 1200));
}

export async function collectTemplateImages(projectPath: string): Promise<string[]> {
  const found: string[] = [];
  const walk = async (dir: string) => {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) continue;
      const source = await fs.readFile(full, 'utf8').catch(() => '');
      const urls = source.match(/https:\/\/images\.unsplash\.com\/[^"' \s)]+/g) || [];
      found.push(...urls);
    }
  };
  await walk(projectPath);
  const unique = [...new Set(found.map((url) => url.replace(/w=\d+/, 'w=1200')))];
  return unique.length ? unique.slice(0, 10) : restaurantFallbackImages();
}

export async function writeFastCopy(projectPath: string, pack: FastCopyFile): Promise<void> {
  await fs.writeFile(path.join(projectPath, FAST_COPY_FILE), `${JSON.stringify(pack, null, 2)}\n`);
  await fs.writeFile(path.join(projectPath, '.fintoke-filled'), `${pack.name}\n`).catch(() => undefined);
}

export async function readFastCopy(projectPath: string): Promise<FastCopyFile | null> {
  try {
    const raw = await fs.readFile(path.join(projectPath, FAST_COPY_FILE), 'utf8');
    const parsed = JSON.parse(raw) as FastCopyFile;
    if (!parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function extractTemplateTheme(projectPath: string): Promise<{
  background: string;
  text: string;
  muted: string;
  accent: string;
  surface: string;
  sans: string;
  serif: string;
}> {
  const css = await fs.readFile(path.join(projectPath, 'app', 'globals.css'), 'utf8').catch(() => '');
  const tw = await fs.readFile(path.join(projectPath, 'tailwind.config.ts'), 'utf8').catch(() => '');
  const source = `${css}\n${tw}`;
  const hex = (pattern: RegExp, fallback: string) => source.match(pattern)?.[1] || fallback;
  return {
    background: hex(/bg:\s*'?(#[0-9a-fA-F]{3,8})'?/, hex(/background:\s*(#[0-9a-fA-F]{3,8})/, '#f5f3ef')),
    text: hex(/fg:\s*'?(#[0-9a-fA-F]{3,8})'?/, hex(/color:\s*(#[0-9a-fA-F]{3,8})/, '#1c1c1c')),
    muted: hex(/muted:\s*'?(#[0-9a-fA-F]{3,8})'?/, '#6b6560'),
    accent: hex(/accent:\s*'?(#[0-9a-fA-F]{3,8})'?/, '#3d4a52'),
    surface: hex(/surface:\s*'?(#[0-9a-fA-F]{3,8})'?/, '#ebe8e1'),
    sans: css.match(/--font-sans:\s*([^;]+)/)?.[1]?.trim() || 'DM Sans, system-ui, sans-serif',
    serif: css.match(/--font-serif:\s*([^;]+)/)?.[1]?.trim() || 'Playfair Display, Georgia, serif',
  };
}

export function applyCopyToHtml(html: string, pack: FastCopyFile): string {
  const replacements: Array<[string, string]> = [];
  const source = pack.source || {};
  const pairs: Array<[string | undefined, string | undefined]> = [
    [source.name, pack.name],
    [source.tagline, pack.tagline],
    [source.heroTitle, pack.heroTitle],
    [source.heroSubtitle, pack.heroSubtitle],
    [source.description, pack.description],
  ];
  for (const [from, to] of pairs) {
    if (from && to && from !== to && from.length >= 3) replacements.push([from, to]);
  }
  let next = html;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  return next;
}

export function renderFastPreviewHtml(
  pack: FastCopyFile,
  theme?: {
    background: string;
    text: string;
    muted: string;
    accent: string;
    surface: string;
    sans: string;
    serif: string;
  },
): string {
  const colors = theme || {
    background: '#f5f3ef',
    text: '#1c1c1c',
    muted: '#6b6560',
    accent: '#3d4a52',
    surface: '#ebe8e1',
    sans: 'DM Sans, system-ui, sans-serif',
    serif: 'Playfair Display, Georgia, serif',
  };
  const images = pack.images?.length ? pack.images : restaurantFallbackImages();
  const hero = images[0] || restaurantFallbackImages()[0];
  const gallery = images.slice(1, 7);
  const menu = pack.menu?.length ? pack.menu : [{ title: 'Seasonal plate', body: pack.description }];
  const about = pack.aboutColumns?.length ? pack.aboutColumns : [pack.description];
  const features = pack.features?.length ? pack.features : [];
  const quotes = pack.testimonials?.length ? pack.testimonials : [];
  const maps = pack.mapsUrl || (pack.mapsQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(pack.mapsQuery)}&z=15&output=embed`
    : '');

  const img = (src: string, alt: string, className: string) =>
    `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${className}" loading="lazy" referrerpolicy="origin" />`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="referrer" content="origin" />
  <title>${escapeHtml(pack.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg:${escapeHtml(colors.background)};
      --card:${escapeHtml(colors.surface)};
      --ink:${escapeHtml(colors.text)};
      --muted:${escapeHtml(colors.muted)};
      --accent:${escapeHtml(colors.accent)};
      --sans:${escapeHtml(colors.sans)};
      --serif:${escapeHtml(colors.serif)};
    }
    * { box-sizing: border-box; }
    body { margin:0; font-family: var(--sans); background:var(--bg); color:var(--ink); }
    h1, h2, h3, .brand { font-family: var(--serif); }
    a { color: inherit; }
    img { display:block; width:100%; height:100%; object-fit:cover; }
    header { display:flex; justify-content:space-between; align-items:center; padding:20px 6vw; position:sticky; top:0; background:color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(8px); z-index:2; }
    .brand { font-weight:700; letter-spacing:.04em; }
    nav { display:flex; gap:18px; color:var(--muted); font-size:14px; }
    .hero { display:grid; grid-template-columns: 1.1fr .9fr; min-height: 78vh; }
    .hero-copy { padding: 8vh 6vw; display:flex; flex-direction:column; justify-content:center; gap:18px; }
    .eyebrow { color:var(--accent); letter-spacing:.18em; text-transform:uppercase; font-size:12px; }
    h1 { font-size: clamp(2.4rem, 6vw, 5rem); line-height: .95; margin:0; font-weight:600; }
    .lede { color:var(--muted); font-size:1.15rem; max-width: 38rem; line-height:1.6; }
    .btn { display:inline-block; background:var(--accent); color:#fff; padding:12px 18px; border-radius:999px; text-decoration:none; width:fit-content; }
    section { padding: 72px 6vw; }
    h2 { font-size:2rem; margin:0 0 24px; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:18px; }
    .card { background:var(--card); padding:20px; border-radius:16px; }
    .card h3 { margin:0 0 8px; }
    .card p, .muted { color:var(--muted); line-height:1.55; }
    .gallery { display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; }
    .gallery div { aspect-ratio: 4/3; overflow:hidden; border-radius:14px; }
    iframe { width:100%; height:280px; border:0; border-radius:16px; }
    footer { padding: 32px 6vw 48px; color:var(--muted); border-top:1px solid #2a2a30; }
    @media (max-width: 800px) {
      .hero { grid-template-columns: 1fr; }
      .hero-photo { min-height: 42vh; }
      nav { display:none; }
      .gallery { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">${escapeHtml(pack.name)}</div>
    <nav>
      <a href="#menu">Menu</a>
      <a href="#about">About</a>
      <a href="#visit">Visit</a>
    </nav>
  </header>
  <section class="hero" style="padding:0">
    <div class="hero-copy">
      <div class="eyebrow">${escapeHtml(pack.eyebrow || pack.tagline || pack.name)}</div>
      <h1>${escapeHtml(pack.heroTitle || pack.name)}</h1>
      <p class="lede">${escapeHtml(pack.heroSubtitle || pack.description)}</p>
      <a class="btn" href="#visit">${escapeHtml(pack.ctaButton || 'Reservation')}</a>
    </div>
    <div class="hero-photo">${img(hero, pack.name, '')}</div>
  </section>
  <section id="menu">
    <h2>Menu</h2>
    <div class="grid">
      ${menu
        .map(
          (item) =>
            `<article class="card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
        )
        .join('')}
    </div>
  </section>
  <section id="about">
    <h2>Our story</h2>
    <div class="grid">
      ${about.map((column) => `<article class="card"><p>${escapeHtml(column)}</p></article>`).join('')}
    </div>
    ${
      features.length
        ? `<div class="grid" style="margin-top:18px">${features
            .map(
              (item) =>
                `<article class="card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
            )
            .join('')}</div>`
        : ''
    }
  </section>
  ${
    gallery.length
      ? `<section><h2>Gallery</h2><div class="gallery">${gallery
          .map((src, index) => `<div>${img(src, `${pack.name} ${index + 1}`, '')}</div>`)
          .join('')}</div></section>`
      : ''
  }
  ${
    quotes.length
      ? `<section><h2>Guests</h2><div class="grid">${quotes
          .map(
            (item) =>
              `<article class="card"><p>“${escapeHtml(item.quote)}”</p><p class="muted">${escapeHtml(item.name)}${
                item.role ? ` · ${escapeHtml(item.role)}` : ''
              }</p></article>`,
          )
          .join('')}</div></section>`
      : ''
  }
  <section id="visit">
    <h2>${escapeHtml(pack.ctaTitle || 'Visit')}</h2>
    <p class="lede">${escapeHtml(pack.ctaSubtitle || pack.description)}</p>
    <div class="grid" style="margin-top:24px">
      <article class="card">
        <h3>Address</h3>
        <p>${escapeHtml(pack.address || '')}</p>
        <p>${escapeHtml(pack.phone || '')}</p>
        <p>${escapeHtml(pack.email || '')}</p>
      </article>
      <article class="card">${maps ? `<iframe title="Location" src="${escapeHtml(maps)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` : `<p>${escapeHtml(pack.footer || pack.name)}</p>`}</article>
    </div>
  </section>
  <footer>${escapeHtml(pack.footer || pack.name)}</footer>
</body>
</html>`;
}
