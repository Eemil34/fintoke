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

function cursorInstalled() {
  const result = spawnSync('cursor-agent', ['--version'], {
    env: withCursorPath(process.env),
    encoding: 'utf8',
  });
  return result.status === 0;
}

function ensureCursorCli() {
  process.env.PATH = withCursorPath(process.env).PATH;
  if (cursorInstalled()) {
    console.log('Cursor CLI already installed.');
    return;
  }
  if (process.env.SKIP_CURSOR_INSTALL === '1') {
    console.log('Skipping Cursor CLI install.');
    return;
  }
  console.log('Installing Cursor CLI…');
  const result = spawnSync('bash', ['-lc', 'curl -fsSL https://cursor.com/install | bash'], {
    env: process.env,
    stdio: 'inherit',
    timeout: 120000,
  });
  process.env.PATH = withCursorPath(process.env).PATH;
  if (result.status !== 0 || !cursorInstalled()) {
    console.error('Cursor CLI install did not complete. Preview/chat can still run; add CURSOR_API_KEY after installing cursor-agent.');
  }
}

const dataDir = process.env.SETTINGS_DIR || path.join(root, 'data');
const projects = process.env.PROJECTS_DIR || path.join(dataDir, 'projects');
fs.mkdirSync(projects, { recursive: true });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(dataDir, 'cc.db')}`;
}

ensureCursorCli();

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

setImmediate(() => {
  if (!process.env.DATABASE_URL.startsWith('file:')) return;
  const file = process.env.DATABASE_URL.replace(/^file:/, '');
  if (fs.existsSync(file)) return;
  console.log('Initializing database…');
  spawnSync(localBin('prisma'), ['db', 'push', '--skip-generate'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
});
