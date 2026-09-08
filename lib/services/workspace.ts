import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type {
  EmailStatus,
  PersonKind,
  WorkspaceEmail,
  WorkspaceEmailTemplate,
  WorkspacePerson,
  WorkspaceStore,
} from '@/types/workspace';
import { BUILT_IN_EMAIL_TEMPLATES } from '@/lib/templates/emailCatalog';
import { dataFile } from '@/lib/server/paths';

export type {
  EmailStatus,
  PersonKind,
  WorkspaceEmail,
  WorkspaceEmailTemplate,
  WorkspacePerson,
  WorkspaceStore,
};

const STORE_PATH = dataFile('workspace.json');

export type PersonInput = {
  kind?: PersonKind;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
};

export type EmailInput = {
  to?: string;
  subject?: string;
  body?: string;
  status?: EmailStatus;
  relatedPersonId?: string | null;
  templateId?: string | null;
  templateName?: string | null;
  from?: string | null;
  error?: string | null;
  sentAt?: string | null;
};

export type EmailTemplateInput = {
  name?: string;
  description?: string;
  subject?: string;
  body?: string;
};

const EMPTY_STORE: WorkspaceStore = {
  people: [],
  emails: [],
  emailTemplates: [],
};

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function readStore(): Promise<WorkspaceStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<WorkspaceStore>;
    return normalizeStore({
      people: Array.isArray(parsed.people)
        ? parsed.people.map((person) => ({ ...person, phone: person.phone || '' }))
        : [],
      emails: Array.isArray(parsed.emails) ? parsed.emails : [],
      emailTemplates: Array.isArray(parsed.emailTemplates) ? parsed.emailTemplates : [],
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      return normalizeStore({ ...EMPTY_STORE });
    }
    throw error;
  }
}

function normalizeStore(store: WorkspaceStore): WorkspaceStore {
  const custom = store.emailTemplates.filter((template) => !template.builtIn);
  const overrides = new Map(
    store.emailTemplates.filter((template) => template.builtIn).map((template) => [template.id, template]),
  );
  const emailTemplates = [
    ...BUILT_IN_EMAIL_TEMPLATES.map((template) => overrides.get(template.id) || template),
    ...custom,
  ];
  return {
    people: store.people,
    emails: store.emails,
    emailTemplates,
  };
}

async function writeStore(store: WorkspaceStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function nowIso(): string {
  return new Date().toISOString();
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isPersonKind(value: unknown): value is PersonKind {
  return value === 'user' || value === 'client';
}

function isEmailStatus(value: unknown): value is EmailStatus {
  return value === 'draft' || value === 'sent' || value === 'failed';
}

export async function getWorkspace(): Promise<WorkspaceStore> {
  return enqueue(() => readStore());
}

export async function listPeople(kind?: PersonKind): Promise<WorkspacePerson[]> {
  const store = await getWorkspace();
  const people = kind ? store.people.filter((person) => person.kind === kind) : store.people;
  return people.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createPerson(input: PersonInput): Promise<WorkspacePerson> {
  const name = cleanText(input.name);
  if (!name) {
    throw new Error('Name is required');
  }
  if (!isPersonKind(input.kind)) {
    throw new Error('Kind must be user or client');
  }

  const timestamp = nowIso();
  const person: WorkspacePerson = {
    id: randomUUID(),
    kind: input.kind,
    name,
    email: cleanText(input.email),
    phone: cleanText(input.phone),
    company: cleanText(input.company),
    role: cleanText(input.role),
    notes: cleanText(input.notes),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return enqueue(async () => {
    const store = await readStore();
    store.people.unshift(person);
    await writeStore(store);
    return person;
  });
}

export async function updatePerson(id: string, input: PersonInput): Promise<WorkspacePerson> {
  return enqueue(async () => {
    const store = await readStore();
    const index = store.people.findIndex((person) => person.id === id);
    if (index === -1) {
      throw new Error('Person not found');
    }

    const current = store.people[index];
    const next: WorkspacePerson = {
      ...current,
      name: input.name !== undefined ? cleanText(input.name) : current.name,
      email: input.email !== undefined ? cleanText(input.email) : current.email,
      phone: input.phone !== undefined ? cleanText(input.phone) : current.phone || '',
      company: input.company !== undefined ? cleanText(input.company) : current.company,
      role: input.role !== undefined ? cleanText(input.role) : current.role,
      notes: input.notes !== undefined ? cleanText(input.notes) : current.notes,
      kind: isPersonKind(input.kind) ? input.kind : current.kind,
      updatedAt: nowIso(),
    };

    if (!next.name) {
      throw new Error('Name is required');
    }

    store.people[index] = next;
    await writeStore(store);
    return next;
  });
}

export async function deletePerson(id: string): Promise<void> {
  return enqueue(async () => {
    const store = await readStore();
    const nextPeople = store.people.filter((person) => person.id !== id);
    if (nextPeople.length === store.people.length) {
      throw new Error('Person not found');
    }
    store.people = nextPeople;
    store.emails = store.emails.map((email) =>
      email.relatedPersonId === id ? { ...email, relatedPersonId: undefined } : email,
    );
    await writeStore(store);
  });
}

export async function listEmails(): Promise<WorkspaceEmail[]> {
  const store = await getWorkspace();
  return [...store.emails].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getEmail(id: string): Promise<WorkspaceEmail | null> {
  const store = await getWorkspace();
  return store.emails.find((email) => email.id === id) || null;
}

export async function createEmail(input: EmailInput): Promise<WorkspaceEmail> {
  const to = cleanText(input.to);
  const subject = cleanText(input.subject);
  if (!to) {
    throw new Error('Recipient is required');
  }
  if (!subject) {
    throw new Error('Subject is required');
  }

  const timestamp = nowIso();
  const email: WorkspaceEmail = {
    id: randomUUID(),
    to,
    subject,
    body: typeof input.body === 'string' ? input.body : '',
    status: isEmailStatus(input.status) ? input.status : 'draft',
    relatedPersonId: input.relatedPersonId || undefined,
    templateId: input.templateId || undefined,
    templateName: input.templateName || undefined,
    from: input.from || undefined,
    error: input.error || undefined,
    sentAt: input.sentAt || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return enqueue(async () => {
    const store = await readStore();
    store.emails.unshift(email);
    await writeStore(store);
    return email;
  });
}

export async function updateEmail(id: string, input: EmailInput): Promise<WorkspaceEmail> {
  return enqueue(async () => {
    const store = await readStore();
    const index = store.emails.findIndex((email) => email.id === id);
    if (index === -1) {
      throw new Error('Email not found');
    }

    const current = store.emails[index];
    const next: WorkspaceEmail = {
      ...current,
      to: input.to !== undefined ? cleanText(input.to) : current.to,
      subject: input.subject !== undefined ? cleanText(input.subject) : current.subject,
      body: input.body !== undefined ? String(input.body) : current.body,
      status: isEmailStatus(input.status) ? input.status : current.status,
      relatedPersonId:
        input.relatedPersonId === null
          ? undefined
          : input.relatedPersonId !== undefined
            ? input.relatedPersonId
            : current.relatedPersonId,
      templateId:
        input.templateId === null
          ? undefined
          : input.templateId !== undefined
            ? input.templateId
            : current.templateId,
      templateName:
        input.templateName === null
          ? undefined
          : input.templateName !== undefined
            ? input.templateName
            : current.templateName,
      from: input.from === null ? undefined : input.from !== undefined ? input.from : current.from,
      error: input.error === null ? undefined : input.error !== undefined ? input.error : current.error,
      sentAt: input.sentAt === null ? undefined : input.sentAt !== undefined ? input.sentAt : current.sentAt,
      updatedAt: nowIso(),
    };

    if (!next.to) {
      throw new Error('Recipient is required');
    }
    if (!next.subject) {
      throw new Error('Subject is required');
    }

    store.emails[index] = next;
    await writeStore(store);
    return next;
  });
}

export async function deleteEmail(id: string): Promise<void> {
  return enqueue(async () => {
    const store = await readStore();
    const nextEmails = store.emails.filter((email) => email.id !== id);
    if (nextEmails.length === store.emails.length) {
      throw new Error('Email not found');
    }
    store.emails = nextEmails;
    await writeStore(store);
  });
}

export async function getPerson(id: string): Promise<WorkspacePerson | null> {
  const store = await getWorkspace();
  return store.people.find((person) => person.id === id) || null;
}

export async function findPersonByRecipient(value: string): Promise<WorkspacePerson | null> {
  const needle = cleanText(value).toLowerCase();
  if (!needle) return null;
  const store = await getWorkspace();
  return (
    store.people.find((person) => person.email.toLowerCase() === needle) ||
    store.people.find((person) => person.name.toLowerCase() === needle) ||
    store.people.find((person) => person.name.toLowerCase().includes(needle)) ||
    null
  );
}

export async function listEmailTemplates(): Promise<WorkspaceEmailTemplate[]> {
  const store = await getWorkspace();
  return [...store.emailTemplates].sort((a, b) => {
    if (a.builtIn !== b.builtIn) return a.builtIn ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getEmailTemplate(id: string): Promise<WorkspaceEmailTemplate | null> {
  const store = await getWorkspace();
  return store.emailTemplates.find((template) => template.id === id) || null;
}

export async function findEmailTemplate(value: string): Promise<WorkspaceEmailTemplate | null> {
  const needle = cleanText(value).toLowerCase();
  if (!needle) return null;
  const templates = await listEmailTemplates();
  return (
    templates.find((template) => template.id.toLowerCase() === needle) ||
    templates.find((template) => template.name.toLowerCase() === needle) ||
    templates.find((template) => template.name.toLowerCase().includes(needle)) ||
    null
  );
}

export async function createEmailTemplate(input: EmailTemplateInput): Promise<WorkspaceEmailTemplate> {
  const name = cleanText(input.name);
  const subject = cleanText(input.subject);
  if (!name) throw new Error('Template name is required');
  if (!subject) throw new Error('Template subject is required');

  const timestamp = nowIso();
  const template: WorkspaceEmailTemplate = {
    id: randomUUID(),
    name,
    description: cleanText(input.description),
    subject,
    body: typeof input.body === 'string' ? input.body : '',
    builtIn: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return enqueue(async () => {
    const store = await readStore();
    store.emailTemplates.push(template);
    await writeStore(store);
    return template;
  });
}

export async function updateEmailTemplate(id: string, input: EmailTemplateInput): Promise<WorkspaceEmailTemplate> {
  return enqueue(async () => {
    const store = await readStore();
    const index = store.emailTemplates.findIndex((template) => template.id === id);
    if (index === -1) {
      throw new Error('Template not found');
    }

    const current = store.emailTemplates[index];
    const next: WorkspaceEmailTemplate = {
      ...current,
      name: input.name !== undefined ? cleanText(input.name) : current.name,
      description: input.description !== undefined ? cleanText(input.description) : current.description,
      subject: input.subject !== undefined ? cleanText(input.subject) : current.subject,
      body: input.body !== undefined ? String(input.body) : current.body,
      updatedAt: nowIso(),
    };

    if (!next.name) throw new Error('Template name is required');
    if (!next.subject) throw new Error('Template subject is required');

    store.emailTemplates[index] = next;
    await writeStore(store);
    return next;
  });
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  return enqueue(async () => {
    const store = await readStore();
    const current = store.emailTemplates.find((template) => template.id === id);
    if (!current) throw new Error('Template not found');
    if (current.builtIn) {
      throw new Error('Built-in templates cannot be deleted. Edit the copy instead.');
    }
    store.emailTemplates = store.emailTemplates.filter((template) => template.id !== id);
    await writeStore(store);
  });
}
