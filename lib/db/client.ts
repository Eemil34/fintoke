import { copyFileSync, existsSync } from 'fs';
import os from 'os';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { isVercelRuntime, writableDataDir } from '@/lib/server/paths';

const PRISMA_CLIENT_VERSION = 5;

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  prismaVersion?: number;
};

function sqliteFileUrl(dbPath: string): string {
  const abs = path.resolve(dbPath);
  return abs.startsWith('/') ? `file://${abs}` : `file:${abs}`;
}

function resolveDatabaseUrl(): string | undefined {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured && !configured.startsWith('file:')) return configured;
  const dest = path.join(writableDataDir(), 'cc.db');
  process.env.DATABASE_URL = sqliteFileUrl(dest);
  if (isVercelRuntime()) {
    const tmp = path.join(os.tmpdir(), 'fintoke.db');
    const bundled = path.join(process.cwd(), 'prisma', 'vercel.db');
    if (!existsSync(tmp) && existsSync(bundled)) {
      copyFileSync(bundled, tmp);
    }
    return sqliteFileUrl(tmp);
  }
  return sqliteFileUrl(dest);
}

function createPrismaClient() {
  const url = resolveDatabaseUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

if (globalForPrisma.prisma && globalForPrisma.prismaVersion !== PRISMA_CLIENT_VERSION) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
