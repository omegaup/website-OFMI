/*
  Warnings:

  - You are about to drop the column `disqualified` on the `ContestantParticipation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[DisqualificationId]` on the table `ContestantParticipation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ContestantParticipation" DROP COLUMN "disqualified",
ADD COLUMN     "DisqualificationId" TEXT;

-- CreateTable
CREATE TABLE "Disqualification" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "appealed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disqualification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContestantParticipation_DisqualificationId_key" ON "ContestantParticipation"("DisqualificationId");

-- AddForeignKey
ALTER TABLE "ContestantParticipation" ADD CONSTRAINT "ContestantParticipation_DisqualificationId_fkey" FOREIGN KEY ("DisqualificationId") REFERENCES "Disqualification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
