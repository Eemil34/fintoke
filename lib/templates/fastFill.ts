import fs from 'fs/promises';
import path from 'path';
import { getOpenaiApiKey } from '@/lib/services/leads';
import type { WorkspaceLead } from '@/types/leads';

const SKIP_DIR = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.turbo', 'public', 'assets']);
const TEXT_FILES = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const IMAGE_HINT = /unsplash|photo-[a-z0-9-]+|images\.unsplash|\/uploads\/|fallback\.svg/i;
const SKIP_STRING = /unsplash\(|https?:\/\/|_next\/|mailto:|className|from ['"]|\/images\/|\/uploads\//i;
const PLACEHOLDER_BRAND = 'Coral Cove|Kaarna|Careevo|Northlane|Helixline|Lumenlist|Fold & Signal';

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

function freezeMedia(source: string): { frozen: string; slots: string[] } {
  const slots: string[] = [];
  const frozen = source.replace(
    /unsplash\(\s*['"][^'"]+['"][^)]*\)|https?:\/\/(?:images\.)?unsplash\.com[^"'`)\s]*|\/(?:images|uploads)\/[^\s"'`)]+|photo-[a-z0-9-]+/gi,
    (match) => {
      const index = slots.length;
      slots.push(match);
      return `__FTIMG_${index}__`;
    },
  );
  return { frozen, slots };
}

function thawMedia(source: string, slots: string[]): string {
  let next = source;
  for (let index = 0; index < slots.length; index += 1) {
    next = next.split(`__FTIMG_${index}__`).join(slots[index]);
  }
  return next;
}

function stripFence(text: string): string {
  return text
    .replace(/^```(?:tsx?|javascript|typescript|jsx)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function isVisitorCopy(value: string): boolean {
  if (IMAGE_HINT.test(value) || SKIP_STRING.test(value)) return false;
  if (/^(flex|grid|hidden|block|inline|absolute|relative|sticky|items-|justify-|px-|py-|pt-|pb-|pl-|pr-|mt-|mb-|ml-|mr-|mx-|my-|w-|h-|min-|max-|text-|bg-|rounded|border|shadow|gap-|col-|row-|sm:|md:|lg:|xl:|2xl:)/.test(value)) {
    return false;
  }
  if (value.length < 4) return false;
  return /[A-Za-zÀ-ÿ]/.test(value);
}

function isCopyFile(file: string, source: string): boolean {
  const base = path.basename(file);
  if (['SiteImage.tsx', 'imageLibrary.ts', 'ImageGuard.tsx', 'instrumentation-client.ts'].includes(base)) {
    return false;
  }
  if (base === 'site.ts' || base === 'content.ts' || base === 'copy.ts') return true;
  return /export const site\s*=/.test(source) && source.length < 28_000;
}

export function isCopyOnlyInstruction(instruction: string): boolean {
  return /rewrite (all )?(the )?(text|copy|strings)|visible copy|full text|do not (change|replace|touch) (the )?(photos|images|files)|keep (the )?(photos|images)|copy only|text only/i.test(
    instruction,
  );
}

async function completeFillText(prompt: string): Promise<string> {
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
          temperature: 0.55,
          max_tokens: 12000,
          messages: [
            {
              role: 'system',
              content:
                'You rewrite website template source for one real business. Return the full source file only. Keep TypeScript/React valid. Leave every __FTIMG_n__ token unchanged. Never add or remove photos, Unsplash IDs, or layout sections. Rewrite ALL visitor-facing copy: name, hero, about, menu items, events, testimonials, CTAs, hours, address, footer.',
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
      const text = stripFence(payload?.choices?.[0]?.message?.content || '');
      if (text.length > 80) return text;
      lastError = 'ChatGPT returned empty source.';
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
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 12000,
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
  const text = stripFence(payload?.content?.find((item) => item.type === 'text')?.text || '');
  if (!text) throw new Error('Claude did not return source.');
  return text;
}

async function rewriteCopyFile(original: string, brief: string): Promise<string | null> {
  const { frozen, slots } = freezeMedia(original);
  if (frozen.length > 28_000) return null;
  const rewritten = await completeFillText(`Rewrite this template source for the business below.
Keep imports, component structure, className values, and every __FTIMG_n__ token exactly.
Change every customer-visible string so it is about this business (menu, about, hero, events, contact). Do not leave the old restaurant/cafe/clinic placeholder names.

Business:
${brief}

Source:
${frozen}`);
  if (rewritten.length < original.length * 0.45) return null;
  const missing = slots.some((_, index) => !rewritten.includes(`__FTIMG_${index}__`));
  if (missing) {
    const originalShots = (original.match(/unsplash\(/g) || []).length;
    const nextShots = (rewritten.match(/unsplash\(/g) || []).length;
    if (originalShots && nextShots === originalShots) return rewritten;
    return null;
  }
  return thawMedia(rewritten, slots);
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
          temperature: 0.5,
          max_tokens: 8000,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You localize a website template for one real business. Reply with a JSON object only. Never change image URLs, Unsplash IDs, or layout. Rewrite almost every visitor-facing string: hero, about, menu dishes, events, testimonials, CTAs, hours, address. Do not leave placeholder restaurant names like Coral Cove.',
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
      max_tokens: 8000,
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

async function fillStringBatches(
  strings: string[],
  brief: string,
): Promise<{ replacements: Record<string, string>; mapsQuery: string; accent: string; address: string }> {
  const replacements: Record<string, string> = {};
  let mapsQuery = '';
  let accent = '';
  let address = '';
  const visitor = strings.filter(isVisitorCopy);
  const chunkSize = 22;
  for (let index = 0; index < visitor.length; index += chunkSize) {
    const chunk = visitor.slice(index, index + chunkSize);
    try {
      const parsed = await completeFillJson(`Business to put on this template (keep photos exactly as they are):
${brief}

Rewrite EVERY string in this list. Keys must match exactly. Do not skip menu items, about paragraphs, or headlines.
${JSON.stringify(chunk)}

Return JSON:
{
  "replacements": { "exact current string": "new string for this business" },
  "address": "street and city if known, else city and country",
  "mapsQuery": "best Google Maps search query",
  "primaryColor": "#RRGGBB or empty"
}`);
      const raw = parsed.replacements && typeof parsed.replacements === 'object' ? parsed.replacements : {};
      for (const [from, to] of Object.entries(raw as Record<string, unknown>)) {
        const next = asString(to);
        if (from && next && from !== next) replacements[from] = next;
      }
      mapsQuery = asString(parsed.mapsQuery) || asString(parsed.address) || mapsQuery;
      accent = asString(parsed.primaryColor) || accent;
      address = asString(parsed.address) || address;
    } catch (error) {
      console.warn('[fastFill] String batch failed:', error);
    }
  }
  return { replacements, mapsQuery, accent, address };
}

function sweepPlaceholders(source: string, business: string, city: string): string {
  if (!business) return source;
  let next = source.replace(new RegExp(PLACEHOLDER_BRAND, 'g'), business);
  if (city) {
    next = next.replace(/Park Avenue, 60146 NY, USA/g, city);
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
  const brief = JSON.stringify(
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
  );

  for (const file of files) {
    if (!file.endsWith('site.ts') && !file.endsWith('content.ts') && !file.endsWith('copy.ts')) continue;
    try {
      const original = await fs.readFile(file, 'utf8');
      if (!isCopyFile(file, original)) continue;
      const rewritten = await rewriteCopyFile(original, brief);
      if (rewritten && rewritten !== original) {
        await fs.writeFile(file, rewritten);
      }
    } catch (error) {
      console.warn('[fastFill] File rewrite failed, using string replacements:', file, error);
    }
  }

  const afterRewrite = (
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
  const leftover = collectCopyStrings(afterRewrite).slice(0, 180);
  const batched = await fillStringBatches(leftover, brief);
  const replacements = {
    ...fallbackReplacements(options.lead, leftover),
    ...batched.replacements,
  };
  let mapsQuery = batched.mapsQuery || [options.lead.business, options.lead.city, options.country].filter(Boolean).join(', ');
  const accent = batched.accent;
  if (batched.address) {
    for (const value of leftover) {
      if (/address|avenue|street|katu|tie|plaza|ny, usa/i.test(value) && value.length < 90) {
        replacements[value] = batched.address;
      }
    }
  }

  const embed = mapsQuery ? mapsEmbed(mapsQuery) : '';
  let writes = 0;
  for (const file of files) {
    const original = await fs.readFile(file, 'utf8');
    let next = sweepPlaceholders(original, options.lead.business, options.lead.city);
    next = applyReplacements(next, replacements);
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
  const { previewManager } = await import('@/lib/services/preview');
  const previewBoot = previewManager.start(options.projectId);
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
  await previewBoot.catch((error) => {
    console.warn(`[fastFill] Preview start failed for ${options.projectId}:`, error);
  });
  await previewManager.ensureReady(options.projectId).catch((error) => {
    console.warn(`[fastFill] Preview not ready yet for ${options.projectId}:`, error);
  });
  return filled;
}
