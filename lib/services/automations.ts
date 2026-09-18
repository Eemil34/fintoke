import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { AutomationInput, AutomationKind, AutomationStatus, WorkspaceAutomation } from '@/types/automations';
import { dataFile, dataFileCandidates, volumeDataDir } from '@/lib/server/paths';
import { writeJsonAtomic } from '@/lib/server/atomicJson';
import { enrichEmptyLeads, generateWorkRows } from '@/lib/services/leadEnrich';
import { listLeads, updateLead } from '@/lib/services/leads';
import { createPerson, findPersonByRecipient } from '@/lib/services/workspace';
import { createProject } from '@/lib/services/project';
import { startProjectInstruction } from '@/lib/services/agentRun';
import { generateProjectId } from '@/lib/utils';
import { pickWebsiteTemplate } from '@/lib/templates/match';
import { listManagedTemplates } from '@/lib/templates/store';
import { fastFillProjectFromLead } from '@/lib/templates/fastFill';
import { publishFastTrackLive } from '@/lib/services/publishSite';
import { resolveAndPersistProjectWorkspace } from '@/lib/server/projectWorkspace';
import { getSerializedAgentSite } from '@/lib/agent-api/serialize';
import { getAgentWorkspaceSnapshot } from '@/lib/agent-api/workspaceAccess';
import { appOrigin } from '@/lib/agent-api/http';
import { sharePreviewUrl } from '@/lib/server/publicUrl';
import { composeAndSendEmail } from '@/lib/services/emailCompose';
import { getPublicMailSettings } from '@/lib/services/mail';
import { getDefaultModelForCli } from '@/lib/constants/cliModels';

function volumeFile(name: string): string {
  const volume = volumeDataDir();
  return volume ? path.join(volume, name) : dataFile(name);
}

function storePath(): string {
  return volumeFile('automations.json');
}

let writeQueue: Promise<unknown> = Promise.resolve();
let ticking = false;

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

function asBuildMode(value: unknown): 'fast' | 'full' {
  return value === 'full' ? 'full' : 'fast';
}

function asKind(value: unknown): AutomationKind {
  if (value === 'enrich_empty' || value === 'generate_work' || value === 'outreach') return value;
  return 'outreach';
}

function asStatus(value: unknown): AutomationStatus {
  if (value === 'scheduled' || value === 'running' || value === 'paused' || value === 'completed' || value === 'failed') {
    return value;
  }
  return 'scheduled';
}

function asCount(value: unknown, fallback: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(1, Math.round(parsed)));
}

function normalize(raw: Partial<WorkspaceAutomation> & { id?: string }): WorkspaceAutomation {
  const timestamp = nowIso();
  const repeatTotal = asCount(raw.repeatTotal, 3, 50);
  const intervalMinutes = asCount(raw.intervalMinutes, 60, 24 * 60);
  const windowStart = clean(raw.windowStart) || timestamp;
  const windowEnd = clean(raw.windowEnd) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const runCount = Math.max(0, Number(raw.runCount) || 0);
  let status = asStatus(raw.status);
  if (runCount >= repeatTotal) status = 'completed';
  return {
    id: clean(raw.id) || randomUUID(),
    name: clean(raw.name) || 'Outreach',
    kind: asKind(raw.kind),
    prompt: clean(raw.prompt),
    websitePrompt: clean(raw.websitePrompt),
    messagePrompt: clean(raw.messagePrompt),
    emailSubject: clean(raw.emailSubject),
    emailTemplateId: clean(raw.emailTemplateId) || 'tpl-site-ready',
    buildMode: asBuildMode(raw.buildMode),
    count: asCount(raw.count, 8, 40),
    city: clean(raw.city),
    country: clean(raw.country),
    businessKind: clean(raw.businessKind) || 'local businesses',
    sitesPerRun: asCount(raw.sitesPerRun, 2, 8),
    emailsPerRun: asCount(raw.emailsPerRun, 3, 10),
    repeatTotal,
    intervalMinutes,
    windowStart,
    windowEnd,
    status,
    runCount,
    nextRunAt: raw.nextRunAt === null ? null : clean(raw.nextRunAt) || windowStart,
    lastRunAt: clean(raw.lastRunAt) || null,
    lastError: clean(raw.lastError),
    runs: Array.isArray(raw.runs) ? raw.runs.slice(0, 40) : [],
    createdAt: raw.createdAt || timestamp,
    updatedAt: raw.updatedAt || timestamp,
  };
}

async function readJsonFile(filePath: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as unknown;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    throw error;
  }
}

async function readAll(): Promise<WorkspaceAutomation[]> {
  const rows: WorkspaceAutomation[] = [];
  for (const filePath of dataFileCandidates('automations.json')) {
    const parsed = await readJsonFile(filePath);
    if (!parsed || typeof parsed !== 'object') continue;
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { automations?: unknown }).automations)
        ? (parsed as { automations: unknown[] }).automations
        : [];
    for (const item of list) {
      if (item && typeof item === 'object') rows.push(normalize(item as Partial<WorkspaceAutomation>));
    }
  }
  const byId = new Map<string, WorkspaceAutomation>();
  for (const row of rows) byId.set(row.id, row);
  return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function writeAll(automations: WorkspaceAutomation[]): Promise<void> {
  await writeJsonAtomic(storePath(), { automations });
}

function isRateLimit(message: string): boolean {
  return /429|rate limit|quota|too many requests|insufficient_quota/i.test(message);
}

async function execute(job: WorkspaceAutomation): Promise<string> {
  if (job.kind === 'outreach') {
    return runOutreach(job);
  }
  if (job.kind === 'enrich_empty') {
    const result = await enrichEmptyLeads();
    return `Filled ${result.filled.length} work rows.`;
  }

  const created = await generateWorkRows({
    query: job.prompt,
    kind: job.businessKind,
    city: job.city,
    country: job.country,
    count: job.count,
  });
  return `Added ${created.created.length} businesses from ChatGPT.`;
}

function hasEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function ensureClient(lead: {
  email: string;
  business: string;
  contactName: string;
  personId?: string;
}): Promise<string | undefined> {
  if (lead.personId) return lead.personId;
  if (!hasEmail(lead.email)) return undefined;
  const existing = await findPersonByRecipient(lead.email);
  if (existing) return existing.id;
  const person = await createPerson({
    kind: 'client',
    name: lead.contactName || lead.business,
    email: lead.email,
    company: lead.business,
  });
  return person.id;
}

async function startSiteForLead(job: WorkspaceAutomation, lead: Awaited<ReturnType<typeof listLeads>>[number]) {
  const origin = appOrigin();
  const templates = await listManagedTemplates();
  const brief = [job.websitePrompt, lead.whatTheyDo, lead.business, job.businessKind, lead.city].filter(Boolean).join('\n');
  const template = pickWebsiteTemplate({ prompt: brief, name: lead.business }, templates);
  const projectId = generateProjectId();
  const fast = job.buildMode !== 'full';

  if (fast) {
    const project = await createProject({
      project_id: projectId,
      name: lead.business.slice(0, 50) || 'Outreach site',
      initialPrompt: '',
      preferredCli: 'cursor',
      selectedModel: getDefaultModelForCli('cursor'),
      description: lead.whatTheyDo.slice(0, 180) || 'Fast-track template with rewritten copy',
      websiteTemplateId: template?.id,
    });
    const projectPath = await resolveAndPersistProjectWorkspace(project, project.id);
    const filled = await fastFillProjectFromLead({
      projectPath,
      lead,
      websitePrompt: job.websitePrompt,
      country: job.country,
    });
    const live = await publishFastTrackLive(projectId);
    const shareUrl = live.url || sharePreviewUrl(projectId);
    const personId = await ensureClient(lead);
    await updateLead(lead.id, {
      projectId,
      personId,
      vercelUrl: shareUrl,
      notes: [
        lead.notes,
        `Fast-track site ${projectId} from template ${template?.id || 'default'} (${filled.replacements} files, map ${filled.mapsQuery || 'city'}).`,
        live.url ? `Live: ${live.url}` : live.error || '',
      ]
        .filter(Boolean)
        .join('\n'),
    });
    return { projectId, shareUrl, origin };
  }

  const snapshot = await getAgentWorkspaceSnapshot();
  const instruction = `You are the Cursor agent inside Fintoke. Build a real Next.js marketing site for this business. Do not write a chat-only mock.

Business:
${JSON.stringify(
    {
      name: lead.business,
      contactName: lead.contactName,
      whatTheyDo: lead.whatTheyDo,
      city: lead.city,
      currentWebsite: lead.website,
      email: lead.email,
      phone: lead.phone,
      instagram: lead.instagram,
      style: lead.style,
      audience: lead.audience,
      notes: lead.notes,
    },
    null,
    2,
  )}

Website instructions from the operator:
${job.websitePrompt || 'Create a clean, specific one-page site that matches this business and city.'}

Workspace snapshot (same data the Claude/ChatGPT connector can read):
${JSON.stringify(snapshot, null, 2)}

Use SiteImage for photos. Do not invent Unsplash IDs. Keep copy about this business only.`;

  await createProject({
    project_id: projectId,
    name: lead.business.slice(0, 50) || 'Outreach site',
    initialPrompt: instruction,
    preferredCli: 'cursor',
    selectedModel: getDefaultModelForCli('cursor'),
    description: lead.whatTheyDo.slice(0, 180) || instruction.slice(0, 180),
    websiteTemplateId: template?.id,
  });
  await startProjectInstruction({
    projectId,
    instruction,
    cliPreference: 'cursor',
    isInitialPrompt: true,
  });
  const personId = await ensureClient(lead);
  await updateLead(lead.id, {
    projectId,
    personId,
    vercelUrl: sharePreviewUrl(projectId),
    notes: [lead.notes, `Site ${projectId} started from automation ${job.name}`].filter(Boolean).join('\n'),
  });
  return { projectId, shareUrl: sharePreviewUrl(projectId), origin };
}

async function sendOfferForLead(job: WorkspaceAutomation, lead: Awaited<ReturnType<typeof listLeads>>[number]) {
  if (!lead.projectId || !hasEmail(lead.email) || lead.offerSent) return null;
  const origin = appOrigin();
  const { getProjectById } = await import('@/lib/services/project');
  const { resolveProjectWorkspace } = await import('@/lib/server/projectWorkspace');
  const { readFastCopy } = await import('@/lib/templates/fastPreview');
  const project = await getProjectById(lead.projectId);
  const copy = project ? await readFastCopy(await resolveProjectWorkspace(project, lead.projectId)) : null;
  if (!copy) {
    const { previewManager } = await import('@/lib/services/preview');
    await previewManager.ensureReady(lead.projectId).catch((error) => {
      console.warn(`[automations] Preview still starting before offer for ${lead.projectId}:`, error);
    });
  }
  const site = await getSerializedAgentSite(lead.projectId, origin);
  if (!site) return null;
  if (site.job.running) return null;
  const liveUrl = site.vercel.deploymentUrl || site.shareUrl;
  const personId = await ensureClient(lead);
  const result = await composeAndSendEmail({
    to: lead.email,
    personId,
    templateId: job.emailTemplateId || 'tpl-site-ready',
    subject: job.emailSubject || undefined,
    message: job.messagePrompt,
    variables: {
      name: lead.contactName || lead.business,
      first_name: (lead.contactName || lead.business).split(/\s+/)[0],
      company: lead.business,
      site_name: lead.business,
      site_url: liveUrl,
      projectId: lead.projectId,
      message: job.messagePrompt,
    },
    send: true,
  });
  await updateLead(lead.id, {
    personId,
    offerSent: true,
    messageSent: true,
    vercelUrl: liveUrl,
    responded: lead.responded === 'none' ? 'waiting' : lead.responded,
  });
  return { to: lead.email, liveUrl, delivered: result.delivered };
}

async function runOutreach(job: WorkspaceAutomation): Promise<string> {
  const parts: string[] = [];
  if (job.prompt) {
    const found = await generateWorkRows({
      query: job.prompt,
      kind: job.businessKind,
      city: job.city,
      country: job.country,
      count: job.count,
    });
    parts.push(`Researched ${found.created.length} businesses.`);
  }

  const leads = await listLeads();
  const needSite = leads.filter((lead) => !lead.projectId).slice(0, job.sitesPerRun);
  let sites = 0;
  for (const lead of needSite) {
    await startSiteForLead(job, lead);
    sites += 1;
  }
  if (sites) parts.push(`Started ${sites} ${job.buildMode === 'full' ? 'Cursor site builds' : 'fast-track template sites'}.`);

  const latest = await listLeads();
  const mail = await getPublicMailSettings();
  let sent = 0;
  if (mail.configured) {
    const ready = latest.filter((lead) => lead.projectId && hasEmail(lead.email) && !lead.offerSent);
    for (const lead of ready.slice(0, job.emailsPerRun)) {
      const result = await sendOfferForLead(job, lead);
      if (result?.delivered) sent += 1;
    }
    if (sent) parts.push(`Sent ${sent} offer emails with live preview links.`);
  } else {
    parts.push('Mail is not configured, so offers were not sent.');
  }

  if (!parts.length) {
    return 'Nothing to do this run. Add a research prompt or wait for sites to finish before sending.';
  }
  return parts.join(' ');
}

function stillInWindow(job: WorkspaceAutomation, now: number): boolean {
  const start = Date.parse(job.windowStart);
  const end = Date.parse(job.windowEnd);
  if (Number.isFinite(start) && now < start) return false;
  if (Number.isFinite(end) && now > end) return false;
  return true;
}

export async function listAutomations(): Promise<WorkspaceAutomation[]> {
  return readAll();
}

export async function getAutomation(id: string): Promise<WorkspaceAutomation | null> {
  const rows = await readAll();
  return rows.find((row) => row.id === id) || null;
}

export async function createAutomation(input: AutomationInput): Promise<WorkspaceAutomation> {
  const timestamp = nowIso();
  const windowStart = clean(input.windowStart) || timestamp;
  const job = normalize({
    ...input,
    status: 'scheduled',
    runCount: 0,
    nextRunAt: windowStart,
    windowStart,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  if (!job.prompt && job.kind === 'generate_work') {
    throw new Error('Describe what ChatGPT should find, for example “cafes in Tampere”.');
  }
  if (job.kind === 'outreach' && !job.prompt && !job.websitePrompt && !job.messagePrompt) {
    throw new Error('Add a research prompt, website instructions, or an offer message.');
  }
  return enqueue(async () => {
    const rows = await readAll();
    rows.unshift(job);
    await writeAll(rows);
    return job;
  });
}

export async function updateAutomation(id: string, input: AutomationInput): Promise<WorkspaceAutomation> {
  return enqueue(async () => {
    const rows = await readAll();
    const index = rows.findIndex((row) => row.id === id);
    if (index === -1) throw new Error('Automation not found');
    const current = rows[index];
    const next = normalize({
      ...current,
      ...input,
      id: current.id,
      createdAt: current.createdAt,
      runs: current.runs,
      runCount: current.runCount,
      updatedAt: nowIso(),
    });
    rows[index] = next;
    await writeAll(rows);
    return next;
  });
}

export async function deleteAutomation(id: string): Promise<void> {
  return enqueue(async () => {
    const rows = await readAll();
    const next = rows.filter((row) => row.id !== id);
    if (next.length === rows.length) throw new Error('Automation not found');
    await writeAll(next);
  });
}

export async function pauseAutomation(id: string): Promise<WorkspaceAutomation> {
  return updateAutomation(id, { status: 'paused', nextRunAt: null });
}

export async function resumeAutomation(id: string): Promise<WorkspaceAutomation> {
  const job = await getAutomation(id);
  if (!job) throw new Error('Automation not found');
  if (job.runCount >= job.repeatTotal) {
    return updateAutomation(id, { status: 'completed', nextRunAt: null });
  }
  return updateAutomation(id, { status: 'scheduled', lastError: '', nextRunAt: nowIso() });
}

export async function runAutomationNow(id: string): Promise<WorkspaceAutomation> {
  await updateAutomation(id, { status: 'scheduled', nextRunAt: nowIso() });
  await tickAutomations(id);
  const job = await getAutomation(id);
  if (!job) throw new Error('Automation not found');
  return job;
}

export async function tickAutomations(onlyId?: string): Promise<void> {
  if (ticking) return;
  ticking = true;
  try {
    const due = await enqueue(async () => {
      const rows = await readAll();
      const now = Date.now();
      const ids: string[] = [];
      let changed = false;
      for (const job of rows) {
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'paused') continue;
        if (job.runCount >= job.repeatTotal) {
          job.status = 'completed';
          job.nextRunAt = null;
          job.updatedAt = nowIso();
          changed = true;
          continue;
        }
        const end = Date.parse(job.windowEnd);
        if (Number.isFinite(end) && now > end) {
          job.status = job.runCount > 0 ? 'completed' : 'paused';
          job.nextRunAt = null;
          job.lastError = job.runCount > 0 ? job.lastError : 'Time window ended before a run finished.';
          job.updatedAt = nowIso();
          changed = true;
          continue;
        }
        if (onlyId && job.id !== onlyId) continue;
        if (!onlyId) {
          if (job.nextRunAt && Date.parse(job.nextRunAt) > now) continue;
          if (!stillInWindow(job, now) && Date.parse(job.windowStart) > now) continue;
        }
        job.status = 'running';
        job.updatedAt = nowIso();
        ids.push(job.id);
        changed = true;
      }
      if (changed) await writeAll(rows);
      return ids;
    });

    for (const id of due) {
      const job = await getAutomation(id);
      if (!job) continue;
      const now = Date.now();
      try {
        const summary = await execute(job);
        await enqueue(async () => {
          const rows = await readAll();
          const current = rows.find((row) => row.id === id);
          if (!current) return;
          current.runCount += 1;
          current.lastRunAt = nowIso();
          current.lastError = '';
          current.runs.unshift({ at: current.lastRunAt, ok: true, summary });
          current.runs = current.runs.slice(0, 40);
          if (current.runCount >= current.repeatTotal) {
            current.status = 'completed';
            current.nextRunAt = null;
          } else {
            current.status = 'scheduled';
            current.nextRunAt = new Date(now + current.intervalMinutes * 60 * 1000).toISOString();
          }
          current.updatedAt = nowIso();
          await writeAll(rows);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'ChatGPT request failed';
        await enqueue(async () => {
          const rows = await readAll();
          const current = rows.find((row) => row.id === id);
          if (!current) return;
          current.lastRunAt = nowIso();
          current.runs.unshift({ at: current.lastRunAt, ok: false, summary: message });
          current.runs = current.runs.slice(0, 40);
          if (isRateLimit(message)) {
            current.status = 'paused';
            current.nextRunAt = null;
            current.lastError =
              'OpenAI paused this job after a rate or quota limit. Paste a different OpenAI API key below, then resume. Fintoke will not log into ChatGPT Google accounts or hop accounts to bypass limits.';
          } else {
            current.status = 'failed';
            current.nextRunAt = null;
            current.lastError = message;
          }
          current.updatedAt = nowIso();
          await writeAll(rows);
        });
      }
    }
  } finally {
    ticking = false;
  }
}
