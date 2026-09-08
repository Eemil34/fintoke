import { NextRequest } from 'next/server';
import { listEmails } from '@/lib/services/workspace';
import { agentErrorResponse, agentJson, agentOptions, requireAgentKey } from '@/lib/agent-api/http';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  try {
    await requireAgentKey(request, 'emails:read');
    const emails = await listEmails();
    return agentJson({
      success: true,
      data: emails.map((email) => ({
        id: email.id,
        to: email.to,
        subject: email.subject,
        body: email.body,
        status: email.status,
        templateId: email.templateId,
        templateName: email.templateName,
        from: email.from,
        error: email.error,
        sentAt: email.sentAt,
        createdAt: email.createdAt,
      })),
    });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
