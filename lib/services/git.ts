import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

class GitError extends Error {
  constructor(message: string, readonly output?: string) {
    super(message);
    this.name = 'GitError';
  }
}

const DEFAULT_GITIGNORE_ENTRIES = [
  '# Dependencies',
  'node_modules/',
  '',
  '# Next.js build output',
  '.next/',
  'out/',
  '',
  '# Build artifacts',
  'dist/',
  'build/',
  '.turbo/',
  '',
  '# Environment files',
  '.env',
  '.env.*',
  '',
  '# Misc',
  '.DS_Store',
  '.git-backup-*',
  '.vercel/',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  'pnpm-debug.log*',
];

function ensureGitignore(repoPath: string) {
  const gitignorePath = path.join(repoPath, '.gitignore');
  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
  }

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, `${DEFAULT_GITIGNORE_ENTRIES.join('\n')}\n`, 'utf8');
    return;
  }

  const existing = fs.readFileSync(gitignorePath, 'utf8');
  const existingLines = existing.split(/\r?\n/);
  const normalized = new Set(existingLines.map((line) => line.trim()));

  const additions = DEFAULT_GITIGNORE_ENTRIES.filter((entry) => {
    const trimmed = entry.trim();
    if (trimmed.length === 0) {
      // always allow blank lines to keep grouping but avoid duplicating consecutive blanks
      return (
        existingLines.length === 0 ||
        existingLines[existingLines.length - 1].trim().length !== 0
      );
    }
    return !normalized.has(trimmed);
  });

  if (additions.length === 0) {
    return;
  }

  const trimmedExisting = existing.replace(/\s+$/u, '');
  const separator = trimmedExisting.length > 0 ? '\n\n' : '';
  const nextContents = `${trimmedExisting}${separator}${additions.join('\n')}\n`;
  fs.writeFileSync(gitignorePath, nextContents, 'utf8');
}

function redactGitSecrets(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/https:\/\/[^@\s]+@github\.com/g, 'https://***@github.com')
    .replace(/ghp_[A-Za-z0-9]+/g, 'ghp_***')
    .replace(/github_pat_[A-Za-z0-9_]+/g, 'github_pat_***');
}

function runGit(args: string[], cwd: string): string {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 1024 * 1024 * 20, // allow larger git output before hitting ENOBUFS
  });

  if (result.error) {
    throw new GitError(
      `Git command failed: ${result.error.message}`,
      redactGitSecrets(result.stderr || result.stdout),
    );
  }

  if (result.status !== 0) {
    const output =
      typeof result.stderr === 'string' && result.stderr.trim().length > 0
        ? result.stderr
        : typeof result.stdout === 'string'
        ? result.stdout
        : undefined;
    const safeOutput = redactGitSecrets(output);
    throw new GitError(
      `Git command failed: git ${args[0]}${safeOutput ? `\n${safeOutput}` : ''}`,
      safeOutput,
    );
  }

  return result.stdout.trim();
}

function untrackIgnoredPaths(repoPath: string) {
  const pathsToUntrack = ['node_modules', '.next', 'dist', 'build', 'out', '.turbo', '.vercel'];
  for (const entry of pathsToUntrack) {
    runGit(['rm', '-r', '--cached', '--ignore-unmatch', entry], repoPath);
  }
}

export function ensureGitConfig(repoPath: string, name: string, email: string) {
  runGit(['config', '--local', 'user.name', name], repoPath);
  runGit(['config', '--local', 'user.email', email], repoPath);
}

export function initializeMainBranch(repoPath: string) {
  try {
    runGit(['rev-parse', 'HEAD'], repoPath);
  } catch {
    try {
      runGit(['commit', '--allow-empty', '-m', 'Initial commit'], repoPath);
    } catch (error) {
      throw error;
    }
  }

  try {
    const currentBranch = runGit(['branch', '--show-current'], repoPath);
    if (currentBranch !== 'main') {
      runGit(['branch', '-M', 'main'], repoPath);
    }
  } catch {
    try {
      runGit(['checkout', '-b', 'main'], repoPath);
    } catch {
      // ignore
    }
  }
}

export function addOrUpdateRemote(repoPath: string, remoteName: string, remoteUrl: string) {
  try {
    const existing = runGit(['remote', 'get-url', remoteName], repoPath);
    if (existing !== remoteUrl) {
      runGit(['remote', 'set-url', remoteName, remoteUrl], repoPath);
    }
  } catch {
    runGit(['remote', 'add', remoteName, remoteUrl], repoPath);
  }
}

export function getCurrentBranch(repoPath: string): string {
  try {
    const branch = runGit(['branch', '--show-current'], repoPath);
    if (branch) return branch;
  } catch {
    // fall through
  }
  return 'main';
}

export function commitAll(repoPath: string, message: string) {
  try {
    untrackIgnoredPaths(repoPath);
    runGit(['add', '-A'], repoPath);
    runGit(['commit', '-m', message], repoPath);
    return true;
  } catch (error) {
    if (error instanceof GitError && error.output && error.output.includes('nothing to commit')) {
      return false;
    }
    throw error;
  }
}

export function pushToRemote(
  repoPath: string,
  remoteName = 'origin',
  branch = 'main',
  remoteUrl?: string,
) {
  let previousUrl: string | null = null;
  if (remoteUrl) {
    try {
      previousUrl = runGit(['remote', 'get-url', remoteName], repoPath);
    } catch {
      previousUrl = null;
    }
    addOrUpdateRemote(repoPath, remoteName, remoteUrl);
  }

  try {
    try {
      runGit(['push', '-u', remoteName, branch], repoPath);
    } catch (error) {
      if (error instanceof GitError) {
        runGit(['push', '-u', '--force', remoteName, branch], repoPath);
      } else {
        throw error;
      }
    }
  } finally {
    if (remoteUrl) {
      const publicUrl = previousUrl
        ? previousUrl.replace(/https:\/\/[^@]+@/, 'https://')
        : remoteUrl.replace(/https:\/\/[^@]+@/, 'https://');
      try {
        addOrUpdateRemote(repoPath, remoteName, publicUrl);
      } catch {
        // Keep the authenticated remote if restoring the public URL fails.
      }
    }
  }
}

export function ensureGitRepository(repoPath: string) {
  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
  }
  if (!fs.existsSync(path.join(repoPath, '.git'))) {
    runGit(['init'], repoPath);
  }
  ensureGitignore(repoPath);
}
