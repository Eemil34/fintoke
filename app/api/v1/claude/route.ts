import { NextRequest, NextResponse } from 'next/server';
import { agentOrigin, agentOptions, AGENT_CORS_HEADERS } from '@/lib/agent-api/http';
import { claudeConnectorInstructions } from '@/lib/agent-api/docs';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  const body = claudeConnectorInstructions(agentOrigin(request));
  const response = new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...AGENT_CORS_HEADERS,
    },
  });
  return response;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
