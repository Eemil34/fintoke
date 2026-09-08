import { WEBSITE_TEMPLATES } from './catalog';
import type { WebsiteTemplate } from './types';

export function suggestWebsiteTemplate(
  prompt: string,
  templates: WebsiteTemplate[] = WEBSITE_TEMPLATES,
): WebsiteTemplate | null {
  const text = prompt.toLowerCase().trim();
  if (!text) return null;

  let best: { template: WebsiteTemplate; score: number } | null = null;
  for (const template of templates) {
    let score = 0;
    for (const keyword of template.keywords) {
      if (text.includes(keyword)) {
        score += keyword.length >= 8 ? 3 : keyword.length >= 5 ? 2 : 1;
      }
    }
    if (text.includes(template.name.toLowerCase())) score += 4;
    if (text.includes(template.niche.toLowerCase())) score += 3;
    if (!best || score > best.score) {
      best = { template, score };
    }
  }

  return best && best.score >= 2 ? best.template : null;
}
