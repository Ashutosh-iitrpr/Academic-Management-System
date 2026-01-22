-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT;

-- Set default department for existing instructors
UPDATE "User" SET "department" = 'Unassigned' WHERE "role" = 'INSTRUCTOR' AND "department" IS NULL;
