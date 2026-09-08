import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { LeadInput, LeadResponse, WorkspaceLead } from '@/types/leads';
import { dataFile } from '@/lib/server/paths';

const STORE_PATH = dataFile('leads.json');

interface LeadStore {
  openaiApiKey: string;
  leads: WorkspaceLead[];
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

function nowIso(): string {
  return new Date().toISOString();
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'yes' || value === 'true' || value === '1') return true;
  if (value === 'no' || value === 'false' || value === '0') return false;
  return fallback;
}

function asResponse(value: unknown): LeadResponse {
  if (value === 'waiting' || value === 'yes' || value === 'no') return value;
  return 'none';
}

function normalizeLead(raw: Partial<WorkspaceLead> & { id?: string }): WorkspaceLead {
  const timestamp = nowIso();
  return {
    id: clean(raw.id) || randomUUID(),
    business: clean(raw.business),
    contactName: clean(raw.contactName),
    whatTheyDo: clean(raw.whatTheyDo),
    email: clean(raw.email),
    phone: clean(raw.phone),
    city: clean(raw.city),
    website: clean(raw.website),
    hasWebsite: asBool(raw.hasWebsite, Boolean(clean(raw.website))),
    instagram: clean(raw.instagram),
    language: clean(raw.language),
    style: clean(raw.style),
    audience: clean(raw.audience),
    currentSiteNotes: clean(raw.currentSiteNotes),
    siteLook: clean(raw.siteLook),
    siteState: clean(raw.siteState),
    siteActions: clean(raw.siteActions),
    offerPrice: clean(raw.offerPrice),
    offerSent: asBool(raw.offerSent),
    responded: asResponse(raw.responded),
    called: asBool(raw.called),
    messageSent: asBool(raw.messageSent),
    vercelUrl: clean(raw.vercelUrl),
    nextStep: clean(raw.nextStep),
    followUpAt: clean(raw.followUpAt),
    notes: clean(raw.notes),
    details: clean(raw.details),
    personId: clean(raw.personId) || undefined,
    projectId: clean(raw.projectId) || undefined,
    createdAt: raw.createdAt || timestamp,
    updatedAt: raw.updatedAt || timestamp,
  };
}

async function readStore(): Promise<LeadStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return {
        openaiApiKey: '',
        leads: parsed.map((row) => normalizeLead(row as Partial<WorkspaceLead>)),
      };
    }
    const object = parsed && typeof parsed === 'object' ? (parsed as Partial<LeadStore>) : {};
    const rows = Array.isArray(object.leads) ? object.leads : [];
    return {
      openaiApiKey: clean(object.openaiApiKey),
      leads: rows.map((row) => normalizeLead(row as Partial<WorkspaceLead>)),
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return { openaiApiKey: '', leads: [] };
    throw error;
  }
}

async function writeStore(store: LeadStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function listLeads(): Promise<WorkspaceLead[]> {
  const store = await readStore();
  return [...store.leads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getLead(id: string): Promise<WorkspaceLead | null> {
  const store = await readStore();
  return store.leads.find((lead) => lead.id === id) || null;
}

export async function createLead(input: LeadInput = {}): Promise<WorkspaceLead> {
  return enqueue(async () => {
    const store = await readStore();
    const lead = normalizeLead({ ...input, id: randomUUID() });
    store.leads.unshift(lead);
    await writeStore(store);
    return lead;
  });
}

export async function updateLead(id: string, input: LeadInput): Promise<WorkspaceLead> {
  return enqueue(async () => {
    const store = await readStore();
    const index = store.leads.findIndex((lead) => lead.id === id);
    if (index < 0) throw new Error('Row not found');
    const current = store.leads[index];
    const next = normalizeLead({
      ...current,
      ...input,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: nowIso(),
    });
    store.leads[index] = next;
    await writeStore(store);
    return next;
  });
}

export async function deleteLead(id: string): Promise<void> {
  const removed = await deleteLeads([id]);
  if (!removed) throw new Error('Row not found');
}

export async function deleteLeads(ids: string[]): Promise<number> {
  const remove = new Set(ids.map((id) => id.trim()).filter(Boolean));
  if (!remove.size) return 0;
  return enqueue(async () => {
    const store = await readStore();
    const before = store.leads.length;
    store.leads = store.leads.filter((lead) => !remove.has(lead.id));
    await writeStore(store);
    return before - store.leads.length;
  });
}

export async function deleteAllLeads(): Promise<number> {
  return enqueue(async () => {
    const store = await readStore();
    const removed = store.leads.length;
    store.leads = [];
    await writeStore(store);
    return removed;
  });
}

export async function getWorkAiSettings(): Promise<{ hasOpenaiKey: boolean }> {
  const store = await readStore();
  const env = Boolean(process.env.OPENAI_API_KEY?.trim());
  return { hasOpenaiKey: Boolean(store.openaiApiKey) || env };
}

export async function getOpenaiApiKey(): Promise<string> {
  const store = await readStore();
  return store.openaiApiKey || process.env.OPENAI_API_KEY?.trim() || '';
}

export async function saveOpenaiApiKey(value: string): Promise<{ hasOpenaiKey: boolean }> {
  return enqueue(async () => {
    const store = await readStore();
    const key = value.trim();
    if (key) store.openaiApiKey = key;
    await writeStore(store);
    return { hasOpenaiKey: Boolean(store.openaiApiKey || process.env.OPENAI_API_KEY?.trim()) };
  });
}

export function leadToCsv(leads: WorkspaceLead[]): string {
  const headers: (keyof WorkspaceLead)[] = [
    'business',
    'contactName',
    'whatTheyDo',
    'email',
    'phone',
    'city',
    'website',
    'hasWebsite',
    'instagram',
    'language',
    'style',
    'audience',
    'currentSiteNotes',
    'offerPrice',
    'offerSent',
    'responded',
    'called',
    'messageSent',
    'vercelUrl',
    'nextStep',
    'followUpAt',
    'notes',
    'details',
  ];
  const escape = (value: string | boolean) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...leads.map((lead) => headers.map((key) => escape(lead[key] as string | boolean)).join(',')),
  ];
  return `${lines.join('\n')}\n`;
}
