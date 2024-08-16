/*
  Warnings:

  - You are about to drop the column `omegaup_password` on the `ContestantParticipation` table. All the data in the column will be lost.
  - You are about to drop the column `omegaup_username` on the `ContestantParticipation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ContestantParticipation_omegaup_username_key";

-- AlterTable
ALTER TABLE "ContestantParticipation" DROP COLUMN "omegaup_password",
DROP COLUMN "omegaup_username",
ADD COLUMN     "omegaup_user_id" TEXT,
ALTER COLUMN "medal" DROP NOT NULL,
ALTER COLUMN "place" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OmegaupUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "OmegaupUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OmegaupUser_username_key" ON "OmegaupUser"("username");

-- AddForeignKey
ALTER TABLE "ContestantParticipation" ADD CONSTRAINT "ContestantParticipation_omegaup_user_id_fkey" FOREIGN KEY ("omegaup_user_id") REFERENCES "OmegaupUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
