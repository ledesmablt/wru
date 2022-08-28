/*
  Warnings:

  - You are about to drop the column `coordinates` on the `Location` table. All the data in the column will be lost.
  - Added the required column `coordinateX` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coordinateY` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "coordinates",
ADD COLUMN     "coordinateX" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "coordinateY" DOUBLE PRECISION NOT NULL;
