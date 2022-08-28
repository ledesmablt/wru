/*
  Warnings:

  - Added the required column `endDateTime` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDateTime` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "endDateTime" INTEGER NOT NULL,
ADD COLUMN     "googleCalendarEventId" TEXT,
ADD COLUMN     "startDateTime" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" INTEGER NOT NULL;
