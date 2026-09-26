const fs = require('fs');
const os = require('os');
const path = require('path');

const HEAVY = [
  'node_modules',
  '.next',
  '.turbo',
  '.cache',
  'dist',
  'build',
  'coverage',
  '.pnpm-store',
  'out',
];

function rmPath(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

function listDirs(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function stripHeavy(root, removed) {
  for (const name of HEAVY) {
    const target = path.join(root, name);
    if (fs.existsSync(target) && rmPath(target)) removed.push(target);
  }
}

function reclaimVolume(dataDir, repoRoot) {
  const removed = [];
  const projects = path.join(dataDir, 'projects');
  for (const entry of listDirs(projects)) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const projectPath = path.join(projects, entry.name);
    stripHeavy(projectPath, removed);
    stripHeavy(path.join(projectPath, 'repo'), removed);
  }

  const seedRoot = path.join(repoRoot, 'seed', 'templates', 'snapshots');
  const volumeSnaps = path.join(dataDir, 'templates', 'snapshots');
  for (const entry of listDirs(volumeSnaps)) {
    if (!entry.isDirectory()) continue;
    const volumePath = path.join(volumeSnaps, entry.name);
    if (fs.existsSync(path.join(volumePath, '.fintoke-user-snapshot'))) {
      stripHeavy(volumePath, removed);
      continue;
    }
    if (fs.existsSync(path.join(seedRoot, entry.name, 'package.json'))) {
      if (rmPath(volumePath)) removed.push(volumePath);
      continue;
    }
    stripHeavy(volumePath, removed);
  }

  for (const name of ['.npm', '.cache', '.turbo', '.pnpm-store', 'preview-deps']) {
    const target = path.join(dataDir, name);
    if (fs.existsSync(target) && rmPath(target)) removed.push(target);
  }

  const runtime = path.join(dataDir, 'preview-runtime');
  for (const entry of listDirs(runtime)) {
    const target = path.join(runtime, entry.name);
    if (rmPath(target)) removed.push(target);
  }

  const tmp = os.tmpdir();
  for (const entry of listDirs(tmp)) {
    if (!entry.name.startsWith('fintoke-')) continue;
    const target = path.join(tmp, entry.name);
    if (rmPath(target)) removed.push(target);
  }

  console.log(`[start-prod] Freed ${removed.length} heavy folders on the volume`);
  return removed;
}

module.exports = { reclaimVolume };
