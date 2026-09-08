import { getPlainServiceToken } from '@/lib/services/tokens';
import { getProjectById } from '@/lib/services/project';
import { getProjectService } from '@/lib/services/project-services';
import { connectProjectToGitHub, checkRepositoryAvailability } from '@/lib/services/github';
import { connectVercelProject, checkVercelProjectAvailability, triggerVercelDeployment } from '@/lib/services/vercel';
import { AgentApiError } from '@/lib/agent-api/keys';

function resourceSlug(name: string, projectId: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 28) || 'site';
  const suffix = projectId.replace(/[^a-z0-9]/g, '').slice(-6);
  return `${base}-${suffix}`.slice(0, 40);
}

export async function publishSite(projectId: string) {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new AgentApiError('Site not found', 404);
  }

  const vercelToken = await getPlainServiceToken('vercel');
  if (!vercelToken) {
    throw new AgentApiError(
      'Vercel is not connected in Settings → Services. Add a Vercel token before publishing.',
      400,
    );
  }

  const slug = resourceSlug(project.name, projectId);
  const githubToken = await getPlainServiceToken('github');
  let github: { repo_url?: string; owner?: string } | null = null;

  if (githubToken) {
    const existingGithub = await getProjectService(projectId, 'github');
    if (!existingGithub) {
      let repoName = slug;
      try {
        const availability = await checkRepositoryAvailability(repoName);
        if (availability.exists) {
          repoName = `${slug.slice(0, 32)}-site`;
        }
      } catch {
        // continue with slug
      }
      github = await connectProjectToGitHub(projectId, {
        repoName,
        description: project.description || project.initialPrompt || project.name,
        private: false,
      });
    } else {
      const data = existingGithub.serviceData as Record<string, string>;
      github = { repo_url: data.repo_url, owner: data.owner };
    }
  }

  const existingVercel = await getProjectService(projectId, 'vercel');
  if (!existingVercel) {
    let projectName = slug;
    try {
      const availability = await checkVercelProjectAvailability(projectName);
      if (!availability.available) {
        projectName = `${slug}-app`.slice(0, 40);
      }
    } catch {
      // continue
    }
    await connectVercelProject(projectId, projectName);
  }

  const deployment = await triggerVercelDeployment(projectId);
  return {
    github,
    deployment: {
      id: deployment.deploymentId ?? null,
      url: deployment.deploymentUrl ?? null,
      status: deployment.status ?? null,
    },
  };
}
