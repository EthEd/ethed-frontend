-- Migration: Add Role enum and AuditLog model
-- Converts User.role from nullable String to a proper Role enum (USER/MODERATOR/ADMIN)
-- and creates the AuditLog table for tracking admin/mod actions.

-- 1. Create the Role enum type
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- 2. Normalise existing string values before casting
--    - NULL              → 'USER'
--    - 'admin'           → 'ADMIN'
--    - 'moderator'       → 'MODERATOR'
--    - anything else     → 'USER'
UPDATE "User" SET "role" = 'USER'      WHERE "role" IS NULL;
UPDATE "User" SET "role" = 'ADMIN'     WHERE "role" = 'admin';
UPDATE "User" SET "role" = 'MODERATOR' WHERE "role" = 'moderator';
UPDATE "User" SET "role" = 'USER'      WHERE "role" NOT IN ('USER', 'MODERATOR', 'ADMIN');

-- 3. Cast the column to the new enum type, set default and NOT NULL
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "Role" USING "role"::"Role",
  ALTER COLUMN "role" SET DEFAULT 'USER'::"Role",
  ALTER COLUMN "role" SET NOT NULL;

-- 4. Create the AuditLog table
CREATE TABLE "AuditLog" (
  "id"         TEXT         NOT NULL,
  "actorId"    TEXT         NOT NULL,
  "action"     TEXT         NOT NULL,
  "targetId"   TEXT,
  "targetType" TEXT,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- 5. Indexes for common query patterns
CREATE INDEX "AuditLog_actorId_idx"    ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_createdAt_idx"  ON "AuditLog"("createdAt" DESC);
CREATE INDEX "AuditLog_action_idx"     ON "AuditLog"("action");

-- 6. Foreign key: actor must exist as a User
ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
