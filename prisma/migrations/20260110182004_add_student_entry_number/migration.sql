/*
  Warnings:

  - A unique constraint covering the columns `[entryNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "entryNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_entryNumber_key" ON "User"("entryNumber");
