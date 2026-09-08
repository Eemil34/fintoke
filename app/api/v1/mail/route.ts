import { NextRequest } from 'next/server';
import { getPublicMailSettings } from '@/lib/services/mail';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  try {
    await requireAgentKey(request, 'workspace:read');
    const mail = await getPublicMailSettings();
    return agentJson({
      success: true,
      data: {
        configured: mail.configured,
        provider: mail.provider,
        fromName: mail.fromName,
        fromEmail: mail.fromEmail,
        replyTo: mail.replyTo,
      },
    });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
