import fs from 'fs/promises';
import type { Dirent } from 'fs';
import path from 'path';
import {
  allLibraryPhotoIds,
  formatImageLibraryModule,
  isIncompatibleImageCategory,
  matchImageCategory,
  photoLibraryCategory,
  pickLibraryPhoto,
  scoreImageCategory,
} from './imageLibrary';
import { dataFile } from '@/lib/server/paths';

export {
  SITE_IMAGE_AGENT_RULES,
  buildSiteImageAgentRules,
} from './imageLibrary';

export const SAFE_UNSPLASH_IDS = allLibraryPhotoIds();

const SAFE_ID_SET = new Set<string>(SAFE_UNSPLASH_IDS);

const KNOWN_DEAD_UNSPLASH_IDS = new Set([
  'photo-1595278069441-2cf7f38a3b24',
  'photo-1615485925534-598c2f4a6c97',
  'photo-1615485500908-78dcce483cc3',
  'photo-1595171690106-0666d8a0e564',
  'photo-1587049352846-4a222e7848fa',
  'photo-1579584425558-c3ce17fd4351',
  'photo-1617195737496-73f7d6d5a7a1',
  'photo-1611145346302-a7a36e9e6c83',
  'photo-1572116467636-31e0a63761d9',
  'photo-1569529465841-df975a7650d4',
  'photo-1551024709-8f23befdf6dd',
  'photo-1574096079515-d8259312b785',
  'photo-1577217495644-349702793992',
  'photo-1566554273541-37a8054b73bc',
  'photo-1434682881908-6a73b2ffa95f',
  'photo-1472851291858-1b8b1b5caa4c',
  'photo-1487412947147-5cebf100ff44',
  'photo-1503220317375-aa2ba1850c22',
  'photo-1523050854058-8df90110c9f1',
  'photo-1565514020176-b73d5b2c6a0c',
  'photo-1565793298595-6a879b1d9502',
  'photo-1579684385127-1ef41f9772c7',
  'photo-1581595220892-b0739db3b8c5',
  'photo-1582750433449-648ed127bb48',
  'photo-1593022356769-79afce825b54',
  'photo-1598256985400-628e5670e0e0',
]);

export const GENERATED_IMAGES_CONFIG = `images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  }`;

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d9d4c8"/>
      <stop offset="52%" stop-color="#b7c2b4"/>
      <stop offset="100%" stop-color="#cbb89a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <g fill="none" stroke="rgba(44,36,22,0.16)" stroke-width="10" stroke-linejoin="round">
    <path d="M40 640 L320 330 L510 510 L780 240 L1160 640"/>
  </g>
  <circle cx="900" cy="170" r="54" fill="rgba(255,255,255,0.42)"/>
</svg>
`;

const IMAGE_GUARD_SOURCE = `'use client';

import { useEffect } from 'react';

const FALLBACK = '/images/fallback.svg';

function patchBrokenImage(img: HTMLImageElement) {
  if (img.dataset.clbFallback === '1') return;
  if (img.getAttribute('src') === FALLBACK) return;
  img.dataset.clbFallback = '1';
  img.removeAttribute('srcset');
  img.srcset = '';
  img.src = FALLBACK;
  img.style.opacity = '1';
  img.style.visibility = 'visible';
  img.style.objectFit = 'cover';
}

export function ImageGuard() {
  useEffect(() => {
    const onError = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) patchBrokenImage(target);
    };
    document.addEventListener('error', onError, true);

    const scan = () => {
      document.querySelectorAll('img').forEach((img) => {
        if (
          img.complete &&
          img.naturalWidth === 0 &&
          img.getAttribute('src') &&
          img.getAttribute('src') !== FALLBACK
        ) {
          patchBrokenImage(img);
        }
      });
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => {
      document.removeEventListener('error', onError, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
`;

const INSTRUMENTATION_CLIENT_SOURCE = `// Managed by Claudable. Restores broken photos so generated sites never show empty frames.
const FALLBACK = '/images/fallback.svg';

function patchBrokenImage(img: HTMLImageElement) {
  if (img.dataset.clbFallback === '1') return;
  if (img.getAttribute('src') === FALLBACK) return;
  img.dataset.clbFallback = '1';
  img.removeAttribute('srcset');
  img.srcset = '';
  img.src = FALLBACK;
  img.style.opacity = '1';
  img.style.visibility = 'visible';
  img.style.objectFit = 'cover';
}

try {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) patchBrokenImage(target);
    },
    true,
  );

  const scan = () => {
    document.querySelectorAll('img').forEach((img) => {
      if (
        img.complete &&
        img.naturalWidth === 0 &&
        img.getAttribute('src') &&
        img.getAttribute('src') !== FALLBACK
      ) {
        patchBrokenImage(img);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
} catch {
  // Preview should still boot if this file is evaluated too early.
}
`;

const SITE_IMAGE_SOURCE = `'use client';

import Image from 'next/image';
import { useState } from 'react';

const FALLBACK = '/images/fallback.svg';

type SiteImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
};

export function SiteImage({
  src,
  alt,
  className = '',
  fill,
  width,
  height,
  priority,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: SiteImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || FALLBACK);

  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        referrerPolicy="no-referrer"
        onError={() => setCurrentSrc(FALLBACK)}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
      priority={priority}
      referrerPolicy="no-referrer"
      onError={() => setCurrentSrc(FALLBACK)}
    />
  );
}
`;

export type SiteImagesResult = {
  changed: boolean;
  needsPreviewRestart: boolean;
};

async function writeIfChanged(filePath: string, contents: string): Promise<boolean> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    const existing = await fs.readFile(filePath, 'utf8');
    if (existing === contents) return false;
  } catch {
    // missing
  }
  await fs.writeFile(filePath, contents, 'utf8');
  return true;
}

function layoutImportLine(layoutPath: string, projectPath: string): string {
  const from = path.posix.dirname(layoutPath.replace(/\\/g, '/'));
  const to = path.posix.join(projectPath.replace(/\\/g, '/'), 'components/ImageGuard');
  let rel = path.posix.relative(from, to);
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return `import { ImageGuard } from '${rel}';`;
}

function injectImageGuard(source: string, importLine: string): string {
  if (source.includes('<ImageGuard') && source.includes('ImageGuard')) {
    return source;
  }

  let next = source;
  if (!next.includes(importLine) && !/import\s+\{\s*ImageGuard\s*\}/.test(next)) {
    const imports = [...next.matchAll(/^import .+$/gm)];
    const last = imports[imports.length - 1];
    if (last && last.index !== undefined) {
      const at = last.index + last[0].length;
      next = `${next.slice(0, at)}\n${importLine}${next.slice(at)}`;
    } else {
      next = `${importLine}\n${next}`;
    }
  }

  if (!next.includes('<ImageGuard')) {
    if (/<body([^>]*)>\s*\{children\}/.test(next)) {
      next = next.replace(
        /<body([^>]*)>\s*\{children\}/,
        '<body$1>\n        <ImageGuard />\n        {children}',
      );
    } else if (/<body([^>]*)>/.test(next)) {
      next = next.replace(/<body([^>]*)>/, '<body$1>\n        <ImageGuard />');
    }
  }

  if (!next.includes('name="referrer"') && /<html[\s\S]*?>/.test(next) && !/<head[\s>]/.test(next)) {
    next = next.replace(
      /<html([^>]*)>/,
      '<html$1>\n      <head>\n        <meta name="referrer" content="no-referrer" />\n      </head>',
    );
  } else if (next.includes('<head>') && !next.includes('name="referrer"')) {
    next = next.replace(
      '<head>',
      '<head>\n        <meta name="referrer" content="no-referrer" />',
    );
  }

  return next;
}

export function ensureRemoteImageConfig(source: string): string {
  const hasWildcard =
    source.includes("hostname: '**'") || source.includes('hostname: "**"');
  if (hasWildcard) {
    if (source.includes('unoptimized: true')) return source;
    return source.replace(/images:\s*\{/, 'images: {\n    unoptimized: true,');
  }

  const unsplashOnly =
    /remotePatterns:\s*\[\s*\{\s*protocol:\s*'https',\s*hostname:\s*'images\.unsplash\.com'\s*\}\s*\]/;
  if (unsplashOnly.test(source)) {
    let next = source.replace(
      unsplashOnly,
      `remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ]`,
    );
    if (!next.includes('unoptimized: true')) {
      next = next.replace(/images:\s*\{/, 'images: {\n    unoptimized: true,');
    }
    return next;
  }

  const imagesBlock = /images:\s*\{[\s\S]*?\n  \}/;
  if (imagesBlock.test(source)) {
    return source.replace(imagesBlock, GENERATED_IMAGES_CONFIG);
  }

  if (source.includes('const nextConfig = {')) {
    return source.replace(
      'const nextConfig = {',
      `const nextConfig = {\n  ${GENERATED_IMAGES_CONFIG},`,
    );
  }

  if (source.includes('module.exports = {')) {
    return source.replace(
      'module.exports = {',
      `module.exports = {\n  ${GENERATED_IMAGES_CONFIG},`,
    );
  }

  return source;
}

async function injectIntoLayout(projectPath: string): Promise<boolean> {
  const candidates = [
    'app/layout.tsx',
    'app/layout.jsx',
    'src/app/layout.tsx',
    'src/app/layout.jsx',
  ];

  let changed = false;
  for (const rel of candidates) {
    const layoutPath = path.join(projectPath, rel);
    let source = '';
    try {
      source = await fs.readFile(layoutPath, 'utf8');
    } catch {
      continue;
    }
    const next = injectImageGuard(source, layoutImportLine(layoutPath, projectPath));
    if (next !== source) {
      await fs.writeFile(layoutPath, next, 'utf8');
      changed = true;
    }
  }
  return changed;
}

async function patchNextConfig(projectPath: string): Promise<boolean> {
  const configPath = path.join(projectPath, 'next.config.js');
  let source = '';
  try {
    source = await fs.readFile(configPath, 'utf8');
  } catch {
    return false;
  }
  const next = ensureRemoteImageConfig(source);
  if (next === source) return false;
  await fs.writeFile(configPath, next, 'utf8');
  return true;
}

export async function ensureSiteImages(projectPath: string): Promise<SiteImagesResult> {
  const instrumentationPath = path.join(projectPath, 'instrumentation-client.ts');
  let hadInstrumentation = false;
  try {
    await fs.access(instrumentationPath);
    hadInstrumentation = true;
  } catch {
    hadInstrumentation = false;
  }

  const wroteFallback = await writeIfChanged(
    path.join(projectPath, 'public/images/fallback.svg'),
    FALLBACK_SVG,
  );
  const wroteGuard = await writeIfChanged(
    path.join(projectPath, 'components/ImageGuard.tsx'),
    IMAGE_GUARD_SOURCE,
  );
  const wroteSiteImage = await writeIfChanged(
    path.join(projectPath, 'components/SiteImage.tsx'),
    SITE_IMAGE_SOURCE,
  );
  const wroteInstrumentation = await writeIfChanged(
    instrumentationPath,
    INSTRUMENTATION_CLIENT_SOURCE,
  );
  const wroteLibrary = await writeIfChanged(
    path.join(projectPath, 'lib/imageLibrary.ts'),
    formatImageLibraryModule(),
  );
  const layoutChanged = await injectIntoLayout(projectPath);
  const configChanged = await patchNextConfig(projectPath);

  const changed =
    wroteFallback ||
    wroteGuard ||
    wroteSiteImage ||
    wroteInstrumentation ||
    wroteLibrary ||
    layoutChanged ||
    configChanged;

  return {
    changed,
    needsPreviewRestart:
      configChanged || (wroteInstrumentation && !hadInstrumentation),
  };
}

function replacementIdFor(deadId: string, context = ''): string {
  const category = matchImageCategory(context);
  return pickLibraryPhoto(category, deadId).id;
}

type StatusCache = Record<string, { ok: boolean; checkedAt: number }>;

function statusCachePath(): string {
  return dataFile('unsplash-status.json');
}

async function loadStatusCache(): Promise<StatusCache> {
  try {
    const raw = await fs.readFile(statusCachePath(), 'utf8');
    const parsed = JSON.parse(raw) as StatusCache;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveStatusCache(cache: StatusCache): Promise<void> {
  await fs.mkdir(path.dirname(statusCachePath()), { recursive: true });
  await fs.writeFile(statusCachePath(), `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

async function unsplashExists(photoId: string): Promise<boolean> {
  if (SAFE_ID_SET.has(photoId)) return true;
  if (KNOWN_DEAD_UNSPLASH_IDS.has(photoId)) return false;

  const url = `https://images.unsplash.com/${photoId}?w=64&q=60`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'ClaudableImageCheck/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    const type = response.headers.get('content-type') || '';
    await response.body?.cancel().catch(() => undefined);
    return response.ok && (type.includes('image') || type.includes('octet-stream') || type === '');
  } catch {
    return true;
  }
}

const SOURCE_FILE = /\.(tsx|ts|jsx|js|mjs|cjs)$/;
const SKIP_DIR = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.turbo', '.vercel']);

async function collectSourceFiles(dir: string, out: string[] = []): Promise<string[]> {
  let entries: Dirent[] = [];
  try {
    entries = await fs.readdir(dir, { encoding: 'utf8', withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIR.has(entry.name) || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectSourceFiles(full, out);
    } else if (SOURCE_FILE.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

export async function repairBrokenRemoteImages(projectPath: string): Promise<boolean> {
  const files = await collectSourceFiles(projectPath);
  const idPattern = /images\.unsplash\.com\/(photo-[a-zA-Z0-9-]+)/g;
  const found = new Set<string>();
  const fileTexts = new Map<string, string>();

  for (const file of files) {
    let text = '';
    try {
      text = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    fileTexts.set(file, text);
    for (const match of text.matchAll(idPattern)) {
      found.add(match[1]);
    }
  }

  if (found.size === 0) return false;

  const cache = await loadStatusCache();
  const now = Date.now();
  const ttl = 1000 * 60 * 60 * 24 * 7;
  const dead = new Set<string>();

  for (const id of found) {
    if (SAFE_ID_SET.has(id)) {
      cache[id] = { ok: true, checkedAt: now };
      continue;
    }
    const cached = cache[id];
    if (cached && now - cached.checkedAt < ttl) {
      if (!cached.ok) dead.add(id);
      continue;
    }
    const ok = await unsplashExists(id);
    cache[id] = { ok, checkedAt: now };
    if (!ok) dead.add(id);
  }

  await saveStatusCache(cache);
  if (dead.size === 0) return false;

  let changed = false;
  for (const [file, original] of fileTexts) {
    let next = original;
    for (const id of dead) {
      const replacement = replacementIdFor(id, original);
      if (replacement === id) continue;
      next = next.split(id).join(replacement);
    }
    if (next !== original) {
      await fs.writeFile(file, next, 'utf8');
      changed = true;
    }
  }

  return changed;
}

const RETARGET_MIN_SCORE = 8;

export async function retargetMismatchedRemoteImages(projectPath: string): Promise<boolean> {
  const files = await collectSourceFiles(projectPath);
  const topicParts: string[] = [];
  const fileTexts = new Map<string, string>();

  for (const file of files) {
    if (file.endsWith(`${path.sep}imageLibrary.ts`) || file.endsWith('/imageLibrary.ts')) continue;
    let text = '';
    try {
      text = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    fileTexts.set(file, text);
    topicParts.push(text);
  }

  const scored = scoreImageCategory(topicParts.join('\n'));
  if (scored.score < RETARGET_MIN_SCORE) return false;

  const siteCategory = scored.category;
  const idPattern = /images\.unsplash\.com\/(photo-[a-zA-Z0-9-]+)/g;
  let changed = false;

  for (const [file, original] of fileTexts) {
    const ids = [...original.matchAll(idPattern)].map((match) => match[1]);
    if (ids.length === 0) continue;

    let next = original;
    for (const id of new Set(ids)) {
      const photoCat = photoLibraryCategory(id);
      if (!photoCat) continue;
      if (!isIncompatibleImageCategory(siteCategory.id, photoCat)) continue;
      const replacement = pickLibraryPhoto(siteCategory, `${file}:${id}`).id;
      if (replacement === id) continue;
      next = next.split(id).join(replacement);
    }
    if (next !== original) {
      await fs.writeFile(file, next, 'utf8');
      changed = true;
    }
  }

  return changed;
}

export async function settleGeneratedSiteImages(projectPath: string): Promise<SiteImagesResult> {
  const result = await ensureSiteImages(projectPath);
  try {
    await retargetMismatchedRemoteImages(projectPath);
  } catch (error) {
    console.warn('[SiteImages] Failed to retarget photos:', error);
  }
  void repairBrokenRemoteImages(projectPath).catch((error) => {
    console.warn('[SiteImages] Failed to repair remote photos:', error);
  });
  return result;
}
