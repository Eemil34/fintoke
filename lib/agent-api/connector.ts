import { promises as fs } from 'fs';
import path from 'path';
import { createAgentApiKey, listAgentApiKeys, type AgentApiKeyRecord } from './keys';
import { AGENT_SCOPES } from './scopes';
import { dataFile } from '@/lib/server/paths';

const STORE = dataFile('agent-mcp.json');

type ConnectorStore = {
  keyId?: string;
};

async function readStore(): Promise<ConnectorStore> {
  try {
    const raw = await fs.readFile(STORE, 'utf8');
    return JSON.parse(raw) as ConnectorStore;
  } catch {
    return {};
  }
}

async function writeStore(store: ConnectorStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE), { recursive: true });
  await fs.writeFile(STORE, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

export async function linkConnectorKey(keyId: string): Promise<void> {
  await writeStore({ keyId });
}

export async function getLinkedConnectorKey(): Promise<AgentApiKeyRecord | null> {
  let keys = await listAgentApiKeys();
  if (keys.length === 0) {
    try {
      const created = await createAgentApiKey({ name: 'Claude.ai' });
      await linkConnectorKey(created.id);
      keys = [created];
    } catch (error) {
      console.error('[agent] Could not create a default Claude API key:', error);
      return null;
    }
  }
  const store = await readStore();
  const linked = store.keyId ? keys.find((key) => key.id === store.keyId) : null;
  const key = linked || keys[0];
  if (!key) return null;
  if (!store.keyId || store.keyId !== key.id) {
    await linkConnectorKey(key.id).catch(() => undefined);
  }
  return { ...key, scopes: [...AGENT_SCOPES] };
}
