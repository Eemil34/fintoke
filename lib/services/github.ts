import { getPlainServiceToken } from '@/lib/services/tokens';
import { getProjectById, updateProject } from '@/lib/services/project';
import { resolveAndPersistProjectWorkspace } from '@/lib/server/projectWorkspace';
import { getProjectService, upsertProjectServiceConnection, updateProjectServiceData } from '@/lib/services/project-services';
import { pushDirectoryViaGitHubApi } from '@/lib/services/githubPush';
import type { GitHubUserInfo, CreateRepoOptions, GitHubRepositoryInfo } from '@/types/shared';

class GitHubError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'GitHubError';
  }
}

async function githubFetch(token: string, endpoint: string, init?: RequestInit) {
  const baseUrl = 'https://api.github.com';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'Claudable-Next',
      ...init?.headers,
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body: any = response.status === 204
    ? null
    : isJson
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    let message = 'GitHub API request failed';
    if (body) {
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object') {
        const errorMessage = (body as Record<string, unknown>).message;
        const errors = (body as Record<string, unknown>).errors;
        if (typeof errorMessage === 'string' && errorMessage.trim().length > 0) {
          message = errorMessage;
        } else if (Array.isArray(errors) && errors.length > 0) {
          const aggregated = errors
            .map((err) => (err && typeof err === 'object' ? (err as Record<string, unknown>).message : null))
            .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
            .join(', ');
          if (aggregated) {
            message = aggregated;
          }
        } else {
          message = JSON.stringify(body);
        }
      }
    }
    throw new GitHubError(message, response.status);
  }

  return body;
}

export async function getGithubUser(): Promise<GitHubUserInfo> {
  const token = await getPlainServiceToken('github');
  if (!token) {
    throw new GitHubError('GitHub token not configured', 401);
  }

  const data = (await githubFetch(token, '/user')) as any;
  return {
    login: data.login,
    name: data.name,
    email: data.email,
  };
}

export async function checkRepositoryAvailability(repoName: string) {
  const token = await getPlainServiceToken('github');
  if (!token) {
    throw new GitHubError('GitHub token not configured', 401);
  }

  const user = await getGithubUser();
  try {
    await githubFetch(token, `/repos/${user.login}/${repoName}`);
    return { exists: true, username: user.login };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) {
      return { exists: false, username: user.login };
    }
    throw error;
  }
}

export async function createRepository(options: CreateRepoOptions) {
  const token = await getPlainServiceToken('github');
  if (!token) {
    throw new GitHubError('GitHub token not configured', 401);
  }

  const user = await getGithubUser();
  try {
    return (await githubFetch(token, '/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: options.repoName,
        description: options.description ?? '',
        private: options.private ?? false,
        auto_init: true,
      }),
    })) as any;
  } catch (error) {
    if (error instanceof GitHubError && (error.status === 422 || error.status === 409)) {
      try {
        return (await githubFetch(token, `/repos/${user.login}/${options.repoName}`)) as any;
      } catch {
        throw new GitHubError(
          `${error.message} Use a different repository name, or give the GitHub token the repo scope.`,
          error.status,
        );
      }
    }
    throw error;
  }
}

export async function ensureProjectRepository(projectId: string, repoPath?: string | null) {
  return resolveAndPersistProjectWorkspace({ repoPath }, projectId);
}

export async function getGithubRepositoryDetails(owner: string, repo: string): Promise<GitHubRepositoryInfo> {
  const token = await getPlainServiceToken('github');
  if (!token) {
    throw new GitHubError('GitHub token not configured', 401);
  }

  try {
    const data = (await githubFetch(token, `/repos/${owner}/${repo}`)) as any;
    if (!data || typeof data.id !== 'number') {
      throw new GitHubError('GitHub repository not found', 404);
    }

    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      owner: {
        login: data.owner?.login ?? owner,
        id: typeof data.owner?.id === 'number' ? data.owner.id : null,
      },
      default_branch: data.default_branch,
    };
  } catch (error) {
    if (error instanceof GitHubError) {
      if (error.status === 404) {
        throw new GitHubError('GitHub repository not found', 404);
      }
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new GitHubError(`Failed to fetch repository metadata: ${message}`);
  }
}

async function publishFolderToGitHub(params: {
  token: string;
  owner: string;
  repoName: string;
  repoPath: string;
  branch: string;
  message: string;
}) {
  await pushDirectoryViaGitHubApi({
    token: params.token,
    owner: params.owner,
    repo: params.repoName,
    branch: params.branch,
    directory: params.repoPath,
    message: params.message,
  });
  return params.branch;
}

export async function connectProjectToGitHub(projectId: string, options: CreateRepoOptions) {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const token = await getPlainServiceToken('github');
  if (!token) {
    throw new GitHubError('GitHub token not configured', 401);
  }

  const user = await getGithubUser();
  const repo = await createRepository(options);
  const repoPath = await ensureProjectRepository(projectId, project.repoPath);
  const repoUrl = repo.html_url as string;
  const cloneUrl = repo.clone_url as string;
  const defaultBranch = (typeof repo.default_branch === 'string' && repo.default_branch) || 'main';

  await updateProject(projectId, { repoPath });

  try {
    await sleep(1200);
    await publishFolderToGitHub({
      token,
      owner: user.login,
      repoName: options.repoName,
      repoPath,
      branch: defaultBranch,
      message: 'Initial commit from Fintoke',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new GitHubError(
      `Created the GitHub repository but failed to upload the site files: ${message}`,
      400,
    );
  }

  await upsertProjectServiceConnection(projectId, 'github', {
    repo_url: repoUrl,
    repo_name: options.repoName,
    clone_url: cloneUrl,
    default_branch: defaultBranch,
    owner: user.login,
  });

  return {
    repo_url: repoUrl,
    clone_url: cloneUrl,
    default_branch: defaultBranch,
    owner: user.login,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getLatestCommitSha(owner: string, repo: string, ref: string): Promise<string> {
  const token = await getPlainServiceToken('github');
  if (!token) {
    throw new GitHubError('GitHub token not configured', 401);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const data = (await githubFetch(
        token,
        `/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}`,
      )) as { sha?: string };
      if (typeof data?.sha === 'string' && data.sha.length > 0) {
        return data.sha;
      }
    } catch (error) {
      lastError = error;
    }
    await sleep(1000 * (attempt + 1));
  }

  const detail = lastError instanceof Error ? lastError.message : 'repository has no commits';
  throw new GitHubError(
    `GitHub repository ${owner}/${repo} has no commit on "${ref}". ${detail}`,
    400,
  );
}

export async function pushProjectToGitHub(projectId: string) {
  try {
    const project = await getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const token = await getPlainServiceToken('github');
    if (!token) {
      throw new GitHubError('GitHub token not configured', 401);
    }

    const service = await getProjectService(projectId, 'github');
    const data = service?.serviceData as Record<string, any> | undefined;
    if (!data?.clone_url || !data?.owner) {
      throw new GitHubError('GitHub repository not connected', 404);
    }

    const repoPath = await ensureProjectRepository(projectId, project.repoPath);
    const branch = (typeof data.default_branch === 'string' && data.default_branch) || 'main';
    const repoName = String(data.repo_name || '').trim();
    if (!repoName) {
      throw new GitHubError('GitHub repository name is missing. Connect the repo again.', 400);
    }

    await publishFolderToGitHub({
      token,
      owner: String(data.owner),
      repoName,
      repoPath,
      branch,
      message: 'Update from Fintoke',
    });

    await updateProjectServiceData(projectId, 'github', {
      last_pushed_at: new Date().toISOString(),
      default_branch: branch,
    });
  } catch (error) {
    if (error instanceof GitHubError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new GitHubError(`Failed to push project to GitHub: ${message}`);
  }
}
