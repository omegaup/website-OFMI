/*
  Warnings:

  - You are about to drop the column `disqualified` on the `ContestantParticipation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContestantParticipation" DROP COLUMN "disqualified";

-- CreateTable
CREATE TABLE "Disqualification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ofmiId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "appealed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disqualification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Disqualification_userId_ofmiId_key" ON "Disqualification"("userId", "ofmiId");

-- AddForeignKey
ALTER TABLE "Disqualification" ADD CONSTRAINT "Disqualification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disqualification" ADD CONSTRAINT "Disqualification_ofmiId_fkey" FOREIGN KEY ("ofmiId") REFERENCES "Ofmi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
