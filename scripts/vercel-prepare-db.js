#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const sqliteFile = path.join(root, 'prisma', 'vercel.db');

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run('npx', ['prisma', 'generate']);

if (process.env.VERCEL) {
  fs.mkdirSync(path.dirname(sqliteFile), { recursive: true });
  run('npx', ['prisma', 'db', 'push', '--skip-generate', '--accept-data-loss'], {
    DATABASE_URL: `file:${sqliteFile}`,
  });
}
