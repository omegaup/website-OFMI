/*
  Warnings:

  - You are about to drop the column `ofmiId` on the `Disqualification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Disqualification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[DisqualificationId]` on the table `ContestantParticipation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Disqualification" DROP CONSTRAINT "Disqualification_ofmiId_fkey";

-- DropForeignKey
ALTER TABLE "Disqualification" DROP CONSTRAINT "Disqualification_userId_fkey";

-- DropIndex
DROP INDEX "Disqualification_userId_ofmiId_key";

-- AlterTable
ALTER TABLE "ContestantParticipation" ADD COLUMN     "DisqualificationId" TEXT;

-- AlterTable
ALTER TABLE "Disqualification" DROP COLUMN "ofmiId",
DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "ContestantParticipation_DisqualificationId_key" ON "ContestantParticipation"("DisqualificationId");

-- AddForeignKey
ALTER TABLE "ContestantParticipation" ADD CONSTRAINT "ContestantParticipation_DisqualificationId_fkey" FOREIGN KEY ("DisqualificationId") REFERENCES "Disqualification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
