import { NextRequest } from 'next/server';
import { createAgentApiKey, listAgentApiKeys, AgentApiError, DEFAULT_AGENT_SCOPES } from '@/lib/agent-api/keys';
import { linkConnectorKey } from '@/lib/agent-api/connector';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function GET() {
  try {
    const keys = await listAgentApiKeys();
    return createSuccessResponse(keys);
  } catch (error) {
    return handleApiError(error, 'AgentKeys', 'Failed to list API keys');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const created = await createAgentApiKey({
      name: typeof body.name === 'string' ? body.name : undefined,
      scopes: body.scopes ?? DEFAULT_AGENT_SCOPES,
    });
    await linkConnectorKey(created.id);
    return createSuccessResponse(created, 201);
  } catch (error) {
    if (error instanceof AgentApiError) {
      return createErrorResponse(error.message, undefined, error.status);
    }
    return handleApiError(error, 'AgentKeys', 'Failed to create API key');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
