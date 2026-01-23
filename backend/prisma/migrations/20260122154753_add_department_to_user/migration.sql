-- AlterTable (make idempotent in case column already exists)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "department" TEXT;

-- Set default department for existing instructors
UPDATE "User" SET "department" = 'Unassigned' WHERE "role" = 'INSTRUCTOR' AND "department" IS NULL;
