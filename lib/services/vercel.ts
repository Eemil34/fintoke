import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { VERCEL_SAFE_INSTALL_COMMAND } from '@/lib/constants/generatedApp';
import { getPlainServiceToken } from '@/lib/services/tokens';
import { upsertProjectServiceConnection, updateProjectServiceData, getProjectService } from '@/lib/services/project-services';
import { getProjectById } from '@/lib/services/project';
import { listEnvVars } from '@/lib/services/env';
import { validateProjectExists, getProjectGitHubRepo } from '@/lib/services/service-integration';
import type {
  CheckResult,
  VercelProjectResponse,
  VercelDeploymentsResponse,
  VercelProjectServiceData,
  DeploymentStatusResponse,
} from '@/types/shared';

const VERCEL_API_BASE = 'https://api.vercel.com';

class VercelError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'VercelError';
  }
}

async function vercelFetch<T = any>(
  token: string,
  endpoint: string,
  {
    method = 'GET',
    body,
    teamId,
    query,
  }: {
    method?: string;
    body?: any;
    teamId?: string | null;
    query?: Record<string, string | undefined>;
  } = {},
): Promise<T> {
  const url = new URL(`${VERCEL_API_BASE}${endpoint}`);
  if (teamId) {
    url.searchParams.set('teamId', teamId);
  }
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  let resolvedBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    resolvedBody = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: resolvedBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || `Vercel API request failed (${response.status})`;
    try {
      const parsed = JSON.parse(errorText) as {
        error?: { message?: string; code?: string };
        message?: string;
      };
      message = parsed.error?.message || parsed.message || message;
    } catch {
      // Keep the raw body when Vercel does not return JSON.
    }
    throw new VercelError(message, response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

function normalizeDeploymentUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

function createEmptyDeploymentResponse(
  overrides: Partial<DeploymentStatusResponse> = {},
): DeploymentStatusResponse {
  return {
    has_deployment: false,
    status: null,
    deployment_id: null,
    deployment_url: null,
    last_deployment_url: null,
    inspector_url: null,
    vercel_configured: true,
    ...overrides,
  };
}

const SKIP_DEPLOY_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.vercel',
  'out',
  'dist',
  'build',
  '.turbo',
  'coverage',
]);

function shouldSkipDeployFile(name: string) {
  if (name === '.DS_Store' || name.endsWith('.log')) return true;
  if (name.startsWith('.env') && name !== '.env.example') return true;
  return false;
}

function resolveProjectRepoPath(projectId: string, repoPath?: string | null) {
  if (repoPath) {
    return path.isAbsolute(repoPath) ? repoPath : path.resolve(process.cwd(), repoPath);
  }
  return path.resolve(process.cwd(), process.env.PROJECTS_DIR || './data/projects', projectId);
}

function collectDeploymentFiles(root: string): Array<{ abs: string; rel: string; size: number }> {
  const files: Array<{ abs: string; rel: string; size: number }> = [];

  const walk = (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (SKIP_DEPLOY_DIRS.has(entry.name) || shouldSkipDeployFile(entry.name)) {
        continue;
      }
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      const stat = fs.statSync(abs);
      files.push({
        abs,
        rel: path.relative(root, abs).split(path.sep).join('/'),
        size: stat.size,
      });
    }
  };

  walk(root);
  return files;
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) || 1 }, () => worker()));
  return results;
}

async function uploadDeploymentFile(
  token: string,
  fileBuffer: Buffer,
  sha: string,
  teamId?: string | null,
) {
  const url = new URL(`${VERCEL_API_BASE}/v2/files`);
  if (teamId) {
    url.searchParams.set('teamId', teamId);
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(fileBuffer.length),
      'x-vercel-digest': sha,
      'x-now-digest': sha,
      'x-now-size': String(fileBuffer.length),
    },
    body: new Uint8Array(fileBuffer),
  });

  if (response.ok || response.status === 409) {
    return;
  }

  const errorText = await response.text();
  let message = errorText || `Failed to upload file to Vercel (${response.status})`;
  try {
    const parsed = JSON.parse(errorText) as { error?: { message?: string }; message?: string };
    message = parsed.error?.message || parsed.message || message;
  } catch {
    // Keep the raw body when Vercel does not return JSON.
  }
  throw new VercelError(message, response.status);
}

async function uploadProjectFiles(
  token: string,
  repoPath: string,
  teamId?: string | null,
) {
  const files = collectDeploymentFiles(repoPath);
  if (files.length === 0) {
    throw new VercelError('Project folder is empty, so there is nothing to deploy.', 400);
  }

  return mapPool(files, 8, async (file) => {
    const buffer = fs.readFileSync(file.abs);
    const sha = createHash('sha1').update(buffer).digest('hex');
    await uploadDeploymentFile(token, buffer, sha, teamId);
    return {
      file: file.rel,
      sha,
      size: buffer.length,
    };
  });
}

const MIN_SAFE_NEXT_15 = [15, 5, 25] as const;
const MIN_SAFE_NEXT_16 = [16, 3, 3] as const;

function parseNextVersion(raw: unknown): [number, number, number] | null {
  if (typeof raw !== 'string' || raw.trim().length === 0) return null;
  const match = raw.trim().match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isAtLeast(version: [number, number, number], minimum: readonly [number, number, number]) {
  for (let i = 0; i < 3; i += 1) {
    if (version[i] > minimum[i]) return true;
    if (version[i] < minimum[i]) return false;
  }
  return true;
}

function assertPatchedNextVersion(repoPath: string) {
  const packageJsonPath = path.join(repoPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new VercelError('package.json is missing from the project.', 400);
  }
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
    dependencies?: { next?: string };
  };
  const parsed = parseNextVersion(pkg.dependencies?.next);
  if (!parsed) {
    throw new VercelError('This project does not declare a Next.js version Vercel can deploy.', 400);
  }
  const safe =
    (parsed[0] === 15 && isAtLeast(parsed, MIN_SAFE_NEXT_15)) ||
    (parsed[0] === 16 && isAtLeast(parsed, MIN_SAFE_NEXT_16)) ||
    parsed[0] > 16;
  if (!safe) {
    throw new VercelError(
      `Vercel blocked Next.js ${parsed.join('.')} as vulnerable. This site needs Next.js 15.5.25 or later.`,
      400,
    );
  }
}

async function unlinkVercelGitRepository(
  token: string,
  vercelProjectId: string,
  teamId?: string | null,
) {
  try {
    await vercelFetch(token, `/v9/projects/${encodeURIComponent(vercelProjectId)}/link`, {
      method: 'DELETE',
      teamId,
    });
  } catch (error) {
    if (error instanceof VercelError && (error.status === 404 || error.status === 400)) {
      return;
    }
    console.warn(
      '[Vercel] Could not unlink GitHub from the Vercel project:',
      error instanceof Error ? error.message : error,
    );
  }
}

export async function assertVercelToken(token: string): Promise<void> {
  try {
    await vercelFetch(token, '/v2/user');
  } catch (error) {
    if (error instanceof VercelError && (error.status === 401 || error.status === 403)) {
      throw new Error(
        'Invalid Vercel token. Create a new token at vercel.com/account/tokens and paste it again.',
      );
    }
    if (error instanceof VercelError) {
      throw error;
    }
    throw new Error(
      'Could not reach Vercel to verify the token. Check your internet connection and try again.',
    );
  }
}

export async function checkVercelProjectAvailability(
  projectName: string,
  options?: { teamId?: string | null },
): Promise<CheckResult> {
  const token = await getPlainServiceToken('vercel');
  if (!token) {
    throw new VercelError('Vercel token not configured', 401);
  }

  try {
    const response = await vercelFetch<{ projects: Array<{ name: string }> }>(
      token,
      '/v9/projects',
      {
        method: 'GET',
        teamId: options?.teamId ?? null,
        query: {
          search: projectName,
          limit: '1',
        },
      },
    );

    const exists = Array.isArray(response?.projects)
      ? response.projects.some((project) => project.name === projectName)
      : false;

    return { available: !exists };
  } catch (error) {
    if (error instanceof VercelError && error.status === 404) {
      return { available: true };
    }
    throw error;
  }
}

async function fetchExistingProject(
  token: string,
  projectName: string,
  teamId?: string | null,
): Promise<VercelProjectResponse | null> {
  try {
    const project = await vercelFetch<VercelProjectResponse>(
      token,
      `/v9/projects/${encodeURIComponent(projectName)}`,
      {
        method: 'GET',
        teamId,
      },
    );
    return project;
  } catch (error) {
    if (error instanceof VercelError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function connectVercelProject(
  projectId: string,
  projectName: string,
  options?: { githubRepo?: string | null; teamId?: string | null },
) {
  const token = await getPlainServiceToken('vercel');
  if (!token) {
    throw new VercelError('Vercel token not configured', 401);
  }

  const project = await getProjectById(projectId);
  if (!project) {
    throw new VercelError('Project not found', 404);
  }

  const teamId = options?.teamId ?? null;

  let linkedRepo = options?.githubRepo ?? null;
  if (!linkedRepo) {
    const githubRepo = await getProjectGitHubRepo(projectId);
    if (githubRepo) {
      linkedRepo = githubRepo.fullName;
    }
  }

  const payload: Record<string, unknown> = {
    name: projectName,
    framework: 'nextjs',
  };

  let vercelProject: VercelProjectResponse | null = null;

  try {
    vercelProject = await vercelFetch<VercelProjectResponse>(
      token,
      '/v10/projects',
      {
        method: 'POST',
        body: payload,
        teamId,
      },
    );
  } catch (error) {
    if (error instanceof VercelError && error.status === 409) {
      vercelProject = await fetchExistingProject(token, projectName, teamId);
    } else {
      throw error;
    }
  }

  if (!vercelProject) {
    throw new VercelError('Failed to create or retrieve Vercel project', 500);
  }

  const envVars = await listEnvVars(projectId);
  for (const envVar of envVars) {
    try {
      await vercelFetch(
        token,
        `/v10/projects/${vercelProject.id}/env`,
        {
          method: 'POST',
          teamId,
          body: {
            key: envVar.key,
            value: envVar.value,
            target: ['production', 'preview', 'development'],
            type: envVar.is_secret ? 'encrypted' : 'plain',
          },
        },
      );
    } catch (error) {
      if (error instanceof VercelError && error.status === 409) {
        continue;
      }
      console.warn('[Vercel] Failed to sync env var:', envVar.key, error);
    }
  }

  const dashboardUrl = `https://vercel.com/dashboard/projects/${vercelProject.id}`;
  const latestDeployment = Array.isArray(vercelProject.latestDeployments) ? vercelProject.latestDeployments[0] : undefined;

  const serviceData: VercelProjectServiceData = {
    project_id: vercelProject.id,
    project_name: vercelProject.name,
    project_url: vercelProject.link?.url ?? dashboardUrl,
    github_repo: linkedRepo,
    team_id: teamId,
    connected_at: new Date().toISOString(),
    last_deployment_id: latestDeployment?.id ?? null,
    last_deployment_status: latestDeployment?.readyState ?? null,
    last_deployment_url: normalizeDeploymentUrl(latestDeployment?.url),
    last_deployment_at: latestDeployment?.createdAt
      ? new Date(latestDeployment.createdAt).toISOString()
      : null,
  };

  await upsertProjectServiceConnection(projectId, 'vercel', serviceData as Record<string, unknown>);
  return serviceData;
}

export async function triggerVercelDeployment(projectId: string) {
  const token = await getPlainServiceToken('vercel');
  if (!token) {
    throw new VercelError('Vercel token not configured', 401);
  }

  const service = await getProjectService(projectId, 'vercel');
  if (!service) {
    throw new VercelError('Vercel project not connected', 404);
  }

  const data = (service.serviceData ?? {}) as VercelProjectServiceData;
  if (!data.project_id) {
    throw new VercelError('Vercel project ID missing', 400);
  }

  const teamId = data.team_id ?? null;
  const project = await getProjectById(projectId);
  if (!project) {
    throw new VercelError('Project not found', 404);
  }

  const repoPath = resolveProjectRepoPath(projectId, project.repoPath);
  if (!fs.existsSync(repoPath)) {
    throw new VercelError('Project files were not found on disk.', 400);
  }

  assertPatchedNextVersion(repoPath);

  try {
    const { pushProjectToGitHub } = await import('@/lib/services/github');
    await pushProjectToGitHub(projectId);
  } catch (error) {
    console.warn(
      '[Vercel] GitHub push before deploy failed:',
      error instanceof Error ? error.message : error,
    );
  }

  await unlinkVercelGitRepository(token, data.project_id, teamId);

  const files = await uploadProjectFiles(token, repoPath, teamId);
  const githubRepo = await getProjectGitHubRepo(projectId);
  const projectName = data.project_name || githubRepo?.repoName || project.name || 'site';

  const deployment = await vercelFetch<{
    id: string;
    url: string;
    readyState: string;
    inspectorUrl?: string;
    createdAt?: number;
  }>(token, '/v13/deployments', {
    method: 'POST',
    teamId,
    query: {
      skipAutoDetectionConfirmation: '1',
      forceNew: '1',
    },
    body: {
      name: projectName,
      project: data.project_id,
      target: 'production',
      files,
      projectSettings: {
        framework: 'nextjs',
        installCommand: VERCEL_SAFE_INSTALL_COMMAND,
        buildCommand: 'next build',
      },
    },
  });

  const deploymentUrl = normalizeDeploymentUrl(deployment?.url);
  const readyState = deployment?.readyState ?? 'QUEUED';

  await updateProjectServiceData(projectId, 'vercel', {
    project_name: projectName,
    github_repo: githubRepo ? `${githubRepo.owner}/${githubRepo.repoName}` : data.github_repo,
    last_deployment_id: deployment?.id ?? null,
    last_deployment_status: readyState,
    last_deployment_url: deploymentUrl,
    last_deployment_at: deployment?.createdAt
      ? new Date(deployment.createdAt).toISOString()
      : new Date().toISOString(),
  });

  return {
    success: true,
    deploymentId: deployment?.id ?? null,
    deploymentUrl,
    status: readyState,
  };
}

export async function getCurrentDeploymentStatus(projectId: string) {
  const token = await getPlainServiceToken('vercel');
  if (!token) {
    return createEmptyDeploymentResponse({
      status: 'not_configured',
      vercel_configured: false,
    });
  }

  const service = await getProjectService(projectId, 'vercel');
  if (!service || !service.serviceData) {
    return createEmptyDeploymentResponse({ vercel_configured: false });
  }

  const data = service.serviceData as VercelProjectServiceData;
  if (!data.project_id) {
    return createEmptyDeploymentResponse({ vercel_configured: false });
  }

  const teamId = data.team_id ?? null;

  const buildResponse = (deployment?: {
    id: string;
    url: string;
    readyState: string;
    inspectorUrl?: string;
    createdAt?: number;
  }): DeploymentStatusResponse => {
    const deploymentUrl = normalizeDeploymentUrl(deployment?.url ?? data.last_deployment_url);
    const readyState = deployment?.readyState ?? data.last_deployment_status ?? null;
    const deploymentId = deployment?.id ?? data.last_deployment_id ?? null;
    const isActive =
      readyState === 'QUEUED' || readyState === 'BUILDING' || readyState === 'INITIALIZING';

    return {
      has_deployment: Boolean(isActive && deploymentId),
      status: readyState ?? null,
      last_deployment_url: deploymentUrl ?? null,
      deployment_id: deploymentId ?? null,
      inspector_url: deployment?.inspectorUrl ?? null,
      deployment_url: deploymentUrl ?? null,
      vercel_configured: true,
    };
  };

  if (data.last_deployment_id) {
    try {
      const deployment = await vercelFetch<{
        id: string;
        url: string;
        readyState: string;
        inspectorUrl?: string;
        createdAt?: number;
      }>(
        token,
        `/v13/deployments/${data.last_deployment_id}`,
        {
          method: 'GET',
          teamId,
        },
      );

      const deploymentUrl = normalizeDeploymentUrl(deployment?.url);
      const readyState = deployment?.readyState ?? null;

      await updateProjectServiceData(projectId, 'vercel', {
        last_deployment_id: deployment?.id ?? data.last_deployment_id,
        last_deployment_status: readyState,
        last_deployment_url: deploymentUrl,
        last_deployment_at: deployment?.createdAt
          ? new Date(deployment.createdAt).toISOString()
          : data.last_deployment_at ?? new Date().toISOString(),
      });

      return buildResponse(deployment);
    } catch (error) {
      if (!(error instanceof VercelError && error.status === 404)) {
        throw error;
      }
      // Fall through to list deployments when the stored deployment id is no longer valid.
    }
  }

  try {
    const deployments = await vercelFetch<VercelDeploymentsResponse>(
      token,
      '/v6/deployments',
      {
        method: 'GET',
        teamId,
        query: {
          projectId: data.project_id,
          limit: '1',
        },
      },
    );

    const latest = Array.isArray(deployments?.deployments) ? deployments.deployments[0] : undefined;
    if (!latest) {
      return createEmptyDeploymentResponse();
    }

    const deploymentUrl = normalizeDeploymentUrl(latest.url);
    const readyState = latest.readyState ?? null;

    await updateProjectServiceData(projectId, 'vercel', {
      last_deployment_id: latest.id ?? data.last_deployment_id ?? null,
      last_deployment_status: readyState,
      last_deployment_url: deploymentUrl,
      last_deployment_at: latest.createdAt
        ? new Date(latest.createdAt).toISOString()
        : data.last_deployment_at ?? new Date().toISOString(),
    });

    return buildResponse(latest);
  } catch (error) {
    if (error instanceof VercelError && (error.status === 404 || error.status === 400)) {
      return createEmptyDeploymentResponse();
    }
    throw error;
  }
}
