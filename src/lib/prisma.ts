import { PrismaClient } from '@prisma/client';

// Declare a global scoped variable for prisma to avoid multiple instances during development
// this is neccessary because in development there are hotreloads which will create multiple 
// instances of prisma ande we will get the error:
// Error: PrismaClient cannot be used in multiple instances. Please make sure you have only one instance of PrismaClient.

// Define a global variable for Prisma and cast it as an object with a `prisma` property of type PrismaClient or unknown.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Export the Prisma client instance, using the globally scoped instance if available, or create a new one.
export const prisma = globalForPrisma.prisma || new PrismaClient()

// In a development environment, store the Prisma client instance globally to avoid multiple instances due to hot reloads.
if (process.env.NODE_ENV !== 'production'){

  // (no issue with hotloading and creating multiple instances of PrismaClient)
  globalForPrisma.prisma = prisma
}

 
