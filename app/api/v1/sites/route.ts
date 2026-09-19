import { NextRequest } from 'next/server';
import { createProject, getAllProjects } from '@/lib/services/project';
import { generateProjectId } from '@/lib/utils';
import { getDefaultModelForCli, normalizeModelId } from '@/lib/constants/cliModels';
import { listManagedTemplates } from '@/lib/templates/store';
import { pickWebsiteTemplate, siteNameFromBrief } from '@/lib/templates/match';
import { startProjectInstruction } from '@/lib/services/agentRun';
import { previewManager } from '@/lib/services/preview';
import { publishSite } from '@/lib/services/publishSite';
import { waitForSiteIdle } from '@/lib/agent-api/wait';
import { serializeAgentSite } from '@/lib/agent-api/serialize';
import {
  agentErrorResponse,
  agentJson,
  agentOptions,
  agentOrigin,
  requireAgentKey,
} from '@/lib/agent-api/http';
import { AgentApiError } from '@/lib/agent-api/keys';
import { fastFillProjectFromLead, leadFromSiteBrief, wantsFastTrack } from '@/lib/templates/fastFill';
import { resolveAndPersistProjectWorkspace } from '@/lib/server/projectWorkspace';
import { resolveSnapshotTemplateId } from '@/lib/templates/snapshot';
import { hasStaticExport } from '@/lib/templates/staticSite';
import { ensureTemplateStatic } from '@/lib/templates/exportStatic';

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  try {
    await requireAgentKey(request, 'sites:read');
    const origin = agentOrigin(request);
    const projects = await getAllProjects();
    const data = await Promise.all(projects.map((project) => serializeAgentSite(project, origin)));
    return agentJson({ success: true, data });
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const key = await requireAgentKey(request, 'sites:create');
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const prompt = String(body.prompt || body.instruction || '').trim();
    if (!prompt) {
      throw new AgentApiError('prompt is required');
    }

    const start = body.start !== false;
    const publish = body.publish === true;
    const fast = wantsFastTrack({ prompt });
    if (start && !fast && !key.scopes.includes('sites:edit')) {
      throw new AgentApiError('This key cannot start the AI. Enable “Edit with AI”.', 403);
    }
    if (publish && !key.scopes.includes('sites:publish')) {
      throw new AgentApiError('This key cannot publish. Enable “Publish to Vercel”.', 403);
    }

    const cli = String(body.cli || body.preferredCli || 'claude').toLowerCase();
    const templates = await listManagedTemplates();
    const requestedTemplate =
      typeof body.templateId === 'string'
        ? body.templateId
        : typeof body.websiteTemplateId === 'string'
          ? body.websiteTemplateId
          : '';
    const picked = pickWebsiteTemplate(
      { prompt, templateId: requestedTemplate, name: typeof body.name === 'string' ? body.name : undefined },
      templates,
    );
    const templateId = picked?.id;

    const projectId = generateProjectId();
    const siteName = siteNameFromBrief(prompt, typeof body.name === 'string' ? body.name : undefined, templates);
    const project = await createProject({
      project_id: projectId,
      name: siteName,
      initialPrompt: '',
      preferredCli: cli,
      selectedModel: normalizeModelId(cli, getDefaultModelForCli(cli)),
      description: prompt.slice(0, 180),
      websiteTemplateId: templateId,
    });

    const origin = agentOrigin(request);
    let job: { requestId: string; userMessageId: string } | null = null;
    let filled = null;
    if (fast) {
      const resolvedTemplate = templateId ? await resolveSnapshotTemplateId(templateId) : '';
      let staticReady = resolvedTemplate ? await hasStaticExport(resolvedTemplate) : false;
      if (resolvedTemplate && !staticReady) {
        staticReady = await ensureTemplateStatic(resolvedTemplate).catch((error) => {
          console.warn('[sites] Static export skipped:', error);
          return false;
        });
      }
      const warming =
        resolvedTemplate && !staticReady
          ? previewManager.startSharedTemplate(resolvedTemplate).catch((error) => {
              console.warn('[sites] Template preview start skipped:', error);
            })
          : Promise.resolve();
      const projectPath = await resolveAndPersistProjectWorkspace(project, project.id);
      filled = await fastFillProjectFromLead({
        projectPath,
        lead: leadFromSiteBrief({
          prompt,
          name: siteName,
          business: body.business,
          contactName: body.contactName,
          city: body.city,
          email: body.email,
          phone: body.phone,
          website: body.website,
          whatTheyDo: body.whatTheyDo,
          audience: body.audience,
          style: body.style,
          details: body.details,
        }),
        websitePrompt: prompt,
      });
      await warming;
      if (resolvedTemplate && !staticReady) {
        await previewManager.ensureSharedReady(resolvedTemplate, 40_000).catch((error) => {
          console.warn('[sites] Template preview wait skipped:', error);
        });
      }
    } else if (start) {
      job = await startProjectInstruction({
        projectId,
        instruction: prompt,
        cliPreference: cli,
        isInitialPrompt: true,
      });
    }

    let published = null;
    let timedOut = false;
    if (!fast && publish) {
      if (start) {
        const idle = await waitForSiteIdle(projectId);
        if (!idle) timedOut = true;
      }
      if (!timedOut) {
        published = await publishSite(projectId);
      }
    }

    const site = await serializeAgentSite(project, origin);
    return agentJson(
      {
        success: true,
        data: {
          ...site,
          shareUrl: site.shareUrl,
          preview: { ...site.preview, url: site.shareUrl },
          buildMode: fast ? 'fast' : 'full',
          job: fast ? { running: false, activeCount: 0 } : site.job,
          jobStarted: job,
          filled,
          published,
          timedOut,
          next: fast
            ? 'Send shareUrl to the client. It is a Fintoke preview link. Do not wait for Vercel.'
            : undefined,
          message: timedOut
            ? 'The agent is still working. Poll GET /sites/{id} until job.running is false, then POST /sites/{id}/publish.'
            : undefined,
        },
      },
      201,
    );
  } catch (error) {
    return agentErrorResponse(error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 800;
