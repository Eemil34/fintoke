import { prisma } from '@/lib/db/client';
import {
  findTokenBackupById,
  readTokenBackup,
  removeTokenBackup,
  touchTokenBackup,
  upsertTokenBackup,
  type TokenBackupRecord,
} from '@/lib/services/tokenBackup';

const SUPPORTED_PROVIDERS = ['github', 'supabase', 'vercel'] as const;
export type ServiceProvider = (typeof SUPPORTED_PROVIDERS)[number];

interface ServiceTokenRecord {
  id: string;
  provider: ServiceProvider;
  name: string;
  token: string | null;
  created_at: string;
  last_used: string | null;
}

function assertProvider(provider: string): asserts provider is ServiceProvider {
  if (!SUPPORTED_PROVIDERS.includes(provider as ServiceProvider)) {
    throw new Error('Invalid provider');
  }
}

function fromBackup(provider: ServiceProvider, record: TokenBackupRecord): ServiceTokenRecord {
  return {
    id: record.id,
    provider,
    name: record.name,
    token: record.token,
    created_at: record.created_at,
    last_used: record.last_used,
  };
}

async function syncPrisma(record: ServiceTokenRecord): Promise<void> {
  try {
    await prisma.serviceToken.deleteMany({ where: { provider: record.provider } });
    await prisma.serviceToken.create({
      data: {
        id: record.id,
        provider: record.provider,
        name: record.name,
        token: record.token || '',
        createdAt: new Date(record.created_at),
        lastUsed: record.last_used ? new Date(record.last_used) : null,
      },
    });
  } catch (error) {
    console.error('[tokens] SQLite sync failed; volume JSON is the source of truth:', error);
  }
}

async function importFromPrisma(provider: ServiceProvider): Promise<TokenBackupRecord | null> {
  try {
    const row = await prisma.serviceToken.findFirst({
      where: { provider },
      orderBy: { createdAt: 'desc' },
    });
    if (!row?.token?.trim()) return null;
    return upsertTokenBackup(provider, row.name, row.token, {
      id: row.id,
      created_at: row.createdAt.toISOString(),
      last_used: row.lastUsed ? row.lastUsed.toISOString() : null,
    });
  } catch (error) {
    console.error('[tokens] Could not import token from SQLite:', error);
    return null;
  }
}

export async function createServiceToken(
  provider: string,
  token: string,
  name: string,
): Promise<ServiceTokenRecord> {
  assertProvider(provider);

  if (!token.trim()) {
    throw new Error('Token cannot be empty');
  }

  const stored = await upsertTokenBackup(
    provider,
    name.trim() || `${provider.charAt(0).toUpperCase()}${provider.slice(1)} Token`,
    token.trim(),
  );
  const record = fromBackup(provider, stored);
  await syncPrisma(record);
  return record;
}

export async function getServiceToken(provider: string): Promise<ServiceTokenRecord | null> {
  assertProvider(provider);

  const backup = await readTokenBackup();
  const saved = backup[provider];
  if (saved) return fromBackup(provider, saved);

  const imported = await importFromPrisma(provider);
  return imported ? fromBackup(provider, imported) : null;
}

export async function deleteServiceToken(tokenId: string): Promise<boolean> {
  const found = await findTokenBackupById(tokenId);
  if (found) {
    await removeTokenBackup(found.provider);
    try {
      await prisma.serviceToken.deleteMany({ where: { provider: found.provider } });
    } catch {
      // JSON already removed.
    }
    return true;
  }

  try {
    const existing = await prisma.serviceToken.findUnique({ where: { id: tokenId } });
    await prisma.serviceToken.delete({ where: { id: tokenId } });
    if (existing?.provider) await removeTokenBackup(existing.provider);
    return true;
  } catch {
    return false;
  }
}

export async function getPlainServiceToken(provider: string): Promise<string | null> {
  const record = await getServiceToken(provider);
  return record?.token ?? null;
}

export async function touchServiceToken(provider: string): Promise<void> {
  assertProvider(provider);
  await touchTokenBackup(provider);
  try {
    await prisma.serviceToken.updateMany({
      where: { provider },
      data: { lastUsed: new Date() },
    });
  } catch {
    // JSON already updated.
  }
}
