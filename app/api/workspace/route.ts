import { listLeads } from '@/lib/services/leads';
import { getWorkspace } from '@/lib/services/workspace';
import { createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function GET() {
  try {
    const [store, leads] = await Promise.all([getWorkspace(), listLeads()]);
    return createSuccessResponse({
      people: store.people,
      emails: store.emails,
      counts: {
        users: store.people.filter((person) => person.kind === 'user').length,
        clients: store.people.filter((person) => person.kind === 'client').length,
        emails: store.emails.length,
        drafts: store.emails.filter((email) => email.status === 'draft').length,
        sent: store.emails.filter((email) => email.status === 'sent').length,
        templates: store.emailTemplates.length,
        work: leads.length,
      },
    });
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to load workspace');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
