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

function sectionCopy(pack: FastCopyFile) {
  return {
    categoriesTitle: clipCopy('Our menu', 28),
    newestTitle: clipCopy(`New at ${pack.name}`, 32),
    customersTitle: clipCopy('Our guests', 28),
    visitTitle: clipCopy(`Find ${pack.name}`, 28),
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
  if (/hours\s*&\s*location|^location$|find us|visit us/i.test(text) && text.length < 48) return sections.visitTitle;
  return '';
}

function allowHtmlSwap(from: string): boolean {
  if (from.length < 12 || /unsplash|photo-[a-z0-9-]+|class=|href=|\.(?:png|jpe?g|webp|gif|svg)/i.test(from)) {
    return false;
  }
  if (/^(home|menu|about|bar|login|bag|contact|gallery|reservations?|book now|our story|hours|visit)$/i.test(from.trim())) {
    return false;
  }
  return true;
}

export function fitCopyPack(pack: FastCopyFile): FastCopyFile {
  const items = (rows: FastCopyItem[] | undefined, titleMax: number, bodyMax: number) =>
    (rows || []).map((row) => ({
      title: clipCopy(row.title, titleMax),
      body: clipCopy(row.body, bodyMax),
    }));
  const fitted: FastCopyFile = {
    ...pack,
    name: clipCopy(pack.name, 22),
    tagline: clipWords(pack.tagline, 8, 56),
    description: clipWords(pack.description, 28, 160),
    eyebrow: clipWords(pack.eyebrow, 5, 28),
    heroTitle: clipWords(pack.heroTitle || pack.name, 4, 22),
    heroSubtitle: clipWords(pack.heroSubtitle, 16, 96),
    address: clipCopy(pack.address, 48),
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
  fitted.swaps = buildCopySwaps(fitted.source, fitted);
  return fitted;
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

async function readTemplateText(projectPath: string): Promise<string> {
  const chunks: string[] = [];
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
      if (/imageLibrary|ImageGuard|SiteImage|next-env/.test(entry.name)) continue;
      chunks.push(await fs.readFile(full, 'utf8').catch(() => ''));
      if (chunks.length >= 40) return;
    }
  };
  await walk(projectPath);
  return chunks.join('\n');
}

function isDishName(value: string): boolean {
  return /loaf|salad|steak|pasta|chicken|oyster|tartare|pizza|soup|wine|cocktail|nigiri|ramen|espresso|bun\b/i.test(
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
            text.length >= 12 &&
            text.length <= 280 &&
            !/\n|;/.test(text) &&
            /\s/.test(text) &&
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
  const skipHero = new Set(
    [src.heroTitle, src.heroSubtitle, src.tagline].filter(Boolean).map((value) => value.replace(/\s+/g, ' ').trim()),
  );
  const phraseSwaps = (src.phrases || [])
    .filter((from) => from.length >= 24 && /\s/.test(from) && from !== brandTo && !skipHero.has(from.replace(/\s+/g, ' ').trim()))
    .map((from, index) => ({
      from,
      to: bodies[index] || longTo,
    }));
  const brands = [
    src.name,
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
  const swaps = [
    ...buildHtmlCopySwaps(next, pack),
    ...(pack.swaps?.length ? pack.swaps : buildCopySwaps(pack.source, pack)),
  ].sort((a, b) => b.from.length - a.from.length);
  const seen = new Set<string>();
  for (const { from, to } of swaps) {
    if (seen.has(from) || isTemplateLabel(to) || !allowHtmlSwap(from)) continue;
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
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
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

export function injectLiveCopyOverlay(html: string, pack: FastCopyFile): string {
  pack = fitCopyPack(pack);
  const sections = sectionCopy(pack);
  const swaps = [
    ...buildHtmlCopySwaps(html, pack),
    ...(pack.swaps?.length ? pack.swaps : buildCopySwaps(pack.source, pack)),
  ]
    .filter(
      (row) =>
        row.from &&
        row.to &&
        row.from !== row.to &&
        allowHtmlSwap(row.from) &&
        !row.to.includes(row.from) &&
        !/unsplash|photo-[a-z0-9-]+|class=|href=/i.test(row.from),
    )
    .sort((a, b) => b.from.length - a.from.length)
    .slice(0, 48)
    .map((row) => [row.from, row.to]);
  const data = {
    name: pack.name,
    sourceName: pack.source?.name || '',
    eyebrow: pack.eyebrow,
    heroTitle: pack.heroTitle,
    heroSubtitle: pack.heroSubtitle,
    description: pack.description,
    phone: pack.phone,
    email: pack.email,
    address: pack.address,
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
  if(/(hours\\s*&\\s*location|^location$|find us|visit us)/i.test(t)&&t.length<48)return "location";
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
  var loc=[d.address,d.phone,d.email].filter(Boolean);
  var i=0;
  sec.querySelectorAll("p,li,address").forEach(function(el){
    var t=txt(el);
    if(!t||kind(t)||NAV.test(t)||t.length>90||inHero(el)||el.closest("a"))return;
    if(el.tagName==="P"&&t.length>40&&!/\\d|@|\\+|lane|street|road|ave/i.test(t)){
      if(d.ctaSubtitle)set(el,d.ctaSubtitle);
      return;
    }
    if(loc[i]&&(/\\d|@|\\+|lane|street|road|avenue|downtown|[A-Z]{2}\\b/.test(t)||t.length<56)){
      set(el,loc[i]);i+=1;
    }
  });
}
function apply(){
  if(n>12)return;
  n+=1;
  if(d.name)document.title=d.name;
  function walk(node){
    if(!node)return;
    if(node.nodeType===3){
      var parent=node.parentElement;
      if(parent&&/^(A|BUTTON|NAV|LABEL|SCRIPT|STYLE)$/.test(parent.tagName))return;
      if(parent&&parent.closest&&parent.closest("a,button,nav,header,h1"))return;
      if(inHero(parent))return;
      var t=node.nodeValue,o=t;
      if(!t||t.length<12)return;
      for(var i=0;i<s.length;i++){if(s[i][0].length>=12&&t.indexOf(s[i][0])!==-1)t=t.split(s[i][0]).join(s[i][1]);}
      if(t!==o)node.nodeValue=t;
      return;
    }
    if(node.nodeType===1&&node.tagName!=="SCRIPT"&&node.tagName!=="STYLE"&&node.tagName!=="NAV"&&node.tagName!=="A"){
      for(var c=node.firstChild;c;c=c.nextSibling)walk(c);
    }
  }
  if(document.body)walk(document.body);
  document.querySelectorAll("header a, header [class*='logo'], header [class*='brand'], a[href='#top'], footer [class*='logo'], footer [class*='brand']").forEach(function(el){
    if(!isLogo(el))return;
    if(el.querySelector&&el.querySelector("img,svg"))return;
    set(el,d.name);
  });
  document.querySelectorAll("h2,h3,p").forEach(function(el){
    if(inHero(el))return;
    var k=kind(txt(el));
    if(k==="categories")fillCards(sectionOf(el),d.menu||d.features);
    if(k==="newest")fillCards(sectionOf(el),(d.menu||[]).slice().reverse());
    if(k==="customers")fillQuotes(sectionOf(el));
    if(k==="reserve"||k==="location")fillPlace(sectionOf(el));
  });
  document.querySelectorAll("h2,h3").forEach(function(el){
    if(inHero(el))return;
    var k=kind(txt(el));
    if(k==="categories")set(el,d.categoriesTitle);
    if(k==="newest")set(el,d.newestTitle);
    if(k==="customers")set(el,d.customersTitle);
    if(k==="reserve")set(el,d.ctaTitle);
    if(k==="location")set(el,d.visitTitle);
  });
  var box=document.querySelector("[id*='location'],[class*='location'],[id*='contact'],[class*='contact'],[class*='map']");
  if(box)fillPlace(box);
  if(d.phone)document.querySelectorAll('a[href^="tel:"]').forEach(function(a){set(a,d.phone);a.href="tel:"+String(d.phone).replace(/\\s/g,"");});
  if(d.email)document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){set(a,d.email);a.href="mailto:"+d.email;});
  if(d.mapsUrl){var f=document.querySelector("iframe[src*='map']");if(f)f.src=d.mapsUrl;}
}
document.addEventListener("DOMContentLoaded",apply);
window.addEventListener("load",apply);
[0,250,700,1400,2200,3500,5000].forEach(function(ms){setTimeout(apply,ms);});
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
