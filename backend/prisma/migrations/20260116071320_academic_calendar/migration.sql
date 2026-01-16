-- CreateTable
CREATE TABLE "AcademicCalendar" (
    "id" TEXT NOT NULL,
    "enrollmentStart" TIMESTAMP(3) NOT NULL,
    "enrollmentEnd" TIMESTAMP(3) NOT NULL,
    "dropDeadline" TIMESTAMP(3) NOT NULL,
    "auditDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCalendar_pkey" PRIMARY KEY ("id")
);
