import { NextRequest } from 'next/server';
import { createLead, deleteAllLeads, deleteLeads, leadToCsv, listLeads } from '@/lib/services/leads';
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const leads = await listLeads();
    const format = request.nextUrl.searchParams.get('format');
    if (format === 'emails') {
      const emails = [...new Set(leads.map((row) => row.email.trim().toLowerCase()).filter(Boolean))];
      return new Response(`${emails.join('\n')}\n`, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="work-emails.txt"',
        },
      });
    }
    if (format === 'csv') {
      return new Response(leadToCsv(leads), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="work.csv"',
        },
      });
    }
    return createSuccessResponse(leads);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to list work rows');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const lead = await createLead(body);
    return createSuccessResponse(lead, 201);
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to add row');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { all?: boolean; ids?: string[] };
    const removed = body.all
      ? await deleteAllLeads()
      : await deleteLeads(Array.isArray(body.ids) ? body.ids : []);
    return createSuccessResponse({ removed });
  } catch (error) {
    return handleApiError(error, 'API', 'Failed to delete rows');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
