import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db/client';
import { dataFile } from '@/lib/server/paths';

const BACKUP_PATH = dataFile('service-tokens.json');

type TokenBackup = Record<string, { name: string; token: string }>;

let restoreOnce: Promise<void> | null = null;

async function readBackup(): Promise<TokenBackup> {
  try {
    const parsed = JSON.parse(await fs.readFile(BACKUP_PATH, 'utf8')) as TokenBackup;
    if (!parsed || typeof parsed !== 'object') return {};
    const next: TokenBackup = {};
    for (const [provider, value] of Object.entries(parsed)) {
      if (value && typeof value.token === 'string' && value.token.trim()) {
        next[provider] = {
          name: typeof value.name === 'string' && value.name.trim() ? value.name : provider,
          token: value.token.trim(),
        };
      }
    }
    return next;
  } catch {
    return {};
  }
}

async function writeBackup(backup: TokenBackup): Promise<void> {
  await fs.mkdir(path.dirname(BACKUP_PATH), { recursive: true });
  await fs.writeFile(BACKUP_PATH, `${JSON.stringify(backup, null, 2)}\n`, 'utf8');
}

export async function snapshotServiceTokens(): Promise<void> {
  const rows = await prisma.serviceToken.findMany();
  const fromDb: TokenBackup = {};
  for (const row of rows) {
    if (row.token?.trim()) {
      fromDb[row.provider] = { name: row.name || row.provider, token: row.token.trim() };
    }
  }
  const existing = await readBackup();
  if (Object.keys(fromDb).length === 0) return;
  await writeBackup({ ...existing, ...fromDb });
}

export async function restoreServiceTokens(): Promise<void> {
  if (!restoreOnce) {
    restoreOnce = (async () => {
      const backup = await readBackup();
      for (const [provider, value] of Object.entries(backup)) {
        const existing = await prisma.serviceToken.findFirst({ where: { provider } });
        if (existing) continue;
        await prisma.serviceToken.create({
          data: {
            provider,
            name: value.name,
            token: value.token,
          },
        });
      }
      await snapshotServiceTokens();
    })().catch((error) => {
      console.error('[tokens] Failed to restore service tokens from volume backup:', error);
    });
  }
  await restoreOnce;
}

export async function upsertTokenBackup(provider: string, name: string, token: string): Promise<void> {
  const backup = await readBackup();
  backup[provider] = { name, token };
  await writeBackup(backup);
}

export async function removeTokenBackup(provider: string): Promise<void> {
  const backup = await readBackup();
  delete backup[provider];
  await writeBackup(backup);
}
