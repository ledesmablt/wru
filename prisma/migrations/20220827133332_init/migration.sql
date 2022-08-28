/*
  Warnings:

  - The primary key for the `GoogleCredentials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `GoogleCredentials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GoogleCredentials" DROP CONSTRAINT "GoogleCredentials_pkey",
DROP COLUMN "id";

-- CreateTable
CREATE TABLE "UserFollow" (
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "locationId" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coordinates" DOUBLE PRECISION[],
    "geoHash" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFollow_fromUserId_toUserId_key" ON "UserFollow"("fromUserId", "toUserId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
