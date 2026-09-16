const fs = require('fs');
const os = require('os');
const path = require('path');

const HEAVY = new Set([
  'node_modules',
  '.next',
  '.turbo',
  '.cache',
  'dist',
  'build',
  'coverage',
  '.pnpm-store',
]);

function rmDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

function reclaimVolume(dataDir, repoRoot) {
  const removed = [];
  const projects = path.join(dataDir, 'projects');
  let entries = [];
  try {
    entries = fs.readdirSync(projects, { withFileTypes: true });
  } catch {
    entries = [];
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const projectPath = path.join(projects, entry.name);
    for (const name of HEAVY) {
      const target = path.join(projectPath, name);
      if (fs.existsSync(target) && rmDir(target)) removed.push(target);
    }
  }

  const seedRoot = path.join(repoRoot, 'seed', 'templates', 'snapshots');
  const volumeSnaps = path.join(dataDir, 'templates', 'snapshots');
  let snaps = [];
  try {
    snaps = fs.readdirSync(volumeSnaps, { withFileTypes: true });
  } catch {
    snaps = [];
  }
  for (const entry of snaps) {
    if (!entry.isDirectory()) continue;
    const volumePath = path.join(volumeSnaps, entry.name);
    if (fs.existsSync(path.join(volumePath, '.fintoke-user-snapshot'))) continue;
    if (!fs.existsSync(path.join(seedRoot, entry.name, 'package.json'))) continue;
    if (rmDir(volumePath)) removed.push(volumePath);
  }

  for (const name of ['.npm', '.cache', '.turbo', '.pnpm-store']) {
    const target = path.join(dataDir, name);
    if (fs.existsSync(target) && rmDir(target)) removed.push(target);
  }

  const tmpCache = path.join(os.tmpdir(), 'fintoke-npm-cache');
  if (fs.existsSync(tmpCache) && rmDir(tmpCache)) removed.push(tmpCache);

  console.log(`[start-prod] Freed ${removed.length} heavy folders on the volume`);
  return removed;
}

module.exports = { reclaimVolume };
