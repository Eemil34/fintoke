#!/usr/bin/env node

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
process.chdir(root);

function localBin(name) {
  const bin = path.join(root, 'node_modules', '.bin', name);
  if (!fs.existsSync(bin)) {
    console.error(`Missing ${bin}. Run npm ci before starting.`);
    process.exit(1);
  }
  return bin;
}

const dataDir = process.env.SETTINGS_DIR || path.join(root, 'data');
const projects = process.env.PROJECTS_DIR || path.join(dataDir, 'projects');
fs.mkdirSync(projects, { recursive: true });

function seedWebsiteTemplates() {
  const seedJson = path.join(root, 'seed', 'templates.json');
  const seedSnaps = path.join(root, 'seed', 'templates', 'snapshots');
  const destJson = path.join(dataDir, 'templates.json');
  const destSnaps = path.join(dataDir, 'templates', 'snapshots');
  if (!fs.existsSync(seedJson)) return;

  const force = process.env.SYNC_TEMPLATES_FROM_SEED === '1';
  let needsSeed = force || !fs.existsSync(destJson);
  if (!needsSeed) {
    try {
      const parsed = JSON.parse(fs.readFileSync(destJson, 'utf8'));
      const custom = Array.isArray(parsed.custom) ? parsed.custom : [];
      const seed = JSON.parse(fs.readFileSync(seedJson, 'utf8'));
      const seedIds = new Set((Array.isArray(seed.custom) ? seed.custom : []).map((row) => row.id));
      needsSeed = !custom.some((row) => seedIds.has(row.id));
    } catch {
      needsSeed = true;
    }
  }
  if (!needsSeed) return;

  fs.mkdirSync(path.join(dataDir, 'templates'), { recursive: true });
  fs.copyFileSync(seedJson, destJson);
  if (fs.existsSync(seedSnaps)) {
    fs.cpSync(seedSnaps, destSnaps, { recursive: true });
  }
  console.log('Loaded saved website templates.');
}

seedWebsiteTemplates();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(dataDir, 'cc.db')}`;
}

if (process.env.DATABASE_URL.startsWith('file:')) {
  const file = process.env.DATABASE_URL.replace(/^file:/, '');
  if (!fs.existsSync(file)) {
    console.log('Initializing database…');
    const result = spawnSync(localBin('prisma'), ['db', 'push', '--skip-generate'], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    });
    if (result.status !== 0) {
      process.exit(result.status || 1);
    }
  }
}

const port = process.env.PORT || '3000';
const child = spawn(
  localBin('next'),
  ['start', '--hostname', '0.0.0.0', '--port', String(port)],
  {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  }
);
child.on('exit', (code) => process.exit(code || 0));
