#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');

const INSTALL_SCRIPT_URL = 'https://cursor.com/install';
const CURL_UA = 'curl/8.7.1';

function cursorHome() {
  return process.env.SETTINGS_DIR || process.env.HOME || os.homedir() || '/tmp';
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

function isFile(full) {
  try {
    return fs.statSync(full).isFile();
  } catch {
    return false;
  }
}

function findBin() {
  for (const dir of binDirs()) {
    for (const name of ['agent', 'cursor-agent']) {
      const full = path.join(dir, name);
      if (isFile(full)) return full;
    }
  }
  return null;
}

function request(url, destPath) {
  return new Promise((resolve, reject) => {
    const go = (target, hops = 0) => {
      const req = https.get(
        target,
        {
          headers: {
            'User-Agent': CURL_UA,
            Accept: '*/*',
          },
        },
        (res) => {
          const location = res.headers.location;
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && location && hops < 8) {
            const next = location.startsWith('http') ? location : new URL(location, target).href;
            go(next, hops + 1);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`${target} HTTP ${res.statusCode}`));
            return;
          }
          if (!destPath) {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              body += chunk;
            });
            res.on('end', () => resolve(body));
            return;
          }
          const out = fs.createWriteStream(destPath);
          res.pipe(out);
          out.on('finish', () => resolve(destPath));
          out.on('error', reject);
        },
      );
      req.on('error', reject);
    };
    go(url);
  });
}

function platformTriple() {
  const osName = process.platform === 'darwin' ? 'darwin' : 'linux';
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  return { osName, arch };
}

function parseDownloadUrl(script) {
  const match = script.match(/DOWNLOAD_URL="([^"]+)"/);
  if (match) return match[1];
  const { osName, arch } = platformTriple();
  const version = script.match(/lab\/(\d{4}\.\d{2}\.\d{2}-[a-f0-9]+)\//);
  if (version) {
    return `https://downloads.cursor.com/lab/${version[1]}/${osName}/${arch}/agent-cli-package.tar.gz`;
  }
  return null;
}

function findExtractedAgent(dir) {
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      if (entry.isFile() && (entry.name === 'cursor-agent' || entry.name === 'agent')) {
        return full;
      }
    }
  }
  return null;
}

async function install() {
  const existing = findBin();
  if (existing) {
    console.log(`[cursor] Already installed at ${existing}`);
    return existing;
  }

  const home = cursorHome();
  const binDir = path.join(home, '.local', 'bin');
  const shareDir = path.join(home, '.local', 'share', 'cursor-agent');
  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(shareDir, { recursive: true });

  console.log(`[cursor] Fetching installer script as curl`);
  const script = await request(INSTALL_SCRIPT_URL);
  if (typeof script !== 'string' || !script.startsWith('#!')) {
    throw new Error('cursor.com/install did not return a bash installer (got HTML).');
  }

  let downloadUrl = parseDownloadUrl(script);
  if (downloadUrl) {
    const { osName, arch } = platformTriple();
    downloadUrl = downloadUrl.replace('${OS}', osName).replace('${ARCH}', arch);
  }
  if (!downloadUrl) {
    throw new Error('Could not parse Cursor CLI download URL from installer.');
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-cli-'));
  const tarPath = path.join(tmpDir, 'agent-cli-package.tar.gz');
  const extractDir = path.join(tmpDir, 'extract');
  fs.mkdirSync(extractDir, { recursive: true });

  console.log(`[cursor] Downloading ${downloadUrl}`);
  await request(downloadUrl, tarPath);

  const extracted = spawnSync('tar', ['-xzf', tarPath, '-C', extractDir], { encoding: 'utf8' });
  if (extracted.status !== 0) {
    throw new Error(`tar extract failed: ${extracted.stderr || extracted.error || extracted.status}`);
  }

  const agentPath = findExtractedAgent(extractDir);
  if (!agentPath) {
    throw new Error('Downloaded Cursor package did not contain an agent binary.');
  }

  const versionMatch = downloadUrl.match(/lab\/([^/]+)\//);
  const version = versionMatch ? versionMatch[1] : 'current';
  const finalDir = path.join(shareDir, 'versions', version);
  fs.rmSync(finalDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(finalDir), { recursive: true });
  fs.cpSync(extractDir, finalDir, { recursive: true });

  const finalAgent = findExtractedAgent(finalDir);
  if (!finalAgent) {
    throw new Error('Failed to copy Cursor agent binary into place.');
  }
  try {
    fs.chmodSync(finalAgent, 0o755);
  } catch {
    // ignore
  }

  for (const name of ['agent', 'cursor-agent']) {
    const link = path.join(binDir, name);
    fs.rmSync(link, { force: true });
    fs.symlinkSync(finalAgent, link);
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
  const ready = findBin();
  if (!ready) {
    throw new Error(`Installed Cursor agent at ${finalAgent} but it is not on the search path.`);
  }
  console.log(`[cursor] Ready at ${ready}`);
  return ready;
}

module.exports = { install, findBin, cursorHome, binDirs };

if (require.main === module) {
  install().catch((error) => {
    console.error('[cursor] Install failed:', error);
    process.exit(1);
  });
}
