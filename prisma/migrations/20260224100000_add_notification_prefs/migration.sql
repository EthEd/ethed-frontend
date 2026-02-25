-- Add notificationPrefs column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notificationPrefs" JSONB NOT NULL DEFAULT '{}';
