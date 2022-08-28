/*
  Warnings:

  - Changed the type of `endDateTime` on the `Activity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startDateTime` on the `Activity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `Activity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `GoogleCredentials` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "endDateTime",
ADD COLUMN     "endDateTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "startDateTime",
ADD COLUMN     "startDateTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "GoogleCredentials" ALTER COLUMN "expiry_date" SET DATA TYPE TEXT,
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
