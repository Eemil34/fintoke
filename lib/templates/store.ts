import fs from 'fs/promises';
import path from 'path';
import { createBlankTemplate } from './blank';
import { WEBSITE_TEMPLATES, WEBSITE_TEMPLATES_BY_ID } from './catalog';
import { hostnameFromUrl, parsePublicHttpUrl } from './cloneUrl';
import {
  deleteProjectSnapshot,
  directoryHasApp,
  duplicateProjectSnapshot,
  snapshotHasApp,
  writeProjectSnapshot,
} from './snapshot';
import type { ManagedTemplate, TemplateKind, WebsiteTemplate } from './types';
import { sanitizeWebsiteTemplate, slugifyTemplateId } from './validate';
import { dataFile } from '@/lib/server/paths';
import bundledSeedJson from '@/seed/templates.json';

const STORE_PATH = dataFile('templates.json');
const BUILTIN_IDS = new Set(WEBSITE_TEMPLATES.map((template) => template.id));
const RESERVED_IDS = new Set(['blank', 'new', 'all']);

interface StoredCustomTemplate extends WebsiteTemplate {
  kind?: TemplateKind;
  sourceProjectId?: string | null;
  sourceUrl?: string | null;
  savedAt?: string | null;
}

interface TemplateFileStore {
  overrides: Record<string, WebsiteTemplate>;
  custom: StoredCustomTemplate[];
  hidden: string[];
}

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function parseStore(raw: string): TemplateFileStore {
  const parsed = JSON.parse(raw) as Partial<TemplateFileStore>;
  const overrides =
    parsed.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {};
  const custom = Array.isArray(parsed.custom) ? parsed.custom : [];
  const hidden = Array.isArray(parsed.hidden) ? parsed.hidden.map((id) => String(id)) : [];
  return { overrides, custom, hidden };
}

async function readStoreFile(): Promise<TemplateFileStore> {
  try {
    return parseStore(await fs.readFile(STORE_PATH, 'utf8'));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return { overrides: {}, custom: [], hidden: [] };
    throw error;
  }
}

async function loadSeedStore(): Promise<TemplateFileStore | null> {
  try {
    return parseStore(await fs.readFile(path.join(process.cwd(), 'seed', 'templates.json'), 'utf8'));
  } catch {
    try {
      return parseStore(JSON.stringify(bundledSeedJson));
    } catch {
      return null;
    }
  }
}

async function readStore(): Promise<TemplateFileStore> {
  const store = await readStoreFile();
  const seed = await loadSeedStore();
  if (!seed?.custom.length) return store;

  const have = new Set(store.custom.map((template) => template.id));
  const missingSeed = seed.custom.filter((template) => !have.has(template.id));
  const next: TemplateFileStore = {
    overrides: { ...seed.overrides, ...store.overrides },
    custom: [...store.custom, ...missingSeed],
    hidden: [...new Set([...(seed.hidden ?? []), ...(store.hidden ?? [])])],
  };

  if (JSON.stringify(store) !== JSON.stringify(next)) {
    try {
      await writeStore(next);
    } catch (error) {
      console.error('Could not persist seeded templates to disk:', error);
    }
  }
  return next;
}

async function writeStore(store: TemplateFileStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function existingIds(store: TemplateFileStore): Set<string> {
  return new Set([
    ...BUILTIN_IDS,
    ...store.custom.map((template) => template.id),
    ...Object.keys(store.overrides),
  ]);
}

function uniqueId(base: string, taken: Set<string>): string {
  const root = slugifyTemplateId(base);
  let id = root;
  let n = 2;
  while (taken.has(id) || RESERVED_IDS.has(id)) {
    id = `${root}-${n}`;
    n += 1;
  }
  return id;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function snapshotMeta(raw: StoredCustomTemplate | WebsiteTemplate | undefined): {
  kind: TemplateKind;
  sourceProjectId?: string | null;
  sourceUrl?: string | null;
  savedAt?: string | null;
} {
  const record = (raw && typeof raw === 'object' ? raw : {}) as StoredCustomTemplate;
  const sourceUrl = record.sourceUrl ? parsePublicHttpUrl(record.sourceUrl) : null;
  return {
    kind: record.kind === 'snapshot' ? 'snapshot' : 'catalog',
    sourceProjectId: record.sourceProjectId || null,
    sourceUrl,
    savedAt: record.savedAt || null,
  };
}

async function toManaged(
  template: WebsiteTemplate,
  source: ManagedTemplate['source'],
  overridden: boolean,
  extras: ReturnType<typeof snapshotMeta> = { kind: 'catalog' },
  origin: ManagedTemplate['origin'] = 'pack',
): Promise<ManagedTemplate> {
  const hasSnapshot = await snapshotHasApp(template.id);
  return {
    ...template,
    source,
    overridden,
    kind: hasSnapshot ? 'snapshot' : extras.kind,
    sourceProjectId: extras.sourceProjectId ?? null,
    sourceUrl: extras.sourceUrl ?? null,
    hasSnapshot,
    origin,
    savedAt: extras.savedAt ?? null,
  };
}

function skeletonFromSave(input: {
  id: string;
  name: string;
  description: string;
  sourceUrl?: string | null;
}): StoredCustomTemplate {
  const host = input.sourceUrl ? hostnameFromUrl(input.sourceUrl) : '';
  const description =
    input.description ||
    (input.sourceUrl
      ? `Saved clone of ${host}. New sites start from this generated site.`
      : 'Saved generated site. New projects start from these files.');
  const base = createBlankTemplate({
    id: input.id,
    name: input.name,
    niche: host || 'Saved site',
    description,
    keywords: ['custom', 'saved', host].filter(Boolean),
    brand: {
      name: input.name,
      tagline: host || 'Saved site',
      description,
    },
    hero: {
      eyebrow: host || 'Saved template',
      title: input.name,
      subtitle: description,
      cta: 'Use template',
    },
  });
  return {
    ...base,
    kind: 'snapshot',
    sourceUrl: input.sourceUrl || null,
  };
}

function persistCustom(template: StoredCustomTemplate): StoredCustomTemplate {
  const clean = sanitizeWebsiteTemplate(template, { id: template.id });
  return {
    ...clean,
    kind: template.kind === 'snapshot' ? 'snapshot' : 'catalog',
    sourceProjectId: template.sourceProjectId || null,
    sourceUrl: template.sourceUrl || null,
    savedAt: template.savedAt || null,
  };
}

export function isBuiltinTemplateId(id: string): boolean {
  return BUILTIN_IDS.has(id);
}

export async function listManagedTemplates(): Promise<ManagedTemplate[]> {
  const store = await enqueue(() => readStore());
  const seed = await loadSeedStore();
  const seedIds = new Set((seed?.custom ?? []).map((template) => template.id));
  const custom = await Promise.all(
    store.custom.map((template) =>
      toManaged(
        sanitizeWebsiteTemplate(template, { id: template.id }),
        'custom',
        false,
        snapshotMeta(template),
        seedIds.has(template.id) ? 'pack' : 'user',
      ),
    ),
  );
  custom.sort((a, b) => {
    if (a.origin === b.origin) {
      return (b.savedAt || '').localeCompare(a.savedAt || '');
    }
    return a.origin === 'user' ? -1 : 1;
  });
  const hasSavedSites = custom.some((template) => template.hasSnapshot);
  const builtins = hasSavedSites
    ? []
    : await Promise.all(
        WEBSITE_TEMPLATES.filter((template) => !store.hidden.includes(template.id)).map((template) => {
          const override = store.overrides[template.id];
          if (!override) return toManaged(template, 'builtin', false);
          return toManaged(sanitizeWebsiteTemplate(override, { id: template.id }), 'builtin', true);
        }),
      );
  return [...custom, ...builtins];
}

export async function resolveWebsiteTemplate(
  id: string | null | undefined,
): Promise<WebsiteTemplate | null> {
  if (!id || id === 'blank') return null;
  const templates = await listManagedTemplates();
  return templates.find((template) => template.id === id) ?? null;
}

export async function getManagedTemplate(id: string): Promise<ManagedTemplate | null> {
  const templates = await listManagedTemplates();
  return templates.find((template) => template.id === id) ?? null;
}

export async function createManagedTemplate(input: unknown): Promise<ManagedTemplate> {
  return enqueue(async () => {
    const store = await readStore();
    const taken = existingIds(store);
    const draft = sanitizeWebsiteTemplate(input);
    const id = uniqueId(draft.id || draft.name, taken);
    const template = persistCustom({
      ...sanitizeWebsiteTemplate({ ...draft, id }, { id }),
      kind: 'catalog',
    });
    store.custom.unshift(template);
    await writeStore(store);
    return toManaged(template, 'custom', false, snapshotMeta(template));
  });
}

export async function createSnapshotTemplate(input: {
  projectPath: string;
  projectId: string;
  name: string;
  description?: string;
  sourceUrl?: string | null;
}): Promise<ManagedTemplate> {
  if (!(await directoryHasApp(input.projectPath))) {
    throw new Error('The site has no files yet. Generate it with the agent first.');
  }

  return enqueue(async () => {
    const store = await readStore();
    const taken = existingIds(store);
    const name = asString(input.name, 'Saved site');
    const id = uniqueId(name, taken);
    const template = persistCustom({
      ...skeletonFromSave({
        id,
        name,
        description: asString(input.description),
        sourceUrl: input.sourceUrl,
      }),
      sourceProjectId: input.projectId,
      savedAt: new Date().toISOString(),
    });

    await writeProjectSnapshot(id, input.projectPath);
    store.custom.unshift(template);
    await writeStore(store);
    return toManaged(template, 'custom', false, snapshotMeta(template), 'user');
  });
}

export async function refreshSnapshotTemplate(
  id: string,
  projectPath: string,
  projectId: string,
): Promise<ManagedTemplate> {
  if (!(await directoryHasApp(projectPath))) {
    throw new Error('The site has no files yet. Generate it with the agent first.');
  }

  return enqueue(async () => {
    const store = await readStore();
    const customIndex = store.custom.findIndex((item) => item.id === id);
    if (customIndex < 0) {
      throw new Error('Template not found');
    }

    await writeProjectSnapshot(id, projectPath);
    const current = store.custom[customIndex];
    const merged = persistCustom({
      ...current,
      kind: 'snapshot',
      sourceProjectId: projectId,
    });
    store.custom[customIndex] = merged;
    await writeStore(store);
    return toManaged(merged, 'custom', false, snapshotMeta(merged));
  });
}

export async function duplicateManagedTemplate(fromId: string): Promise<ManagedTemplate> {
  const source = await getManagedTemplate(fromId);
  if (!source) {
    throw new Error('Template not found');
  }

  return enqueue(async () => {
    const store = await readStore();
    const taken = existingIds(store);
    const id = uniqueId(`${source.name} copy`, taken);
    const template = persistCustom({
      ...sanitizeWebsiteTemplate({ ...source, id, name: `${source.name} copy` }, { id }),
      kind: source.kind,
      sourceProjectId: source.sourceProjectId,
      sourceUrl: source.sourceUrl,
    });

    if (source.hasSnapshot) {
      await duplicateProjectSnapshot(fromId, id);
      template.kind = 'snapshot';
    }

    store.custom.unshift(template);
    await writeStore(store);
    return toManaged(template, 'custom', false, snapshotMeta(template), 'user');
  });
}

export async function updateManagedTemplate(id: string, input: unknown): Promise<ManagedTemplate> {
  return enqueue(async () => {
    const store = await readStore();
    const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};

    const customIndex = store.custom.findIndex((item) => item.id === id);
    if (customIndex >= 0) {
      const current = store.custom[customIndex];
    const merged = persistCustom({
      ...current,
      ...sanitizeWebsiteTemplate(
        {
          ...current,
          name: asString(raw.name, current.name),
          description: asString(raw.description, current.description),
          niche: asString(raw.niche, current.niche),
          category: raw.category ?? current.category,
          keywords: raw.keywords ?? current.keywords,
        },
        { id },
      ),
      kind: current.kind === 'snapshot' ? 'snapshot' : 'catalog',
      sourceProjectId: current.sourceProjectId,
      sourceUrl: current.sourceUrl,
      savedAt: current.savedAt,
    });
      store.custom[customIndex] = merged;
      await writeStore(store);
      return toManaged(merged, 'custom', false, snapshotMeta(merged));
    }

    if (BUILTIN_IDS.has(id)) {
      const current =
        store.overrides[id] || WEBSITE_TEMPLATES.find((template) => template.id === id);
      if (!current) throw new Error('Template not found');
      const merged = sanitizeWebsiteTemplate(
        {
          ...current,
          name: asString(raw.name, current.name),
          description: asString(raw.description, current.description),
          niche: asString(raw.niche, current.niche),
          category: raw.category ?? current.category,
          keywords: raw.keywords ?? current.keywords,
        },
        { id },
      );
      store.overrides[id] = merged;
      await writeStore(store);
      return toManaged(merged, 'builtin', true);
    }

    throw new Error('Template not found');
  });
}

export async function deleteManagedTemplate(id: string): Promise<{ reset: boolean }> {
  return enqueue(async () => {
    const store = await readStore();
    const customIndex = store.custom.findIndex((item) => item.id === id);
    if (customIndex >= 0) {
      store.custom.splice(customIndex, 1);
      await writeStore(store);
      await deleteProjectSnapshot(id);
      return { reset: false };
    }

    if (BUILTIN_IDS.has(id)) {
      if (!store.hidden.includes(id)) store.hidden.push(id);
      delete store.overrides[id];
      await writeStore(store);
      return { reset: false };
    }

    throw new Error('Template not found');
  });
}

export function getBuiltinTemplate(id: string): WebsiteTemplate | null {
  return WEBSITE_TEMPLATES_BY_ID[id] ?? null;
}
