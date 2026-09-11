import fs from 'fs/promises';
import path from 'path';

export async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, payload, 'utf8');
  await fs.rename(tmp, filePath);
  await fs.copyFile(filePath, `${filePath}.bak`).catch(() => undefined);
}
