import {
  createEmail,
  findEmailTemplate,
  findPersonByRecipient,
  getPerson,
  listEmails,
  updateEmail,
  type WorkspaceEmail,
  type WorkspaceEmailTemplate,
} from '@/lib/services/workspace';
import { sharePreviewUrl } from '@/lib/server/publicUrl';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const recentSends: number[] = [];
const SEND_WINDOW_MS = 60 * 60 * 1000;
const SEND_LIMIT = 40;

export type ComposeEmailInput = {
  to?: string;
  personId?: string;
  templateId?: string;
  templateName?: string;
  subject?: string;
  body?: string;
  message?: string;
  variables?: Record<string, string>;
  send?: boolean;
};

export type ComposedEmail = {
  to: string;
  subject: string;
  body: string;
  relatedPersonId?: string;
  templateId?: string;
  templateName?: string;
  variables: Record<string, string>;
};

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function applyTemplateVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = vars[key] ?? vars[key.toLowerCase()] ?? '';
    return value;
  });
}

export function collectTemplateVars(text: string): string[] {
  const keys = new Set<string>();
  for (const match of text.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) {
    keys.add(match[1].toLowerCase());
  }
  return [...keys];
}

function flattenVariables(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  const next: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (item == null) continue;
    next[key] = String(item);
    next[key.toLowerCase()] = String(item);
  }
  return next;
}

function assertCanSend(): void {
  const now = Date.now();
  while (recentSends.length && now - recentSends[0] > SEND_WINDOW_MS) {
    recentSends.shift();
  }
  if (recentSends.length >= SEND_LIMIT) {
    throw new Error(`Too many emails in the last hour (limit ${SEND_LIMIT}). Wait and try again.`);
  }
}

export async function composeEmail(input: ComposeEmailInput): Promise<ComposedEmail> {
  const settings = await loadMailSettings();
  const person =
    (input.personId ? await getPerson(input.personId) : null) ||
    (input.to ? await findPersonByRecipient(input.to) : null);

  const to = clean(input.to) || person?.email || '';
  if (!to) {
    throw new Error('Recipient email is required');
  }
  if (!EMAIL_RE.test(to)) {
    throw new Error(`“${to}” is not a valid email address`);
  }

  const template = await resolveTemplate(input);
  const extra = flattenVariables(input.variables);
  const message = clean(input.message) || extra.message || '';
  const variables: Record<string, string> = {
    name: person?.name || extra.name || to.split('@')[0],
    first_name: extra.first_name || firstName(person?.name || extra.name || to.split('@')[0]),
    email: to,
    company: person?.company || extra.company || '',
    role: person?.role || extra.role || '',
    notes: person?.notes || extra.notes || '',
    sender_name: settings.fromName || extra.sender_name || 'Fintoke',
    sender_email: settings.fromEmail || settings.smtp.user || extra.sender_email || '',
    message,
    site_name: extra.site_name || extra.sitename || '',
    site_url:
      extra.projectId || extra.project_id
        ? sharePreviewUrl(String(extra.projectId || extra.project_id))
        : extra.site_url || extra.url || extra.preview_url || '',
    ...extra,
  };

  const subject = clean(input.subject) || (template ? applyTemplateVars(template.subject, variables) : '');
  const body = input.body !== undefined
    ? applyTemplateVars(String(input.body), variables)
    : template
      ? applyTemplateVars(template.body, variables)
      : message;

  if (!subject) {
    throw new Error('Subject is required. Pick a template or pass subject.');
  }

  return {
    to,
    subject: applyTemplateVars(subject, variables),
    body,
    relatedPersonId: person?.id,
    templateId: template?.id,
    templateName: template?.name,
    variables,
  };
}

async function resolveTemplate(input: ComposeEmailInput): Promise<WorkspaceEmailTemplate | null> {
  const hint = clean(input.templateId) || clean(input.templateName);
  if (hint) {
    const found = await findEmailTemplate(hint);
    if (!found) {
      throw new Error(`Email template “${hint}” was not found. Call claudable_list_email_templates first.`);
    }
    return found;
  }
  if (clean(input.subject) || input.body !== undefined) {
    return null;
  }
  throw new Error('Pick an email template or provide subject and body.');
}

export async function composeAndSendEmail(input: ComposeEmailInput): Promise<{
  email: WorkspaceEmail;
  delivered: boolean;
}> {
  const composed = await composeEmail(input);
  const shouldSend = input.send !== false;

  const email = await createEmail({
    to: composed.to,
    subject: composed.subject,
    body: composed.body,
    relatedPersonId: composed.relatedPersonId,
    templateId: composed.templateId,
    templateName: composed.templateName,
    status: 'draft',
  });

  if (!shouldSend) {
    return { email, delivered: false };
  }

  assertCanSend();
  try {
    const delivered = await deliverEmail({
      to: composed.to,
      subject: composed.subject,
      body: composed.body,
    });
    recentSends.push(Date.now());
    const sent = await updateEmail(email.id, {
      status: 'sent',
      from: delivered.from,
      error: null,
      sentAt: new Date().toISOString(),
    });
    return { email: sent, delivered: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    const failed = await updateEmail(email.id, {
      status: 'failed',
      error: message,
    });
    throw Object.assign(new Error(message), { email: failed });
  }
}

export async function sendExistingEmail(id: string): Promise<WorkspaceEmail> {
  const emails = await listEmails();
  const current = emails.find((item) => item.id === id);
  if (!current) throw new Error('Email not found');

  assertCanSend();
  try {
    const delivered = await deliverEmail({
      to: current.to,
      subject: current.subject,
      body: current.body,
    });
    recentSends.push(Date.now());
    return updateEmail(id, {
      status: 'sent',
      from: delivered.from,
      error: null,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    await updateEmail(id, { status: 'failed', error: message });
    throw new Error(message);
  }
}
