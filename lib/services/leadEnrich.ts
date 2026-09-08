import type { LeadInput, WorkspaceLead } from '@/types/leads';
import { createLead, getLead, getOpenaiApiKey, listLeads, updateLead } from '@/lib/services/leads';

const SEARCH_MODELS = ['gpt-4o', 'gpt-4.1', 'gpt-4o-mini'];
const GENERIC_EMAIL_LOCAL = new Set([
  'info',
  'contact',
  'hello',
  'office',
  'mail',
  'admin',
  'hi',
  'varaus',
  'myynti',
  'asiakaspalvelu',
]);

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

function asNonEmpty(value: unknown, fallback = ''): string {
  return asString(value) || fallback;
}

function countryCode(country: string): string {
  const raw = country.trim();
  if (/^[a-z]{2}$/i.test(raw)) return raw.toUpperCase();
  const map: Record<string, string> = {
    finland: 'FI',
    suomi: 'FI',
    sweden: 'SE',
    norway: 'NO',
    denmark: 'DK',
    estonia: 'EE',
    germany: 'DE',
    'united kingdom': 'GB',
    uk: 'GB',
    usa: 'US',
    'united states': 'US',
  };
  return map[raw.toLowerCase()] || '';
}

function nameKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b(ravintola|restaurant|restaurang|café|cafe|kahvila|bakery|gym)\b/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function normalizeWebsite(value: string): string {
  const raw = value.trim();
  if (!raw) return '';
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (!url.hostname.includes('.')) return '';
    return url.toString();
  } catch {
    return '';
  }
}

function fillPrompt(lead: WorkspaceLead): string {
  return `Search the public web for this local business. Open the official site and the contact / yhteystiedot page. Use only published facts. If a field is not clearly published, return "". Never invent emails, phones, Instagram, or URLs.

Known:
- business: ${lead.business || '(unknown)'}
- contact: ${lead.contactName || '(unknown)'}
- city: ${lead.city || '(unknown)'}
- website: ${lead.website || '(unknown)'}
- email: ${lead.email || '(unknown)'}
- what they do: ${lead.whatTheyDo || '(unknown)'}

Return JSON:
{
  "business": "",
  "contactName": "",
  "whatTheyDo": "one short sentence from a real source",
  "email": "",
  "phone": "",
  "city": "",
  "website": "official https URL or empty",
  "hasWebsite": false,
  "instagram": "",
  "language": "fi or en",
  "style": "",
  "audience": "",
  "currentSiteNotes": "",
  "notes": ""
}`;
}

function applyFill(lead: WorkspaceLead, parsed: Record<string, unknown>): LeadInput {
  const website = asString(parsed.website) || lead.website;
  const extra = asString(parsed.notes);
  return {
    business: asString(parsed.business) || lead.business,
    contactName: asString(parsed.contactName) || lead.contactName,
    whatTheyDo: asString(parsed.whatTheyDo) || lead.whatTheyDo,
    email: asString(parsed.email) || lead.email,
    phone: asString(parsed.phone) || lead.phone,
    city: asString(parsed.city) || lead.city,
    website,
    hasWebsite: typeof parsed.hasWebsite === 'boolean' ? parsed.hasWebsite : Boolean(website),
    instagram: asString(parsed.instagram) || lead.instagram,
    language: asString(parsed.language) || lead.language,
    style: asString(parsed.style) || lead.style,
    audience: asString(parsed.audience) || lead.audience,
    currentSiteNotes: asString(parsed.currentSiteNotes) || lead.currentSiteNotes,
    notes: extra && !lead.notes.includes(extra) ? [lead.notes, extra].filter(Boolean).join('\n') : lead.notes,
  };
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#64;|&commat;/gi, '@')
    .replace(/&#46;/g, '.')
    .replace(/&nbsp;/g, ' ');
}

function normalizeEmail(value: string): string {
  const email = decodeEntities(value).trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) return '';
  if (/example\.|noreply|no-reply|privacy@|sentry|wixpress|wordpress|cloudflare|schema\.org|png$|jpg$|webp$/i.test(email)) {
    return '';
  }
  return email;
}

function emailMatchesHost(email: string, host: string): boolean {
  const domain = email.split('@')[1]?.replace(/^www\./, '') || '';
  if (!email || !host || !domain) return false;
  return domain === host || domain.endsWith(`.${host}`) || host.endsWith(`.${domain}`);
}

function emailsFromHtml(html: string): string[] {
  const decoded = decodeEntities(html)
    .replace(/\[(?:at|ät)\]|\((?:at|ät)\)|\s+(?:at|ät)\s+/gi, '@')
    .replace(/\[(?:dot|piste)\]|\((?:dot|piste)\)/gi, '.');
  const mailto = [...decoded.matchAll(/mailto:([^"'?\s]+)/gi)].map((match) => decodeURIComponent(match[1]));
  const jsonLd = [...decoded.matchAll(/"email"\s*:\s*"([^"]+)"/gi)].map((match) => match[1]);
  const matches = decoded.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return [...new Set([...mailto, ...jsonLd, ...matches].map(normalizeEmail).filter(Boolean))];
}

function phonesFromHtml(html: string): string[] {
  const decoded = decodeEntities(html);
  const tel = [...decoded.matchAll(/href=["']tel:([^"']+)/gi)].map((match) => decodeURIComponent(match[1]).trim());
  const jsonLd = [...decoded.matchAll(/"telephone"\s*:\s*"([^"]+)"/gi)].map((match) => match[1].trim());
  const nordic = decoded.match(/\+358[\s-]?(?:\(?0\)?[\s-]?)?\d(?:[\s-]?\d){6,10}/g) || [];
  const local = decoded.match(/(?:^|[^\d])(0\d[\d\s-]{6,12}\d)/g) || [];
  return [...new Set([...tel, ...jsonLd, ...nordic, ...local.map((item) => item.trim())])]
    .map((phone) => phone.replace(/[^\d+]/g, (char) => (char === '+' ? '+' : '')))
    .filter((phone) => phone.replace(/\D/g, '').length >= 7);
}

function instagramFromHtml(html: string): string {
  const match = html.match(/https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9._]+)\/?/i);
  if (!match?.[1] || /^(p|reel|stories|explore)$/i.test(match[1])) return '';
  return `https://www.instagram.com/${match[1]}/`;
}

function sameOrigin(url: string, base: string): boolean {
  try {
    return new URL(url, base).origin === new URL(base).origin;
  } catch {
    return false;
  }
}

function contactPageUrls(html: string, base: string): string[] {
  const hrefs = [...html.matchAll(/href=["']([^"'#]+)["']/gi)].map((match) => match[1]);
  const found: string[] = [];
  for (const href of hrefs) {
    if (!/yhteystiedot|yhteys|contact|kontakt|impressum|yhteydenotto/i.test(href)) continue;
    try {
      const url = new URL(href, base).toString();
      if (sameOrigin(url, base) && !found.includes(url)) found.push(url);
    } catch {
      continue;
    }
  }
  const origin = new URL(base).origin;
  for (const path of ['/yhteystiedot', '/contact', '/contact-us', '/yhteys', '/en/contact']) {
    const url = `${origin}${path}`;
    if (!found.includes(url)) found.push(url);
  }
  return found.slice(0, 4);
}

async function fetchPublicPage(url: string): Promise<{ url: string; html: string } | null> {
  const target = normalizeWebsite(url);
  if (!target) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(target, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fi-FI,fi;q=0.9,en;q=0.8',
      },
    });
    if (!response.ok) return null;
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (/^(image|audio|video)\//.test(contentType) || contentType.includes('application/pdf')) {
      return null;
    }
    const html = await response.text();
    if (!html.trim()) return null;
    return { url: response.url || target, html: html.slice(0, 220000) };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function pickEmail(candidates: string[], website: string): string {
  const host = hostnameOf(website);
  return (
    candidates.find((email) => emailMatchesHost(email, host)) ||
    candidates.find((email) => !GENERIC_EMAIL_LOCAL.has(email.split('@')[0] || '')) ||
    candidates[0] ||
    ''
  );
}

function acceptSearchedEmail(email: string, website: string, html: string): string {
  const value = normalizeEmail(email);
  if (!value) return '';
  const host = hostnameOf(website);
  if (host && emailMatchesHost(value, host)) return value;
  if (html && html.toLowerCase().includes(value)) return value;
  if (!host && !GENERIC_EMAIL_LOCAL.has(value.split('@')[0] || '')) return value;
  return '';
}

async function fetchSiteAndContactPages(website: string): Promise<{ url: string; html: string }[]> {
  const home = website ? await fetchPublicPage(website) : null;
  if (!home) return [];
  const pages = [home];
  for (const url of contactPageUrls(home.html, home.url)) {
    if (pages.some((page) => page.url.replace(/\/$/, '') === url.replace(/\/$/, ''))) continue;
    const page = await fetchPublicPage(url);
    if (page?.html) pages.push(page);
  }
  return pages;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function attr(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return decodeEntities(match?.[1] || '').trim();
}

function headings(html: string, tag: string, limit = 8): string[] {
  const matches = [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi'))];
  return [...new Set(matches.map((item) => htmlToText(item[1]).slice(0, 140)).filter(Boolean))].slice(0, limit);
}

function pageBrief(page: { url: string; html: string }): string {
  const html = page.html;
  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || attr(html, /property=["']og:title["'][^>]*content=["']([^"']+)/i);
  const description =
    attr(html, /name=["']description["'][^>]*content=["']([^"']+)/i) ||
    attr(html, /property=["']og:description["'][^>]*content=["']([^"']+)/i);
  const generator = attr(html, /name=["']generator["'][^>]*content=["']([^"']+)/i);
  const lang = attr(html, /<html[^>]*lang=["']([^"']+)/i);
  const viewport = /name=["']viewport["']/i.test(html);
  const https = page.url.startsWith('https:');
  const hasForm = /<form[\s>]/i.test(html);
  const platform = /shopify/i.test(html)
    ? 'Shopify'
    : /wix\.com|wixstatic/i.test(html)
      ? 'Wix'
      : /squarespace/i.test(html)
        ? 'Squarespace'
        : /wp-content|wordpress/i.test(html)
          ? 'WordPress'
          : /webflow/i.test(html)
            ? 'Webflow'
            : generator || 'unknown';
  const text = htmlToText(html).slice(0, 7000);
  return [
    `URL: ${page.url}`,
    `HTTPS: ${https}`,
    `lang: ${lang || 'unknown'}`,
    `mobile viewport: ${viewport}`,
    `platform hint: ${platform}`,
    `has form: ${hasForm}`,
    `title: ${title}`,
    `meta description: ${description}`,
    `H1: ${headings(html, 'h1').join(' | ')}`,
    `H2: ${headings(html, 'h2').join(' | ')}`,
    `text: ${text}`,
  ].join('\n');
}

function heuristicFromPages(lead: WorkspaceLead, pages: { url: string; html: string }[]): LeadInput {
  const home = pages[0];
  if (!home) return {};
  const html = home.html;
  const title =
    attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
    attr(html, /property=["']og:title["'][^>]*content=["']([^"']+)/i);
  const description =
    attr(html, /name=["']description["'][^>]*content=["']([^"']+)/i) ||
    attr(html, /property=["']og:description["'][^>]*content=["']([^"']+)/i);
  const h1 = headings(html, 'h1');
  const h2 = headings(html, 'h2');
  const text = htmlToText(html);
  const lang = attr(html, /<html[^>]*lang=["']([^"']+)/i);
  const https = home.url.startsWith('https:');
  const viewport = /name=["']viewport["']/i.test(html);
  const hasForm = /<form[\s>]/i.test(html);
  const hasCta = /ota yhteyttä|contact|varaa|book|osta|buy|subscribe/i.test(html);
  const platform = /shopify/i.test(html)
    ? 'Shopify'
    : /wix\.com|wixstatic/i.test(html)
      ? 'Wix'
      : /squarespace/i.test(html)
        ? 'Squarespace'
        : /wp-content|wordpress/i.test(html)
          ? 'WordPress'
          : /webflow/i.test(html)
            ? 'Webflow'
            : /next|_next\/static/i.test(html)
              ? 'Next.js'
              : 'custom / unclear';
  const thin = text.length < 400;
  const allHtml = pages.map((page) => page.html).join('\n');
  const business = lead.business || title.split(/[|\-–]/)[0]?.trim() || title;
  const whatTheyDo = description || h1[0] || lead.whatTheyDo;
  const siteLook = thin
    ? `The public HTML is thin (likely a JS-heavy or blocked page). Title is “${title || 'missing'}”. Platform hint: ${platform}. Need a visual pass in the browser.`
    : `Title “${title || 'untitled'}”. Headlines: ${[...h1, ...h2].slice(0, 4).join('; ') || 'none extracted'}. ${description ? `Meta: ${description}` : 'No meta description.'} Reads as a ${platform} site.`;
  const siteState = [
    https ? 'HTTPS is on.' : 'The URL is not HTTPS.',
    viewport ? 'A mobile viewport tag is present.' : 'No mobile viewport tag — likely weak on phones.',
    description ? 'Has a meta description.' : 'Missing meta description (SEO gap).',
    hasForm || hasCta ? 'There is a form or contact CTA.' : 'No clear form/contact CTA on the homepage.',
    thin ? 'Very little indexable text — search and AI will struggle.' : `About ${Math.round(text.length / 80)} lines of visible copy extracted.`,
  ].join(' ');
  const siteActions = [
    '1. SEO modelling: keywords, titles, and meta for the real services.',
    '2. Homepage rewrite: one offer, proof, and a single primary CTA.',
    hasForm || hasCta ? '3. Tighten the contact/booking path and follow-up.' : '3. Add a visible contact or booking path.',
    viewport ? '4. Check Core Web Vitals and image compression.' : '4. Make the layout work on mobile first.',
    `5. ${platform === 'WordPress' || platform === 'Wix' || platform === 'Squarespace' ? 'Maintenance retainer: updates, backups, and small page changes.' : 'Consider a cleaner Next.js rebuild if the stack is hard to edit.'}`,
    '6. Web marketing: one landing per main offer, then monthly content.',
  ].join('\n');
  return {
    business,
    whatTheyDo,
    language: lang?.toLowerCase().startsWith('fi') ? 'fi' : lang?.toLowerCase().startsWith('en') ? 'en' : lead.language,
    style: platform,
    audience: lead.audience,
    siteLook,
    siteState,
    siteActions,
    currentSiteNotes: `${siteLook} ${siteState}`,
    nextStep: 'Pitch SEO modelling plus homepage/CTA fixes, then a care retainer for ongoing changes.',
    details: `Fetched ${pages.map((page) => page.url).join(', ')}.\nPlatform: ${platform}.\nTitle: ${title}\nH1: ${h1.join(' | ')}\n${description}`,
    website: home.url,
    hasWebsite: true,
    email: pickEmail(emailsFromHtml(allHtml), home.url) || lead.email,
    phone: phonesFromHtml(allHtml)[0] || lead.phone,
    instagram: instagramFromHtml(allHtml) || lead.instagram,
  };
}

function analyzePrompt(lead: WorkspaceLead, pages: { url: string; html: string }[]): string {
  const briefs = pages.map((page) => pageBrief(page)).join('\n\n---\n\n');
  return `You are a Finnish software studio (Fintoke) reviewing a company's live website for sales and delivery. Use ONLY the fetched page extracts. Do not invent contact details.

Known record:
- business: ${lead.business || '(unknown)'}
- city: ${lead.city || '(unknown)'}
- website: ${lead.website || '(unknown)'}
- what they do: ${lead.whatTheyDo || '(unknown)'}

Fetched site:
${briefs}

Return JSON:
{
  "business": "",
  "whatTheyDo": "one sentence from the site",
  "city": "",
  "language": "fi or en",
  "audience": "who the site is for",
  "style": "visual/brand style in a short phrase",
  "siteLook": "2-4 sentences: layout, typography, photos, trust, mobile feel",
  "siteState": "2-4 sentences: content freshness, SEO basics, speed/structure clues, conversion (forms/CTAs), technical health",
  "siteActions": "numbered list of 4-7 concrete jobs: SEO modelling, copy, landing pages, rebuild, maintenance, analytics, etc.",
  "currentSiteNotes": "one short paragraph combining look + state",
  "nextStep": "the first package/job Fintoke should pitch and why",
  "details": "a longer internal brief for the company file",
  "email": "published email or empty",
  "phone": "published phone or empty",
  "contactName": "named person if published, else empty",
  "instagram": "instagram url or empty"
}`;
}

function applyAnalysis(lead: WorkspaceLead, parsed: Record<string, unknown>, fallback: LeadInput = {}): LeadInput {
  return {
    business: asNonEmpty(parsed.business, fallback.business || lead.business),
    whatTheyDo: asNonEmpty(parsed.whatTheyDo, fallback.whatTheyDo || lead.whatTheyDo),
    city: asNonEmpty(parsed.city, fallback.city || lead.city),
    language: asNonEmpty(parsed.language, fallback.language || lead.language),
    audience: asNonEmpty(parsed.audience, fallback.audience || lead.audience),
    style: asNonEmpty(parsed.style, fallback.style || lead.style),
    siteLook: asNonEmpty(parsed.siteLook, fallback.siteLook || lead.siteLook),
    siteState: asNonEmpty(parsed.siteState, fallback.siteState || lead.siteState),
    siteActions: asNonEmpty(parsed.siteActions, fallback.siteActions || lead.siteActions),
    currentSiteNotes: asNonEmpty(parsed.currentSiteNotes, fallback.currentSiteNotes || lead.currentSiteNotes),
    nextStep: asNonEmpty(parsed.nextStep, fallback.nextStep || lead.nextStep),
    details: asNonEmpty(parsed.details, fallback.details || lead.details),
    email: asNonEmpty(parsed.email, fallback.email || lead.email),
    phone: asNonEmpty(parsed.phone, fallback.phone || lead.phone),
    contactName: asNonEmpty(parsed.contactName, fallback.contactName || lead.contactName),
    instagram: asNonEmpty(parsed.instagram, fallback.instagram || lead.instagram),
  };
}

async function completeWithOpenaiJson(apiKey: string, prompt: string, maxTokens = 2200): Promise<string> {
  let lastError = 'ChatGPT request failed';
  const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'];
  for (const model of models) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You analyze real websites from provided HTML extracts. Reply with a JSON object only. Never invent emails, phones, or facts that are not in the extract. Fill every string field with useful text from the extract.',
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
    const text = payload?.choices?.[0]?.message?.content || '';
    if (text.trim()) return text;
    lastError = 'ChatGPT returned an empty analysis.';
  }
  throw new Error(lastError);
}

async function completeAnalysisJson(prompt: string): Promise<Record<string, unknown>> {
  const openai = await getOpenaiApiKey();
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim() || process.env.CLAUDE_API_KEY?.trim() || '';
  if (!openai && !anthropic) {
    throw new Error('Add a ChatGPT API key on the Work page (OpenAI), or set OPENAI_API_KEY.');
  }
  const text = openai
    ? await completeWithOpenaiJson(openai, prompt)
    : await completeWithAnthropic(anthropic, prompt, 1800);
  const parsed = extractJsonObject(text);
  if (!parsed) throw new Error('The model did not return a usable website analysis.');
  return parsed;
}

async function analyzeFetchedPages(lead: WorkspaceLead, pages: { url: string; html: string }[]): Promise<LeadInput> {
  if (!pages.length) {
    throw new Error('Could not fetch the website. Check the URL and that the site is public.');
  }
  const heuristic = heuristicFromPages(lead, pages);
  let parsed: Record<string, unknown> = {};
  try {
    parsed = await completeAnalysisJson(analyzePrompt(lead, pages));
  } catch (error) {
    console.error('[analyze website]', error);
  }
  const grounded = await groundFromWebsite({ website: pages[0].url, ...heuristic });
  const merged = applyAnalysis(lead, parsed, heuristic);
  return {
    ...heuristic,
    ...merged,
    website: grounded.website || heuristic.website || lead.website,
    hasWebsite: true,
    email: grounded.email || merged.email || heuristic.email || lead.email,
    phone: grounded.phone || merged.phone || heuristic.phone || lead.phone,
    instagram: grounded.instagram || merged.instagram || heuristic.instagram || lead.instagram,
    contactName: merged.contactName || lead.contactName,
  };
}

export async function analyzeLeadWebsite(id: string): Promise<WorkspaceLead> {
  const lead = await getLead(id);
  if (!lead) throw new Error('Row not found');
  const website = normalizeWebsite(lead.website);
  if (!website) throw new Error('Add a website URL first, then analyze it.');
  const pages = await fetchSiteAndContactPages(website);
  const patch = await analyzeFetchedPages({ ...lead, website: pages[0]?.url || website }, pages);
  return updateLead(id, patch);
}

async function groundFromWebsite(draft: LeadInput): Promise<LeadInput> {
  const website = normalizeWebsite(draft.website || '');
  const pages = await fetchSiteAndContactPages(website);
  const html = pages.map((page) => page.html).join('\n');
  const finalUrl = pages[0]?.url || website;
  const scrapedEmail = pickEmail(emailsFromHtml(html), finalUrl);
  const scrapedPhone = phonesFromHtml(html)[0] || '';
  const scrapedIg = instagramFromHtml(html);
  return {
    ...draft,
    website: finalUrl,
    hasWebsite: Boolean(finalUrl),
    email: scrapedEmail || acceptSearchedEmail(draft.email || '', finalUrl, html),
    phone: scrapedPhone || asString(draft.phone),
    instagram: scrapedIg || asString(draft.instagram),
  };
}

function collectText(value: unknown, into: string[]) {
  if (typeof value === 'string' && value.trim()) {
    into.push(value);
    return;
  }
  if (!value || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  if (typeof record.output_text === 'string') into.push(record.output_text);
  if (typeof record.text === 'string') into.push(record.text);
  if (record.text && typeof record.text === 'object') collectText(record.text, into);
  if (typeof record.value === 'string') into.push(record.value);
  if (Array.isArray(record.content)) record.content.forEach((item) => collectText(item, into));
  if (Array.isArray(record.output)) record.output.forEach((item) => collectText(item, into));
}

function outputTextFromResponses(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  collectText(payload, parts);
  return [...new Set(parts.map((part) => part.trim()).filter(Boolean))].join('\n');
}

async function completeWithOpenaiSearch(
  apiKey: string,
  prompt: string,
  options?: { maxTokens?: number; country?: string; city?: string },
): Promise<string> {
  const location = countryCode(options?.country || '');
  const webSearch: Record<string, unknown> = { type: 'web_search' };
  if (location || options?.city) {
    webSearch.user_location = {
      type: 'approximate',
      ...(location ? { country: location } : {}),
      ...(options?.city ? { city: options.city } : {}),
    };
  }

  let lastError = 'ChatGPT web search failed';
  for (const model of SEARCH_MODELS) {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        tools: [webSearch],
        tool_choice: 'auto',
        max_output_tokens: options?.maxTokens ?? 2500,
        instructions:
          'You research real local businesses on the public web. Always use web search. Reply with JSON only. Prefer published emails and phones from official sites, contact pages, and business listings. Never invent contact details; use an empty string when you did not see them.',
        input: prompt,
      }),
    });
    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok) {
      const err = payload?.error as { message?: string } | undefined;
      lastError = err?.message || `ChatGPT request failed (${response.status})`;
      if (/model|tool|unsupported|not found/i.test(lastError)) continue;
      throw new Error(lastError);
    }
    const text = payload ? outputTextFromResponses(payload) : '';
    if (text.trim()) return text;
    lastError = 'ChatGPT returned an empty search result.';
  }
  throw new Error(lastError);
}

async function completeWithAnthropic(apiKey: string, prompt: string, maxTokens = 900): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: maxTokens,
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
  return payload?.content?.find((item) => item.type === 'text')?.text || '';
}

async function completeJson(
  prompt: string,
  options?: { maxTokens?: number; country?: string; city?: string },
): Promise<Record<string, unknown>> {
  const openai = await getOpenaiApiKey();
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim() || process.env.CLAUDE_API_KEY?.trim() || '';
  if (!openai && !anthropic) {
    throw new Error('Add a ChatGPT API key on the Work page (OpenAI), or set OPENAI_API_KEY.');
  }
  let text = '';
  if (openai) {
    try {
      text = await completeWithOpenaiSearch(openai, prompt, options);
    } catch (error) {
      console.error('[fill search]', error);
    }
    if (!extractJsonObject(text)) {
      text = await completeWithOpenaiJson(openai, prompt, options?.maxTokens ?? 1800);
    }
  } else {
    text = await completeWithAnthropic(anthropic, prompt, options?.maxTokens ?? 900);
  }
  const parsed = extractJsonObject(text);
  if (!parsed) throw new Error('The model did not return usable fields.');
  return parsed;
}

export async function enrichLead(id: string): Promise<WorkspaceLead> {
  const lead = await getLead(id);
  if (!lead) throw new Error('Row not found');
  if (!lead.business && !lead.website) {
    throw new Error('Add a business name or website first, then fill with AI.');
  }

  const knownSite = normalizeWebsite(lead.website);
  if (knownSite) {
    const pages = await fetchSiteAndContactPages(knownSite);
    if (pages.length) {
      const analysis = await analyzeFetchedPages({ ...lead, website: pages[0].url }, pages);
      return updateLead(id, analysis);
    }
  }

  const parsed = await completeJson(fillPrompt(lead), { country: '', city: lead.city });
  const draft = applyFill(lead, parsed);
  const grounded = await groundFromWebsite({
    ...draft,
    website: draft.website || lead.website,
  });
  const website = normalizeWebsite(grounded.website || lead.website);
  let analysis: LeadInput = {};
  if (website) {
    const pages = await fetchSiteAndContactPages(website);
    if (pages.length) {
      analysis = await analyzeFetchedPages({ ...lead, ...grounded, website: pages[0].url }, pages);
    }
  }
  return updateLead(id, {
    ...draft,
    ...analysis,
    website: analysis.website || grounded.website || lead.website,
    hasWebsite: Boolean(analysis.website || grounded.website || lead.website),
    email: analysis.email || grounded.email || lead.email,
    phone: analysis.phone || grounded.phone || lead.phone,
    instagram: analysis.instagram || grounded.instagram || lead.instagram,
  });
}

export type EnrichBatchResult = {
  filled: WorkspaceLead[];
  errors: { id: string; business: string; message: string }[];
};

export async function enrichLeads(ids: string[]): Promise<EnrichBatchResult> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (!unique.length) throw new Error('Select at least one row to fill.');

  const filled: WorkspaceLead[] = [];
  const errors: EnrichBatchResult['errors'] = [];
  const queue = [...unique];

  const worker = async () => {
    while (queue.length) {
      const id = queue.shift();
      if (!id) return;
      const current = await getLead(id);
      try {
        filled.push(await enrichLead(id));
      } catch (error) {
        errors.push({
          id,
          business: current?.business || id,
          message: error instanceof Error ? error.message : 'Fill failed',
        });
      }
    }
  };

  await Promise.all([worker(), worker(), worker()]);
  return { filled, errors };
}

async function fillMissingContacts(
  rows: LeadInput[],
  options: { place: string; country: string; city: string },
): Promise<LeadInput[]> {
  const missing = rows.filter((row) => row.business && (!row.email || !row.phone));
  if (!missing.length) return rows;

  const prompt = `Search the public web for the published email and phone of each business. Check the official website, /yhteystiedot, /contact, Google Business, and Facebook About. Copy only what you see. Use "" if it is not published.

Place: ${options.place}
${missing
    .map((row) => `- ${row.business} | city: ${row.city || options.city || ''} | site: ${row.website || 'unknown'}`)
    .join('\n')}

Return JSON:
{
  "contacts": [
    { "business": "", "email": "", "phone": "", "website": "", "instagram": "" }
  ]
}`;

  try {
    const parsed = await completeJson(prompt, {
      maxTokens: 3000,
      country: options.country,
      city: options.city,
    });
    const contacts = Array.isArray(parsed.contacts) ? parsed.contacts : [];
    const byName = new Map<string, Record<string, unknown>>();
    for (const item of contacts) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      const key = nameKey(asString(row.business));
      if (key) byName.set(key, row);
    }
    return rows.map((row) => {
      const found = byName.get(nameKey(row.business || ''));
      if (!found) return row;
      const website = row.website || normalizeWebsite(asString(found.website));
      const searchedEmail = normalizeEmail(asString(found.email));
      const host = hostnameOf(website);
      const email =
        row.email ||
        (host && searchedEmail && emailMatchesHost(searchedEmail, host) ? searchedEmail : '') ||
        searchedEmail;
      return {
        ...row,
        website,
        hasWebsite: Boolean(website),
        email,
        phone: row.phone || asString(found.phone),
        instagram: row.instagram || asString(found.instagram),
      };
    });
  } catch {
    return rows;
  }
}

export async function enrichEmptyLeads(): Promise<EnrichBatchResult> {
  const rows = await listLeads();
  const ids = rows
    .filter((row) => row.business && (!row.whatTheyDo || !row.email || !row.website))
    .map((row) => row.id);
  if (!ids.length) throw new Error('No rows look empty. Select rows, or add a business name first.');
  return enrichLeads(ids);
}

export type GenerateWorkInput = {
  query?: string;
  kind?: string;
  country?: string;
  city?: string;
  count?: number;
};

export async function generateWorkRows(input: GenerateWorkInput): Promise<{
  created: WorkspaceLead[];
  skipped: string[];
}> {
  const count = Math.min(40, Math.max(1, Math.round(Number(input.count) || 20)));
  const kind = asString(input.kind) || 'local businesses';
  const country = asString(input.country);
  const city = asString(input.city);
  const query = asString(input.query);
  if (!query && !country && !city && kind === 'local businesses') {
    throw new Error('Say what to find, for example “cafes in Finland” or set a country and type.');
  }

  const place = [city, country].filter(Boolean).join(', ') || 'the country implied by the request';
  const languageHint = /finland|suomi|finnish|\bfi\b/i.test(`${country} ${city} ${query}`) ? 'fi' : '';

  const prompt = `Search the public web for ${count} currently operating ${kind} in ${place}.
${query ? `User request: ${query}` : ''}
The user wants contact details when they are publicly listed.

Hard rules:
- Every business MUST appear in web search results. Do not recall names from memory.
- Prefer independent local businesses.
- website: official site URL from results, or "".
- Search each venue's official site, yhteystiedot/contact page, Google Business, and Facebook About for email and phone.
- email and phone: copy only values you actually saw. If you did not see them, use "".
- instagram: official handle URL or "".
- whatTheyDo: one short line from the source, or "".
- Skip duplicates.

Return JSON:
{
  "businesses": [
    {
      "business": "Exact public name",
      "whatTheyDo": "",
      "city": "",
      "website": "",
      "email": "",
      "phone": "",
      "instagram": "",
      "language": "${languageHint || 'en'}"
    }
  ]
}`;

  const parsed = await completeJson(prompt, { maxTokens: 4000, country, city });
  const list = Array.isArray(parsed.businesses) ? parsed.businesses : Array.isArray(parsed.rows) ? parsed.rows : [];
  if (!list.length) throw new Error('ChatGPT did not return any businesses. Try a narrower city or type.');

  const existing = await listLeads();
  const taken = new Set(existing.map((row) => nameKey(row.business)).filter(Boolean));
  const skipped: string[] = [];
  const pending: LeadInput[] = [];

  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const name = asString(row.business);
    if (!name) continue;
    const key = nameKey(name);
    if (key && taken.has(key)) {
      skipped.push(name);
      continue;
    }
    if (key) taken.add(key);
    pending.push({
      business: name,
      whatTheyDo: asString(row.whatTheyDo),
      city: asString(row.city) || city,
      website: asString(row.website),
      language: asString(row.language) || languageHint,
      email: asString(row.email),
      phone: asString(row.phone),
      instagram: asString(row.instagram),
      contactName: asString(row.contactName),
      hasWebsite: false,
    });
  }

  const grounded: LeadInput[] = [];
  const queue = [...pending];
  const workers = Array.from({ length: Math.min(5, queue.length || 1) }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (!next) return;
      grounded.push(await groundFromWebsite(next));
    }
  });
  await Promise.all(workers);

  const withContacts = await fillMissingContacts(grounded, { place, country, city });

  const created: WorkspaceLead[] = [];
  for (const row of withContacts) {
    created.push(
      await createLead({
        ...row,
        city: row.city || city,
        language: row.language || languageHint,
        offerSent: false,
        responded: 'none',
        called: false,
        messageSent: false,
      }),
    );
  }

  if (!created.length) {
    throw new Error(
      skipped.length
        ? 'Those businesses are already in the table.'
        : 'ChatGPT returned no usable names. Try again with a city.',
    );
  }

  return { created, skipped };
}
