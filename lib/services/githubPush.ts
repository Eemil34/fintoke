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
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        (body && typeof body === 'object' && typeof (body as { message?: string }).message === 'string'
          ? (body as { message: string }).message
          : `GitHub API ${response.status}`);
      throw new Error(message);
    }
    return body as Record<string, unknown>;
  };

  const blobs = [];
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
      blobs.push({
        path: chunk[index].path,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      });
    });
  }

  const tree = await api(`/repos/${params.owner}/${params.repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ tree: blobs }),
  });

  let parent: string | undefined;
  try {
    const ref = await api(`/repos/${params.owner}/${params.repo}/git/ref/heads/${branch}`);
    const object = ref.object as { sha?: string } | undefined;
    parent = object?.sha;
  } catch {
    try {
      const ref = await api(`/repos/${params.owner}/${params.repo}/git/refs/heads/${branch}`);
      const object = ref.object as { sha?: string } | undefined;
      parent = object?.sha;
    } catch {
      parent = undefined;
    }
  }

  const commit = await api(`/repos/${params.owner}/${params.repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: params.message,
      tree: tree.sha,
      parents: parent ? [parent] : [],
    }),
  });

  if (parent) {
    await api(`/repos/${params.owner}/${params.repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: true }),
    });
    return;
  }

  try {
    await api(`/repos/${params.owner}/${params.repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
    });
  } catch {
    await api(`/repos/${params.owner}/${params.repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: true }),
    });
  }
}
