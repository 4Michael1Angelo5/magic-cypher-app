import { PrismaClient } from '@prisma-gen'
import { PrismaNeon } from '@prisma/adapter-neon'

// Declare a global scoped variable for prisma to avoid multiple instances during development
// this is necessary because in development there are hot reloads which will create multiple
// instances of prisma ande we will get the error:
// Error: PrismaClient cannot be used in multiple instances. Please make sure you have only one instance of PrismaClient.

// Define a global variable for Prisma and cast it as an object with a `prisma` property of type PrismaClient or unknown.

// Export the Prisma client instance, using the globally scoped instance if available, or create a new one.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const getClient = () => {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || getClient()

// In a development environment, store the Prisma client instance globally to avoid multiple instances due to hot reloads.
if (process.env.NODE_ENV !== 'production') {
  // (no issue with hot loading and creating multiple instances of PrismaClient)
  globalForPrisma.prisma = prisma
}
