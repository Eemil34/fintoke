import { NextRequest } from 'next/server';
import { createPerson, listPeople } from '@/lib/services/workspace';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  try {
    await requireAgentKey(request, 'emails:read');
    const kind = request.nextUrl.searchParams.get('kind');
    const people = await listPeople(kind === 'user' || kind === 'client' ? kind : undefined);
    return agentJson({ success: true, data: people });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAgentKey(request, 'people:write');
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const person = await createPerson(body);
    return agentJson({ success: true, data: person }, 201);
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
