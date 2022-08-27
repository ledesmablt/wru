/*
  Warnings:

  - You are about to drop the column `accessToken` on the `GoogleCredentials` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `GoogleCredentials` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `GoogleCredentials` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `GoogleCredentials` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `GoogleCredentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `access_token` to the `GoogleCredentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refresh_token` to the `GoogleCredentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `GoogleCredentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `GoogleCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoogleCredentials" DROP COLUMN "accessToken",
DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "refreshToken",
ADD COLUMN     "access_token" TEXT NOT NULL,
ADD COLUMN     "expiry_date" INTEGER,
ADD COLUMN     "id_token" TEXT,
ADD COLUMN     "refresh_token" TEXT NOT NULL,
ADD COLUMN     "scope" TEXT NOT NULL,
ADD COLUMN     "token_type" TEXT,
ADD COLUMN     "updatedAt" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCredentials_userId_key" ON "GoogleCredentials"("userId");
