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

export function prioritizeLcpImage(html: string): string {
  let next = html.replace(/<img\b([^>]*)>/i, (_full, attrs: string) => {
    const cleaned = attrs
      .replace(/\sloading=["'][^"']*["']/gi, '')
      .replace(/\sfetchpriority=["'][^"']*["']/gi, '')
      .replace(/\sfetchPriority=["'][^"']*["']/gi, '');
    return `<img loading="eager" fetchpriority="high" decoding="async"${cleaned}>`;
  });
  const unsplash = [...next.matchAll(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+[^"'<>\s]*/g)].map((match) =>
    match[0].replace(/&amp;/g, '&'),
  );
  let hero = unsplash[0] || next.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || '';
  for (const url of unsplash) {
    try {
      const width = Number(new URL(url).searchParams.get('w') || '0');
      const heroWidth = hero ? Number(new URL(hero).searchParams.get('w') || '0') : 0;
      if (width > heroWidth) hero = url;
    } catch {
      // keep current
    }
  }
  const links = [
    '<link rel="preconnect" href="https://images.unsplash.com" crossorigin />',
    hero
      ? `<link rel="preload" as="image" href="${hero.replace(/&/g, '&amp;')}" fetchpriority="high" />`
      : '',
  ].join('');
  if (/<head[^>]*>/i.test(next)) next = next.replace(/<head[^>]*>/i, (open) => `${open}${links}`);
  return next;
}
