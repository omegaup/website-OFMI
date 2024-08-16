/*
  Warnings:

  - A unique constraint covering the columns `[user_id,ofmi_id,role_id]` on the table `Participation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Participation_user_id_ofmi_id_role_id_key" ON "Participation"("user_id", "ofmi_id", "role_id");
