import { copyFileSync, existsSync } from 'fs';
import os from 'os';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { isVercelRuntime, writableDataDir } from '@/lib/server/paths';

const PRISMA_CLIENT_VERSION = 4;

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  prismaVersion?: number;
};

function resolveDatabaseUrl(): string | undefined {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured && !configured.startsWith('file:')) return configured;
  const dest = path.join(writableDataDir(), 'cc.db');
  process.env.DATABASE_URL = `file:${dest}`;
  if (isVercelRuntime()) {
    const tmp = path.join(os.tmpdir(), 'fintoke.db');
    const bundled = path.join(process.cwd(), 'prisma', 'vercel.db');
    if (!existsSync(tmp) && existsSync(bundled)) {
      copyFileSync(bundled, tmp);
    }
    return `file:${tmp}`;
  }
  return `file:${dest}`;
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

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
}
