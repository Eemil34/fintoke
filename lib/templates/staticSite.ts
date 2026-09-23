import fs from 'fs/promises';
import path from 'path';
import { resolveSnapshotDir } from './snapshot';

export const STATIC_EXPORT_DIR = '.fintoke-static';
export const STATIC_EXPORT_VERSION = 'keep-photos-1';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
};

export async function resolveStaticExportDir(templateId: string): Promise<string | null> {
  const snapshot = await resolveSnapshotDir(templateId);
  if (!snapshot) return null;
  for (const name of [STATIC_EXPORT_DIR, 'out']) {
    const index = path.join(snapshot, name, 'index.html');
    try {
      await fs.access(index);
      return path.join(snapshot, name);
    } catch {
      // try next
    }
  }
  return null;
}

export async function resolveProjectStaticExportDir(projectPath: string): Promise<string | null> {
  if (!projectPath) return null;
  for (const root of [path.join(projectPath, 'repo'), projectPath]) {
    for (const name of [STATIC_EXPORT_DIR, 'out']) {
      const index = path.join(root, name, 'index.html');
      try {
        await fs.access(index);
        return path.join(root, name);
      } catch {
        // try next
      }
    }
  }
  return null;
}

export async function hasStaticExport(templateId: string): Promise<boolean> {
  return Boolean(await resolveStaticExportDir(templateId));
}

export async function hasCurrentStaticExport(templateId: string): Promise<boolean> {
  const dir = await resolveStaticExportDir(templateId);
  if (!dir) return false;
  if (!/^restaurant-4/.test(templateId)) return true;
  try {
    const version = (await fs.readFile(path.join(dir, '.fintoke-export'), 'utf8')).trim();
    return version === STATIC_EXPORT_VERSION;
  } catch {
    return false;
  }
}

function safeJoin(root: string, segments?: string[]): string | null {
  const rel = (segments || []).filter(Boolean).join('/');
  if (rel.split('/').some((part) => part === '..')) return null;
  return path.join(root, rel);
}

export async function readStaticExportFile(
  root: string,
  segments?: string[],
): Promise<{ abs: string; body: Buffer; contentType: string } | null> {
  const joined = safeJoin(root, segments);
  if (!joined) return null;
  const candidates = [];
  if (!segments?.length) {
    candidates.push(path.join(root, 'index.html'));
  } else {
    candidates.push(joined);
    if (!path.extname(joined)) {
      candidates.push(`${joined}.html`);
      candidates.push(path.join(joined, 'index.html'));
    }
  }
  for (const abs of candidates) {
    const resolved = path.resolve(abs);
    if (!resolved.startsWith(path.resolve(root))) continue;
    try {
      const body = await fs.readFile(abs);
      const ext = path.extname(abs).toLowerCase() || '.html';
      return { abs, body, contentType: MIME[ext] || 'application/octet-stream' };
    } catch {
      // try next candidate
    }
  }
  return null;
}

export function rewriteStaticUrls(source: string, prefix: string): string {
  const base = prefix.replace(/\/$/, '');
  const prefixed = source
    .replace(/(["'`(=])\/_next\//g, `$1${base}/_next/`)
    .replace(/(\s(?:href|src|srcset|srcSet|action))="([^"]*)"/gi, (_, attr: string, value: string) => {
      const next = value.replace(/(^|[\s,])\/(?!\/|preview\/)/g, `$1${base}/`);
      return `${attr}="${next}"`;
    })
    .replace(/url\(\s*(['"]?)\/(?!\/|preview\/)/g, `url($1${base}/`)
    .replace(/(["'`])(\/(?:images|uploads|photos|img|assets|public)\/[^"'`]+)/g, (full, quote: string, url: string) => {
      if (url.startsWith(`${base}/`)) return full;
      return `${quote}${base}${url}`;
    });
  return unwrapNextImageUrls(prefixed, base);
}

export function unwrapNextImageUrls(source: string, prefix = ''): string {
  const base = prefix.replace(/\/$/, '');
  return source.replace(
    /(?:\/preview\/[^/]+)?\/_next\/image\?((?:(?!["'<>\s]).)+)/g,
    (full, query: string) => {
      try {
        const params = new URLSearchParams(query.replace(/&amp;/g, '&'));
        const url = params.get('url');
        if (!url) return full;
        const decoded = decodeURIComponent(url);
        if (/^https?:\/\//i.test(decoded)) return decoded;
        if (decoded.startsWith('/') && base) return `${base}${decoded}`;
      } catch {
        // keep original
      }
      return full;
    },
  );
}

export function disableImagePatcher(source: string): string {
  return source
    .replace(/https:\/\/images\.unsplash\.com\/photo-1497366216548-37526070297c[^"'`\s]*/g, '')
    .replace(/removeAttribute\("srcset"\)/g, 'getAttribute("srcset")')
    .replace(/dataset\.clbReliable="1",[a-z]\.src=e/g, 'dataset.clbReliable="1"')
    .replace(/[a-z]\.src=e;return/g, 'return')
    .replace(/dataset\.clbFallback="1",[a-z]\.src=/g, 'dataset.clbFallback="1";0&&');
}

function capUnsplashUrl(raw: string, width = 640): string {
  const encoded = raw.includes('&amp;');
  try {
    const parsed = new URL(raw.replace(/&amp;/g, '&'));
    if (!parsed.hostname.includes('unsplash.com')) return raw;
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('q', width > 800 ? '60' : '50');
    parsed.searchParams.delete('h');
    parsed.searchParams.delete('dpr');
    const next = parsed.toString();
    return encoded ? next.replace(/&/g, '&amp;') : next;
  } catch {
    return raw;
  }
}

export function prioritizeLcpImage(html: string): string {
  let hero = '';
  let index = 0;
  let next = html.replace(/<img\b([^>]*)>/gi, (_full, attrs: string) => {
    index += 1;
    const isHero = index === 1;
    let a = attrs
      .replace(/\sloading=["'][^"']*["']/gi, '')
      .replace(/\sfetchpriority=["'][^"']*["']/gi, '')
      .replace(/\sfetchPriority=["'][^"']*["']/gi, '')
      .replace(/\ssrcset=["'][^"']*["']/gi, '')
      .replace(/\ssizes=["'][^"']*["']/gi, '');
    a = a.replace(/https:\/\/images\.unsplash\.com\/photo-[^"'>\s]+/g, (url: string) => {
      const capped = capUnsplashUrl(url, isHero ? 900 : 640);
      if (isHero) hero = capped.replace(/&amp;/g, '&');
      return capped;
    });
    if (isHero) return `<img loading="eager" fetchpriority="high" decoding="async"${a}>`;
    return `<img loading="lazy" decoding="async"${a}>`;
  });
  next = next.replace(/https:\/\/images\.unsplash\.com\/photo-[^"'()\s]+/g, (url) => {
    const current = url.replace(/&amp;/g, '&');
    if (hero && current.split('?')[0] === hero.split('?')[0]) return capUnsplashUrl(url, 900);
    return capUnsplashUrl(url, 640);
  });
  if (!hero) {
    const found = next.match(/https:\/\/images\.unsplash\.com\/photo-[^"'<>\s]+/)?.[0];
    if (found) hero = capUnsplashUrl(found.replace(/&amp;/g, '&'), 900);
  }
  const links = [
    '<link rel="preconnect" href="https://images.unsplash.com" crossorigin />',
    '<link rel="dns-prefetch" href="https://images.unsplash.com" />',
    hero ? `<link rel="preload" as="image" href="${hero.replace(/&/g, '&amp;')}" fetchpriority="high" />` : '',
  ].join('');
  if (/<head[^>]*>/i.test(next)) next = next.replace(/<head[^>]*>/i, (open) => `${open}${links}`);
  return addHeroEntrance(next);
}

export function freezePreviewHtml(html: string): string {
  return html
    .replace(/<link[^>]+as=["']script["'][^>]*>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/?>/gi, '');
}

export function isBrandIconRequest(segments?: string[]) {
  const last = segments?.[segments.length - 1] || '';
  return /^(favicon\.(ico|png|svg)|icon\.svg|icon\.png|apple-icon.*|apple-touch-icon.*)$/i.test(last);
}

export async function readFintokeBrandIcon(): Promise<{ body: Buffer; contentType: string } | null> {
  for (const file of [
    path.join(process.cwd(), 'public', 'fintoke-icon.png'),
    path.join(process.cwd(), 'app', 'icon.png'),
  ]) {
    try {
      const body = await fs.readFile(file);
      if (body.length > 32) return { body, contentType: 'image/png' };
    } catch {
      // try next
    }
  }
  return null;
}

export function injectFintokeFavicon(html: string): string {
  const tags =
    '<link rel="icon" href="/fintoke-icon.png" type="image/png"/><link rel="apple-touch-icon" href="/fintoke-icon.png"/>';
  const next = html.replace(
    /<link\b[^>]*(?:rel=["'][^"']*icon[^"']*["']|href=["'][^"']*(?:favicon|\/icon\.svg|\/icon\.png)[^"']*["'])[^>]*>/gi,
    '',
  );
  if (/<head[^>]*>/i.test(next)) return next.replace(/<head[^>]*>/i, (open) => `${open}${tags}`);
  return `${tags}${next}`;
}

export async function applyFintokeBrandIcons(projectPath: string): Promise<void> {
  const icon = await readFintokeBrandIcon();
  if (!icon) return;
  for (const root of [projectPath, path.join(projectPath, 'repo')]) {
    try {
      await fs.access(path.join(root, 'app'));
    } catch {
      continue;
    }
    await fs.mkdir(path.join(root, 'public'), { recursive: true });
    await fs.writeFile(path.join(root, 'app', 'icon.png'), icon.body);
    await fs.rm(path.join(root, 'app', 'icon.svg'), { force: true });
    await fs.writeFile(path.join(root, 'public', 'favicon.ico'), icon.body);
    await fs.writeFile(path.join(root, 'public', 'favicon.png'), icon.body);
  }
}

export function addHeroEntrance(html: string): string {
  const css = `<style id="fintoke-enter">
img[fetchpriority=high]{content-visibility:visible}
img:not([fetchpriority=high]){content-visibility:auto}
.reveal,[class*="reveal"],.hero-rise,[data-reveal],.opacity-0{opacity:1!important;transform:none!important;visibility:visible!important;animation:none!important}
html,body,main,#__next{opacity:1!important;visibility:visible!important}
footer{width:100%!important;max-width:100%!important;box-sizing:border-box}
footer > div,footer > section{width:100%!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important}
footer [class*="grid-cols"],footer [class*="grid"]{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))!important;justify-content:space-between!important;align-items:start!important;gap:2rem 2.5rem!important;width:100%!important}
@media (min-width:768px){
  footer > div > div[class*="flex"]:not(nav):not(form):not(ul){flex-direction:row!important;flex-wrap:wrap!important;justify-content:space-between!important;align-items:flex-start!important;gap:2rem 2.5rem!important;width:100%!important}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (open) => `${open}${css}`);
  return `${css}${html}`;
}
