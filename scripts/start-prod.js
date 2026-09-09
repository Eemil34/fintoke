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

const dataDir = process.env.SETTINGS_DIR || path.join(root, 'data');
const projects = process.env.PROJECTS_DIR || path.join(dataDir, 'projects');
fs.mkdirSync(projects, { recursive: true });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(dataDir, 'cc.db')}`;
}

process.env.PATH = withCursorPath(process.env).PATH;

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
