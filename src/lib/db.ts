import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only log queries in development — silence in production for performance
const logConfig = process.env.NODE_ENV === 'production'
  ? []
  : ['query'] as const

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logConfig,
    // Connection pooling hints for better resource management
    // In production, consider setting DATABASE_URL with connection_limit param
    // e.g., file:./dev.db?connection_limit=10&pool_timeout=10
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
