import fs from 'fs/promises';
import path from 'path';
import { getOpenaiApiKey } from '@/lib/services/leads';
import type { WorkspaceLead } from '@/types/leads';

const SKIP_DIR = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.turbo', 'public', 'assets']);
const TEXT_FILES = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const IMAGE_HINT = /unsplash|photo-|images\.unsplash|\/uploads\/|SiteImage|imageAlt|image:|fallback\.svg|src=\{|src="/i;
const SKIP_STRING = /unsplash\(|photo-[a-z0-9-]+|https?:\/\/|_next\/|mailto:|className|from ['"]|\/images\/|\/uploads\//i;

type FastFillLead = Pick<
  WorkspaceLead,
  'business' | 'contactName' | 'whatTheyDo' | 'email' | 'phone' | 'city' | 'website' | 'notes' | 'details' | 'audience' | 'style'
>;

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

function collectCopyStrings(source: string): string[] {
  const found: string[] = [];
  const re = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const value = match[2].replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"');
    if (value.length < 3 || value.length > 420) continue;
    if (SKIP_STRING.test(value)) continue;
    if (IMAGE_HINT.test(value)) continue;
    if (!/[a-zA-ZÀ-ÿ]/.test(value)) continue;
    if (/^[.#]?[\w-]+$/.test(value) && value.length < 24) continue;
    found.push(value);
  }
  return [...new Set(found)];
}

function applyReplacements(source: string, replacements: Record<string, string>): string {
  const pairs = Object.entries(replacements)
    .map(([from, to]) => [from, to] as const)
    .filter(([from, to]) => from && to && from !== to && !SKIP_STRING.test(from) && !IMAGE_HINT.test(from))
    .sort((a, b) => b[0].length - a[0].length);
  let next = source;
  for (const [from, to] of pairs) {
    if (to.includes(from) && from.length > 12) continue;
    next = next.split(from).join(to);
  }
  return next;
}

function rewriteMaps(source: string, query: string): string {
  if (!query) return source;
  const embed = mapsEmbed(query);
  return source.replace(
    /https?:\/\/(?:www\.)?google\.[^"' \s]+\/maps[^"' \s]*/gi,
    embed,
  );
}

function injectMapsUrl(siteSource: string, embed: string): string {
  if (!embed) return siteSource;
  if (/mapsUrl\s*:/.test(siteSource)) {
    return siteSource.replace(/mapsUrl\s*:\s*(['"`])[\s\S]*?\1/, `mapsUrl: '${embed.replace(/'/g, "\\'")}'`);
  }
  if (!/contact\s*:\s*\{/.test(siteSource)) return siteSource;
  return siteSource.replace(
    /(contact\s*:\s*\{)/,
    `$1\n    mapsUrl: '${embed.replace(/'/g, "\\'")}',`,
  );
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

async function completeFillJson(prompt: string): Promise<Record<string, unknown>> {
  const openai = await getOpenaiApiKey();
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim() || process.env.CLAUDE_API_KEY?.trim() || '';
  if (!openai && !anthropic) {
    throw new Error('Add an OpenAI API key on Automations (sk-…) or set OPENAI_API_KEY.');
  }
  if (openai) {
    const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'];
    let lastError = 'ChatGPT request failed';
    for (const model of models) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openai}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 3500,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You localize a website template for one real business. Reply with a JSON object only. Never change image URLs, Unsplash IDs, or layout. Only rewrite visible copy, contact details, and optional brand hex color.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      } | null;
      if (!response.ok) {
        lastError = payload?.error?.message || `ChatGPT request failed (${response.status})`;
        if (/model|not found|unsupported|does not exist/i.test(lastError)) continue;
        throw new Error(lastError);
      }
      const parsed = extractJsonObject(payload?.choices?.[0]?.message?.content || '');
      if (parsed) return parsed;
      lastError = 'ChatGPT returned empty JSON.';
    }
    throw new Error(lastError);
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
      max_tokens: 3500,
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

function fallbackReplacements(lead: FastFillLead, strings: string[]): Record<string, string> {
  const next: Record<string, string> = {};
  const name = lead.business.trim();
  if (!name) return next;
  const city = [lead.city].filter(Boolean).join(', ');
  for (const value of strings) {
    if (value.length > 48) continue;
    if (/coral cove|kaarna|careevo|example\.com|park avenue/i.test(value)) {
      next[value] = name;
    }
  }
  if (lead.phone) {
    for (const value of strings) {
      if (/\+?\d[\d\s().-]{7,}/.test(value)) next[value] = lead.phone;
    }
  }
  if (lead.email) {
    for (const value of strings) {
      if (/@/.test(value) && /hello@|info@|contact@/.test(value)) next[value] = lead.email;
    }
  }
  if (city) {
    for (const value of strings) {
      if (/park avenue|ny, usa|helsinki|tampere/i.test(value) && value.length < 80) next[value] = city;
    }
  }
  return next;
}

export async function fastFillProjectFromLead(options: {
  projectPath: string;
  lead: FastFillLead;
  websitePrompt?: string;
  country?: string;
}): Promise<{ replacements: number; mapsQuery: string }> {
  const files = await listTextFiles(options.projectPath);
  const combined = (
    await Promise.all(
      files.map(async (file) => {
        try {
          return await fs.readFile(file, 'utf8');
        } catch {
          return '';
        }
      }),
    )
  ).join('\n');
  const strings = collectCopyStrings(combined).slice(0, 90);
  const locationHint = [options.lead.city, options.country, options.lead.details, options.lead.notes]
    .filter(Boolean)
    .join(', ');

  let replacements = fallbackReplacements(options.lead, strings);
  let mapsQuery = [options.lead.business, options.lead.city, options.country].filter(Boolean).join(', ');
  let accent = '';

  try {
    const parsed = await completeFillJson(`Business to put on this template (keep photos exactly as they are):
${JSON.stringify(
      {
        name: options.lead.business,
        contactName: options.lead.contactName,
        whatTheyDo: options.lead.whatTheyDo,
        email: options.lead.email,
        phone: options.lead.phone,
        city: options.lead.city,
        country: options.country || '',
        website: options.lead.website,
        audience: options.lead.audience,
        style: options.lead.style,
        notes: options.lead.notes,
        details: options.lead.details,
        extraInstructions: options.websitePrompt || '',
      },
      null,
      2,
    )}

Current visible template strings:
${JSON.stringify(strings)}

Return JSON:
{
  "replacements": { "exact current string": "new string for this business" },
  "address": "street and city if known, else city and country",
  "mapsQuery": "best Google Maps search query",
  "primaryColor": "#RRGGBB or empty",
  "phone": "",
  "email": ""
}

Rules:
- Replace names, headlines, about text, menu item names, CTAs, address, phone, email, hours.
- Do not invent a street address if you do not have one; use city and country.
- Keep string keys EXACTLY as given.
- Never output Unsplash IDs or image URLs.
- primaryColor only if a small accent shift is useful; otherwise empty.`);
    const raw = parsed.replacements && typeof parsed.replacements === 'object' ? parsed.replacements : {};
    for (const [from, to] of Object.entries(raw as Record<string, unknown>)) {
      const next = asString(to);
      if (from && next) replacements[from] = next;
    }
    mapsQuery = asString(parsed.mapsQuery) || asString(parsed.address) || mapsQuery;
    accent = asString(parsed.primaryColor);
    const address = asString(parsed.address);
    if (address) {
      for (const value of strings) {
        if (/address|avenue|street|katu|tie|plaza|ny, usa/i.test(value) && value.length < 90) {
          replacements[value] = address;
        }
      }
    }
  } catch (error) {
    console.warn('[fastFill] Model fill failed, using name/contact fallback:', error);
  }

  const embed = mapsQuery ? mapsEmbed(mapsQuery) : '';
  let writes = 0;
  for (const file of files) {
    const original = await fs.readFile(file, 'utf8');
    let next = applyReplacements(original, replacements);
    next = rewriteMaps(next, mapsQuery);
    if (path.basename(file) === 'site.ts') {
      next = injectMapsUrl(next, embed);
    }
    if (/\.(tsx|jsx)$/.test(file)) {
      next = injectMapIframe(next);
    }
    if (/\.(css|tsx|ts|js)$/.test(file)) {
      next = applyAccentColor(next, accent);
    }
    if (next !== original) {
      await fs.writeFile(file, next);
      writes += 1;
    }
  }

  return { replacements: writes, mapsQuery };
}

export function wantsFastTrack(input: { buildMode?: unknown; fast?: unknown; prompt?: string }): boolean {
  if (input.buildMode === 'full' || input.fast === false) return false;
  if (input.buildMode === 'fast' || input.fast === true) return true;
  if (
    /full (cursor )?rebuild|from[- ]scratch|use cursor|cursor agent|rebuild (the )?(layout|site)/i.test(
      input.prompt || '',
    )
  ) {
    return false;
  }
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
