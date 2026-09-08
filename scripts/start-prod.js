#!/usr/bin/env node

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
process.chdir(root);

const dataDir = process.env.SETTINGS_DIR || path.join(root, 'data');
const projects = process.env.PROJECTS_DIR || path.join(dataDir, 'projects');
fs.mkdirSync(projects, { recursive: true });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(dataDir, 'cc.db')}`;
}

if (process.env.DATABASE_URL.startsWith('file:')) {
  const file = process.env.DATABASE_URL.replace(/^file:/, '');
  if (!fs.existsSync(file)) {
    console.log('Initializing database…');
    const result = spawnSync('npx', ['prisma', 'db', 'push', '--skip-generate'], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
      shell: process.platform === 'win32',
    });
    if (result.status !== 0) {
      process.exit(result.status || 1);
    }
  }
}

const port = process.env.PORT || '3000';
const child = spawn('npx', ['next', 'start', '--hostname', '0.0.0.0', '--port', String(port)], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});
child.on('exit', (code) => process.exit(code || 0));
