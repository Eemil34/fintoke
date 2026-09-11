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

function persistentVolumeDir() {
  const fromEnv = process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();
  if (fromEnv) {
    try {
      fs.mkdirSync(path.join(fromEnv, 'projects'), { recursive: true });
      fs.accessSync(fromEnv, fs.constants.W_OK);
      return path.resolve(fromEnv);
    } catch {
      console.error('[start-prod] RAILWAY_VOLUME_MOUNT_PATH is not writable:', fromEnv);
    }
  }
  try {
    const mounts = fs.readFileSync('/proc/mounts', 'utf8');
    for (const candidate of ['/app/data', '/data']) {
      const mounted = mounts.split('\n').some((line) => line.split(/\s+/)[1] === candidate);
      if (!mounted) continue;
      fs.mkdirSync(path.join(candidate, 'projects'), { recursive: true });
      return candidate;
    }
  } catch {
    // local mac/windows have no /proc/mounts
  }
  return null;
}

const volume = persistentVolumeDir();
if (process.env.RAILWAY_ENVIRONMENT && !volume) {
  console.error(
    '[start-prod] No Railway Volume detected. Attach a volume with mount path /app/data. Until then every deploy deletes sites, users, emails, and keys.',
  );
}
const dataDir = volume || process.env.SETTINGS_DIR || path.join(root, 'data');
const projects = path.join(dataDir, 'projects');
fs.mkdirSync(projects, { recursive: true });

process.env.SETTINGS_DIR = dataDir;
process.env.PROJECTS_DIR = projects;

process.env.PATH = withCursorPath(process.env).PATH;
process.env.PATH = `${path.join(dataDir, '.local', 'bin')}${path.delimiter}${process.env.PATH}`;

function sqliteFileUrl(dbPath) {
  const abs = path.resolve(dbPath);
  return abs.startsWith('/') ? `file://${abs}` : `file:${abs}`;
}

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
  process.env.DATABASE_URL = sqliteFileUrl(path.join(dataDir, 'cc.db'));
}

if (String(process.env.DATABASE_URL || '').startsWith('file:')) {
  const dbFile = String(process.env.DATABASE_URL).replace(/^file:\/\//, '').replace(/^file:/, '');
  const existing = [dbFile, `${dbFile}-wal`, `${dbFile}-shm`].some((file) => fs.existsSync(file));
  if (existing) {
    console.log('[start-prod] Keeping existing SQLite database at', dbFile);
  } else {
    const pushed = spawnSync(localBin('prisma'), ['db', 'push', '--skip-generate'], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    });
    if (pushed.status !== 0) {
      console.error('[start-prod] prisma db push failed; starting with the existing database');
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

try {
  const { install } = require('./install-cursor-cli');
  install().catch((error) => {
    console.error('[start-prod] Cursor CLI install failed:', error);
  });
} catch (error) {
  console.error('[start-prod] Cursor CLI installer missing:', error);
}
