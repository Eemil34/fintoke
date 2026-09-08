import { BLANK_TEMPLATE_ID } from './types';
import { parsePublicHttpUrl } from './cloneUrl';

export interface ProjectTemplateSettings {
  websiteTemplateId?: string;
  cloneUrl?: string;
}

export function parseProjectSettings(raw?: string | null): ProjectTemplateSettings {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as ProjectTemplateSettings;
  } catch {
    return {};
  }
}

export function serializeProjectSettings(
  current: string | null | undefined,
  patch: ProjectTemplateSettings,
): string {
  const existing = parseProjectSettings(current);
  return JSON.stringify({ ...existing, ...patch });
}

export function getWebsiteTemplateId(raw?: string | null): string | null {
  const id = parseProjectSettings(raw).websiteTemplateId;
  if (!id || id === BLANK_TEMPLATE_ID) return null;
  return id;
}

export function getCloneUrl(raw?: string | null): string | null {
  const url = parseProjectSettings(raw).cloneUrl;
  return url ? parsePublicHttpUrl(url) : null;
}
