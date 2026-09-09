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
  const env = withCursorPath(process.env);
  const names = ['cursor-agent', 'agent'];
  for (const name of names) {
    const result = spawnSync(name, ['--version'], {
      env,
      encoding: 'utf8',
    });
    if (result.status === 0) return true;
  }
  const home = os.homedir();
  const dirs = [
    path.join(home, '.local', 'bin'),
    path.join(home, '.cursor', 'bin'),
    path.join(home, '.cursor-agent', 'bin'),
  ];
  return dirs.some((dir) =>
    names.some((name) => fs.existsSync(path.join(dir, name)))
  );
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

function snapshotComplete(dir) {
  return (
    fs.existsSync(path.join(dir, 'package.json')) &&
    (fs.existsSync(path.join(dir, 'app', 'page.tsx')) ||
      fs.existsSync(path.join(dir, 'app', 'page.jsx')))
  );
}

function syncSeedSnapshots() {
  const seedSnapshots = path.join(root, 'seed', 'templates', 'snapshots');
  const volumeSnapshots = path.join(dataDir, 'templates', 'snapshots');
  if (!fs.existsSync(seedSnapshots)) {
    console.warn('No seed/templates/snapshots in this image.');
    return;
  }
  fs.mkdirSync(volumeSnapshots, { recursive: true });
  for (const name of fs.readdirSync(seedSnapshots)) {
    const from = path.join(seedSnapshots, name);
    const to = path.join(volumeSnapshots, name);
    if (!fs.statSync(from).isDirectory()) continue;
    if (!snapshotComplete(from)) continue;
    if (snapshotComplete(to)) continue;
    fs.cpSync(from, to, { recursive: true });
    console.log(`Copied saved template snapshot ${name}`);
  }
}

setTimeout(() => {
  if (process.env.DATABASE_URL.startsWith('file:')) {
    console.log('Ensuring database schema…');
    const result = spawnSync(localBin('prisma'), ['db', 'push', '--skip-generate'], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    });
    if (result.status !== 0) {
      console.error('prisma db push failed; chat/projects will not work until the database exists.');
    }
  }
  try {
    syncSeedSnapshots();
  } catch (error) {
    console.error('Failed to copy saved template snapshots:', error);
  }
  ensureCursorCli();
}, 250);
