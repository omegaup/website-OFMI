/*
  Warnings:

  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `ParticipationRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
DROP TABLE "Roles";

-- CreateIndex
CREATE UNIQUE INDEX "ParticipationRole_name_key" ON "ParticipationRole"("name");
