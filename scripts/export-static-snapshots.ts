import fs from 'fs/promises';
import path from 'path';
import { exportSnapshotStatic } from '../lib/templates/exportStatic';
import { STATIC_EXPORT_DIR } from '../lib/templates/staticSite';

const ROOT = path.join(process.cwd(), 'seed', 'templates', 'snapshots');

async function listSnapshots(): Promise<string[]> {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const ids: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      await fs.access(path.join(ROOT, entry.name, 'package.json'));
      ids.push(entry.name);
    } catch {
      // not a site snapshot
    }
  }
  return ids.sort((a, b) => {
    const rank = (id: string) => (id.startsWith('restaurant') ? 0 : 1);
    return rank(a) - rank(b) || a.localeCompare(b);
  });
}

async function alreadyExported(id: string): Promise<boolean> {
  try {
    await fs.access(path.join(ROOT, id, STATIC_EXPORT_DIR, 'index.html'));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes('--force');
  const requested = argv.filter((value) => value !== '--force');
  const names = requested.length ? requested : await listSnapshots();
  for (const id of names) {
    if (!force && (await alreadyExported(id))) {
      console.log('skip', id);
      continue;
    }
    console.log('exporting', id);
    const out = await exportSnapshotStatic(path.join(ROOT, id));
    console.log('wrote', out);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
