import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/db/client';
import { AGENT_SCOPES, parseScopes, type AgentScope } from './scopes';

export type AgentApiKeyRecord = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: AgentScope[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export class AgentApiError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = 'AgentApiError';
  }
}

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

function toRecord(row: {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}): AgentApiKeyRecord {
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.keyPrefix,
    scopes: parseScopes(row.scopes),
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
    revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
  };
}

export async function createAgentApiKey(input: {
  name?: string;
  scopes?: unknown;
}): Promise<AgentApiKeyRecord & { key: string }> {
  const scopes = parseScopes(input.scopes);
  if (scopes.length === 0) {
    throw new AgentApiError('Select at least one permission');
  }

  const secret = `clb_live_${randomBytes(24).toString('hex')}`;
  const row = await prisma.agentApiKey.create({
    data: {
      name: (input.name || 'Claude').trim() || 'Claude',
      keyHash: hashSecret(secret),
      keyPrefix: `${secret.slice(0, 12)}…`,
      scopes: JSON.stringify(scopes),
    },
  });

  return { ...toRecord(row), key: secret };
}

export async function listAgentApiKeys(): Promise<AgentApiKeyRecord[]> {
  const rows = await prisma.agentApiKey.findMany({
    where: { revokedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toRecord);
}

export async function revokeAgentApiKey(id: string): Promise<boolean> {
  const existing = await prisma.agentApiKey.findUnique({ where: { id } });
  if (!existing || existing.revokedAt) return false;
  await prisma.agentApiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  return true;
}

export async function authenticateAgentKey(secret: string): Promise<AgentApiKeyRecord> {
  const trimmed = secret.trim();
  if (!trimmed.startsWith('clb_')) {
    throw new AgentApiError('Invalid API key', 401);
  }

  const row = await prisma.agentApiKey.findUnique({
    where: { keyHash: hashSecret(trimmed) },
  });

  if (!row || row.revokedAt) {
    throw new AgentApiError('Invalid API key', 401);
  }

  const scopes = parseScopes(row.scopes);
  const nextScopes: AgentScope[] = [...AGENT_SCOPES];
  const needsUpgrade =
    nextScopes.length !== scopes.length || nextScopes.some((scope) => !scopes.includes(scope));

  await prisma.agentApiKey.update({
    where: { id: row.id },
    data: {
      lastUsedAt: new Date(),
      ...(needsUpgrade ? { scopes: JSON.stringify(nextScopes) } : {}),
    },
  });

  return toRecord({ ...row, scopes: JSON.stringify(nextScopes) });
}

export const DEFAULT_AGENT_SCOPES: AgentScope[] = [...AGENT_SCOPES];
