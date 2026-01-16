-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING_INSTRUCTOR', 'ENROLLED', 'REJECTED', 'DROPPED', 'AUDIT');

-- CreateEnum
CREATE TYPE "EnrollmentType" AS ENUM ('CREDIT', 'CREDIT_CONCENTRATION', 'CREDIT_MINOR');

-- AlterTable
ALTER TABLE "CourseOffering" ADD COLUMN     "allowedBranches" TEXT[];

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL,
    "enrollmentType" "EnrollmentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "CourseOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
