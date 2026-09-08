import { NextRequest } from 'next/server';
import { createProject, getAllProjects } from '@/lib/services/project';
import { generateProjectId } from '@/lib/utils';
import { getDefaultModelForCli, normalizeModelId } from '@/lib/constants/cliModels';
import { listManagedTemplates } from '@/lib/templates/store';
import { suggestWebsiteTemplate } from '@/lib/templates/match';
import { startProjectInstruction } from '@/lib/services/agentRun';
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

function siteNameFromPrompt(prompt: string, name?: string): string {
  if (name?.trim()) return name.trim().slice(0, 50);
  const line = prompt.split('\n')[0]?.trim() || 'New site';
  return line.length > 50 ? `${line.slice(0, 47)}...` : line;
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
    if (start && !key.scopes.includes('sites:edit')) {
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
    const suggested = suggestWebsiteTemplate(prompt, templates);
    const templateId = requestedTemplate || suggested?.id || undefined;

    const projectId = generateProjectId();
    const project = await createProject({
      project_id: projectId,
      name: siteNameFromPrompt(prompt, typeof body.name === 'string' ? body.name : undefined),
      initialPrompt: prompt,
      preferredCli: cli,
      selectedModel: normalizeModelId(cli, getDefaultModelForCli(cli)),
      description: prompt.slice(0, 180),
      websiteTemplateId: templateId,
    });

    const origin = agentOrigin(request);
    let job: { requestId: string; userMessageId: string } | null = null;
    if (start) {
      job = await startProjectInstruction({
        projectId,
        instruction: prompt,
        cliPreference: cli,
        isInitialPrompt: true,
      });
    }

    let published = null;
    let timedOut = false;
    if (publish) {
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
          jobStarted: job,
          published,
          timedOut,
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
