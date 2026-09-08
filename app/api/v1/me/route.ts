import { NextRequest } from 'next/server';
import { agentJson, agentOptions, requireAgentKey, agentErrorResponse } from '@/lib/agent-api/http';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  try {
    const key = await requireAgentKey(request);
    return agentJson({
      success: true,
      data: {
        name: key.name,
        prefix: key.keyPrefix,
        scopes: key.scopes,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
      },
    });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
