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
  hours: string;
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
    phrases?: string[];
  };
  swaps?: Array<{ from: string; to: string }>;
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
  const fitted = fitCopyPack(pack);
  await fs.writeFile(path.join(projectPath, FAST_COPY_FILE), `${JSON.stringify(fitted, null, 2)}\n`);
  await fs.writeFile(path.join(projectPath, '.fintoke-filled'), `${fitted.name}\n`).catch(() => undefined);
}

function clipCopy(value: string, max: number): string {
  const text = (value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.55 ? cut.slice(0, space) : cut).replace(/[,:;–—-]+$/g, '');
}

function clipWords(value: string, maxWords: number, maxChars: number): string {
  const words = (value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, maxWords);
  return clipCopy(words.join(' '), maxChars);
}

export function clipToOriginal(next: string, original: string, slack = 0.2): string {
  const incoming = (next || '').replace(/\s+/g, ' ').trim();
  const base = (original || '').replace(/\s+/g, ' ').trim();
  if (!incoming) return incoming;
  if (!base) return clipCopy(incoming, 48);
  const maxChars = Math.max(base.length, Math.ceil(base.length * (1 + slack)));
  const maxWords = Math.max(1, Math.ceil(base.split(' ').filter(Boolean).length * (1 + slack)));
  return clipWords(incoming, maxWords, maxChars);
}

function sectionCopy(pack: FastCopyFile) {
  return {
    categoriesTitle: clipCopy('Our menu', 28),
    newestTitle: clipCopy(`New at ${pack.name}`, 32),
    customersTitle: clipCopy('Our guests', 28),
    visitTitle: clipCopy('Visit us', 24),
  };
}

function headingReplacement(from: string, pack: FastCopyFile): string {
  const text = from.replace(/\s+/g, ' ').trim();
  const sections = sectionCopy(pack);
  if (/categor/i.test(text) && text.length < 48) return sections.categoriesTitle;
  if (/newest|explore .{0,24}item|best sellers?/i.test(text)) return sections.newestTitle;
  if (/^customers$|our customers|what (our )?(customers|guests)|testimonials?/i.test(text) && text.length < 64) {
    return sections.customersTitle;
  }
  if (/reserve your evening|book your evening|reserve a table|join us for/i.test(text)) return pack.ctaTitle;
  if (/^visit(\s+us)?$/i.test(text) || (/find us|hours\s*&\s*location|^location$/i.test(text) && text.length < 48)) {
    return sections.visitTitle;
  }
  return '';
}

function allowHtmlSwap(from: string, brandFrom?: Set<string>): boolean {
  if (/unsplash|photo-[a-z0-9-]+|class=|href=|\.(?:png|jpe?g|webp|gif|svg)/i.test(from)) {
    return false;
  }
  if (/^(home|menu|about|bar|login|bag|contact|gallery|reservations?|book now|our story|hours|visit)$/i.test(from.trim())) {
    return false;
  }
  if (from.length >= 12) return true;
  return Boolean(brandFrom?.has(from) && from.length >= 3);
}

export function fitCopyPack(pack: FastCopyFile): FastCopyFile {
  const src = pack.source || {};
  const items = (rows: FastCopyItem[] | undefined, titleMax: number, bodyMax: number) =>
    (rows || []).map((row) => ({
      title: clipCopy(row.title, titleMax),
      body: clipCopy(row.body, bodyMax),
    }));
  const fitted: FastCopyFile = {
    ...pack,
    name: clipToOriginal(pack.name, src.name || pack.name, 0.15) || clipCopy(pack.name, 22),
    tagline: clipToOriginal(pack.tagline, src.tagline || pack.tagline),
    description: clipToOriginal(pack.description, src.description || pack.description),
    eyebrow: clipWords(pack.eyebrow, 5, 28),
    heroTitle: clipToOriginal(pack.heroTitle || pack.name, src.heroTitle || pack.heroTitle || pack.name),
    heroSubtitle: clipToOriginal(pack.heroSubtitle, src.heroSubtitle || pack.heroSubtitle),
    address: clipCopy(pack.address, 48),
    hours: clipCopy(pack.hours || '', 40),
    aboutColumns: (pack.aboutColumns || []).map((column) => clipWords(column, 22, 120)),
    menu: items(pack.menu, 18, 56),
    features: items(pack.features, 18, 64),
    events: items(pack.events, 18, 64),
    ctaTitle: clipWords(pack.ctaTitle, 4, 24),
    ctaSubtitle: clipWords(pack.ctaSubtitle, 14, 80),
    ctaButton: clipCopy(pack.ctaButton, 18),
    footer: clipCopy(pack.footer, 56),
    testimonials: (pack.testimonials || []).map((row) => ({
      ...row,
      quote: clipCopy(row.quote, 120),
      name: clipCopy(row.name, 24),
      role: clipCopy(row.role, 24),
    })),
    team: (pack.team || []).map((row) => ({
      ...row,
      name: clipCopy(row.name, 24),
      role: clipCopy(row.role, 24),
      bio: clipCopy(row.bio, 90),
    })),
  };
  fitted.swaps = pack.swaps?.length ? pack.swaps : buildCopySwaps(fitted.source, fitted);
  return fitted;
}

export async function readFastCopy(projectPath: string): Promise<FastCopyFile | null> {
  if (!projectPath) return null;
  const dirs = [projectPath, path.join(projectPath, 'repo')];
  for (const dir of dirs) {
    try {
      const raw = await fs.readFile(path.join(dir, FAST_COPY_FILE), 'utf8');
      const parsed = JSON.parse(raw) as FastCopyFile;
      if (parsed?.name) return parsed;
    } catch {
      // try next location
    }
  }
  return null;
}

async function siteRoot(dir: string): Promise<string> {
  for (const candidate of [dir, path.join(dir, 'repo')]) {
    try {
      await fs.access(path.join(candidate, 'app', 'page.tsx'));
      return candidate;
    } catch {
      try {
        await fs.access(path.join(candidate, 'app', 'page.jsx'));
        return candidate;
      } catch {
        // keep looking
      }
    }
  }
  return dir;
}

async function listSourceFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  const walk = async (dir: string) => {
    if (files.length >= 40) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (files.length >= 40) return;
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) continue;
      if (/imageLibrary|ImageGuard|SiteImage|next-env|next\.config|tailwind|postcss|run-dev/.test(entry.name)) continue;
      files.push(full);
    }
  };
  await walk(root);
  return files;
}

async function readTemplateText(projectPath: string): Promise<string> {
  const files = await listSourceFiles(projectPath);
  const chunks = await Promise.all(files.map((file) => fs.readFile(file, 'utf8').catch(() => '')));
  return chunks.join('\n');
}

const NAV_COPY =
  /^(home|menu|about|bar|login|bag|search|contact|gallery|reservations?|book now|our story|hours|visit|plates|experience|order|shop|wine|private|starters|mains|sides|sweets|drinks)$/i;

function extractContentStrings(source: string): string[] {
  const decode = (value: string) =>
    value
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const out: string[] = [];
  const add = (raw: string) => {
    const text = decode(raw);
    if (text.length < 3 || text.length > 280) return;
    if (/^(use client|use server|true|false|null|undefined)$/i.test(text)) return;
    if (/^https?:/i.test(text) || text.includes('className') || text.includes('{')) return;
    if (NAV_COPY.test(text)) return;
    out.push(text);
  };
  for (const match of source.matchAll(
    /\b(?:name|title|subtitle|desc|description|label|quote|body|role|bio|hours|address|phone|email|tagline|eyebrow|price|note)\s*:\s*['"`]([^'"`]{1,280})['"`]/gi,
  )) {
    add(match[1]);
  }
  for (const match of source.matchAll(/>([^<>{}]{3,280})</g)) add(match[1]);
  return out;
}

function alignContentSwaps(fromList: string[], toList: string[]): Array<{ from: string; to: string }> {
  if (fromList.length === toList.length) {
    return fromList
      .map((from, index) => ({ from, to: toList[index] || '' }))
      .filter((row) => row.from && row.to && row.from !== row.to);
  }
  const swaps: Array<{ from: string; to: string }> = [];
  const fromSet = new Set(fromList);
  const toSet = new Set(toList);
  let i = 0;
  let j = 0;
  while (i < fromList.length && j < toList.length) {
    if (fromList[i] === toList[j]) {
      i += 1;
      j += 1;
      continue;
    }
    if (toSet.has(fromList[i]) && !fromSet.has(toList[j])) {
      j += 1;
      continue;
    }
    if (fromSet.has(toList[j]) && !toSet.has(fromList[i])) {
      i += 1;
      continue;
    }
    if (fromList[i] && toList[j] && fromList[i] !== toList[j]) {
      swaps.push({ from: fromList[i], to: toList[j] });
    }
    i += 1;
    j += 1;
  }
  return swaps;
}

export function applySafeCopySwaps(html: string, swaps: Array<{ from: string; to: string }>): string {
  if (!swaps.length) return html;
  const held: string[] = [];
  const hold = (block: string) => {
    held.push(block);
    return `<!--FINTOKE_ATTR_${held.length - 1}-->`;
  };
  let next = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, hold)
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, hold)
    .replace(/\s(?:class|className|style|src|srcset|srcSet|href|poster|id|data-[\w-]+)=["'][^"']*["']/gi, hold);
  const seen = new Set<string>();
  const ordered = [...swaps]
    .filter((row) => row.from.length >= 3 && row.to && row.from !== row.to && !NAV_COPY.test(row.from))
    .sort((a, b) => b.from.length - a.from.length);
  for (const { from, to: rawTo } of ordered) {
    if (seen.has(from) || !next.includes(from)) continue;
    const to = clipToOriginal(rawTo, from);
    if (!to || to === from) continue;
    seen.add(from);
    next = next.split(from).join(to);
    const encoded = from.replace(/&/g, '&amp;');
    if (encoded !== from && next.includes(encoded)) next = next.split(encoded).join(to.replace(/&/g, '&amp;'));
  }
  return next.replace(/<!--FINTOKE_ATTR_(\d+)-->/g, (_, index) => held[Number(index)] || '');
}

export async function contentSwapsFromProject(
  projectPath: string,
  templateId: string,
): Promise<Array<{ from: string; to: string }>> {
  if (!projectPath || !templateId) return [];
  const { resolveSnapshotDir } = await import('@/lib/templates/snapshot');
  const snapshotDir = await resolveSnapshotDir(templateId);
  if (!snapshotDir) return [];
  const fromRoot = await siteRoot(snapshotDir);
  const toRoot = await siteRoot(projectPath);
  const fromFiles = await listSourceFiles(fromRoot);
  const swaps: Array<{ from: string; to: string }> = [];
  for (const fromFile of fromFiles) {
    const rel = path.relative(fromRoot, fromFile);
    const toFile = path.join(toRoot, rel);
    const [fromSource, toSource] = await Promise.all([
      fs.readFile(fromFile, 'utf8').catch(() => ''),
      fs.readFile(toFile, 'utf8').catch(() => ''),
    ]);
    if (!fromSource || !toSource || fromSource === toSource) continue;
    swaps.push(...alignContentSwaps(extractContentStrings(fromSource), extractContentStrings(toSource)));
  }
  const unique = new Map<string, string>();
  for (const row of swaps) {
    if (!unique.has(row.from)) unique.set(row.from, row.to);
  }
  return [...unique.entries()].map(([from, to]) => ({ from, to }));
}

function isDishName(value: string): boolean {
  return /loaf|salad|steak|pasta|chicken|oyster|tartare|pizza|soup|wine|cocktail|nigiri|ramen|espresso|bun\b|smash|fries|cheeseburger|milkshake/i.test(
    value,
  );
}

export async function captureTemplateSource(projectPath: string): Promise<NonNullable<FastCopyFile['source']>> {
  const raw = await readTemplateText(projectPath);
  const grab = (key: string) => raw.match(new RegExp(`\\b${key}:\\s*['"\`]([^'"\`]{2,160})['"\`]`))?.[1] || '';
  const decode = (value: string) => value.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const metaTitle = grab('title');
  const named = [...raw.matchAll(/\bname:\s*['"`]([^'"`]{2,80})['"`]/g)].map((match) => decode(match[1]));
  const siteName = named.find((value) => value && !isDishName(value) && !/^[a-z0-9-]+$/.test(value));
  const jsxBrand =
    decode(
      raw.match(/className=\{?["'`][^"'`]*brand[^"'`]*["'`][^>]*>\s*([^<{]{2,80})\s*</i)?.[1] || '',
    ) || decode(raw.match(/<h1[^>]*>\s*([^<{]{2,80})\s*</i)?.[1] || '');
  const name = jsxBrand || siteName || metaTitle.split(/[—–\-|•]/)[0]?.trim() || named[0] || '';
  const keep =
    /^(About|Menu|Home|Gallery|Reservation|Contact|Book Now|Our Menu|Our story|Our categories|Categories|Explore newest items|Customers|Events|Interior|Hours|Visit|Starters|Mains|Sides|Sweets|Drinks|Features|Pricing|Team|Blog|To begin|From the hearth|For the table|To finish|Reserve|Primary)$/i;
  const phrases = [
    ...new Set(
      [...raw.matchAll(/>([^<{]*)</g)]
        .map((match) => decode(match[1]))
        .filter(
          (text) =>
            text.length >= 8 &&
            text.length <= 320 &&
            !/\n|;/.test(text) &&
            /[A-Za-zÀ-ÿ]/.test(text) &&
            !keep.test(text) &&
            !/categor|newest items|reserve your evening/i.test(text) &&
            !/[{}`]|=>|className|return |const |let |function /.test(text),
        ),
    ),
  ].slice(0, 28);
  return {
    name,
    tagline: grab('tagline') || grab('eyebrow'),
    heroTitle: jsxBrand || metaTitle || grab('title'),
    heroSubtitle: grab('subtitle') || phrases.find((text) => text.length >= 40) || '',
    description: grab('description'),
    phrases,
  };
}

function isTemplateLabel(value: string): boolean {
  return /template|^\s*new restaurant\b|^restaurant\s*\d+\s*$|\s[—–-]\s*restaurant\s*\d+/i.test(value.trim());
}

export function buildCopySwaps(
  source: FastCopyFile['source'] | undefined,
  pack: Pick<FastCopyFile, 'name' | 'tagline' | 'heroTitle' | 'heroSubtitle' | 'description' | 'aboutColumns'>,
): Array<{ from: string; to: string }> {
  const src = source || {};
  const brandTo = pack.name && !isTemplateLabel(pack.name) ? pack.name : '';
  const longTo = pack.description || pack.heroSubtitle || pack.tagline;
  const bodies = [pack.description, ...(pack.aboutColumns || [])].filter(Boolean);
  const skipHero = new Set<string>();
  const phraseSwaps = (src.phrases || [])
    .filter((from) => from.length >= 12 && from !== brandTo && !skipHero.has(from.replace(/\s+/g, ' ').trim()))
    .map((from, index) => ({
      from,
      to: clipToOriginal(bodies[index] || longTo || '', from),
    }));
  const brands = [
    src.name,
    'Bun & Bite',
    'New Restaurant',
    'NEW RESTAURANT',
    'Hearth & Vale',
    'Coral Cove',
    'Veloura Dining & Lounge',
    'Veloura Steak',
    'Veloura',
    'Säde',
  ];
  return [
    ...brands.map((from) => ({ from: from || '', to: brandTo })),
    { from: src.description || '', to: pack.description },
    ...phraseSwaps,
  ].filter(
    (row): row is { from: string; to: string } =>
      Boolean(
        row.from &&
          row.to &&
          row.from !== row.to &&
          row.from.length >= 4 &&
          !row.from.includes('{') &&
          !row.to.includes('{'),
      ),
  );
}

export async function ensureCopySwaps(pack: FastCopyFile): Promise<FastCopyFile> {
  let source = pack.source;
  if ((!source?.name || !source.phrases?.length) && pack.templateId) {
    const { resolveSnapshotDir } = await import('@/lib/templates/snapshot');
    const dir = await resolveSnapshotDir(pack.templateId);
    if (dir) source = await captureTemplateSource(dir);
  }
  const swaps = buildCopySwaps(source, pack);
  return { ...pack, source, swaps: swaps.length ? swaps : pack.swaps };
}

export async function previewCopyPack(
  projectPath: string,
  templateId: string,
  pack: FastCopyFile | null,
): Promise<FastCopyFile | null> {
  if (!projectPath && !pack) return null;
  const { resolveSnapshotDir } = await import('@/lib/templates/snapshot');
  const snapshotDir = templateId ? await resolveSnapshotDir(templateId) : null;
  const snapshot =
    pack?.source?.phrases?.length || pack?.source?.name
      ? pack.source
      : snapshotDir
        ? await captureTemplateSource(await siteRoot(snapshotDir))
        : undefined;
  const liveRoot = projectPath ? await siteRoot(projectPath) : '';
  const live = liveRoot ? await captureTemplateSource(liveRoot) : undefined;
  const liveRaw = liveRoot ? await readTemplateText(liveRoot) : '';
  const grab = (key: string) =>
    liveRaw.match(new RegExp(`\\b${key}:\\s*['"\`]([^'"\`]{2,160})['"\`]`))?.[1]?.trim() || '';
  if (pack?.name && !isTemplateLabel(pack.name)) {
    return fitCopyPack({
      ...pack,
      source: snapshot || pack.source,
      address: pack.address || grab('address') || pack.address,
      phone: pack.phone || grab('phone') || pack.phone,
      email: pack.email || grab('email') || pack.email,
      hours: pack.hours || grab('hours') || pack.hours,
      templateId: pack.templateId || templateId,
    });
  }
  const name = live?.name && !isTemplateLabel(live.name) ? live.name : pack?.name || '';
  const skipHero = new Set(
    [snapshot?.heroTitle, snapshot?.heroSubtitle, snapshot?.tagline]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.replace(/\s+/g, ' ').trim()),
  );
  const fromP = snapshot?.phrases || [];
  const toP = live?.phrases || [];
  const phraseSwaps: Array<{ from: string; to: string }> = [];
  const n = Math.min(fromP.length, toP.length);
  for (let i = 0; i < n; i += 1) {
    const from = fromP[i];
    const to = toP[i];
    if (!from || !to || from === to) continue;
    if (skipHero.has(from.replace(/\s+/g, ' ').trim())) continue;
    if (from.length < 12 || to.length < 8) continue;
    phraseSwaps.push({ from, to });
  }
  const fileSwaps = await contentSwapsFromProject(projectPath, templateId);
  const brandSwaps =
    snapshot?.name && name && snapshot.name !== name && !isTemplateLabel(name)
      ? [{ from: snapshot.name, to: name }]
      : [];
  if (!pack && !name && !fileSwaps.length) return null;
  const next: FastCopyFile = {
    name: name || pack?.name || 'Restaurant',
    tagline: pack?.tagline || live?.tagline || '',
    description: pack?.description || live?.description || '',
    eyebrow: pack?.eyebrow || '',
    heroTitle: pack?.heroTitle || live?.heroTitle || '',
    heroSubtitle: pack?.heroSubtitle || live?.heroSubtitle || '',
    address: grab('address') || pack?.address || '',
    phone: grab('phone') || pack?.phone || '',
    email: grab('email') || pack?.email || '',
    hours: grab('hours') || pack?.hours || '',
    aboutColumns: pack?.aboutColumns || [],
    menu: pack?.menu || [],
    features: pack?.features || [],
    events: pack?.events || [],
    testimonials: pack?.testimonials || [],
    team: pack?.team || [],
    ctaTitle: pack?.ctaTitle || '',
    ctaSubtitle: pack?.ctaSubtitle || '',
    ctaButton: pack?.ctaButton || '',
    footer: pack?.footer || name || '',
    images: pack?.images || [],
    mapsQuery: pack?.mapsQuery || '',
    mapsUrl: pack?.mapsUrl || '',
    templateId: pack?.templateId || templateId,
    source: snapshot,
    swaps: fileSwaps.length ? [...brandSwaps, ...fileSwaps] : [...brandSwaps, ...phraseSwaps],
  };
  return fitCopyPack(next);
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
  const token = (names: string[], fallback: string) => {
    for (const name of names) {
      const match = source.match(new RegExp(`--${name}:\\s*([^;]+)`));
      const value = match?.[1]?.trim();
      if (value && /#|[a-z]/i.test(value)) return value.replace(/['"]/g, '');
    }
    return fallback;
  };
  const hex = (pattern: RegExp, fallback: string) => source.match(pattern)?.[1] || fallback;
  return {
    background: token(['paper', 'bg', 'background'], hex(/background:\s*(#[0-9a-fA-F]{3,8})/, '#f4f0e8')),
    text: token(['ink', 'fg', 'text'], hex(/color:\s*(#[0-9a-fA-F]{3,8})/, '#14110e')),
    muted: token(['mute', 'muted', 'ink-2'], '#6f675c'),
    accent: token(['accent', 'accent-2', 'gold'], '#9a7b4a'),
    surface: token(['paper-2', 'surface', 'snow', 'card'], '#ebe4d8'),
    sans: token(['font-body', 'font-sans'], 'Figtree, system-ui, sans-serif'),
    serif: token(['font-display', 'font-serif'], 'Syne, Georgia, serif'),
  };
}

export const FAST_HTML_FILE = '.fintoke-preview.html';

function sizedImage(src: string, width: number): string {
  try {
    const url = new URL(src);
    if (!url.hostname.includes('unsplash.com')) return src;
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', '72');
    return url.toString();
  } catch {
    return src;
  }
}

function fontHref(sans: string, serif: string): string {
  const names = [serif, sans]
    .map((value) => value.split(',')[0]?.replace(/['"]/g, '').trim())
    .filter(Boolean)
    .map((name) => name.replace(/\s+/g, '+'));
  const family = [...new Set(names)].map((name) => `family=${name}:ital,wght@0,400;0,600;0,700;1,400`).join('&');
  return `https://fonts.googleapis.com/css2?${family}&display=swap`;
}

export async function writeFastPreviewHtml(projectPath: string, pack: FastCopyFile): Promise<void> {
  const { renderSnapshotPreviewHtml } = await import('./snapshotHtml');
  const snapshot = await renderSnapshotPreviewHtml(projectPath, pack);
  const html = snapshot ? applyCopyToHtml(snapshot, pack) : renderFastPreviewHtml(pack, await extractTemplateTheme(projectPath));
  await fs.writeFile(path.join(projectPath, FAST_HTML_FILE), `${html}\n`);
}

export async function readFastPreviewHtml(projectPath: string): Promise<string | null> {
  try {
    const html = await fs.readFile(path.join(projectPath, FAST_HTML_FILE), 'utf8');
    return html.includes('<html') ? html : null;
  } catch {
    return null;
  }
}

export function applyCopyToHtml(html: string, pack: FastCopyFile): string {
  pack = fitCopyPack(pack);
  const held: string[] = [];
  const hold = (block: string) => {
    held.push(block);
    return `<!--FINTOKE_HOLD_${held.length - 1}-->`;
  };
  let next = html
    .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, hold)
    .replace(/<section\b[^>]*>[\s\S]*?<\/section>/i, hold)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, hold)
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, hold)
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, hold)
    .replace(/<img\b[^>]*>/gi, hold)
    .replace(/<source\b[^>]*>/gi, hold)
    .replace(/url\(\s*(['"]?)[^)]+\)/gi, hold)
    .replace(/\s(?:src|srcset|srcSet|poster|data-src|data-bg)=["'][^"']*["']/gi, hold);
  const brandSwaps = buildCopySwaps(pack.source, pack).filter((row) => row.from.length < 24);
  const brandFrom = new Set(brandSwaps.map((row) => row.from));
  const swaps = [
    ...buildHtmlCopySwaps(next, pack),
    ...(pack.swaps?.length ? pack.swaps : buildCopySwaps(pack.source, pack)),
  ].sort((a, b) => b.from.length - a.from.length);
  const seen = new Set<string>();
  for (const { from, to } of swaps) {
    if (seen.has(from) || isTemplateLabel(to) || !allowHtmlSwap(from, brandFrom)) continue;
    if (/unsplash|photo-[a-z0-9-]+|\.(?:png|jpe?g|webp|gif|svg|avif)/i.test(from)) continue;
    seen.add(from);
    next = next.split(from).join(to);
    const encoded = from.replace(/&/g, '&amp;');
    if (encoded !== from) next = next.split(encoded).join(to.replace(/&/g, '&amp;'));
  }
  return next.replace(/<!--FINTOKE_HOLD_(\d+)-->/g, (_, index) => held[Number(index)] || '');
}

function decodeHtmlText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#38;/g, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&#39;|&apos;|&#x27;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCopy(value: string): string {
  return decodeHtmlText(value)
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function extractTagTexts(html: string, tag: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const text = decodeHtmlText(match[1]);
    if (text) out.push(text);
  }
  return out;
}

function buildHtmlCopySwaps(html: string, pack: FastCopyFile): Array<{ from: string; to: string }> {
  const keep =
    /^(About|Menu|Home|Gallery|Reservation|Contact|Book Now|Our Menu|Our story|Events|Interior|Hours|Visit|Starters|Mains|Sides|Sweets|Drinks|Features|Pricing|Team|Blog|Reserve|Login|Bag)$/i;
  const h1 = extractTagTexts(html, 'h1');
  const h2 = extractTagTexts(html, 'h2');
  const h3 = extractTagTexts(html, 'h3').concat(extractTagTexts(html, 'h4')).filter((text) => !keep.test(text));
  const paragraphs = extractTagTexts(html, 'p').filter((text) => text.length > 28);
  const titles = [
    ...(pack.menu || []).map((item) => item.title),
    ...(pack.features || []).map((item) => item.title),
    ...(pack.events || []).map((item) => item.title),
  ].filter(Boolean);
  const bodies = [
    ...(pack.aboutColumns || []),
    pack.description,
    ...(pack.menu || []).map((item) => item.body),
    ...(pack.features || []).map((item) => item.body),
    pack.ctaSubtitle,
  ].filter(Boolean);
  const rows: Array<{ from: string; to: string }> = [];
  h2.forEach((from) => {
    const to = headingReplacement(from, pack);
    if (to) rows.push({ from, to });
  });
  h3.forEach((from) => {
    const to = headingReplacement(from, pack);
    if (to) rows.push({ from, to });
  });
  paragraphs.forEach((from, index) => {
    if (h1[0] && from === h1[0]) return;
    const mapped = headingReplacement(from, pack);
    if (mapped) rows.push({ from, to: mapped });
    else if (bodies[index]) rows.push({ from, to: bodies[index] });
  });
  h3.forEach((from, index) => {
    if (headingReplacement(from, pack) || keep.test(from)) return;
    if (titles[index]) rows.push({ from, to: titles[index] });
  });
  return rows.filter((row) => row.from && row.to && row.from !== row.to && allowHtmlSwap(row.from));
}

const NAV_PAINT =
  /^(menu|home|about|about us|bar|login|bag|search|contact|gallery|reservations?|book now|our story|hours|visit|order|shop|wine|private|starters|mains|sides|sweets|drinks|quick links|subscribe|locations)$/i;

const TEMPLATE_BRANDS = [
  'Bun & Bite',
  'Hearth & Vale',
  'Coral Cove',
  'Veloura Dining & Lounge',
  'Veloura Steak',
  'Veloura',
  'New Restaurant',
  'Säde',
];

function copyPairs(pack: FastCopyFile): Array<[string, string]> {
  const longSlots = [
    pack.heroSubtitle,
    pack.description,
    ...(pack.aboutColumns || []),
    pack.ctaSubtitle,
    pack.tagline,
    pack.footer,
  ].filter((value) => value && value.length >= 8);
  const rows: Array<[string, string]> = [
    [
      'Fresh ingredients, bold flavors, and handcrafted with love. Our burgers aren\'t just food — they\'re a reason to smile.',
      pack.heroSubtitle || pack.description,
    ],
    [
      'At Bun & Bite, a great burger brings people together. From farm-fresh produce to flame-grilled patties, every bite is crafted to make your day brighter.',
      pack.description || pack.aboutColumns?.[0] || '',
    ],
    [
      'Visit our Dhanmondi kitchen for the same flame-grilled favorites — dine in or take out.',
      pack.ctaSubtitle || pack.description,
    ],
    ['Crafting delicious artisan pizzas', pack.tagline || pack.footer],
    ['Deals and cravings, delivered weekly.', pack.ctaSubtitle || pack.tagline],
    ['Real Ingredients. Better Burgers.', pack.ctaTitle || pack.aboutColumns?.[0] || ''],
    ['Find Us Near You', pack.ctaTitle],
    ['House 12, Road 2, Dhaka', pack.address],
    ['Dhaka, Bangladesh', pack.address],
    ['Dhanmondi', pack.address?.split(',')[0] || pack.address],
    ['hello@bunandbite.com', pack.email],
    ['+880 1234 567890', pack.phone],
    ['+358 40 123 4567', pack.phone],
  ];
  (pack.source?.phrases || []).forEach((from, index) => {
    rows.push([from, longSlots[index] || pack.description || pack.tagline]);
  });
  (pack.swaps || []).forEach((row) => rows.push([row.from, row.to]));
  if (pack.source?.name) rows.push([pack.source.name, pack.name]);
  TEMPLATE_BRANDS.forEach((from) => rows.push([from, pack.name]));
  const brandKey = new Set(
    [pack.source?.name, ...TEMPLATE_BRANDS].filter(Boolean).map((value) => normalizeCopy(value || '')),
  );
  return rows.filter((row): row is [string, string] => {
    const [from, to] = row;
    if (!from || !to || normalizeCopy(from) === normalizeCopy(to) || NAV_PAINT.test(from)) return false;
    const fromBrand = brandKey.has(normalizeCopy(from));
    if (!fromBrand && normalizeCopy(to) === normalizeCopy(pack.name)) return false;
    if (/@/.test(from) && !/@/.test(to)) return false;
    if (/^\+?[\d][\d\s().-]{6,}$/.test(from) && !/\d/.test(to)) return false;
    return true;
  });
}

export function paintCopyOnHtml(html: string, pack: FastCopyFile): string {
  pack = fitCopyPack(pack);
  if (!pack.name || isTemplateLabel(pack.name)) return html;
  const held: string[] = [];
  const hold = (block: string) => {
    held.push(block);
    return `<!--FINTOKE_PAINT_${held.length - 1}-->`;
  };
  let next = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, hold)
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, hold)
    .replace(/<form\b[\s\S]*?<\/form>/gi, hold);

  const pairs = copyPairs(pack);
  const exact = new Map<string, string>();
  const prefixes: Array<{ key: string; to: string }> = [];
  for (const [from, to] of pairs) {
    const key = normalizeCopy(from);
    if (!key || exact.has(key)) continue;
    exact.set(key, clipToOriginal(to, from, 0.35));
    if (key.length >= 24) prefixes.push({ key, to: exact.get(key) || to });
  }
  const brands = [...new Set([pack.source?.name, ...TEMPLATE_BRANDS].filter((value): value is string => Boolean(value)))]
    .filter((value) => normalizeCopy(value) !== normalizeCopy(pack.name))
    .sort((a, b) => b.length - a.length);

  next = next.replace(
    /<(a|span|p|h1|h2|h3|strong|em)(\b[^>]*)>([\s\S]{0,80}?)<\/\1>/gi,
    (full, tag: string, attrs: string, inner: string) => {
      if (/<(a|ul|form|nav|input|button|p|h2|h3)\b/i.test(inner)) return full;
      const text = decodeHtmlText(inner);
      if (!text || text.length > 42 || NAV_PAINT.test(text) || /@/.test(text) || /^\+?[\d][\d\s().-]{6,}$/.test(text)) {
        return full;
      }
      if (brands.some((brand) => normalizeCopy(text) === normalizeCopy(brand))) {
        return `<${tag}${attrs}>${escapeHtml(clipCopy(pack.name, 28))}</${tag}>`;
      }
      return full;
    },
  );

  next = next.replace(/>([^<]{1,800})</g, (full, raw: string) => {
    if (!raw.trim() || raw.includes('FINTOKE_PAINT')) return full;
    const lead = raw.match(/^\s*/)?.[0] || '';
    const trail = raw.match(/\s*$/)?.[0] || '';
    const decoded = decodeHtmlText(raw);
    if (!decoded || NAV_PAINT.test(decoded)) return full;
    const key = normalizeCopy(decoded);
    const mapped = exact.get(key);
    if (mapped) {
      const mappedIsBrand = normalizeCopy(mapped) === normalizeCopy(pack.name);
      const fromIsBrand = brands.some((brand) => key === normalizeCopy(brand));
      if (!mappedIsBrand || fromIsBrand) return `>${lead}${escapeHtml(mapped)}${trail}<`;
    }
    const prefix = prefixes.find((row) => decoded.length >= 40 && key.startsWith(row.key.slice(0, 40)));
    if (prefix && normalizeCopy(prefix.to) !== normalizeCopy(pack.name)) {
      return `>${lead}${escapeHtml(clipToOriginal(prefix.to, decoded, 0.35))}${trail}<`;
    }

    let updated = decoded;
    for (const brand of brands) {
      if (!brand || brand === pack.name) continue;
      if (updated.includes(brand)) updated = updated.split(brand).join(pack.name);
    }
    updated = updated.replace(/bun\s*&\s*bite/gi, pack.name);
    if (pack.hours && /open|daily|hours|closed|late|\b(?:am|pm)\b/i.test(decoded) && decoded.length < 56) {
      updated = clipToOriginal(pack.hours, decoded, 0.45);
    } else if (
      pack.address &&
      decoded.length < 64 &&
      !/@/.test(decoded) &&
      (/,/.test(decoded) || /street|road|lane|house|avenue|dhanmondi|dhaka|bangladesh|finland/i.test(decoded))
    ) {
      updated = clipToOriginal(pack.address, decoded, 0.5);
    } else if (pack.phone && /^\+?[\d][\d\s().-]{6,22}$/.test(decoded)) {
      updated = pack.phone;
    } else if (pack.email && /@/.test(decoded)) {
      updated = pack.email;
    }
    if (updated === decoded) return full;
    return `>${lead}${escapeHtml(updated)}${trail}<`;
  });

  if (pack.name) {
    next = next.replace(/<title>([^<]*)<\/title>/i, `<title>${escapeHtml(pack.name)}</title>`);
  }

  return next.replace(/<!--FINTOKE_PAINT_(\d+)-->/g, (_, index) => held[Number(index)] || '');
}

export function injectLiveCopyOverlay(html: string, pack: FastCopyFile): string {
  pack = fitCopyPack(pack);
  const sections = sectionCopy(pack);
  const headerBrand = (() => {
    const header = html.match(/<header\b[\s\S]{0,12000}/i)?.[0] || '';
    const labels =
      /^(menu|home|about|bar|login|bag|search|reservations?|experience|contact|gallery|book now|reservation)$/i;
    return (
      [...header.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)]
        .map((match) => decodeHtmlText(match[1]))
        .find((text) => text.length >= 3 && text.length <= 28 && !labels.test(text)) || ''
    );
  })();
  const brandPairs = [
    ...buildCopySwaps(pack.source, pack),
    ...(headerBrand && pack.name && headerBrand !== pack.name
      ? [{ from: headerBrand, to: pack.name }]
      : []),
  ]
    .filter((row) => row.from.length >= 3 && row.from.length <= 32 && row.from !== pack.name)
    .sort((a, b) => b.from.length - a.from.length)
    .slice(0, 16);
  const brandFrom = new Set(brandPairs.map((row) => row.from));
  const swaps = [
    ...(pack.swaps?.length ? pack.swaps : buildCopySwaps(pack.source, pack)),
  ]
    .filter(
      (row) =>
        row.from &&
        row.to &&
        row.from !== row.to &&
        allowHtmlSwap(row.from, brandFrom) &&
        !/unsplash|photo-[a-z0-9-]+|class=|href=/i.test(row.from),
    )
    .sort((a, b) => b.from.length - a.from.length)
    .slice(0, 48)
    .map((row) => [row.from, row.to]);
  const data = {
    name: pack.name,
    sourceName: pack.source?.name || '',
    brands: [
      ...brandPairs.map((row) => [row.from, pack.name]),
      ...TEMPLATE_BRANDS.filter((from) => from !== pack.name).map((from) => [from, pack.name]),
    ],
    pairs: copyPairs(pack).slice(0, 80),
    eyebrow: pack.eyebrow,
    heroTitle: pack.heroTitle,
    heroSubtitle: pack.heroSubtitle,
    description: pack.description,
    phone: pack.phone,
    email: pack.email,
    address: pack.address,
    hours: pack.hours,
    mapsUrl: pack.mapsUrl,
    menu: pack.menu || [],
    features: pack.features || [],
    testimonials: pack.testimonials || [],
    ctaTitle: pack.ctaTitle,
    ctaSubtitle: pack.ctaSubtitle,
    ctaButton: pack.ctaButton,
    ...sections,
    swaps,
  };
  const script = `<script>(function(){
var d=${JSON.stringify(data)};
var s=d.swaps||[];
var brands=d.brands||[];
var n=0;
var NAV=/^(menu|home|about|bar|login|bag|search|reservations?|experience|contact|gallery|book now|reservation|our story|hours|visit|order|shop|wine|private)$/i;
function txt(el){return (el&&(el.textContent||"").replace(/\\s+/g," ").trim())||"";}
function inHero(el){
  if(!el)return false;
  if(el.tagName==="H1"||(el.closest&&el.closest("h1")))return true;
  if(el.closest&&el.closest("[class*='hero'],.hero,.hero-copy"))return true;
  var h1=document.querySelector("h1");
  var sec=h1&&h1.closest("section");
  return !!(sec&&sec.contains(el));
}
function set(el,v){
  if(!el||!v)return;
  var old=txt(el);
  if(old&&v.length>old.length+Math.max(4,Math.ceil(old.length*0.2))){
    v=v.slice(0,old.length).replace(/\\s+\\S*$/,"").trim()||v.slice(0,old.length);
  }
  if(el.querySelector&&el.querySelector("h2,h3,h4,p,a,button,img,svg,iframe,input,ul,nav")){
    for(var c=el.firstChild;c;c=c.nextSibling){
      if(c.nodeType===3&&c.nodeValue&&c.nodeValue.trim()){c.nodeValue=v;return;}
      if(c.nodeType===1&&/^(SPAN|EM|STRONG)$/.test(c.tagName)&&!c.querySelector("h2,h3,p,a")){c.textContent=v;return;}
    }
    return;
  }
  el.textContent=v;
}
function isLogo(el){
  if(!el)return false;
  var href=(el.getAttribute&&el.getAttribute("href")||"").split("?")[0];
  if(/logo|brand/i.test(el.className||""))return true;
  if(href==="#top"||href==="/"||href==="#")return true;
  if(d.sourceName&&txt(el)===d.sourceName)return true;
  return false;
}
function kind(t){
  if(/categor/i.test(t)&&t.length<48)return "categories";
  if(/newest|explore .{0,24}item|best sellers?/i.test(t))return "newest";
  if(/(^customers$|our customers|what (our )?(customers|guests)|testimonials?)/i.test(t)&&t.length<64)return "customers";
  if(/reserve your evening|book your evening|join us for/i.test(t))return "reserve";
  if(/^visit(\s+us)?$/i.test(t)||/find us|^location$/i.test(t)&&t.length<48)return "location";
  if(d.categoriesTitle&&t===d.categoriesTitle)return "categories";
  if(d.newestTitle&&t===d.newestTitle)return "newest";
  if(d.customersTitle&&t===d.customersTitle)return "customers";
  if(d.ctaTitle&&t===d.ctaTitle)return "reserve";
  if(d.visitTitle&&t===d.visitTitle)return "location";
  return "";
}
function sectionOf(el){return el.closest("section")||el.parentElement||el;}
function fillCards(sec,items){
  if(!sec||!items||!items.length)return;
  var i=0;
  sec.querySelectorAll("h3,h4,article p,figcaption").forEach(function(el){
    var t=txt(el);
    if(!t||NAV.test(t)||kind(t)||inHero(el)||el.querySelector&&el.querySelector("img,svg,input,a"))return;
    var item=items[i];
    if(!item)return;
    if(el.tagName==="P"&&t.length>42){if(item.body)set(el,item.body);i+=1;return;}
    if(item.title)set(el,item.title);
    i+=1;
  });
}
function fillQuotes(sec){
  if(!sec)return;
  var q=d.testimonials||[];
  var i=0;
  sec.querySelectorAll("p,blockquote,figcaption").forEach(function(el){
    var t=txt(el);
    if(!t||kind(t)||t.length<18||NAV.test(t)||inHero(el))return;
    if(q[i]&&q[i].quote){set(el,q[i].quote);i+=1;}
  });
}
function fillPlace(sec){
  if(!sec)return;
  sec.querySelectorAll("h2,h3,h4,p,li,address,span").forEach(function(el){
    var t=txt(el);
    if(!t||inHero(el)||el.closest("a,nav,header")||t.length>80)return;
    if(/^visit(\s+us)?$/i.test(t)||kind(t)==="location"&&/h[1-4]/i.test(el.tagName)){
      if(d.visitTitle)set(el,d.visitTitle);
      return;
    }
    if(d.hours&&/open|daily|hours|closed|late|\\b(am|pm)\\b|mon|tue|wed|week/i.test(t)&&t.length<56){
      set(el,d.hours);
      return;
    }
    if(d.address&&t.length<56&&!/@/.test(t)&&(/,/.test(t)||/street|road|lane|avenue|downtown|bangladesh|finland|helsinki|sylhet|city/i.test(t))){
      set(el,d.address);
      return;
    }
    if(d.phone&&(/^\\+?\\d/.test(t)||/tel/i.test(t)))set(el,d.phone);
    if(d.email&&/@/.test(t))set(el,d.email);
  });
}
function apply(){
  if(n>12)return;
  n+=1;
  if(d.name)document.title=d.name;
  var pairs=(d.pairs||[]).concat(s||[]);
  function walk(node){
    if(!node)return;
    if(node.nodeType===3){
      var parent=node.parentElement;
      if(parent&&/^(SCRIPT|STYLE)$/.test(parent.tagName))return;
      var t=node.nodeValue,o=t;
      if(!t||!t.trim())return;
      var trimmed=t.replace(/\\s+/g," ").trim();
      if(NAV.test(trimmed))return;
      for(var i=0;i<brands.length;i++){
        if(brands[i][0]&&t.indexOf(brands[i][0])!==-1)t=t.split(brands[i][0]).join(brands[i][1]);
      }
      t=t.replace(/bun\\s*&\\s*bite/gi,d.name||t);
      for(var j=0;j<pairs.length;j++){
        if(pairs[j][0]&&pairs[j][0].length>=3&&t.indexOf(pairs[j][0])!==-1)t=t.split(pairs[j][0]).join(pairs[j][1]);
      }
      if(t!==o)node.nodeValue=t;
      return;
    }
    if(node.nodeType===1&&node.tagName!=="SCRIPT"&&node.tagName!=="STYLE"){
      for(var c=node.firstChild;c;c=c.nextSibling)walk(c);
    }
  }
  if(document.body)walk(document.body);
  document.querySelectorAll("header a, header span, footer a, footer p, footer span").forEach(function(el){
    if(el.querySelector&&el.querySelector("img,svg,input,form,ul,nav"))return;
    if(el.children&&el.children.length>1)return;
    var t=txt(el);
    if(!t||NAV.test(t)||t.length>42||/@/.test(t))return;
    var isBrand=t===d.sourceName||/bun\\s*&\\s*bite/i.test(t);
    for(var i=0;i<brands.length&&!isBrand;i++){if(brands[i][0]&&t===brands[i][0])isBrand=true;}
    if(isBrand)set(el,d.name);
  });
  document.querySelectorAll("header a, a[href='#top']").forEach(function(el){
    if(el.querySelector&&el.querySelector("img,svg,ul,nav"))return;
    if(el.children&&el.children.length>1)return;
    var t=txt(el);
    if(t&&NAV.test(t))return;
    if(isLogo(el)&&t&&t.length<=42&&!/@/.test(t))set(el,d.name);
  });
  document.querySelectorAll("section,main,article").forEach(function(sec){
    var count=sec.querySelectorAll("h3,h4").length;
    if(count>=3)fillCards(sec,d.menu||d.features);
  });
  document.querySelectorAll("h2,h3,p").forEach(function(el){
    if(inHero(el))return;
    var k=kind(txt(el));
    if(k==="categories")fillCards(sectionOf(el),d.menu||d.features);
    if(k==="newest")fillCards(sectionOf(el),(d.menu||[]).slice().reverse());
    if(k==="customers")fillQuotes(sectionOf(el));
    if(k==="reserve"||k==="location")fillPlace(sectionOf(el));
  });
  var box=document.querySelector("[id*='location'],[class*='location'],[id*='contact'],[class*='contact'],[class*='map']");
  if(box)fillPlace(box);
  if(d.phone)document.querySelectorAll('a[href^="tel:"]').forEach(function(a){set(a,d.phone);a.href="tel:"+String(d.phone).replace(/\\s/g,"");});
  if(d.email)document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){set(a,d.email);a.href="mailto:"+d.email;});
  if(d.mapsUrl){var f=document.querySelector("iframe[src*='map']");if(f)f.src=d.mapsUrl;}
}
apply();
window.addEventListener("load",function(){setTimeout(apply,200);});
[800,1800].forEach(function(ms){setTimeout(apply,ms);});
})();</script>`;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${script}</body>`);
  return `${html}${script}`;
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
  const images = (pack.images?.length ? pack.images : restaurantFallbackImages()).map((src, index) =>
    sizedImage(src, index === 0 ? 1400 : 800),
  );
  const hero = images[0] || sizedImage(restaurantFallbackImages()[0], 1400);
  const gallery = images.slice(1, 7);
  const menu = pack.menu?.length ? pack.menu : [{ title: 'Seasonal plate', body: pack.description }];
  const about = pack.aboutColumns?.length ? pack.aboutColumns : [pack.description];
  const features = pack.features?.length ? pack.features : [];
  const events = pack.events?.length ? pack.events : [];
  const team = pack.team?.length ? pack.team : [];
  const quotes = pack.testimonials?.length ? pack.testimonials : [];
  const maps = pack.mapsUrl || (pack.mapsQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(pack.mapsQuery)}&z=15&output=embed`
    : '');

  const img = (src: string, alt: string, eager = false) =>
    `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async" referrerpolicy="origin" />`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="referrer" content="origin" />
  <title>${escapeHtml(pack.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://images.unsplash.com" />
  <link rel="preload" as="image" href="${escapeHtml(hero)}" />
  <link href="${escapeHtml(fontHref(colors.sans, colors.serif))}" rel="stylesheet" />
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
    html { scroll-behavior: smooth; }
    body { margin:0; font-family: var(--sans); background:var(--bg); color:var(--ink); }
    h1, h2, h3, .brand { font-family: var(--serif); }
    a { color: inherit; text-decoration: none; }
    img { display:block; width:100%; height:100%; object-fit:cover; }
    header { display:flex; justify-content:space-between; align-items:center; padding:18px 6vw; position:sticky; top:0; background:color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(10px); z-index:2; }
    .brand { font-weight:700; letter-spacing:.04em; font-size:1.15rem; }
    nav { display:flex; gap:18px; color:var(--muted); font-size:14px; }
    .hero { display:grid; grid-template-columns: 1.05fr .95fr; min-height: 82vh; }
    .hero-copy { padding: 9vh 6vw; display:flex; flex-direction:column; justify-content:center; gap:18px; }
    .eyebrow { color:var(--accent); letter-spacing:.18em; text-transform:uppercase; font-size:12px; }
    h1 { font-size: clamp(2.6rem, 6vw, 5.2rem); line-height: .95; margin:0; font-weight:600; }
    .lede { color:var(--muted); font-size:1.15rem; max-width: 38rem; line-height:1.65; }
    .btn { display:inline-block; background:var(--accent); color:#fff; padding:12px 18px; border-radius:999px; width:fit-content; }
    section { padding: 80px 6vw; }
    h2 { font-size:2.1rem; margin:0 0 28px; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:18px; }
    .card { background:var(--card); padding:22px; border-radius:16px; }
    .card h3 { margin:0 0 8px; }
    .card p, .muted { color:var(--muted); line-height:1.55; margin:0; }
    .gallery { display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; }
    .gallery div { aspect-ratio: 4/3; overflow:hidden; border-radius:14px; }
    iframe { width:100%; min-height:280px; border:0; border-radius:16px; }
    footer { padding: 32px 6vw 48px; color:var(--muted); display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; }
    @media (max-width: 800px) {
      .hero { grid-template-columns: 1fr; }
      .hero-photo { min-height: 44vh; }
      nav { display:none; }
      .gallery { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <a class="brand" href="#top">${escapeHtml(pack.name)}</a>
    <nav>
      <a href="#menu">Menu</a>
      <a href="#about">About</a>
      <a href="#gallery">Gallery</a>
      <a href="#visit">Visit</a>
    </nav>
  </header>
  <section class="hero" id="top" style="padding:0">
    <div class="hero-copy">
      <div class="eyebrow">${escapeHtml(pack.eyebrow || pack.tagline || pack.name)}</div>
      <h1>${escapeHtml(pack.heroTitle || pack.name)}</h1>
      <p class="lede">${escapeHtml(pack.heroSubtitle || pack.description)}</p>
      <a class="btn" href="#visit">${escapeHtml(pack.ctaButton || 'Reservation')}</a>
    </div>
    <div class="hero-photo">${img(hero, pack.name, true)}</div>
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
      ? `<section id="gallery"><h2>Gallery</h2><div class="gallery">${gallery
          .map((src, index) => `<div>${img(src, `${pack.name} ${index + 1}`, index < 2)}</div>`)
          .join('')}</div></section>`
      : ''
  }
  ${
    events.length
      ? `<section><h2>Events</h2><div class="grid">${events
          .map(
            (item) =>
              `<article class="card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
          )
          .join('')}</div></section>`
      : ''
  }
  ${
    quotes.length
      ? `<section><h2>Guests</h2><div class="grid">${quotes
          .map(
            (item) =>
              `<article class="card"><p>“${escapeHtml(item.quote)}”</p><p class="muted" style="margin-top:10px">${escapeHtml(item.name)}${
                item.role ? ` · ${escapeHtml(item.role)}` : ''
              }</p></article>`,
          )
          .join('')}</div></section>`
      : ''
  }
  ${
    team.length
      ? `<section><h2>Team</h2><div class="grid">${team
          .map(
            (item) =>
              `<article class="card"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.role)}</p><p style="margin-top:8px">${escapeHtml(item.bio)}</p></article>`,
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
  <footer><span>${escapeHtml(pack.footer || pack.name)}</span><span>${escapeHtml(pack.phone || '')}</span></footer>
</body>
</html>`;
}
