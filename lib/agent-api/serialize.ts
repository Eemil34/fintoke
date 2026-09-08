import { appOrigin } from '@/lib/agent-api/http';
import { getProjectById } from '@/lib/services/project';
import { listProjectServices } from '@/lib/services/project-services';
import { getActiveRequests } from '@/lib/services/user-requests';
import { previewManager } from '@/lib/services/preview';
import { serializeProject } from '@/lib/serializers/project';
import { getCurrentDeploymentStatus } from '@/lib/services/vercel';
import { getWebsiteTemplateId } from '@/lib/templates/settings';
import type { Project as ProjectEntity } from '@/types/backend';

export async function serializeAgentSite(project: ProjectEntity, origin: string) {
  const [services, active, preview] = await Promise.all([
    listProjectServices(project.id),
    getActiveRequests(project.id),
    Promise.resolve(previewManager.getStatus(project.id)),
  ]);

  let deployment: Awaited<ReturnType<typeof getCurrentDeploymentStatus>> | null = null;
  try {
    deployment = await getCurrentDeploymentStatus(project.id);
  } catch {
    deployment = null;
  }

  const github = services.find((service) => service.provider === 'github');
  const vercel = services.find((service) => service.provider === 'vercel');
  const githubData = (github?.serviceData ?? {}) as Record<string, string>;
  const vercelData = (vercel?.serviceData ?? {}) as Record<string, string>;

  return {
    ...serializeProject(project),
    templateId: getWebsiteTemplateId(project.settings),
    chatUrl: `${appOrigin()}/${project.id}/chat`,
    apiBase: `${origin.replace(/\/$/, '')}/api/v1`,
    preview: {
      url: preview.url || project.previewUrl,
      port: preview.port || project.previewPort,
      status: preview.status,
    },
    job: {
      running: active.hasActiveRequests,
      activeCount: active.activeCount,
    },
    github: github
      ? {
          connected: true,
          repoUrl: githubData.repo_url ?? null,
        }
      : { connected: false, repoUrl: null },
    vercel: vercel
      ? {
          connected: true,
          projectUrl: vercelData.project_url ?? null,
          deploymentUrl: deployment?.deployment_url || vercelData.last_deployment_url || null,
          status: deployment?.status || vercelData.last_deployment_status || null,
        }
      : { connected: false, projectUrl: null, deploymentUrl: null, status: null },
  };
}

export async function getSerializedAgentSite(projectId: string, origin: string) {
  const project = await getProjectById(projectId);
  if (!project) return null;
  return serializeAgentSite(project, origin);
}
