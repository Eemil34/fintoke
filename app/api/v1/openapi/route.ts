import { NextRequest } from 'next/server';
import { agentJson, agentOptions, agentOrigin } from '@/lib/agent-api/http';
import { agentOpenApiSpec } from '@/lib/agent-api/docs';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  return agentJson(agentOpenApiSpec(agentOrigin(request)));
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
