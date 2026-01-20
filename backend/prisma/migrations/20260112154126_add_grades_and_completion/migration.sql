-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('A', 'A_MINUS', 'B', 'B_MINUS', 'C', 'C_MINUS', 'D', 'E', 'F');

-- AlterEnum
ALTER TYPE "EnrollmentStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "grade" "Grade";
