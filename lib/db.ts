/**
 * Prisma Client singleton for the application
 * 
 * In development, we store the instance on globalThis to prevent creating new instances
 * on every hot reload. In production, a single instance is created and reused.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
