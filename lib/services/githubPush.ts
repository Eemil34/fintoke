import fs from 'fs/promises';
import path from 'path';

const SKIP_NAMES = new Set([
  'node_modules',
  '.next',
  '.git',
  '.turbo',
  '.vercel',
  '.cursor',
  '.claude',
  'dist',
  'build',
  'coverage',
  '.DS_Store',
]);

type GitHubFile = { path: string; content: string };

function encodeGitHubPath(filePath: string): string {
  return filePath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isEmptyRepoError(error: unknown): boolean {
  return /git repository is empty/i.test(errorMessage(error));
}

async function collectFiles(root: string, relative = ''): Promise<GitHubFile[]> {
  const dir = relative ? path.join(root, relative) : root;
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: GitHubFile[] = [];
  for (const entry of entries) {
    if (SKIP_NAMES.has(entry.name) || entry.name.endsWith('.log')) continue;
    const rel = relative ? `${relative}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(root, rel)));
      continue;
    }
    if (!entry.isFile()) continue;
    const stat = await fs.stat(full);
    if (stat.size > 40 * 1024 * 1024) continue;
    const buffer = await fs.readFile(full);
    files.push({ path: rel.replace(/\\/g, '/'), content: buffer.toString('base64') });
  }
  return files;
}

export async function pushDirectoryViaGitHubApi(params: {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
  directory: string;
  message: string;
}): Promise<void> {
  const branch = params.branch || 'main';
  const files = await collectFiles(params.directory);
  if (files.length === 0) {
    throw new Error('The site folder is empty, so there is nothing to push to GitHub.');
  }

  const api = async (endpoint: string, init?: RequestInit) => {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${params.token}`,
        'User-Agent': 'Fintoke',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        body && typeof body === 'object' && typeof (body as { message?: string }).message === 'string'
          ? (body as { message: string }).message
          : `GitHub API ${response.status}`;
      throw new Error(message);
    }
    return body as Record<string, unknown>;
  };

  const headSha = async (): Promise<string | undefined> => {
    for (const endpoint of [
      `/repos/${params.owner}/${params.repo}/git/ref/heads/${branch}`,
      `/repos/${params.owner}/${params.repo}/git/refs/heads/${branch}`,
      `/repos/${params.owner}/${params.repo}/commits/${encodeURIComponent(branch)}`,
    ]) {
      try {
        const body = await api(endpoint);
        const direct = typeof body.sha === 'string' ? body.sha : '';
        if (direct) return direct;
        const object = body.object as { sha?: string } | undefined;
        if (typeof object?.sha === 'string' && object.sha) return object.sha;
      } catch {
        // empty repos have no ref yet
      }
    }
    return undefined;
  };

  const seedFirstCommit = async () => {
    const seed =
      files.find((file) => file.path === 'package.json') ||
      files.find((file) => file.path === 'README.md') ||
      files[0];
    await api(`/repos/${params.owner}/${params.repo}/contents/${encodeGitHubPath(seed.path)}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: params.message,
        content: seed.content,
        branch,
      }),
    });
  };

  let parent = await headSha();
  if (!parent) {
    try {
      await seedFirstCommit();
    } catch (error) {
      if (!/sha.*required|already exists/i.test(errorMessage(error))) {
        // Contents API is the supported way to create the first commit on an empty repo.
        console.warn('[github] Failed to seed empty repository:', error);
      }
    }
    for (let attempt = 0; attempt < 8 && !parent; attempt += 1) {
      await sleep(400 * (attempt + 1));
      parent = await headSha();
    }
  }

  const pushGitDatabase = async (parentSha?: string) => {
    const blobs: Array<{ path: string; mode: string; type: string; sha: string }> = [];
    for (let i = 0; i < files.length; i += 8) {
      const chunk = files.slice(i, i + 8);
      const created = await Promise.all(
        chunk.map((file) =>
          api(`/repos/${params.owner}/${params.repo}/git/blobs`, {
            method: 'POST',
            body: JSON.stringify({ content: file.content, encoding: 'base64' }),
          }),
        ),
      );
      created.forEach((blob, index) => {
        const sha = typeof blob.sha === 'string' ? blob.sha : '';
        if (!sha) return;
        blobs.push({
          path: chunk[index].path,
          mode: '100644',
          type: 'blob',
          sha,
        });
      });
    }

    const tree = await api(`/repos/${params.owner}/${params.repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ tree: blobs }),
    });

    const commit = await api(`/repos/${params.owner}/${params.repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: params.message,
        tree: tree.sha,
        parents: parentSha ? [parentSha] : [],
      }),
    });

    const sha = typeof commit.sha === 'string' ? commit.sha : '';
    if (!sha) throw new Error('GitHub did not return a commit SHA.');

    if (parentSha) {
      await api(`/repos/${params.owner}/${params.repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha, force: true }),
      });
      return;
    }

    await api(`/repos/${params.owner}/${params.repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
    });
  };

  const pushViaContentsApi = async () => {
    for (const file of files) {
      let sha: string | undefined;
      try {
        const existing = await api(
          `/repos/${params.owner}/${params.repo}/contents/${encodeGitHubPath(file.path)}?ref=${encodeURIComponent(branch)}`,
        );
        if (typeof existing.sha === 'string') sha = existing.sha;
      } catch {
        sha = undefined;
      }
      await api(`/repos/${params.owner}/${params.repo}/contents/${encodeGitHubPath(file.path)}`, {
        method: 'PUT',
        body: JSON.stringify({
          message: params.message,
          content: file.content,
          branch,
          ...(sha ? { sha } : {}),
        }),
      });
    }
  };

  try {
    await pushGitDatabase(parent);
  } catch (error) {
    if (!isEmptyRepoError(error) && !/not found|reference does not exist/i.test(errorMessage(error))) {
      try {
        await seedFirstCommit();
        parent = (await headSha()) || parent;
        await pushGitDatabase(parent);
        return;
      } catch {
        // Fall through to the Contents API, which can populate empty repos.
      }
    }
    try {
      if (!parent) await seedFirstCommit();
    } catch {
      // already seeded or still empty; Contents API upload will surface the real error
    }
    await pushViaContentsApi();
  }
}
