import { getManagedTemplate } from './store';
import { getCloneUrl, getWebsiteTemplateId } from './settings';
import { getProjectById } from '@/lib/services/project';
import { hostnameFromUrl } from './cloneUrl';
import { buildSiteImageAgentRules } from './siteImages';

const FROM_SCRATCH_PREFIX = `Create a new Next.js 15 application with the following requirements:`;

const FROM_SCRATCH_SUFFIX = `Use the App Router, TypeScript, and Tailwind CSS 3.4 (not v4).
Set up the project structure and implement the requested features.
Do not run npm install, npm run dev, next dev, or start another server. The builder already runs the live preview.`;

export function buildFromScratchPrompt(initialPrompt: string): string {
  return `${FROM_SCRATCH_PREFIX}
${initialPrompt}

${FROM_SCRATCH_SUFFIX}

${buildSiteImageAgentRules(initialPrompt)}`.trim();
}

export function buildCloneWebsitePrompt(url: string, initialPrompt: string): string {
  const host = hostnameFromUrl(url);
  return `
Create a new Next.js 15 App Router + TypeScript + Tailwind CSS 3.4 (not v4) website that recreates this public site as a starting template:

URL: ${url}
Site: ${host}

USER REQUEST:
${initialPrompt}

Your job:
1. Rebuild the look: layout, navigation, sections, typography, colors, and page structure. Match it closely enough that someone would recognize the original.
2. Write original code. Do not paste proprietary source, steal private assets, or log into anything. Public marketing pages only.
3. ${buildSiteImageAgentRules(initialPrompt)} Use /images/fallback.svg when you cannot fairly reuse originals. Keep the site compiling and production-looking.
4. Multi-page where the source has multiple pages. App Router. Tailwind CSS 3.4 only.
5. This will be saved as a reusable template, so put shared copy and nav in a central module such as lib/site.ts when practical.
6. Do not add authentication, a database, or billing unless the user asked for them.
7. Do not run npm install, npm run dev, next dev, or start another server. The builder already runs the live preview.
`.trim();
}

export function buildAdaptTemplatePrompt(
  templateName: string,
  templateNiche: string,
  pages: string[],
  brandName: string,
  tagline: string,
  initialPrompt: string,
): string {
  return `
This project is already a complete Next.js 15 App Router + TypeScript + Tailwind CSS 3.4 website.

Starting template: "${templateName}" (${templateNiche})
Placeholder brand: ${brandName} — ${tagline}
Pages already in the repo: ${pages.join(', ')}

USER REQUEST:
${initialPrompt}

Your job:
1. Keep the existing multi-page App Router structure and Tailwind CSS 3.4 setup. Do not recreate the app from scratch. Do not upgrade to Tailwind v4.
2. Rewrite branding, copy, colors, and layout details so the site matches the user's request. Primary content lives in lib/site.ts — update that file and any components needed for visual changes.
3. Replace all placeholder business names, testimonials, metrics, and contact details with content that fits the request.
4. Keep the site compiling and production-looking. Forms can stay as demo UI unless the user asked for a backend. ${buildSiteImageAgentRules(initialPrompt)}
5. Do not add authentication, a database, or billing unless the user asked for them.
6. Do not run npm install, npm run dev, next dev, or start another server. The builder already runs the live preview.
`.trim();
}

export function buildAdaptSnapshotPrompt(
  templateName: string,
  sourceUrl: string | null | undefined,
  initialPrompt: string,
): string {
  const origin = sourceUrl ? ` It was saved from ${sourceUrl}.` : '';
  return `
This project is already a complete Next.js 15 App Router website copied from a saved template named "${templateName}".${origin}
The files on disk are the template — do not scaffold a new app.

USER REQUEST:
${initialPrompt}

Your job:
1. Keep the existing project structure, Tailwind CSS 3.4, and working pages. Do not recreate the app from scratch. Do not upgrade to Tailwind v4.
2. Adapt branding, copy, colors, images, and section content so the site matches the user's request. ${buildSiteImageAgentRules(initialPrompt)}
3. Keep the layout quality of the template. Add or remove pages only when the request needs it.
4. Keep the site compiling and production-looking.
5. Do not add authentication, a database, or billing unless the user asked for them.
6. Do not run npm install, npm run dev, next dev, or start another server. The builder already runs the live preview.
`.trim();
}

export async function buildInitialAgentPrompt(
  projectId: string,
  initialPrompt: string,
): Promise<string> {
  const project = await getProjectById(projectId);
  const cloneUrl = getCloneUrl(project?.settings);
  if (cloneUrl) {
    return buildCloneWebsitePrompt(cloneUrl, initialPrompt);
  }

  const templateId = getWebsiteTemplateId(project?.settings);
  if (!templateId) {
    return buildFromScratchPrompt(initialPrompt);
  }

  const template = await getManagedTemplate(templateId);
  if (!template) {
    return buildFromScratchPrompt(initialPrompt);
  }

  if (template.hasSnapshot || template.kind === 'snapshot') {
    return buildAdaptSnapshotPrompt(template.name, template.sourceUrl, initialPrompt);
  }

  return buildAdaptTemplatePrompt(
    template.name,
    template.niche,
    ['Home', ...template.pages.map((page) => page.label)],
    template.brand.name,
    template.brand.tagline,
    initialPrompt,
  );
}
