-- Add semester information to AcademicCalendar
ALTER TABLE "AcademicCalendar" ADD COLUMN "semesterName" TEXT NOT NULL DEFAULT 'Spring 2026';
ALTER TABLE "AcademicCalendar" ADD COLUMN "semesterStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AcademicCalendar" ADD COLUMN "semesterEndDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
