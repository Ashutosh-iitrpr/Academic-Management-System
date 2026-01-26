-- Add isFacultyAdvisor column to User table
ALTER TABLE "User" ADD COLUMN "isFacultyAdvisor" BOOLEAN NOT NULL DEFAULT false;

-- Add advisorId column to Enrollment table
ALTER TABLE "Enrollment" ADD COLUMN "advisorId" TEXT;

-- Add foreign key constraint for advisor
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add new status to EnrollmentStatus enum
ALTER TYPE "EnrollmentStatus" ADD VALUE 'PENDING_ADVISOR';
