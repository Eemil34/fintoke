#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');

function cursorHome() {
  return (
    process.env.SETTINGS_DIR ||
    process.env.HOME ||
    os.homedir() ||
    '/tmp'
  );
}

function binDirs() {
  const home = cursorHome();
  const userHome = os.homedir();
  return [
    path.join(home, '.local', 'bin'),
    path.join(home, '.cursor', 'bin'),
    path.join(home, '.cursor-agent', 'bin'),
    path.join(userHome, '.local', 'bin'),
    path.join(userHome, '.cursor', 'bin'),
    path.join(userHome, '.cursor-agent', 'bin'),
  ];
}

function findBin() {
  for (const dir of binDirs()) {
    for (const name of ['agent', 'cursor-agent']) {
      const full = path.join(dir, name);
      if (fs.existsSync(full)) return full;
    }
  }
  return null;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const go = (target, hops = 0) => {
      https
        .get(target, (res) => {
          const location = res.headers.location;
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && location && hops < 5) {
            go(location, hops + 1);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`Cursor install script HTTP ${res.statusCode}`));
            return;
          }
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => resolve(body));
        })
        .on('error', reject);
    };
    go(url);
  });
}

function runBash(scriptPath, home) {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', [scriptPath], {
      env: {
        ...process.env,
        HOME: home,
        PATH: `${path.join(home, '.local', 'bin')}${path.delimiter}${process.env.PATH || ''}`,
      },
      stdio: 'inherit',
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('Cursor CLI install timed out'));
    }, 120000);
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`Cursor CLI install exited ${code}`));
    });
  });
}

async function install() {
  const existing = findBin();
  if (existing) return existing;

  const home = cursorHome();
  fs.mkdirSync(path.join(home, '.local', 'bin'), { recursive: true });

  const script = await fetchText('https://cursor.com/install');
  const scriptPath = path.join(os.tmpdir(), 'cursor-install.sh');
  fs.writeFileSync(scriptPath, script);

  console.log(`[cursor] Installing CLI into ${home}`);
  await runBash(scriptPath, home);
  return findBin();
}

module.exports = { install, findBin, cursorHome, binDirs };

if (require.main === module) {
  install()
    .then((bin) => {
      if (!bin) {
        console.error('[cursor] Install finished but agent binary was not found');
        process.exit(1);
      }
      console.log(`[cursor] Ready at ${bin}`);
    })
    .catch((error) => {
      console.error('[cursor] Install failed:', error);
      process.exit(1);
    });
}
