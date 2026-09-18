import fs from 'fs/promises';
import path from 'path';
import { collectTemplateImages, writeFastCopy, type FastCopyFile } from './fastPreview';
import { getOpenaiApiKey } from '@/lib/services/leads';
import type { WorkspaceLead } from '@/types/leads';

const SKIP_DIR = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.turbo', 'public', 'assets']);
const TEXT_FILES = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const IMAGE_HINT = /unsplash|photo-[a-z0-9-]+|images\.unsplash|\/uploads\/|fallback\.svg/i;
const KEEP_LABEL =
  /^(About|Menu|Home|Gallery|Reservation|Contact|Book Now|Our Menu|Our story|Events|Interior|Hours|Visit|Starters|Mains|Sides|Sweets|Drinks|Features|Pricing|Team|Blog)$/i;

type FastFillLead = Pick<
  WorkspaceLead,
  'business' | 'contactName' | 'whatTheyDo' | 'email' | 'phone' | 'city' | 'website' | 'notes' | 'details' | 'audience' | 'style'
>;

type CopyItem = { title: string; body: string };
type CopyPack = {
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
  menu: CopyItem[];
  features: CopyItem[];
  events: CopyItem[];
  testimonials: { quote: string; name: string; role: string }[];
  team: { name: string; role: string; bio: string }[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  footer: string;
};

function extractJsonObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function mapsEmbed(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

async function listTextFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  const walk = async (dir: string) => {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP_DIR.has(entry.name) || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!TEXT_FILES.has(path.extname(entry.name))) continue;
      files.push(full);
    }
  };
  await walk(root);
  return files;
}

function rewriteMaps(source: string, query: string): string {
  if (!query) return source;
  const embed = mapsEmbed(query);
  return source.replace(/https?:\/\/(?:www\.)?google\.[^"' \s]+\/maps[^"' \s]*/gi, embed);
}

function injectMapsUrl(siteSource: string, embed: string): string {
  if (!embed) return siteSource;
  if (/mapsUrl\s*:/.test(siteSource)) {
    return siteSource.replace(/mapsUrl\s*:\s*(['"`])[\s\S]*?\1/, `mapsUrl: '${embed.replace(/'/g, "\\'")}'`);
  }
  if (!/contact\s*:\s*\{/.test(siteSource)) return siteSource;
  return siteSource.replace(/(contact\s*:\s*\{)/, `$1\n    mapsUrl: '${embed.replace(/'/g, "\\'")}',`);
}

function injectMapIframe(source: string): string {
  if (/mapsUrl|google\.com\/maps/.test(source) && /<iframe/i.test(source)) return source;
  if (!/site\.contact\.address/.test(source)) return source;
  if (/site\.contact\.mapsUrl/.test(source)) return source;
  return source.replace(
    /(<p>\s*\{site\.contact\.address\}\s*<\/p>)/,
    `$1
          {(site.contact as { mapsUrl?: string }).mapsUrl ? (
            <iframe
              title="Location"
              src={(site.contact as { mapsUrl?: string }).mapsUrl}
              className="mt-4 h-48 w-full rounded-xl border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : null}`,
  );
}

function applyAccentColor(source: string, color: string): string {
  const hex = color.match(/^#([0-9a-fA-F]{6})$/)?.[0];
  if (!hex) return source;
  const common = source.match(/#(?:DE7356|c95940|C95940|111827|0f172a|2563eb|b45309)/g);
  if (!common?.length) return source;
  let next = source;
  for (const old of new Set(common)) {
    if (old.toLowerCase() === hex.toLowerCase()) continue;
    next = next.split(old).join(hex);
  }
  return next;
}

export function isCopyOnlyInstruction(instruction: string): boolean {
  return /rewrite (all )?(the )?(text|copy|strings)|visible copy|full text|do not (change|replace|touch) (the )?(photos|images|files)|keep (the )?(photos|images)|copy only|text only/i.test(
    instruction,
  );
}

function escapeQuoted(value: string, quote: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(new RegExp(quote, 'g'), `\\${quote}`)
    .replace(/\n/g, '\\n');
}

function decodeQuoted(value: string): string {
  return value.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

function isTechnicalString(value: string): boolean {
  if (IMAGE_HINT.test(value)) return true;
  if (/^@?\/|^\.\.?\/|https?:\/\//.test(value)) return true;
  if (/^[a-z0-9-]+$/.test(value) && !/\s/.test(value)) return true;
  if (/^(flex|grid|hidden|block|px-|py-|text-|bg-|rounded|sm:|md:|lg:)/.test(value)) return true;
  return false;
}

function dishList(what: string, name: string): CopyItem[] {
  const kind = what.toLowerCase();
  if (/pizza/.test(kind)) {
    return [
      { title: `${name} margherita`, body: 'San Marzano tomato, mozzarella, basil, olive oil.' },
      { title: 'Funghi', body: 'Roasted mushrooms, garlic, thyme, fior di latte.' },
      { title: 'Diavola', body: 'Spicy salami, chili honey, mozzarella.' },
      { title: 'Burrata salad', body: 'Ripe tomato, basil oil, grilled bread.' },
      { title: 'Cacio e pepe', body: 'Pecorino, black pepper, fresh pasta.' },
      { title: 'Tiramisu', body: 'Espresso, mascarpone, cocoa.' },
      { title: 'Olives & oil', body: 'Warm focaccia, house olives.' },
      { title: 'Aperitivo spritz', body: 'Bitter citrus, prosecco, orange.' },
    ];
  }
  if (/sushi|ramen|noodle|asian|izakaya/.test(kind)) {
    return [
      { title: 'Chef nigiri set', body: 'Dayboat fish, warm rice, wasabi.' },
      { title: 'Spicy tuna roll', body: 'Sesame, scallion, chili mayo.' },
      { title: 'Miso ramen', body: 'Rich broth, chashu, egg, nori.' },
      { title: 'Cucumber sunomono', body: 'Rice vinegar, sesame, chili.' },
      { title: 'Chicken karaage', body: 'Crisp thigh, lemon, Kewpie.' },
      { title: 'Matcha panna cotta', body: 'White chocolate, berry.' },
      { title: 'Edamame', body: 'Sea salt, chili oil.' },
      { title: 'House highball', body: 'Whisky, soda, yuzu peel.' },
    ];
  }
  if (/cafe|coffee|bakery/.test(kind)) {
    return [
      { title: 'House espresso', body: 'Single origin, chocolate and citrus.' },
      { title: 'Flat white', body: 'Velvety milk, double shot.' },
      { title: 'Cardamom bun', body: 'Butter, sugar, warm spice.' },
      { title: 'Sourdough toast', body: 'Whipped butter, seasonal jam.' },
      { title: 'Seasonal salad', body: 'Greens, seeds, house vinaigrette.' },
      { title: 'Soup of the day', body: 'Ask the counter for today’s pot.' },
      { title: 'Berry oat bowl', body: 'Yogurt, honey, toasted grains.' },
      { title: 'Iced filter', body: 'Slow brew, served over ice.' },
    ];
  }
  return [
    { title: `${name} starter`, body: 'Seasonal produce, house dressing, warm bread.' },
    { title: 'Chef’s catch', body: 'Market fish, lemon, herbs, olive oil.' },
    { title: 'Slow roast', body: 'Sunday-style meat, pan juices, greens.' },
    { title: 'Garden plate', body: 'Grilled vegetables, grains, tahini.' },
    { title: 'House pasta', body: 'Fresh noodles, butter, hard cheese.' },
    { title: 'Citrus tart', body: 'Short pastry, cream, sea salt.' },
    { title: 'Olives & pickles', body: 'Something sharp to start.' },
    { title: 'House wine', body: 'A glass that matches the kitchen.' },
  ];
}

function localCopyPack(lead: FastFillLead, country?: string): CopyPack {
  const name = lead.business.trim() || 'Kitchen';
  const city = [lead.city, country].filter(Boolean).join(', ') || 'town';
  const what = (lead.whatTheyDo || 'a neighborhood restaurant').trim();
  const menu = dishList(what, name);
  const address = city;
  const email = lead.email.trim() || `hello@${name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'kitchen'}.fi`;
  const phone = lead.phone.trim() || '';
  return {
    name,
    tagline: `${what} in ${city}`.slice(0, 90),
    description: `${name} is ${what} in ${city}. ${lead.notes || lead.details || 'Come in for a table, a glass, and food that tastes like this place.'}`.slice(
      0,
      360,
    ),
    eyebrow: `${what} · ${city}`.slice(0, 80),
    heroTitle: name,
    heroSubtitle: `${name} cooks ${what} for ${city} — simple plates, a calm room, and a table you can stay at.`.slice(
      0,
      220,
    ),
    address,
    phone,
    email,
    aboutColumns: [
      `${name} is a ${what} in ${city}. The kitchen cooks for this neighborhood: honest food, a short menu, and a room that feels looked after.`,
      lead.audience
        ? `We cook for ${lead.audience}. ${lead.style || 'The room is unfussy and the service is warm.'}`
        : `Walk in, book a table, or linger after dinner. ${name} is built for regulars as much as first visits.`,
    ],
    menu,
    features: [
      { title: 'The kitchen', body: `${name} cooks ${what} with produce we actually want to eat.` },
      { title: 'The room', body: `A straightforward dining room in ${city} — good light, decent chairs, no theatre.` },
      { title: 'Drinks', body: 'A short list that matches the food: wine, beer, and a couple of house pours.' },
      { title: 'Groups', body: 'Say hello by email if you are booking a longer table or a private evening.' },
    ],
    events: [
      { title: 'Weeknight table', body: `Drop in at ${name} for the short evening menu.` },
      { title: 'Saturday lunch', body: 'A slower midday service when the kitchen has time.' },
      { title: 'Private dining', body: 'Email us for a closed table or a chef’s menu.' },
    ],
    testimonials: [
      { quote: `${name} tastes like ${city} — I booked again before we left.`, name: 'A regular', role: 'Guest' },
      { quote: 'Clear cooking, no fuss. This is the table I send people to.', name: 'Local note', role: 'Neighbor' },
    ],
    team: [
      { name: lead.contactName || 'Head chef', role: 'Kitchen', bio: `Runs the ${name} kitchen around ${what}.` },
      { name: 'Front of house', role: 'Service', bio: `Looks after the room in ${city}.` },
    ],
    ctaTitle: `Book ${name}`,
    ctaSubtitle: `Reserve a table in ${city} or write to us and we will find a time.`,
    ctaButton: 'Reservation',
    footer: `${name} · ${city}`,
  };
}

function asItems(value: unknown): CopyItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const title = asString(row.title);
      const body = asString(row.body);
      if (!title) return null;
      return { title, body };
    })
    .filter((item): item is CopyItem => Boolean(item));
}

async function completeFillJson(prompt: string): Promise<Record<string, unknown>> {
  const openai = await getOpenaiApiKey();
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim() || process.env.CLAUDE_API_KEY?.trim() || '';
  if (!openai && !anthropic) {
    throw new Error('Add an OpenAI API key on Automations (sk-…) or set OPENAI_API_KEY.');
  }
  if (openai) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openai}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Write a complete restaurant/cafe website copy pack for one real business. JSON only. Invent a full menu, about text, events, and testimonials. Never mention Coral Cove, Park Avenue, Unsplash, or image URLs.',
          },
          { role: 'user', content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });
    const payload = (await response.json().catch(() => null)) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    } | null;
    if (!response.ok) {
      throw new Error(payload?.error?.message || `ChatGPT request failed (${response.status})`);
    }
    const parsed = extractJsonObject(payload?.choices?.[0]?.message?.content || '');
    if (!parsed) throw new Error('ChatGPT returned empty JSON.');
    return parsed;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': anthropic,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const payload = (await response.json().catch(() => null)) as {
    content?: { type: string; text?: string }[];
    error?: { message?: string };
  } | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Anthropic request failed (${response.status})`);
  }
  const parsed = extractJsonObject(payload?.content?.find((item) => item.type === 'text')?.text || '');
  if (!parsed) throw new Error('Claude did not return usable JSON.');
  return parsed;
}

async function fetchCopyPack(lead: FastFillLead, country?: string, extra?: string): Promise<CopyPack> {
  const local = localCopyPack(lead, country);
  try {
    const parsed = await completeFillJson(`Write website copy for this business. Fill every field. Photos stay on the template; this is text only.

${JSON.stringify(
      {
        name: lead.business,
        contactName: lead.contactName,
        whatTheyDo: lead.whatTheyDo,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
        country: country || '',
        notes: lead.notes,
        details: lead.details,
        audience: lead.audience,
        style: lead.style,
        extra: extra || '',
      },
      null,
      2,
    )}

Return JSON with keys:
name, tagline, description, eyebrow, heroTitle, heroSubtitle, address, phone, email,
aboutColumns (2 strings),
menu (8 objects {title, body}),
features (4 objects {title, body}),
events (3 objects {title, body}),
testimonials (2 objects {quote, name, role}),
team (2 objects {name, role, bio}),
ctaTitle, ctaSubtitle, ctaButton, footer.`);
    const menu = asItems(parsed.menu);
    const features = asItems(parsed.features);
    const events = asItems(parsed.events);
    const aboutColumns = Array.isArray(parsed.aboutColumns)
      ? parsed.aboutColumns.map((item) => asString(item)).filter(Boolean)
      : [];
    return {
      ...local,
      name: asString(parsed.name) || local.name,
      tagline: asString(parsed.tagline) || local.tagline,
      description: asString(parsed.description) || local.description,
      eyebrow: asString(parsed.eyebrow) || local.eyebrow,
      heroTitle: asString(parsed.heroTitle) || local.heroTitle,
      heroSubtitle: asString(parsed.heroSubtitle) || local.heroSubtitle,
      address: asString(parsed.address) || local.address,
      phone: asString(parsed.phone) || local.phone,
      email: asString(parsed.email) || local.email,
      aboutColumns: aboutColumns.length ? aboutColumns : local.aboutColumns,
      menu: menu.length ? menu : local.menu,
      features: features.length ? features : local.features,
      events: events.length ? events : local.events,
      ctaTitle: asString(parsed.ctaTitle) || local.ctaTitle,
      ctaSubtitle: asString(parsed.ctaSubtitle) || local.ctaSubtitle,
      ctaButton: asString(parsed.ctaButton) || local.ctaButton,
      footer: asString(parsed.footer) || local.footer,
    };
  } catch (error) {
    console.warn('[fastFill] Copy pack failed, using local restaurant copy:', error);
    return local;
  }
}

function applyCopyPack(source: string, pack: CopyPack): string {
  const counters = {
    name: 0,
    title: 0,
    body: 0,
    subtitle: 0,
    alt: 0,
    quote: 0,
    role: 0,
    bio: 0,
    people: 0,
    menu: 0,
    feature: 0,
  };
  const titles = [
    pack.heroTitle,
    pack.aboutColumns[0]?.slice(0, 48) || 'Our kitchen',
    ...pack.menu.map((item) => item.title),
    ...pack.features.map((item) => item.title),
    ...pack.events.map((item) => item.title),
    pack.ctaTitle,
    'Our story',
    'Book a table',
  ];
  const bodies = [
    pack.heroSubtitle,
    pack.description,
    ...pack.aboutColumns,
    ...pack.menu.map((item) => item.body),
    ...pack.features.map((item) => item.body),
    ...pack.events.map((item) => item.body),
    pack.ctaSubtitle,
  ];
  const people = [...pack.testimonials.map((item) => item.name), ...pack.team.map((item) => item.name)];
  const roles = [...pack.testimonials.map((item) => item.role), ...pack.team.map((item) => item.role)];
  const bios = pack.team.map((item) => item.bio);
  const quotes = pack.testimonials.map((item) => item.quote);
  const alts = pack.menu.map((item) => item.title);

  const copyProp =
    /\b(name|tagline|description|address|phone|email|eyebrow|title|titleAccent|subtitle|cta|ctaSecondary|imageAlt|alt|body|quote|role|bio|hours|button|label|footer|text|desc|note)\s*:\s*(['"`])((?:\\.|[^\\])*?)\2/g;

  return source.replace(copyProp, (full, key: string, quote: string, raw: string) => {
    const value = decodeQuoted(raw);
    if (isTechnicalString(value)) return full;
    if (KEEP_LABEL.test(value) && value.length < 22) return full;
    let next = value;
    switch (key) {
      case 'email':
        next = pack.email || value;
        break;
      case 'phone':
        next = pack.phone || value;
        break;
      case 'address':
        next = pack.address || value;
        break;
      case 'tagline':
      case 'eyebrow':
        next = pack.eyebrow;
        break;
      case 'description':
        next = pack.description;
        break;
      case 'footer':
        next = pack.footer;
        break;
      case 'button':
      case 'cta':
      case 'ctaSecondary':
        next = pack.ctaButton;
        break;
      case 'name':
        if (counters.name === 0) {
          next = pack.name;
        } else if (counters.menu < pack.menu.length) {
          next = pack.menu[counters.menu++].title;
        } else {
          next = people[counters.people++ % Math.max(people.length, 1)] || pack.name;
        }
        counters.name += 1;
        break;
      case 'title':
      case 'titleAccent':
        next = titles[counters.title++ % titles.length] || pack.name;
        break;
      case 'subtitle':
      case 'body':
      case 'desc':
      case 'text':
      case 'note':
        next = bodies[counters.body++ % bodies.length] || pack.description;
        break;
      case 'quote':
        next = quotes[counters.quote++ % Math.max(quotes.length, 1)] || pack.heroSubtitle;
        break;
      case 'role':
        next = roles[counters.role++ % Math.max(roles.length, 1)] || 'Team';
        break;
      case 'bio':
        next = bios[counters.bio++ % Math.max(bios.length, 1)] || pack.description;
        break;
      case 'imageAlt':
      case 'alt':
        next = alts[counters.alt++ % Math.max(alts.length, 1)] || pack.name;
        break;
      case 'hours':
        next = 'Tue–Sat 12–22';
        break;
      default:
        break;
    }
    if (!next || next === value) return full;
    return `${key}: ${quote}${escapeQuoted(next, quote)}${quote}`;
  });
}

function rewriteTemplateBrands(source: string, pack: CopyPack): string {
  const brands = [
    'Hearth & Vale',
    'Hearth &amp; Vale',
    'Coral Cove',
    'Veloura Dining & Lounge',
    'Veloura Dining &amp; Lounge',
    'Veloura Steak',
    'Veloura',
    'Säde',
    'Park Avenue, 60146 NY, USA',
  ];
  let next = source;
  for (const brand of brands) {
    if (!brand || brand === pack.name) continue;
    next = next.split(brand).join(pack.name);
  }
  return next;
}

function rewriteJsxCopy(source: string, pack: CopyPack): string {
  const pool = [
    pack.heroTitle,
    pack.heroSubtitle,
    pack.description,
    ...pack.aboutColumns,
    pack.ctaTitle,
    pack.ctaSubtitle,
  ].filter(Boolean);
  let index = 0;
  return source.replace(/>([^<>{}\n][^<>{}]{11,})</g, (full, text: string) => {
    const value = text.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
    if (KEEP_LABEL.test(value)) return full;
    if (value.includes('{') || /https?:|className|svg|path /i.test(value)) return full;
    if (!/[A-Za-zÀ-ÿ]/.test(value)) return full;
    const next = pool[index++ % pool.length];
    if (!next || next === value) return full;
    return `>${next.replace(/&/g, '&amp;')}<`;
  });
}
function rewriteLeftoverQuotes(source: string, pack: CopyPack, business: string): string {
  let index = 0;
  const pool = [...pack.aboutColumns, pack.description, pack.heroSubtitle, ...pack.menu.map((item) => item.body)];
  return source.replace(/(["'`])((?:\\.|[^\\])*?)\1/g, (full, quote: string, raw: string) => {
    const value = decodeQuoted(raw);
    if (isTechnicalString(value) || KEEP_LABEL.test(value)) return full;
    if (value.includes(business) && value.length < 80) return full;
    if (value.length < 20) return full;
    if (!/[A-Za-zÀ-ÿ]/.test(value)) return full;
    if (/className|href|slug|kind|layout|mode/.test(full)) return full;
    const next = pool[index++ % pool.length] || pack.description;
    if (!next || next === value) return full;
    return `${quote}${escapeQuoted(next, quote)}${quote}`;
  });
}

export async function fastFillProjectFromLead(options: {
  projectPath: string;
  lead: FastFillLead;
  websitePrompt?: string;
  country?: string;
}): Promise<{ replacements: number; mapsQuery: string }> {
  const images = await collectTemplateImages(options.projectPath);
  const local = localCopyPack(options.lead, options.country);
  const toFile = (pack: CopyPack): FastCopyFile => {
    const mapsQuery = [pack.name, pack.address || options.lead.city, options.country].filter(Boolean).join(', ');
    return {
      ...pack,
      images,
      mapsQuery,
      mapsUrl: mapsQuery ? mapsEmbed(mapsQuery) : '',
    };
  };
  await writeFastCopy(options.projectPath, toFile(local));
  let pack = local;
  try {
    pack = await fetchCopyPack(options.lead, options.country, options.websitePrompt);
    await writeFastCopy(options.projectPath, toFile(pack));
  } catch (error) {
    console.warn('[fastFill] GPT copy pack skipped, instant local copy already written:', error);
  }
  const files = await listTextFiles(options.projectPath);
  const writes = await writePackToFiles(files, pack, options.lead.city, options.country);
  const mapsQuery = [pack.name, pack.address || options.lead.city, options.country].filter(Boolean).join(', ');
  return { replacements: writes, mapsQuery };
}

async function writePackToFiles(files: string[], pack: CopyPack, city?: string, country?: string): Promise<number> {
  const mapsQuery = [pack.name, pack.address || city, country].filter(Boolean).join(', ');
  const embed = mapsQuery ? mapsEmbed(mapsQuery) : '';
  let writes = 0;
  for (const file of files) {
    const original = await fs.readFile(file, 'utf8');
    let next = original;
    if (/\.(ts|tsx|js|jsx)$/.test(file) && path.basename(file) !== 'SiteImage.tsx') {
      next = applyCopyPack(next, pack);
      next = rewriteTemplateBrands(next, pack);
      if (
        !/imageLibrary|ImageGuard|tailwind\.config|next-env/.test(file) &&
        (path.basename(file) === 'site.ts' || /export const site\s*=/.test(original) || /\.(tsx|jsx)$/.test(file))
      ) {
        next = rewriteLeftoverQuotes(next, pack, pack.name);
      }
      if (/\.(tsx|jsx)$/.test(file)) {
        next = rewriteJsxCopy(next, pack);
      }
    }
    next = rewriteTemplateBrands(next, pack);
    next = next.split('Coral Cove').join(pack.name);
    next = next.split('Park Avenue, 60146 NY, USA').join(pack.address);
    next = next.split('content="no-referrer"').join('content="origin"');
    next = next.replace(/unsplash\((['"][^'"]+['"]),\s*\d+\)/g, 'unsplash($1, 900)');
    next = rewriteMaps(next, mapsQuery);
    if (path.basename(file) === 'site.ts') {
      next = injectMapsUrl(next, embed);
    }
    if (/\.(tsx|jsx)$/.test(file)) {
      next = injectMapIframe(next);
    }
    if (next !== original) {
      await fs.writeFile(file, next);
      writes += 1;
    }
  }
  return writes;
}

export function wantsFastTrack(input: { buildMode?: unknown; fast?: unknown; prompt?: string }): boolean {
  const prompt = input.prompt || '';
  const userAskedForCursor =
    /full (cursor )?rebuild|from[- ]scratch|use cursor|cursor agent|rebuild (the )?(layout|site)|slow rebuild/i.test(
      prompt,
    );
  if (userAskedForCursor && (input.buildMode === 'full' || input.fast === false)) return false;
  return true;
}

function field(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function leadFromSiteBrief(input: {
  prompt: string;
  name?: string;
  business?: unknown;
  contactName?: unknown;
  city?: unknown;
  email?: unknown;
  phone?: unknown;
  website?: unknown;
  whatTheyDo?: unknown;
  audience?: unknown;
  style?: unknown;
  details?: unknown;
  notes?: unknown;
}): FastFillLead {
  const business = field(input.business) || field(input.name) || input.prompt.split('\n')[0]?.trim() || 'Business';
  return {
    business: business.slice(0, 80),
    contactName: field(input.contactName),
    whatTheyDo: field(input.whatTheyDo) || input.prompt.slice(0, 800),
    email: field(input.email),
    phone: field(input.phone),
    city: field(input.city),
    website: field(input.website),
    notes: field(input.notes) || input.prompt.slice(0, 500),
    details: field(input.details),
    audience: field(input.audience),
    style: field(input.style),
  };
}

export async function rewriteExistingProjectCopy(options: {
  projectId: string;
  prompt?: string;
  business?: unknown;
  contactName?: unknown;
  city?: unknown;
  email?: unknown;
  phone?: unknown;
  website?: unknown;
  whatTheyDo?: unknown;
  country?: string;
}): Promise<{ replacements: number; mapsQuery: string }> {
  const { getProjectById } = await import('@/lib/services/project');
  const { resolveAndPersistProjectWorkspace } = await import('@/lib/server/projectWorkspace');
  const project = await getProjectById(options.projectId);
  if (!project) {
    throw new Error('Site not found');
  }
  const prompt =
    (options.prompt || '').trim() ||
    `Rewrite every visitor-facing string for ${project.name}. Keep photos, files, and layout.`;
  const projectPath = await resolveAndPersistProjectWorkspace(project, options.projectId);
  const filled = await fastFillProjectFromLead({
    projectPath,
    lead: leadFromSiteBrief({
      prompt,
      name: project.name,
      business: options.business || project.name,
      contactName: options.contactName,
      city: options.city,
      email: options.email,
      phone: options.phone,
      website: options.website,
      whatTheyDo: options.whatTheyDo,
    }),
    websitePrompt: prompt,
    country: options.country,
  });
  const { previewManager } = await import('@/lib/services/preview');
  void previewManager.start(options.projectId).catch((error) => {
    console.warn(`[fastFill] Preview start failed for ${options.projectId}:`, error);
  });
  return filled;
}
