-- CreateEnum
CREATE TYPE "EnrollmentSource" AS ENUM ('STUDENT_REQUEST', 'INSTRUCTOR_ASSIGNED');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "source" "EnrollmentSource";

-- CreateTable
CREATE TABLE "EnrollmentTrigger" (
    "id" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "branchCode" TEXT NOT NULL,
    "batchYear" INTEGER NOT NULL,
    "enrollmentType" "EnrollmentType" NOT NULL,
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrollmentTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentTrigger_courseOfferingId_branchCode_batchYear_key" ON "EnrollmentTrigger"("courseOfferingId", "branchCode", "batchYear");

-- AddForeignKey
ALTER TABLE "EnrollmentTrigger" ADD CONSTRAINT "EnrollmentTrigger_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "CourseOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentTrigger" ADD CONSTRAINT "EnrollmentTrigger_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
