import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgentKey, AgentApiError, type AgentApiKeyRecord } from './keys';
import { getLinkedConnectorKey } from './connector';
import { hasScope, type AgentScope } from './scopes';

export const AGENT_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id, Last-Event-ID, Mcp-Method, Mcp-Name',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, MCP-Protocol-Version, WWW-Authenticate',
};

export function appOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    `http://localhost:${process.env.PORT || process.env.WEB_PORT || 3002}`;
  return raw.replace(/\/$/, '');
}

export function publicAgentOrigin(): string | null {
  const raw = process.env.AGENT_PUBLIC_URL?.trim();
  return raw ? raw.replace(/\/$/, '') : null;
}

export function isLocalOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local');
  } catch {
    return true;
  }
}

export function agentOrigin(request: NextRequest): string {
  const configured = publicAgentOrigin();
  if (configured) return configured;

  const forwarded = request.headers.get('x-forwarded-proto');
  const proto = forwarded || (request.nextUrl.protocol.replace(':', '') || 'http');
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.host ||
    'localhost:3002';
  return `${proto}://${host}`;
}

export function agentCors(response: NextResponse): NextResponse {
  Object.entries(AGENT_CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function agentJson(data: unknown, status = 200): NextResponse {
  return agentCors(NextResponse.json(data, { status }));
}

export function agentOptions(): NextResponse {
  return agentCors(new NextResponse(null, { status: 204 }));
}

function normalizeSecret(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim().replace(/^["']|["']$/g, '');
  if (value.toLowerCase().startsWith('bearer ')) {
    value = value.slice(7).trim();
  }
  return value || null;
}

export function extractAgentToken(request: NextRequest): string | null {
  const headerNames = [
    'authorization',
    'x-api-key',
    'x-auth-token',
    'api-key',
    'x-claudable-key',
  ];
  for (const name of headerNames) {
    const value = normalizeSecret(request.headers.get(name));
    if (value?.startsWith('clb_')) return value;
  }

  const queryNames = ['api_key', 'key', 'token'];
  for (const name of queryNames) {
    const value = normalizeSecret(request.nextUrl.searchParams.get(name));
    if (value?.startsWith('clb_')) return value;
  }

  const pathMatch = request.nextUrl.pathname.match(/\/(clb_[A-Za-z0-9_]+)/);
  if (pathMatch?.[1]) return pathMatch[1];

  return null;
}

function assertScope(key: AgentApiKeyRecord, scope?: AgentScope | AgentScope[]) {
  if (scope && !hasScope(key.scopes, scope)) {
    const needed = Array.isArray(scope) ? scope.join(', ') : scope;
    throw new AgentApiError(`This key is missing permission: ${needed}`, 403);
  }
}

export async function requireAgentKey(
  request: NextRequest,
  scope?: AgentScope | AgentScope[],
): Promise<AgentApiKeyRecord> {
  const token = extractAgentToken(request);
  if (!token) {
    throw new AgentApiError('Missing API key. Send Authorization: Bearer clb_live_…', 401);
  }
  const key = await authenticateAgentKey(token);
  assertScope(key, scope);
  return key;
}

export async function requireMcpAgentKey(
  request: NextRequest,
  scope?: AgentScope | AgentScope[],
): Promise<AgentApiKeyRecord> {
  const token = extractAgentToken(request);
  if (token) {
    const key = await authenticateAgentKey(token);
    assertScope(key, scope);
    return key;
  }

  const linked = await getLinkedConnectorKey();
  if (linked) {
    assertScope(linked, scope);
    return linked;
  }

  throw new AgentApiError(
    'No Claudable API key is active. Open https://www.fintoke.com/dashboard/settings?tab=api-keys , click Generate API key, then ask again in this chat.',
    401,
  );
}

export function agentErrorResponse(error: unknown): NextResponse {
  if (error instanceof AgentApiError) {
    return agentJson({ success: false, error: error.message }, error.status);
  }
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status =
    error instanceof Error && 'status' in error && typeof (error as { status?: unknown }).status === 'number'
      ? ((error as { status: number }).status ?? 500)
      : message.toLowerCase().includes('not configured')
        ? 400
        : message.toLowerCase().includes('not found')
          ? 404
          : 500;
  console.error('[Agent API]', error);
  return agentJson({ success: false, error: message }, status);
}
