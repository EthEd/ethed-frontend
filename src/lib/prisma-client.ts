import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/monitoring";

function validateDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  
  // Skip validation during build time (Next.js static generation) and tests
  if (process.env.NODE_ENV === 'test' || process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  if (!dbUrl) {
    throw new Error(
      "Missing DATABASE_URL environment variable. Set DATABASE_URL in your .env.local (e.g. DATABASE_URL=postgresql://user:password@localhost:5432/ethed) and restart the dev server."
    );
  }

  // Trim whitespace and strip surrounding single/double quotes if present
  const normalized = dbUrl.trim().replace(/^['"]|['"]$/g, "");
  if (!/^postgres(?:ql)?:\/\//i.test(normalized)) {
    throw new Error(
      `Invalid DATABASE_URL: '${normalized}'. Prisma expects a Postgres connection string starting with 'postgresql://' or 'postgres://'. Example: 'postgresql://user:password@localhost:5432/ethed'`
    );
  }
}

validateDatabaseUrl();

const dbUrl = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        try {
          const result = await query(args);
          const end = performance.now();
          const duration = end - start;
          
          if (process.env.DEBUG_PRISMA === "true" || process.env.NODE_ENV === "development") {
            logger.debug(`${model}.${operation} took ${duration.toFixed(2)}ms`, "Prisma");
          }
          
          return result;
        } catch (error) {
          const end = performance.now();
          logger.error(`${model}.${operation} failed after ${(end - start).toFixed(2)}ms`, "Prisma", undefined, error);
          throw error;
        }
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton | undefined };

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;