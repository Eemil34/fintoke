import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import { dataFile } from '@/lib/server/paths';
import { writeJsonAtomic } from '@/lib/server/atomicJson';

const BACKUP_PATH = dataFile('service-tokens.json');

export type TokenBackupRecord = {
  id: string;
  name: string;
  token: string;
  created_at: string;
  last_used: string | null;
};

export type TokenBackup = Record<string, TokenBackupRecord>;

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function asRecord(provider: string, value: unknown): TokenBackupRecord | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const token = typeof row.token === 'string' ? row.token.trim() : '';
  if (!token) return null;
  const created =
    typeof row.created_at === 'string' && row.created_at.trim()
      ? row.created_at
      : typeof row.createdAt === 'string' && row.createdAt.trim()
        ? row.createdAt
        : new Date().toISOString();
  const lastUsed =
    typeof row.last_used === 'string' && row.last_used.trim()
      ? row.last_used
      : typeof row.lastUsed === 'string' && row.lastUsed.trim()
        ? row.lastUsed
        : null;
  return {
    id: typeof row.id === 'string' && row.id.trim() ? row.id : randomUUID(),
    name:
      typeof row.name === 'string' && row.name.trim()
        ? row.name
        : `${provider.charAt(0).toUpperCase()}${provider.slice(1)} Token`,
    token,
    created_at: created,
    last_used: lastUsed,
  };
}

export async function readTokenBackup(): Promise<TokenBackup> {
  try {
    const parsed = JSON.parse(await fs.readFile(BACKUP_PATH, 'utf8')) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const next: TokenBackup = {};
    for (const [provider, value] of Object.entries(parsed as Record<string, unknown>)) {
      const record = asRecord(provider, value);
      if (record) next[provider] = record;
    }
    return next;
  } catch {
    return {};
  }
}

async function writeTokenBackup(backup: TokenBackup): Promise<void> {
  await writeJsonAtomic(BACKUP_PATH, backup);
}

export async function upsertTokenBackup(
  provider: string,
  name: string,
  token: string,
  existing?: Partial<TokenBackupRecord>,
): Promise<TokenBackupRecord> {
  return enqueue(async () => {
    const backup = await readTokenBackup();
    const current = backup[provider];
    const record: TokenBackupRecord = {
      id: existing?.id || current?.id || randomUUID(),
      name: name.trim() || current?.name || provider,
      token: token.trim(),
      created_at: existing?.created_at || current?.created_at || new Date().toISOString(),
      last_used: existing?.last_used ?? current?.last_used ?? null,
    };
    backup[provider] = record;
    await writeTokenBackup(backup);
    return record;
  });
}

export async function removeTokenBackup(provider: string): Promise<void> {
  await enqueue(async () => {
    const backup = await readTokenBackup();
    delete backup[provider];
    await writeTokenBackup(backup);
  });
}

export async function touchTokenBackup(provider: string): Promise<void> {
  await enqueue(async () => {
    const backup = await readTokenBackup();
    const current = backup[provider];
    if (!current) return;
    backup[provider] = { ...current, last_used: new Date().toISOString() };
    await writeTokenBackup(backup);
  });
}

export async function findTokenBackupById(
  tokenId: string,
): Promise<{ provider: string; record: TokenBackupRecord } | null> {
  const backup = await readTokenBackup();
  for (const [provider, record] of Object.entries(backup)) {
    if (record.id === tokenId) return { provider, record };
  }
  return null;
}
