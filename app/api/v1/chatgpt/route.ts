import { NextRequest, NextResponse } from 'next/server';
import { agentOrigin, agentOptions, AGENT_CORS_HEADERS } from '@/lib/agent-api/http';
import { chatgptConnectorInstructions } from '@/lib/agent-api/docs';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  const body = chatgptConnectorInstructions(agentOrigin(request));
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...AGENT_CORS_HEADERS,
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
