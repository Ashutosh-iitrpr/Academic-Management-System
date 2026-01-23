-- DropForeignKey
ALTER TABLE "CourseOffering" DROP CONSTRAINT "CourseOffering_courseId_fkey";

-- AlterTable
ALTER TABLE "CourseOffering" ADD COLUMN     "newCourseCode" TEXT,
ADD COLUMN     "newCourseCredits" INTEGER,
ADD COLUMN     "newCourseName" TEXT,
ALTER COLUMN "courseId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Course_code_idx" ON "Course"("code");

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
