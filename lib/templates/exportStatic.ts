import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { GENERATED_IMAGES_CONFIG } from './siteImages';
import { STATIC_EXPORT_DIR } from './staticSite';

const EXPORT_CONFIG = `const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname),
  ${GENERATED_IMAGES_CONFIG},
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
`;

function run(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    const collect = (chunk: Buffer | string) => {
      log += chunk.toString();
      if (log.length > 20_000) log = log.slice(-12_000);
    };
    child.stderr.on('data', collect);
    child.stdout.on('data', collect);
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(log.trim() || `${command} ${args.join(' ')} failed (${code})`));
    });
  });
}

async function copyTree(from: string, to: string): Promise<void> {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'out' || entry.name === STATIC_EXPORT_DIR) {
      continue;
    }
    if (entry.name.startsWith('.') && entry.name !== '.fintoke-from') continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) await copyTree(src, dest);
    else await fs.copyFile(src, dest);
  }
}

export async function exportSnapshotStatic(snapshotPath: string): Promise<string> {
  const work = await fs.mkdtemp(path.join(os.tmpdir(), 'fintoke-static-'));
  try {
    await copyTree(snapshotPath, work);
    await fs.writeFile(path.join(work, 'next.config.js'), EXPORT_CONFIG);
    await run('npm', ['install', '--include=dev', '--no-audit', '--no-fund'], work, {
      ...process.env,
      NODE_ENV: 'development',
      NEXT_TELEMETRY_DISABLED: '1',
    });
    await run('npx', ['next', 'build'], work, {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
    });
    const generated = path.join(work, 'out');
    await fs.access(path.join(generated, 'index.html'));
    const dest = path.join(snapshotPath, STATIC_EXPORT_DIR);
    await fs.rm(dest, { recursive: true, force: true });
    await fs.cp(generated, dest, { recursive: true });
    return dest;
  } finally {
    await fs.rm(work, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function ensureTemplateStatic(templateId: string): Promise<boolean> {
  const { hasStaticExport } = await import('./staticSite');
  const { resolveSnapshotDir } = await import('./snapshot');
  if (await hasStaticExport(templateId)) return true;
  const dir = await resolveSnapshotDir(templateId);
  if (!dir) return false;
  await exportSnapshotStatic(dir);
  return hasStaticExport(templateId);
}
