import { PrismaClient } from "@/generated/prisma";

function validateDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  if (process.env.NODE_ENV === 'test') return; // tests may mock prisma-client

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

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;