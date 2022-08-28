/*
  Warnings:

  - The `expiry_date` column on the `GoogleCredentials` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "GoogleCredentials" DROP COLUMN "expiry_date",
ADD COLUMN     "expiry_date" TIMESTAMP(3);
