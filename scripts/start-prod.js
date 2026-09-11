#!/usr/bin/env node

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
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

function cursorBinDirs() {
  const home = os.homedir();
  return [
    path.join(home, '.local', 'bin'),
    path.join(home, '.cursor', 'bin'),
    path.join(home, '.cursor-agent', 'bin'),
  ];
}

function withCursorPath(env) {
  const extra = cursorBinDirs().join(path.delimiter);
  return { ...env, PATH: `${extra}${path.delimiter}${env.PATH || ''}` };
}

function writableVolume() {
  try {
    fs.mkdirSync('/app/data/projects', { recursive: true });
    fs.accessSync('/app/data', fs.constants.W_OK);
    return '/app/data';
  } catch {
    return null;
  }
}

function copyMissing(from, to) {
  try {
    if (!fs.existsSync(from) || fs.existsSync(to)) return;
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    console.log(`[start-prod] Restored ${path.basename(to)} onto the data volume`);
  } catch (error) {
    console.error(`[start-prod] Could not restore ${to}:`, error);
  }
}

function copyLargerSqlite(from, to) {
  try {
    if (!fs.existsSync(from)) return;
    const fromSize = fs.statSync(from).size;
    if (fromSize < 100) return;
    const toSize = fs.existsSync(to) ? fs.statSync(to).size : 0;
    if (toSize >= fromSize) return;
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    console.log(`[start-prod] Copied SQLite database to ${to}`);
  } catch (error) {
    console.error('[start-prod] Could not copy SQLite database:', error);
  }
}

const volume = writableVolume();
const dataDir = volume || process.env.SETTINGS_DIR || path.join(root, 'data');
const projects = path.join(dataDir, 'projects');
fs.mkdirSync(projects, { recursive: true });

process.env.SETTINGS_DIR = dataDir;
process.env.PROJECTS_DIR = projects;

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
  process.env.DATABASE_URL = `file:${path.join(dataDir, 'cc.db')}`;
}

const volumeDb = path.join(dataDir, 'cc.db');
[
  path.join(root, 'data', 'cc.db'),
  path.join(root, 'cc.db'),
  path.join(dataDir, 'data', 'cc.db'),
].forEach((candidate) => copyLargerSqlite(candidate, volumeDb));

[
  'mail.json',
  'templates.json',
  'templates-user.json',
  'service-tokens.json',
  'agent-mcp.json',
].forEach((name) => {
  copyMissing(path.join(root, 'data', name), path.join(dataDir, name));
});

process.env.PATH = withCursorPath(process.env).PATH;
process.env.PATH = `${path.join(dataDir, '.local', 'bin')}${path.delimiter}${process.env.PATH}`;

if (String(process.env.DATABASE_URL || '').startsWith('file:')) {
  const pushed = spawnSync(localBin('prisma'), ['db', 'push', '--skip-generate'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  if (pushed.status !== 0) {
    console.error('[start-prod] prisma db push failed; starting with the existing database');
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

try {
  const { install } = require('./install-cursor-cli');
  install().catch((error) => {
    console.error('[start-prod] Cursor CLI install failed:', error);
  });
} catch (error) {
  console.error('[start-prod] Cursor CLI installer missing:', error);
}
