/*
  Warnings:

  - You are about to drop the column `newCourseCode` on the `CourseOffering` table. All the data in the column will be lost.
  - You are about to drop the column `newCourseCredits` on the `CourseOffering` table. All the data in the column will be lost.
  - You are about to drop the column `newCourseName` on the `CourseOffering` table. All the data in the column will be lost.
  - Made the column `courseId` on table `CourseOffering` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CourseProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "CourseOffering" DROP CONSTRAINT "CourseOffering_courseId_fkey";

-- AlterTable
ALTER TABLE "CourseOffering" DROP COLUMN "newCourseCode",
DROP COLUMN "newCourseCredits",
DROP COLUMN "newCourseName",
ALTER COLUMN "courseId" SET NOT NULL;

-- CreateTable
CREATE TABLE "CourseProposal" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "status" "CourseProposalStatus" NOT NULL DEFAULT 'PENDING',
    "courseId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseProposal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseProposal" ADD CONSTRAINT "CourseProposal_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProposal" ADD CONSTRAINT "CourseProposal_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
