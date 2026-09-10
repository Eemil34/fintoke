#!/usr/bin/env node

const { spawn } = require('child_process');
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

const volume = writableVolume();
const dataDir = process.env.SETTINGS_DIR || volume || path.join(root, 'data');
const projects = process.env.PROJECTS_DIR || path.join(dataDir, 'projects');
fs.mkdirSync(projects, { recursive: true });

process.env.SETTINGS_DIR = process.env.SETTINGS_DIR || dataDir;
process.env.PROJECTS_DIR = process.env.PROJECTS_DIR || projects;

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
  process.env.DATABASE_URL = `file:${path.join(dataDir, 'cc.db')}`;
}

process.env.PATH = withCursorPath(process.env).PATH;
process.env.PATH = `${path.join(dataDir, '.local', 'bin')}${path.delimiter}${process.env.PATH}`;

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

setTimeout(() => {
  if (!String(process.env.DATABASE_URL || '').startsWith('file:')) return;
  const prisma = spawn(localBin('prisma'), ['db', 'push', '--skip-generate'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  prisma.on('error', (error) => {
    console.error('[start-prod] prisma db push failed:', error);
  });
}, 2000);

try {
  const { install } = require('./install-cursor-cli');
  install().catch((error) => {
    console.error('[start-prod] Cursor CLI install failed:', error);
  });
} catch (error) {
  console.error('[start-prod] Cursor CLI installer missing:', error);
}
