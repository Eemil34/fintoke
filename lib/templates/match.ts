import { WEBSITE_TEMPLATES } from './catalog';
import type { WebsiteTemplate } from './types';

export type PickableTemplate = WebsiteTemplate & {
  hasSnapshot?: boolean;
  origin?: 'user' | 'pack' | string;
  savedAt?: string | null;
};

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function scoreTemplate(template: PickableTemplate, haystack: string, needle: string): number {
  let score = 0;
  const idKey = compact(template.id);
  const nameKey = compact(template.name);
  if (needle && (idKey === needle || nameKey === needle)) score += 80;
  if (needle && needle.length >= 4 && (idKey.startsWith(needle) || needle.startsWith(idKey))) score += 50;
  if (haystack.includes(template.id.toLowerCase())) score += 40;
  if (haystack.includes(template.name.toLowerCase())) score += 30;
  for (const keyword of template.keywords || []) {
    if (keyword && haystack.includes(keyword.toLowerCase())) {
      score += keyword.length >= 8 ? 3 : keyword.length >= 5 ? 2 : 1;
    }
  }
  if (haystack.includes((template.niche || '').toLowerCase())) score += 3;
  if (template.hasSnapshot) score += 8;
  if (template.origin === 'user') score += 6;
  if (/restaurant|food|cafe|bistro|dining/.test(haystack) && /restaurant|food|cafe|hospitality/.test(`${template.id} ${template.name} ${template.category}`)) {
    score += 12;
  }
  const numbered = haystack.match(/(?:restaurant|template)\s*(?:template\s*)?#?\s*(\d+)/i);
  if (numbered) {
    const n = numbered[1];
    const idHit = new RegExp(`(?:^|[^0-9])${n}(?:[^0-9]|$)`).test(template.id);
    const nameHit = new RegExp(`\\b${n}\\b`).test(template.name);
    if (idHit || nameHit) score += 60;
  }
  return score;
}

export function pickWebsiteTemplate(
  input: { prompt?: string; templateId?: string; name?: string },
  templates: PickableTemplate[] = WEBSITE_TEMPLATES,
): PickableTemplate | null {
  if (!templates.length) return null;
  const requested = (input.templateId || '').trim();
  const haystack = `${requested} ${input.name || ''} ${input.prompt || ''}`.toLowerCase();
  const needle = compact(requested || '');

  if (requested) {
    const exact = templates.find(
      (template) => template.id === requested || template.name.toLowerCase() === requested.toLowerCase(),
    );
    if (exact) return exact;
  }

  let best: { template: PickableTemplate; score: number } | null = null;
  for (const template of templates) {
    const score = scoreTemplate(template, haystack, needle);
    if (!best || score > best.score) best = { template, score };
  }

  if (best && best.score >= 8) return best.template;

  const snapshots = templates.filter((template) => template.hasSnapshot);
  if (/restaurant|bistro|cafe|dining|food/.test(haystack)) {
    const food = snapshots.find((template) =>
      /restaurant|food|cafe|hospitality/.test(`${template.id} ${template.name} ${template.category}`),
    );
    if (food) return food;
  }
  return snapshots[0] || best?.template || null;
}

export function suggestWebsiteTemplate(
  prompt: string,
  templates: WebsiteTemplate[] = WEBSITE_TEMPLATES,
): WebsiteTemplate | null {
  return pickWebsiteTemplate({ prompt }, templates);
}

export function siteNameFromBrief(
  prompt: string,
  name: string | undefined,
  templates: Array<{ id: string; name: string }>,
): string {
  const trimmed = name?.trim() || '';
  const isTemplateName = (value: string) =>
    templates.some(
      (template) =>
        template.name.toLowerCase() === value.toLowerCase() ||
        template.id.toLowerCase() === value.toLowerCase() ||
        /^restaurant template\b/i.test(value),
    );
  if (trimmed && !isTemplateName(trimmed)) return trimmed.slice(0, 50);
  const lines = prompt
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (isTemplateName(line)) continue;
    if (line.length > 80) continue;
    return line.length > 50 ? `${line.slice(0, 47)}...` : line;
  }
  return trimmed.slice(0, 50) || 'New site';
}
