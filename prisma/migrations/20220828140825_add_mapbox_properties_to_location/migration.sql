/*
  Warnings:

  - You are about to drop the column `coordinateX` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `coordinateY` on the `Location` table. All the data in the column will be lost.
  - Added the required column `coordinateLat` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coordinateLong` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleCalendarAddress` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mapBoxAddress` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mapBoxId` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "coordinateX",
DROP COLUMN "coordinateY",
ADD COLUMN     "coordinateLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "coordinateLong" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "googleCalendarAddress" TEXT NOT NULL,
ADD COLUMN     "mapBoxAddress" TEXT NOT NULL,
ADD COLUMN     "mapBoxId" TEXT NOT NULL;
