import fs from 'fs/promises';
import path from 'path';
import { RUN_DEV_SCRIPT } from '@/lib/utils/runDevScript';
import {
  ensureRemoteImageConfig,
  ensureSiteImages,
  repairBrokenRemoteImages,
  retargetMismatchedRemoteImages,
  GENERATED_IMAGES_CONFIG,
} from './siteImages';

export const ISOLATED_NEXT_CONFIG = `const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  ...(process.env.NEXT_BASE_PATH
    ? { basePath: process.env.NEXT_BASE_PATH, assetPrefix: process.env.NEXT_BASE_PATH }
    : {}),
  ${GENERATED_IMAGES_CONFIG},
};

module.exports = nextConfig;
`;

const ISOLATION_BLOCK = `  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  ...(process.env.NEXT_BASE_PATH
    ? { basePath: process.env.NEXT_BASE_PATH, assetPrefix: process.env.NEXT_BASE_PATH }
    : {}),
`;

export async function ensureIsolatedNextConfig(projectPath: string): Promise<boolean> {
  const configPath = path.join(projectPath, 'next.config.js');
  let source = '';
  try {
    source = await fs.readFile(configPath, 'utf8');
  } catch {
    await fs.writeFile(configPath, ISOLATED_NEXT_CONFIG);
    await clearNextCache(projectPath);
    return true;
  }

  let next = source;
  let changed = false;

  if (!next.includes('outputFileTracingRoot') || !next.includes('turbopack:')) {
    if (!next.includes("require('path')") && !next.includes('require("path")')) {
      next = `const path = require('path');\n${next}`;
    }

    if (next.includes('const nextConfig = {')) {
      next = next.replace('const nextConfig = {', `const nextConfig = {\n${ISOLATION_BLOCK}`);
    } else if (next.includes('module.exports = {')) {
      next = next.replace('module.exports = {', `module.exports = {\n${ISOLATION_BLOCK}`);
    } else {
      next = ISOLATED_NEXT_CONFIG;
    }
    changed = true;
  }

  if (!next.includes('NEXT_BASE_PATH') && next.includes('const nextConfig = {')) {
    next = next.replace(
      'const nextConfig = {',
      `const nextConfig = {
  ...(process.env.NEXT_BASE_PATH
    ? { basePath: process.env.NEXT_BASE_PATH, assetPrefix: process.env.NEXT_BASE_PATH }
    : {}),`,
    );
    changed = true;
  }

  const withImages = ensureRemoteImageConfig(next);
  if (withImages !== next) {
    next = withImages;
    changed = true;
  }

  if (!changed) return false;

  await fs.writeFile(configPath, next);
  await clearNextCache(projectPath);
  return true;
}

export async function writePreviewNextConfig(projectPath: string, basePath: string): Promise<void> {
  const configPath = path.join(projectPath, 'next.config.js');
  const base = basePath
    ? `  basePath: ${JSON.stringify(basePath)},
  assetPrefix: ${JSON.stringify(basePath)},`
    : '';
  const contents = `const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
${base}
  ${GENERATED_IMAGES_CONFIG},
};

module.exports = nextConfig;
`;
  try {
    const current = await fs.readFile(configPath, 'utf8');
    if (current === contents) return;
  } catch {
    // write a new config below
  }
  await fs.writeFile(configPath, contents);
  await clearNextCache(projectPath);
}

export async function ensureGeneratedDevScript(projectPath: string): Promise<void> {
  const scriptPath = path.join(projectPath, 'scripts', 'run-dev.js');
  await fs.mkdir(path.dirname(scriptPath), { recursive: true });
  await fs.writeFile(scriptPath, RUN_DEV_SCRIPT);
}

export async function clearNextCache(projectPath: string): Promise<void> {
  await fs.rm(path.join(projectPath, '.next'), { recursive: true, force: true });
}

export async function normalizeGeneratedProject(projectPath: string): Promise<boolean> {
  const configChanged = await ensureIsolatedNextConfig(projectPath);
  await ensureGeneratedDevScript(projectPath);
  const images = await ensureSiteImages(projectPath);
  try {
    await retargetMismatchedRemoteImages(projectPath);
  } catch (error) {
    console.warn('[Preview] Failed to retarget photos:', error);
  }
  void repairBrokenRemoteImages(projectPath).catch((error) => {
    console.warn('[Preview] Failed to repair remote photos:', error);
  });
  return configChanged || images.needsPreviewRestart;
}
