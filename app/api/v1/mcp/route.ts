import { NextRequest, NextResponse } from 'next/server';
import { agentCors, agentOptions, AGENT_CORS_HEADERS } from '@/lib/agent-api/http';
import { handleMcpMessage, mcpSessionId } from '@/lib/agent-api/mcp';

function mcpHeaders(sessionId: string, unauthorized = false): Record<string, string> {
  return {
    ...AGENT_CORS_HEADERS,
    'Mcp-Session-Id': sessionId,
    'MCP-Protocol-Version': '2025-03-26',
    ...(unauthorized ? { 'WWW-Authenticate': 'Bearer realm="Claudable"' } : {}),
  };
}

export function OPTIONS() {
  return agentOptions();
}

export async function GET() {
  return agentCors(
    NextResponse.json({
      name: 'claudable',
      transport: 'streamable-http',
      methods: ['POST'],
      auth: 'Authorization: Bearer clb_live_… or ?api_key=',
    }),
  );
}

export async function DELETE() {
  return agentCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  const sessionId = mcpSessionId(request);
  const payload = await request.json().catch(() => null);
  const messages = Array.isArray(payload) ? payload : [payload];
  const results = [];

  for (const message of messages) {
    const handled = await handleMcpMessage(request, message || {});
    if (handled.body) results.push(handled.body);
  }

  if (results.length === 0) {
    return new NextResponse(null, { status: 202, headers: mcpHeaders(sessionId) });
  }

  const body = Array.isArray(payload) ? results : results[0];
  const response = NextResponse.json(body, { status: 200 });
  Object.entries(mcpHeaders(sessionId)).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
