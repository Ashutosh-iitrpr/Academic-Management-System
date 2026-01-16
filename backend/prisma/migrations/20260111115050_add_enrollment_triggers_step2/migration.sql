/*
  Warnings:

  - Made the column `source` on table `Enrollment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Enrollment" ALTER COLUMN "source" SET NOT NULL;
