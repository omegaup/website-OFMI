/*
  Warnings:

  - A unique constraint covering the columns `[edition]` on the table `Ofmi` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `edition` to the `Ofmi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationCloseTime` to the `Ofmi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationOpenTime` to the `Ofmi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stage` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SchoolStage" AS ENUM ('Elementary', 'Secondary', 'High');

-- AlterTable
ALTER TABLE "Ofmi" ADD COLUMN     "edition" INTEGER NOT NULL,
ADD COLUMN     "registrationCloseTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "registrationOpenTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "stage" "SchoolStage" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ofmi_edition_key" ON "Ofmi"("edition");
